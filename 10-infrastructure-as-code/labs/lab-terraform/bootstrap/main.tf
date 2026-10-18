# Amorçage du backend Terraform : bucket d'état + table de verrouillage
terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
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

resource "aws_s3_bucket" "state" {
  bucket        = "tfstate-${data.aws_caller_identity.me.account_id}-${var.region}"
  force_destroy = true # lab uniquement
}

resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket                  = aws_s3_bucket.state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "locks" {
  name         = "tf-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
}

output "backend_snippet" {
  value = <<-EOT
    terraform {
      backend "s3" {
        bucket         = "${aws_s3_bucket.state.bucket}"
        key            = "lab10/demo/terraform.tfstate"
        region         = "${var.region}"
        encrypt        = true
        dynamodb_table = "${aws_dynamodb_table.locks.name}"
      }
    }
  EOT
}
