# -----------------------------------------------------------------------------
# Terraform + provider configuration
# -----------------------------------------------------------------------------
# "required_providers" pins which plugins Terraform downloads during
# `terraform init`. The exact versions chosen are recorded in
# .terraform.lock.hcl (commit that file so everyone uses the same versions).

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # State is stored locally in terraform.tfstate (git-ignored).
  # For team use, move it to an S3 backend later - see README.md.
}

# Credentials are NEVER written here. The provider reads them from your
# environment: `aws configure sso` / `aws configure` profiles, the
# AWS_PROFILE variable, or AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY.
provider "aws" {
  region = var.aws_region

  # Added to every resource that supports tags.
  default_tags {
    tags = local.common_tags
  }
}
