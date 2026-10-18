# Application

Écrivez ici une API minimale (Python/Node/Go) exposant :
- `GET /health` → 200
- `GET /api/tasks`, `POST /api/tasks` → PostgreSQL via le secret injecté
- journaux JSON sur stdout

Exigences image : multi-stage, utilisateur non-root, pas de secret, `HEALTHCHECK`.
