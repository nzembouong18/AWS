#!/usr/bin/env bash
# Démo — assumer un rôle et utiliser les credentials temporaires
set -euo pipefail
ROLE_ARN="${1:?usage: $0 <role-arn> [mfa-serial] [mfa-code]}"
MFA_SERIAL="${2:-}"; MFA_CODE="${3:-}"

args=(--role-arn "$ROLE_ARN" --role-session-name "demo-$(date +%s)" --duration-seconds 3600)
[ -n "$MFA_SERIAL" ] && args+=(--serial-number "$MFA_SERIAL" --token-code "$MFA_CODE")

creds=$(aws sts assume-role "${args[@]}" --query Credentials --output json)
AWS_ACCESS_KEY_ID=$(jq -r .AccessKeyId <<<"$creds")
AWS_SECRET_ACCESS_KEY=$(jq -r .SecretAccessKey <<<"$creds")
AWS_SESSION_TOKEN=$(jq -r .SessionToken <<<"$creds")
export AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN
echo "Expire le : $(jq -r .Expiration <<<"$creds")"

echo "== Identité effective =="
aws sts get-caller-identity
