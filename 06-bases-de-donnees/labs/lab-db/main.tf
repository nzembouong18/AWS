terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

variable "region" {
  type    = string
  default = "eu-west-3"
}

variable "multi_az" {
  type    = bool
  default = false
}

provider "aws" {
  region = var.region
  default_tags { tags = { Projet = "formation-aws", Module = "06" } }
}

# VPC par défaut pour simplifier ; la DB reste NON publique
data "aws_vpc" "default" { default = true }

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_db_subnet_group" "db" {
  name       = "lab06-db"
  subnet_ids = data.aws_subnets.default.ids
}

resource "aws_security_group" "db" {
  name_prefix = "lab06-db-"
  vpc_id      = data.aws_vpc.default.id
  description = "PostgreSQL depuis le VPC uniquement"
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.default.cidr_block]
  }
  lifecycle { create_before_destroy = true }
}

resource "aws_db_instance" "pg" {
  identifier        = "lab06-pg"
  engine            = "postgres"
  engine_version    = "16"
  instance_class    = "db.t4g.micro"
  allocated_storage = 20
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = "app"
  username = "appadmin"
  # Mot de passe généré et stocké par RDS dans Secrets Manager : jamais dans le code/state en clair
  manage_master_user_password = true

  multi_az               = var.multi_az
  publicly_accessible    = false
  db_subnet_group_name   = aws_db_subnet_group.db.name
  vpc_security_group_ids = [aws_security_group.db.id]

  backup_retention_period = 7
  deletion_protection     = false # lab uniquement ! true en production
  skip_final_snapshot     = true  # lab uniquement ! false en production

  iam_database_authentication_enabled = true
  performance_insights_enabled        = true
}

# --- DynamoDB ---
resource "aws_dynamodb_table" "orders" {
  name         = "lab06-orders"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "client"
  range_key    = "commande"

  attribute {
    name = "client"
    type = "S"
  }
  attribute {
    name = "commande"
    type = "S"
  }
  attribute {
    name = "statut"
    type = "S"
  }

  global_secondary_index {
    name            = "par-statut"
    hash_key        = "statut"
    range_key       = "commande"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expire_at"
    enabled        = true
  }

  point_in_time_recovery { enabled = true }
  server_side_encryption { enabled = true }
}

output "db_endpoint" { value = aws_db_instance.pg.address }
output "db_secret_arn" { value = aws_db_instance.pg.master_user_secret[0].secret_arn }
output "table" { value = aws_dynamodb_table.orders.name }
