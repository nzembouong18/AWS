#!/usr/bin/env bash
# Démo — construire un VPC public minimal en CLI (comprendre avant d'utiliser Terraform)
set -euo pipefail
REGION="${AWS_REGION:-eu-west-3}"
export AWS_DEFAULT_REGION="$REGION"

VPC=$(aws ec2 create-vpc --cidr-block 10.99.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=demo-vpc}]' \
  --query Vpc.VpcId --output text)
aws ec2 modify-vpc-attribute --vpc-id "$VPC" --enable-dns-hostnames

AZ=$(aws ec2 describe-availability-zones --query 'AvailabilityZones[0].ZoneName' --output text)
SUBNET=$(aws ec2 create-subnet --vpc-id "$VPC" --cidr-block 10.99.0.0/24 --availability-zone "$AZ" \
  --query Subnet.SubnetId --output text)

IGW=$(aws ec2 create-internet-gateway --query InternetGateway.InternetGatewayId --output text)
aws ec2 attach-internet-gateway --internet-gateway-id "$IGW" --vpc-id "$VPC"

RT=$(aws ec2 create-route-table --vpc-id "$VPC" --query RouteTable.RouteTableId --output text)
aws ec2 create-route --route-table-id "$RT" --destination-cidr-block 0.0.0.0/0 --gateway-id "$IGW" >/dev/null
aws ec2 associate-route-table --route-table-id "$RT" --subnet-id "$SUBNET" >/dev/null
aws ec2 modify-subnet-attribute --subnet-id "$SUBNET" --map-public-ip-on-launch

echo "VPC=$VPC SUBNET=$SUBNET IGW=$IGW RT=$RT"
echo "Nettoyage :"
cat <<CLEAN
aws ec2 disassociate-route-table --association-id \$(aws ec2 describe-route-tables --route-table-ids $RT --query 'RouteTables[0].Associations[?!Main].RouteTableAssociationId' --output text)
aws ec2 delete-route-table --route-table-id $RT
aws ec2 detach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
aws ec2 delete-internet-gateway --internet-gateway-id $IGW
aws ec2 delete-subnet --subnet-id $SUBNET
aws ec2 delete-vpc --vpc-id $VPC
CLEAN
