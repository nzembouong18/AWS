#!/usr/bin/env bash
# Démo — analyser les coûts du mois en CLI (Cost Explorer: ~0,01 $ par requête)
set -euo pipefail
START=$(date -u +%Y-%m-01)
END=$(date -u -d '+1 day' +%Y-%m-%d 2>/dev/null || date -u -v+1d +%Y-%m-%d)

echo "== Coût du mois par service =="
aws ce get-cost-and-usage --time-period Start="$START",End="$END" --granularity MONTHLY \
  --metrics UnblendedCost --group-by Type=DIMENSION,Key=SERVICE \
  --query 'ResultsByTime[0].Groups[].[Keys[0],Metrics.UnblendedCost.Amount]' --output text \
  | sort -k2 -nr | head -10

echo; echo "== Prévision fin de mois =="
aws ce get-cost-forecast --time-period Start="$(date -u +%Y-%m-%d)",End="$(date -u -d "$(date -u +%Y-%m-01) +1 month" +%Y-%m-%d)" \
  --metric UNBLENDED_COST --granularity MONTHLY --query 'Total.Amount' --output text 2>/dev/null || echo "(prévision indisponible)"

echo; echo "== Ressources orphelines à vérifier =="
echo "- Volumes EBS non attachés :"
aws ec2 describe-volumes --filters Name=status,Values=available --query 'Volumes[].[VolumeId,Size]' --output text
echo "- Elastic IP non associées :"
aws ec2 describe-addresses --query 'Addresses[?AssociationId==`null`].PublicIp' --output text
