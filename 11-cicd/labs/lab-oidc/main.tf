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

variable "github_org" {
  type = string
}

variable "github_repo" {
  type = string
}

provider "aws" {
  region = var.region
  default_tags { tags = { Projet = "formation-aws", Module = "11" } }
}

data "aws_caller_identity" "me" {}
resource "random_id" "s" { byte_length = 3 }

# Fournisseur OIDC GitHub (un seul par compte : adapter si déjà existant)
resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
  # Depuis 2023 AWS valide la chaîne de confiance de l'IdP ; le thumbprint est conservé pour compatibilité
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

# Bucket de déploiement (site statique de démonstration)
resource "aws_s3_bucket" "site" {
  bucket        = "lab11-site-${data.aws_caller_identity.me.account_id}-${random_id.s.hex}"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# --- Rôle de DÉPLOIEMENT : uniquement la branche main ---
data "aws_iam_policy_document" "trust_deploy" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_org}/${var.github_repo}:ref:refs/heads/main"]
    }
  }
}

resource "aws_iam_role" "deploy" {
  name                 = "lab11-github-deploy"
  assume_role_policy   = data.aws_iam_policy_document.trust_deploy.json
  max_session_duration = 3600
}

data "aws_iam_policy_document" "deploy" {
  statement {
    actions   = ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]
  }
  statement {
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.site.arn]
  }
}

resource "aws_iam_role_policy" "deploy" {
  role   = aws_iam_role.deploy.id
  policy = data.aws_iam_policy_document.deploy.json
}

# --- Rôle PLAN (PR) : lecture seule, toute pull request du dépôt ---
data "aws_iam_policy_document" "trust_plan" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_org}/${var.github_repo}:pull_request"]
    }
  }
}

resource "aws_iam_role" "plan" {
  name               = "lab11-github-plan"
  assume_role_policy = data.aws_iam_policy_document.trust_plan.json
}

resource "aws_iam_role_policy_attachment" "plan_readonly" {
  role       = aws_iam_role.plan.name
  policy_arn = "arn:aws:iam::aws:policy/ReadOnlyAccess"
}

output "deploy_role_arn" { value = aws_iam_role.deploy.arn }
output "plan_role_arn" { value = aws_iam_role.plan.arn }
output "bucket" { value = aws_s3_bucket.site.bucket }
