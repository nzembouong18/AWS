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

variable "email" {
  description = "Adresse qui recevra les alertes"
  type        = string
}

variable "lambda_name" {
  description = "Fonction Lambda à surveiller (ex. lab08-api du module 08)"
  type        = string
  default     = "lab08-api"
}

provider "aws" {
  region = var.region
  default_tags { tags = { Projet = "formation-aws", Module = "12" } }
}

data "aws_caller_identity" "me" {}
resource "random_id" "s" { byte_length = 3 }

# ---------- Notifications ----------
resource "aws_sns_topic" "alerts" { name = "lab12-alerts" }

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.email
}

# EventBridge doit pouvoir publier sur le topic
data "aws_iam_policy_document" "sns_events" {
  statement {
    actions   = ["sns:Publish"]
    resources = [aws_sns_topic.alerts.arn]
    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com", "cloudwatch.amazonaws.com"]
    }
  }
}

resource "aws_sns_topic_policy" "alerts" {
  arn    = aws_sns_topic.alerts.arn
  policy = data.aws_iam_policy_document.sns_events.json
}

# ---------- Alarme sur les erreurs Lambda ----------
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "lab12-lambda-errors"
  namespace           = "AWS/Lambda"
  metric_name         = "Errors"
  dimensions          = { FunctionName = var.lambda_name }
  statistic           = "Sum"
  period              = 60
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
}

# ---------- Metric filter sur les logs ----------
resource "aws_cloudwatch_log_metric_filter" "errors" {
  name           = "lab12-error-count"
  log_group_name = "/aws/lambda/${var.lambda_name}"
  pattern        = "?ERROR ?Exception ?Traceback"

  metric_transformation {
    name          = "AppErrors"
    namespace     = "Lab12"
    value         = "1"
    default_value = "0"
  }
}

# ---------- Alerte sur arrêt d'instance EC2 ----------
resource "aws_cloudwatch_event_rule" "ec2_stopped" {
  name = "lab12-ec2-stopped"
  event_pattern = jsonencode({
    source        = ["aws.ec2"]
    "detail-type" = ["EC2 Instance State-change Notification"]
    detail        = { state = ["stopped", "terminated"] }
  })
}

resource "aws_cloudwatch_event_target" "ec2_stopped" {
  rule = aws_cloudwatch_event_rule.ec2_stopped.name
  arn  = aws_sns_topic.alerts.arn
}

# ---------- CloudTrail -> S3 ----------
resource "aws_s3_bucket" "trail" {
  bucket        = "lab12-trail-${data.aws_caller_identity.me.account_id}-${random_id.s.hex}"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "trail" {
  bucket                  = aws_s3_bucket.trail.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

data "aws_iam_policy_document" "trail_bucket" {
  statement {
    sid       = "AclCheck"
    actions   = ["s3:GetBucketAcl"]
    resources = [aws_s3_bucket.trail.arn]
    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }
  }
  statement {
    sid       = "Write"
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.trail.arn}/AWSLogs/${data.aws_caller_identity.me.account_id}/*"]
    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "s3:x-amz-acl"
      values   = ["bucket-owner-full-control"]
    }
  }
}

resource "aws_s3_bucket_policy" "trail" {
  bucket = aws_s3_bucket.trail.id
  policy = data.aws_iam_policy_document.trail_bucket.json
}

resource "aws_cloudtrail" "main" {
  name                          = "lab12-trail"
  s3_bucket_name                = aws_s3_bucket.trail.id
  is_multi_region_trail         = true
  include_global_service_events = true
  enable_log_file_validation    = true
  depends_on                    = [aws_s3_bucket_policy.trail]
}

# ---------- Dashboard ----------
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "lab12"
  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric", x = 0, y = 0, width = 12, height = 6
        properties = {
          title  = "Lambda - invocations et erreurs"
          region = var.region
          stat   = "Sum"
          period = 60
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", var.lambda_name],
            ["AWS/Lambda", "Errors", "FunctionName", var.lambda_name]
          ]
        }
      },
      {
        type = "metric", x = 12, y = 0, width = 12, height = 6
        properties = {
          title   = "Lambda - durée (p95)"
          region  = var.region
          stat    = "p95"
          period  = 60
          metrics = [["AWS/Lambda", "Duration", "FunctionName", var.lambda_name]]
        }
      }
    ]
  })
}

output "topic_arn" { value = aws_sns_topic.alerts.arn }
output "trail_bucket" { value = aws_s3_bucket.trail.bucket }
