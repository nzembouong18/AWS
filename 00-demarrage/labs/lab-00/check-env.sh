#!/usr/bin/env bash
# Valide que le poste est prêt pour la formation
ok=1
check() { if command -v "$1" >/dev/null 2>&1; then echo "✔ $1 : $($1 $2 2>&1 | head -1)"; else echo "✘ $1 manquant"; ok=0; fi; }

check aws --version
check terraform version
check jq --version
check git --version

if aws sts get-caller-identity >/dev/null 2>&1; then
  echo "✔ Authentifié : $(aws sts get-caller-identity --query Arn --output text)"
  region=$(aws configure get region || echo "${AWS_REGION:-}")
  [ -n "$region" ] && echo "✔ Région : $region" || { echo "✘ Aucune région par défaut"; ok=0; }
else
  echo "✘ Pas de credentials valides (aws sso login ?)"; ok=0
fi

[ $ok -eq 1 ] && echo "✅ Environnement OK" || { echo "❌ Environnement incomplet"; exit 1; }
