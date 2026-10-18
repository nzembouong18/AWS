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
  default_tags { tags = { Projet = "formation-aws", Module = "13" } }
}

data "aws_caller_identity" "me" {}

locals {
  account_id = data.aws_caller_identity.me.account_id
}

# ---------- 1. CMK avec séparation admin / utilisateurs ----------
data "aws_iam_policy_document" "key" {
  # Le compte garde la main (permet la délégation via IAM)
  statement {
    sid       = "EnableIAMPolicies"
    actions   = ["kms:*"]
    resources = ["*"]
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${local.account_id}:root"]
    }
  }
}

resource "aws_kms_key" "app" {
  description             = "Lab13 - clé applicative"
  enable_key_rotation     = true
  deletion_window_in_days = 7
  policy                  = data.aws_iam_policy_document.key.json
}

resource "aws_kms_alias" "app" {
  name          = "alias/lab13-app"
  target_key_id = aws_kms_key.app.key_id
}

# ---------- 2. Secret chiffré avec la CMK ----------
resource "aws_secretsmanager_secret" "api" {
  name                    = "lab13/api-key"
  kms_key_id              = aws_kms_key.app.arn
  recovery_window_in_days = 0 # lab uniquement
}

resource "aws_secretsmanager_secret_version" "api" {
  secret_id     = aws_secretsmanager_secret.api.id
  secret_string = jsonencode({ api_key = "valeur-de-demonstration" })
}

# ---------- 3. Garde-fous au niveau compte ----------
resource "aws_ebs_encryption_by_default" "on" {
  enabled = true
}

resource "aws_s3_account_public_access_block" "account" {
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ---------- 4. GuardDuty ----------
resource "aws_guardduty_detector" "main" {
  enable = true
}

# ---------- 5. WAF (scope REGIONAL : utilisable sur un ALB / API GW) ----------
resource "aws_wafv2_web_acl" "main" {
  name  = "lab13-waf"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  rule {
    name     = "AWSManagedCommon"
    priority = 1
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesCommonRuleSet"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "common"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "AWSManagedSQLi"
    priority = 2
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesSQLiRuleSet"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "sqli"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "RateLimit"
    priority = 3
    action {
      block {}
    }
    statement {
      rate_based_statement {
        limit              = 500 # requêtes / 5 min / IP
        aggregate_key_type = "IP"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "ratelimit"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "lab13"
    sampled_requests_enabled   = true
  }
}

# ---------- 6. AWS Config : règle « SSH ouvert au monde » ----------
# Prérequis : un enregistreur Config actif dans la région (créé ici pour le lab)
data "aws_iam_policy_document" "config_trust" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["config.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "config" {
  name               = "lab13-config"
  assume_role_policy = data.aws_iam_policy_document.config_trust.json
}

resource "aws_iam_role_policy_attachment" "config" {
  role       = aws_iam_role.config.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWS_ConfigRole"
}

resource "aws_s3_bucket" "config" {
  bucket        = "lab13-config-${local.account_id}"
  force_destroy = true
}

data "aws_iam_policy_document" "config_bucket" {
  statement {
    actions   = ["s3:GetBucketAcl", "s3:ListBucket"]
    resources = [aws_s3_bucket.config.arn]
    principals {
      type        = "Service"
      identifiers = ["config.amazonaws.com"]
    }
  }
  statement {
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.config.arn}/AWSLogs/${local.account_id}/Config/*"]
    principals {
      type        = "Service"
      identifiers = ["config.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "s3:x-amz-acl"
      values   = ["bucket-owner-full-control"]
    }
  }
}

resource "aws_s3_bucket_policy" "config" {
  bucket = aws_s3_bucket.config.id
  policy = data.aws_iam_policy_document.config_bucket.json
}

resource "aws_config_configuration_recorder" "main" {
  name     = "lab13"
  role_arn = aws_iam_role.config.arn
  recording_group {
    all_supported = true
  }
}

resource "aws_config_delivery_channel" "main" {
  name           = "lab13"
  s3_bucket_name = aws_s3_bucket.config.bucket
  depends_on     = [aws_config_configuration_recorder.main, aws_s3_bucket_policy.config]
}

resource "aws_config_configuration_recorder_status" "main" {
  name       = aws_config_configuration_recorder.main.name
  is_enabled = true
  depends_on = [aws_config_delivery_channel.main]
}

resource "aws_config_config_rule" "ssh_open" {
  name = "restricted-ssh"
  source {
    owner             = "AWS"
    source_identifier = "INCOMING_SSH_DISABLED"
  }
  depends_on = [aws_config_configuration_recorder_status.main]
}

output "kms_key_arn" { value = aws_kms_key.app.arn }
output "secret_arn" { value = aws_secretsmanager_secret.api.arn }
output "waf_arn" { value = aws_wafv2_web_acl.main.arn }
