# À appliquer depuis le COMPTE DE GESTION de l'organisation.
terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" {
  region = "us-east-1" # Organizations est un service global rattaché à us-east-1
}

variable "allowed_regions" {
  type    = list(string)
  default = ["eu-west-3", "eu-west-1", "eu-central-1"]
}

data "aws_organizations_organization" "org" {}

resource "aws_organizations_organizational_unit" "sandbox" {
  name      = "Sandbox"
  parent_id = data.aws_organizations_organization.org.roots[0].id
}

data "aws_iam_policy_document" "deny_regions" {
  statement {
    sid    = "DenyOutsideAllowedRegions"
    effect = "Deny"
    not_actions = [
      "iam:*", "organizations:*", "route53:*", "route53domains:*",
      "cloudfront:*", "support:*", "sts:*", "budgets:*", "ce:*", "health:*",
    ]
    resources = ["*"]
    condition {
      test     = "StringNotEquals"
      variable = "aws:RequestedRegion"
      values   = var.allowed_regions
    }
  }
}

data "aws_iam_policy_document" "protect_security" {
  statement {
    sid    = "ProtectSecurityServices"
    effect = "Deny"
    actions = [
      "cloudtrail:StopLogging", "cloudtrail:DeleteTrail",
      "guardduty:DeleteDetector", "guardduty:DisassociateFromMasterAccount",
      "config:StopConfigurationRecorder", "config:DeleteConfigurationRecorder",
    ]
    resources = ["*"]
  }
}

data "aws_iam_policy_document" "no_leave" {
  statement {
    sid       = "DenyLeaveOrganization"
    effect    = "Deny"
    actions   = ["organizations:LeaveOrganization"]
    resources = ["*"]
  }
}

resource "aws_organizations_policy" "deny_regions" {
  name    = "deny-outside-eu"
  type    = "SERVICE_CONTROL_POLICY"
  content = data.aws_iam_policy_document.deny_regions.json
}

resource "aws_organizations_policy" "protect_security" {
  name    = "protect-security-services"
  type    = "SERVICE_CONTROL_POLICY"
  content = data.aws_iam_policy_document.protect_security.json
}

resource "aws_organizations_policy" "no_leave" {
  name    = "deny-leave-organization"
  type    = "SERVICE_CONTROL_POLICY"
  content = data.aws_iam_policy_document.no_leave.json
}

resource "aws_organizations_policy_attachment" "deny_regions" {
  policy_id = aws_organizations_policy.deny_regions.id
  target_id = aws_organizations_organizational_unit.sandbox.id
}

resource "aws_organizations_policy_attachment" "protect_security" {
  policy_id = aws_organizations_policy.protect_security.id
  target_id = aws_organizations_organizational_unit.sandbox.id
}

resource "aws_organizations_policy_attachment" "no_leave" {
  policy_id = aws_organizations_policy.no_leave.id
  target_id = aws_organizations_organizational_unit.sandbox.id
}

output "sandbox_ou_id" { value = aws_organizations_organizational_unit.sandbox.id }
