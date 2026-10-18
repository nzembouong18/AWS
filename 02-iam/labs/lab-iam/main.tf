terraform {
  required_version = ">= 1.6"
  required_providers {
    aws    = { source = "hashicorp/aws", version = "~> 5.0" }
    random = { source = "hashicorp/random", version = "~> 3.6" }
  }
}

variable "region" {
  type    = string
  default = "eu-west-3"
}

provider "aws" {
  region = var.region
  default_tags { tags = { Projet = "formation-aws", Module = "02" } }
}

data "aws_caller_identity" "me" {}

resource "random_id" "s" { byte_length = 3 }

# --- Bucket applicatif ---
resource "aws_s3_bucket" "app" {
  bucket        = "formation-iam-app-${random_id.s.hex}"
  force_destroy = true
}

# --- Utilisateur de test + groupe ---
resource "aws_iam_group" "devs" { name = "devs" }

resource "aws_iam_user" "alice" {
  name          = "alice-test"
  force_destroy = true
}

resource "aws_iam_group_membership" "devs" {
  name  = "devs-membership"
  group = aws_iam_group.devs.name
  users = [aws_iam_user.alice.name]
}

# --- Le groupe n'a qu'un droit : assumer dev-role (avec MFA) ---
data "aws_iam_policy_document" "group_assume" {
  statement {
    actions   = ["sts:AssumeRole"]
    resources = [aws_iam_role.dev.arn]
  }
}

resource "aws_iam_group_policy" "assume_dev" {
  name   = "assume-dev-role"
  group  = aws_iam_group.devs.name
  policy = data.aws_iam_policy_document.group_assume.json
}

# --- Trust policy : alice, avec MFA ---
data "aws_iam_policy_document" "trust" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "AWS"
      identifiers = [aws_iam_user.alice.arn]
    }
    condition {
      test     = "Bool"
      variable = "aws:MultiFactorAuthPresent"
      values   = ["true"]
    }
  }
}

resource "aws_iam_role" "dev" {
  name                 = "dev-role"
  assume_role_policy   = data.aws_iam_policy_document.trust.json
  max_session_duration = 3600
}

# --- Permissions du rôle ---
data "aws_iam_policy_document" "dev_permissions" {
  statement {
    sid       = "S3AppBucket"
    actions   = ["s3:GetObject", "s3:PutObject"]
    resources = ["${aws_s3_bucket.app.arn}/*"]
  }
  statement {
    sid       = "S3List"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.app.arn]
  }
  statement {
    sid       = "Ec2DescribeAlways"
    actions   = ["ec2:Describe*"]
    resources = ["*"]
  }
  statement {
    sid       = "RunInstancesOnlyInRegionAndTagged"
    actions   = ["ec2:RunInstances"]
    resources = ["arn:aws:ec2:${var.region}:${data.aws_caller_identity.me.account_id}:instance/*"]
    condition {
      test     = "StringEquals"
      variable = "aws:RequestTag/team"
      values   = ["dev"]
    }
  }
  statement {
    sid     = "RunInstancesOtherResources"
    actions = ["ec2:RunInstances"]
    resources = [
      "arn:aws:ec2:${var.region}::image/*",
      "arn:aws:ec2:${var.region}:${data.aws_caller_identity.me.account_id}:subnet/*",
      "arn:aws:ec2:${var.region}:${data.aws_caller_identity.me.account_id}:network-interface/*",
      "arn:aws:ec2:${var.region}:${data.aws_caller_identity.me.account_id}:security-group/*",
      "arn:aws:ec2:${var.region}:${data.aws_caller_identity.me.account_id}:volume/*",
    ]
  }
  statement {
    sid       = "TaggingOnCreate"
    actions   = ["ec2:CreateTags"]
    resources = ["arn:aws:ec2:${var.region}:${data.aws_caller_identity.me.account_id}:*/*"]
    condition {
      test     = "StringEquals"
      variable = "ec2:CreateAction"
      values   = ["RunInstances"]
    }
  }
}

resource "aws_iam_role_policy" "dev" {
  name   = "dev-permissions"
  role   = aws_iam_role.dev.id
  policy = data.aws_iam_policy_document.dev_permissions.json
}

output "assume_command" {
  value = "aws sts assume-role --role-arn ${aws_iam_role.dev.arn} --role-session-name alice --serial-number <MFA_ARN> --token-code <CODE>"
}

output "bucket" {
  value = aws_s3_bucket.app.bucket
}
