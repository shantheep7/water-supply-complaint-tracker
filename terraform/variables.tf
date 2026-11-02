# -----------------------------------------------------------------------------
# Input variables. Set your values in terraform.tfvars
# (copy terraform.tfvars.example). Variables without a default are required.
# -----------------------------------------------------------------------------

variable "aws_region" {
  description = "AWS region to deploy into, e.g. ap-south-1 (Mumbai). Must be chosen explicitly."
  type        = string

  validation {
    condition     = can(regex("^[a-z]{2}(-[a-z]+)+-[0-9]$", var.aws_region))
    error_message = "aws_region must look like a region code, e.g. ap-south-1 or us-east-1."
  }
}

variable "project_name" {
  description = "Short name used in resource names and tags."
  type        = string
  default     = "water-supply-tracker"

  validation {
    condition     = can(regex("^[a-z0-9-]{3,32}$", var.project_name))
    error_message = "project_name: 3-32 characters, lowercase letters, digits and hyphens only."
  }
}

variable "environment" {
  description = "Environment name used in tags, e.g. dev, staging, prod."
  type        = string
  default     = "dev"
}

variable "owner" {
  description = "Who owns these resources (name or email). Used in the Owner tag."
  type        = string
  default     = "unassigned"
}

variable "instance_type" {
  description = "EC2 instance type. Must be x86_64 (Intel/AMD) because the Docker images are linux/amd64. t3.small (2 GiB RAM) fits MySQL + Spring Boot + Nginx."
  type        = string
  default     = "t3.small"

  validation {
    # Graviton (ARM) families have a "g" after the generation number: t4g, m7g, c6gn ...
    condition     = !can(regex("^[a-z]+[0-9]+[a-z]*g[a-z]*\\.", var.instance_type))
    error_message = "ARM/Graviton instance types (t4g, m7g, ...) cannot run linux/amd64 images. Use an x86_64 type such as t3.small."
  }
}

variable "root_volume_size_gb" {
  description = "Size of the encrypted gp3 root volume in GiB (OS + Docker images + MySQL data)."
  type        = number
  default     = 20

  validation {
    condition     = var.root_volume_size_gb >= 10 && var.root_volume_size_gb <= 100
    error_message = "root_volume_size_gb must be between 10 and 100."
  }
}

variable "allowed_http_cidrs" {
  description = "IPv4 CIDR blocks allowed to open the website on port 80, e.g. [\"203.0.113.25/32\"] for just your IP. Use [\"0.0.0.0/0\"] only if you really want the whole internet to reach it."
  type        = list(string)

  validation {
    condition     = length(var.allowed_http_cidrs) > 0 && alltrue([for cidr in var.allowed_http_cidrs : can(cidrhost(cidr, 0))])
    error_message = "allowed_http_cidrs must contain at least one valid IPv4 CIDR, e.g. 203.0.113.25/32."
  }
}

variable "vpc_cidr" {
  description = "Private IP range for the project VPC."
  type        = string
  default     = "10.20.0.0/16"
}

variable "public_subnet_cidr" {
  description = "IP range for the single public subnet (must be inside vpc_cidr)."
  type        = string
  default     = "10.20.1.0/24"
}

variable "frontend_image" {
  description = "Frontend container image (React + Nginx). Prefer an immutable tag or digest over :latest."
  type        = string
  default     = "ghcr.io/shantheep7/water-supply-frontend:latest"
}

variable "backend_image" {
  description = "Backend container image (Spring Boot). Prefer an immutable tag or digest over :latest."
  type        = string
  default     = "ghcr.io/shantheep7/water-supply-backend:latest"
}

variable "docker_compose_version" {
  description = "Docker Compose v2 plugin release installed on the instance (downloaded from GitHub and checksum-verified)."
  type        = string
  default     = "v2.29.7"
}
