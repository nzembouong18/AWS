# Défi : `terraform test` (nécessite des credentials ; command = plan ne crée aucune ressource)
run "chiffrement_actif_sur_tous_les_buckets" {
  command = plan

  assert {
    condition     = alltrue([for k, m in module.bucket : m.encryption_algorithm == "AES256"])
    error_message = "Tous les buckets doivent être chiffrés en AES256"
  }
}
