#!/usr/bin/env bash
# Démo — versioning S3 : écraser, supprimer, restaurer
set -euo pipefail
B="demo-versioning-$(aws sts get-caller-identity --query Account --output text)-$RANDOM"
aws s3api create-bucket --bucket "$B" --region "${AWS_REGION:-eu-west-3}" \
  --create-bucket-configuration LocationConstraint="${AWS_REGION:-eu-west-3}" >/dev/null
aws s3api put-bucket-versioning --bucket "$B" --versioning-configuration Status=Enabled

for i in 1 2 3; do echo "version $i" | aws s3 cp - "s3://$B/note.txt"; done
echo "== Versions =="
aws s3api list-object-versions --bucket "$B" --query 'Versions[].[VersionId,IsLatest,LastModified]' --output table

aws s3 rm "s3://$B/note.txt"
echo "== Après suppression : delete marker =="
aws s3api list-object-versions --bucket "$B" --query 'DeleteMarkers[].[VersionId,IsLatest]' --output table

DM=$(aws s3api list-object-versions --bucket "$B" --query 'DeleteMarkers[0].VersionId' --output text)
aws s3api delete-object --bucket "$B" --key note.txt --version-id "$DM"
echo "== Restauré =="; aws s3 cp "s3://$B/note.txt" -

echo "Nettoyage : aws s3 rb s3://$B --force (puis supprimer les versions: voir terraform force_destroy)"
