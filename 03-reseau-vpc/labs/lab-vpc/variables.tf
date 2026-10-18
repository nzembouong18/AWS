variable "region" {
  type    = string
  default = "eu-west-3"
}

variable "name" {
  type    = string
  default = "lab03"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "enable_nat" {
  description = "💰 Crée une NAT Gateway pour la sortie Internet du privé"
  type        = bool
  default     = false
}

variable "nat_per_az" {
  description = "Une NAT par AZ (HA) au lieu d'une seule"
  type        = bool
  default     = false
}
