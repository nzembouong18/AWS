variable "bucket_name" {
  description = "Nom global unique du bucket"
  type        = string
}

variable "versioning" {
  description = "Activer le versioning"
  type        = bool
  default     = true
}

variable "force_destroy" {
  description = "Supprimer le bucket même non vide (labs uniquement)"
  type        = bool
  default     = false
}

variable "tags" {
  type    = map(string)
  default = {}
}
