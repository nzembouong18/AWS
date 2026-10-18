terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  # Décommentez après avoir amorcé le backend (bootstrap) et collez le snippet affiché :
  # backend "s3" { ... }
}

variable "region" {
  type    = string
  default = "eu-west-3"
}

provider "aws" {
  region = var.region
  default_tags { tags = { Projet = "formation-aws", Module = "10" } }
}

data "aws_caller_identity" "me" {}

locals {
  envs = {
    dev  = { versioning = false }
    prod = { versioning = true }
  }
}

module "bucket" {
  source   = "../../modules/s3-bucket-secure"
  for_each = local.envs

  bucket_name   = "lab10-${each.key}-${data.aws_caller_identity.me.account_id}"
  versioning    = each.value.versioning
  force_destroy = true
  tags          = { Env = each.key }
}

output "buckets" {
  value = { for k, m in module.bucket : k => m.id }
}
