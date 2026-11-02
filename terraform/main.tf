# -----------------------------------------------------------------------------
# Water Supply Complaint Tracker - AWS infrastructure
#
#   Internet --(port 80, only allowed_http_cidrs)--> [Security group]
#       --> EC2 (Amazon Linux 2023, Docker)
#              frontend (Nginx :80) --> backend (:8080, internal) --> MySQL (:3306, internal)
#
# Admin access is through AWS Systems Manager Session Manager - no SSH port.
# -----------------------------------------------------------------------------

locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    Owner       = var.owner
    ManagedBy   = "Terraform"
  }

  # Pick the first Availability Zone in the region that offers the instance type.
  availability_zone = sort(data.aws_ec2_instance_type_offerings.available.locations)[0]
}

# -----------------------------------------------------------------------------
# Data sources: read-only lookups, nothing is created
# -----------------------------------------------------------------------------

# Latest Amazon Linux 2023 AMI for x86_64, published by AWS in SSM Parameter Store.
# Always current and region-correct, no hardcoded AMI IDs.
data "aws_ssm_parameter" "al2023_x86_64" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

# Details of the chosen instance type, used to double-check it is x86_64.
data "aws_ec2_instance_type" "selected" {
  instance_type = var.instance_type
}

# Availability Zones where the chosen instance type can be launched.
data "aws_ec2_instance_type_offerings" "available" {
  location_type = "availability-zone"

  filter {
    name   = "instance-type"
    values = [var.instance_type]
  }
}

# -----------------------------------------------------------------------------
# Network: a small dedicated VPC with one public subnet.
# No NAT gateway (it would cost ~US$32+/month); the instance reaches the
# internet (GHCR, Docker Hub, OS updates, Systems Manager) through the
# internet gateway using its public IP.
# -----------------------------------------------------------------------------

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = { Name = "${local.name_prefix}-vpc" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = { Name = "${local.name_prefix}-igw" }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = local.availability_zone
  map_public_ip_on_launch = true

  tags = { Name = "${local.name_prefix}-public-subnet" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = { Name = "${local.name_prefix}-public-rt" }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# -----------------------------------------------------------------------------
# Security group = the instance's firewall.
# Inbound: ONLY HTTP (80) from allowed_http_cidrs.
#   - no SSH (22): admin access uses Session Manager instead
#   - no MySQL (3306) and no Spring Boot (8080): they stay inside Docker's network
# Outbound: only HTTP/HTTPS, enough for OS packages, container images and
#   Systems Manager. (DNS and the time service use AWS-internal addresses that
#   security groups do not filter.)
# -----------------------------------------------------------------------------

resource "aws_security_group" "app" {
  name        = "${local.name_prefix}-app-sg"
  description = "Water Supply Tracker web server: HTTP in from allowed CIDRs only"
  vpc_id      = aws_vpc.main.id

  tags = { Name = "${local.name_prefix}-app-sg" }
}

resource "aws_vpc_security_group_ingress_rule" "http" {
  for_each = toset(var.allowed_http_cidrs)

  security_group_id = aws_security_group.app.id
  description       = "HTTP to the Nginx frontend"
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
  cidr_ipv4         = each.value
}

resource "aws_vpc_security_group_egress_rule" "https" {
  security_group_id = aws_security_group.app.id
  description       = "HTTPS out: GHCR, Docker Hub, Systems Manager, package repos"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "http" {
  security_group_id = aws_security_group.app.id
  description       = "HTTP out: package mirrors that redirect to HTTPS"
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
  cidr_ipv4         = "0.0.0.0/0"
}

# -----------------------------------------------------------------------------
# IAM: lets the instance register with Systems Manager so you can open a
# Session Manager shell. Least privilege - only the five actions Session
# Manager needs (no S3, no Parameter Store, no Run Command).
# -----------------------------------------------------------------------------

data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    sid     = "AllowEC2ToAssumeRole"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "session_manager" {
  statement {
    sid = "SessionManagerCore"
    actions = [
      "ssm:UpdateInstanceInformation",
      "ssmmessages:CreateControlChannel",
      "ssmmessages:CreateDataChannel",
      "ssmmessages:OpenControlChannel",
      "ssmmessages:OpenDataChannel",
    ]
    resources = ["*"] # these actions do not support resource-level restrictions
  }
}

resource "aws_iam_role" "ec2" {
  name               = "${local.name_prefix}-ec2-role"
  description        = "EC2 role for ${local.name_prefix}: Session Manager access only"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json
}

resource "aws_iam_role_policy" "session_manager" {
  name   = "session-manager-minimal"
  role   = aws_iam_role.ec2.id
  policy = data.aws_iam_policy_document.session_manager.json
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${local.name_prefix}-ec2-profile"
  role = aws_iam_role.ec2.name
}

# -----------------------------------------------------------------------------
# EC2 instance
# -----------------------------------------------------------------------------

resource "aws_instance" "app" {
  ami                    = data.aws_ssm_parameter.al2023_x86_64.value
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.app.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name
  # No key_name: there is no SSH key pair. Use Session Manager.

  # Installs Docker + Compose and writes /opt/water-supply/docker-compose.yml.
  # It does NOT start the application - you do that yourself (see README.md).
  user_data = templatefile("${path.module}/user_data.sh.tftpl", {
    frontend_image         = var.frontend_image
    backend_image          = var.backend_image
    docker_compose_version = var.docker_compose_version
  })
  user_data_replace_on_change = true

  # IMDSv2 only, hop limit 1: protects the instance's credentials from SSRF
  # attacks and keeps them out of reach of the Docker containers.
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.root_volume_size_gb
    encrypted             = true # uses the AWS-managed aws/ebs KMS key (no extra cost)
    delete_on_termination = true # WARNING: MySQL data is deleted with the instance - back it up
    tags                  = { Name = "${local.name_prefix}-root" }
  }

  monitoring = false # basic 5-minute CloudWatch metrics are free; detailed monitoring costs extra

  tags = { Name = "${local.name_prefix}-app" }

  lifecycle {
    # A newer Amazon Linux AMI is published every few weeks. Without this,
    # every new AMI would make `terraform apply` replace the instance (and
    # delete the database). Patch in place with `sudo dnf upgrade` instead.
    ignore_changes = [ami]

    precondition {
      condition     = contains(data.aws_ec2_instance_type.selected.supported_architectures, "x86_64")
      error_message = "The selected instance_type does not support x86_64, but the Docker images are linux/amd64."
    }
  }
}
