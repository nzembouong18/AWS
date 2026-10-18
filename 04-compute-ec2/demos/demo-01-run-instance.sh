#!/usr/bin/env bash
# Démo — lancer une instance durcie (IMDSv2, SSM) dans le VPC par défaut
set -euo pipefail
REGION="${AWS_REGION:-eu-west-3}"; export AWS_DEFAULT_REGION="$REGION"

AMI=$(aws ssm get-parameter --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \
  --query Parameter.Value --output text)

# Rôle + profil d'instance pour SSM
aws iam create-role --role-name demo-ec2-ssm --assume-role-policy-document '{
 "Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}' >/dev/null 2>&1 || true
aws iam attach-role-policy --role-name demo-ec2-ssm --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
aws iam create-instance-profile --instance-profile-name demo-ec2-ssm >/dev/null 2>&1 || true
aws iam add-role-to-instance-profile --instance-profile-name demo-ec2-ssm --role-name demo-ec2-ssm >/dev/null 2>&1 || true
sleep 10   # propagation IAM

ID=$(aws ec2 run-instances --image-id "$AMI" --instance-type t3.micro \
  --iam-instance-profile Name=demo-ec2-ssm \
  --metadata-options HttpTokens=required,HttpEndpoint=enabled \
  --block-device-mappings 'DeviceName=/dev/xvda,Ebs={VolumeSize=8,VolumeType=gp3,Encrypted=true}' \
  --user-data '#!/bin/bash
dnf install -y nginx && systemctl enable --now nginx
echo "Bonjour depuis $(hostname)" > /usr/share/nginx/html/index.html' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=demo-ec2}]' \
  --query 'Instances[0].InstanceId' --output text)

echo "Instance : $ID"
aws ec2 wait instance-running --instance-ids "$ID"
echo "Connexion : aws ssm start-session --target $ID"
echo "Nettoyage : aws ec2 terminate-instances --instance-ids $ID"
