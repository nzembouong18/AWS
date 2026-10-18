# Défi : permission boundary

```hcl
data "aws_iam_policy_document" "boundary" {
  statement {
    effect    = "Allow"
    actions   = ["s3:*", "ec2:*"]
    resources = ["*"]
  }
  statement {
    effect    = "Deny"
    actions   = ["iam:CreateUser", "iam:CreateAccessKey", "iam:AttachUserPolicy"]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "boundary" {
  name   = "dev-boundary"
  policy = data.aws_iam_policy_document.boundary.json
}

# Dans aws_iam_role.dev :
#   permissions_boundary = aws_iam_policy.boundary.arn
```

Résultat : même si l'on ajoutait `iam:*` au rôle, le plafond l'interdirait.
Test : `aws iam simulate-principal-policy` sur `iam:CreateUser` → `implicitDeny`/`explicitDeny`.
