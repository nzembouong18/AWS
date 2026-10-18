#!/usr/bin/env bash
# Démo — créer une OU Sandbox et la lister (à exécuter depuis le compte de gestion)
set -euo pipefail
ROOT=$(aws organizations list-roots --query 'Roots[0].Id' --output text)
OU=$(aws organizations create-organizational-unit --parent-id "$ROOT" --name Sandbox \
      --query OrganizationalUnit.Id --output text)
echo "OU créée : $OU"
aws organizations list-organizational-units-for-parent --parent-id "$ROOT" --output table
aws organizations list-accounts --query 'Accounts[].[Id,Name,Status]' --output table
echo "Déplacer un compte : aws organizations move-account --account-id <ID> --source-parent-id $ROOT --destination-parent-id $OU"
