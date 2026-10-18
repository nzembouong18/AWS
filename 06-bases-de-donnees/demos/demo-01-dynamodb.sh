#!/usr/bin/env bash
# Démo — DynamoDB : clé composite, Query, GSI, TTL
set -euo pipefail
T="demo-commandes"

aws dynamodb create-table --table-name "$T" \
  --attribute-definitions AttributeName=client,AttributeType=S AttributeName=commande,AttributeType=S AttributeName=statut,AttributeType=S \
  --key-schema AttributeName=client,KeyType=HASH AttributeName=commande,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes '[{"IndexName":"par-statut","KeySchema":[{"AttributeName":"statut","KeyType":"HASH"},{"AttributeName":"commande","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"}}]' >/dev/null
aws dynamodb wait table-exists --table-name "$T"
aws dynamodb update-time-to-live --table-name "$T" --time-to-live-specification Enabled=true,AttributeName=expire_at >/dev/null

EXP=$(( $(date +%s) + 3600 ))
for i in 1 2 3; do
  aws dynamodb put-item --table-name "$T" --item "{
    \"client\":{\"S\":\"c42\"},\"commande\":{\"S\":\"2026-00$i\"},
    \"statut\":{\"S\":\"$([ $i -eq 2 ] && echo LIVRE || echo EN_COURS)\"},
    \"total\":{\"N\":\"$((i*20))\"},\"expire_at\":{\"N\":\"$EXP\"}}"
done

echo "== Query : commandes du client c42 =="
aws dynamodb query --table-name "$T" --key-condition-expression "client = :c" \
  --expression-attribute-values '{":c":{"S":"c42"}}' --query 'Items[].commande.S'

echo "== Query GSI : commandes EN_COURS =="
aws dynamodb query --table-name "$T" --index-name par-statut \
  --key-condition-expression "statut = :s" --expression-attribute-values '{":s":{"S":"EN_COURS"}}' \
  --query 'Items[].[client.S,commande.S]'

echo "Nettoyage : aws dynamodb delete-table --table-name $T"
