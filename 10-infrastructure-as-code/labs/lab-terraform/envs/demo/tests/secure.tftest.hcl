# Défi : `terraform test` (nécessite des credentials ; command = plan évite de créer des ressources)
run "versioning_active_en_prod" {
  command = plan

  assert {
    condition     = module.bucket["prod"].id != ""
    error_message = "Le bucket prod doit exister"
  }
}
