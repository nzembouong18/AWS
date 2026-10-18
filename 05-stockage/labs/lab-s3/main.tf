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
  default_tags { tags = { Projet = "formation-aws", Module = "05" } }
}

data "aws_caller_identity" "me" {}
resource "random_id" "s" { byte_length = 3 }

# --- Clé KMS dédiée ---
resource "aws_kms_key" "data" {
  description             = "Lab05 - chiffrement du bucket de données"
  enable_key_rotation     = true
  deletion_window_in_days = 7
}

resource "aws_kms_alias" "data" {
  name          = "alias/lab05-data"
  target_key_id = aws_kms_key.data.key_id
}

# --- Bucket ---
resource "aws_s3_bucket" "data" {
  bucket        = "lab05-data-${data.aws_caller_identity.me.account_id}-${random_id.s.hex}"
  force_destroy = true
}

resource "aws_s3_bucket_ownership_controls" "data" {
  bucket = aws_s3_bucket.data.id
  rule { object_ownership = "BucketOwnerEnforced" } # ACL désactivées
}

resource "aws_s3_bucket_public_access_block" "data" {
  bucket                  = aws_s3_bucket.data.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "data" {
  bucket = aws_s3_bucket.data.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
  bucket = aws_s3_bucket.data.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.data.arn
    }
    bucket_key_enabled = true # réduit les appels KMS (coût)
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "data" {
  bucket     = aws_s3_bucket.data.id
  depends_on = [aws_s3_bucket_versioning.data]

  rule {
    id     = "tiering"
    status = "Enabled"
    filter {}
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    transition {
      days          = 90
      storage_class = "GLACIER_IR"
    }
    noncurrent_version_expiration {
      noncurrent_days = 180
    }
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# --- TLS obligatoire ---
data "aws_iam_policy_document" "tls_only" {
  statement {
    sid       = "DenyInsecureTransport"
    effect    = "Deny"
    actions   = ["s3:*"]
    resources = [aws_s3_bucket.data.arn, "${aws_s3_bucket.data.arn}/*"]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

resource "aws_s3_bucket_policy" "data" {
  bucket     = aws_s3_bucket.data.id
  policy     = data.aws_iam_policy_document.tls_only.json
  depends_on = [aws_s3_bucket_public_access_block.data]
}

# --- Notification -> SQS ---
resource "aws_sqs_queue" "events" {
  name = "lab05-s3-events-${random_id.s.hex}"
}

data "aws_iam_policy_document" "sqs_from_s3" {
  statement {
    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.events.arn]
    principals {
      type        = "Service"
      identifiers = ["s3.amazonaws.com"]
    }
    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [aws_s3_bucket.data.arn]
    }
  }
}

resource "aws_sqs_queue_policy" "events" {
  queue_url = aws_sqs_queue.events.id
  policy    = data.aws_iam_policy_document.sqs_from_s3.json
}

resource "aws_s3_bucket_notification" "data" {
  bucket     = aws_s3_bucket.data.id
  depends_on = [aws_sqs_queue_policy.events]

  queue {
    queue_arn = aws_sqs_queue.events.arn
    events    = ["s3:ObjectCreated:*"]
  }
}

output "bucket" { value = aws_s3_bucket.data.bucket }
output "queue_url" { value = aws_sqs_queue.events.id }
