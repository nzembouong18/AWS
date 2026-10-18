# Squelette TaskHub

```
infra/
  modules/        # network, data, ecs-service, edge, observability (à écrire)
  envs/dev/       # composition des modules + backend
app/              # API conteneurisée + Dockerfile
docs/adr/         # décisions d'architecture
.github/workflows # CI/CD
Makefile          # fmt, validate, lint, scan, plan, apply, destroy
```

## Ordre de travail conseillé
1. Backend S3 (voir module 10 / bootstrap).
2. Module `network` (module 03) → `data` (06) → `ecs-service` (09) → `edge` (07).
3. Pipeline OIDC (11).
4. `observability` (12) et durcissement (13).
5. Documentation, coûts, démo.

## Check-list quotidienne
- [ ] `make fmt validate lint scan` verts
- [ ] Aucun secret dans Git (`gitleaks detect`)
- [ ] `make destroy` en fin de session si l'environnement n'est pas nécessaire (💰)
