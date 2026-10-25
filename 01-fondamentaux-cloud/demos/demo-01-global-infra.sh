#!/usr/bin/env bash
# Démo — explorer l'infrastructure globale AWS
set -euo pipefail
REGION="${1:-eu-west-3}"

echo "== Régions activées =="
aws ec2 describe-regions --query 'Regions[].RegionName' --output text | tr '\t' '\n' | sort

echo; echo "== AZ de $REGION (nom -> ID physique) =="
aws ec2 describe-availability-zones --region "$REGION" \
  --query 'AvailabilityZones[].[ZoneName,ZoneId,State]' --output table

echo; echo "== Nombre de services AWS disponibles dans $REGION =="
aws ssm get-parameters-by-path \
  --path "/aws/service/global-infrastructure/regions/$REGION/services" \
  --region us-east-1 --query 'Parameters[].Name' --output text | wc -w

echo; echo "== Types d'instances disponibles par AZ (t3.micro) =="
aws ec2 describe-instance-type-offerings --location-type availability-zone \
  --filters Name=instance-type,Values=t3.micro --region "$REGION" \
  --query 'InstanceTypeOfferings[].Location' --output text
