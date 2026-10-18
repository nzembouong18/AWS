# Module 11 — CI/CD sur AWS

**Durée** : 1,5 jour · **Niveau** : intermédiaire · **Coût** : ≈ 0 € (CodeBuild/CodePipeline : quota gratuit limité)
**Certifications** : **DOP-C02 (cœur)**, DVA, SOA

## Objectifs

- Concevoir un pipeline : *build → test → scan → déploiement → vérification → rollback*
- Utiliser **GitHub Actions avec OIDC** pour déployer sur AWS **sans clé**
- Connaître la suite **CodeBuild / CodePipeline / CodeDeploy / CodeArtifact**
- Appliquer les stratégies de déploiement : **rolling, blue/green, canary**, et les **feature flags**

## 1. Le pipeline idéal

```
Commit → [Lint + tests unitaires] → [Build image/artefact] → [Scan SAST/SCA/IaC/image]
       → [Publication artefact signé (ECR/S3/CodeArtifact)]
       → [Déploiement dev auto] → [Tests d'intégration/smoke]
       → [Approbation] → [Déploiement prod progressif] → [Vérif. métriques → rollback auto]
```

Principes DevOps : **build once, deploy many** (même artefact dans tous les environnements), pipelines **as code**, secrets hors code, environnements isolés (comptes séparés), traçabilité (commit SHA ↔ version déployée).

## 2. Services AWS

| Service | Rôle |
|---|---|
| **CodeCommit** | Dépôt Git (⚠️ fermé aux nouveaux clients depuis 2024 : préférer GitHub/GitLab) |
| **CodeBuild** | Build/tests managés, conteneurs éphémères, `buildspec.yml` |
| **CodeDeploy** | Déploiement vers EC2/on-prem, Lambda, ECS (rolling, blue/green, canary) via `appspec` |
| **CodePipeline** | Orchestration (source → build → test → deploy → approbation), V2 déclencheurs/variables |
| **CodeArtifact** | Dépôt de paquets (npm, PyPI, Maven…) |
| **ECR / S3** | Stockage d'artefacts |
| **EC2 Image Builder** | Pipelines d'AMI/conteneurs |
| **CloudFormation / CDK Pipelines** | Déploiement d'infrastructure |
| **Elastic Beanstalk / App Runner** | PaaS avec déploiement intégré |

### buildspec.yml (CodeBuild)
```yaml
version: 0.2
env:
  variables: { APP: lab11 }
phases:
  install:
    runtime-versions: { python: 3.12 }
  pre_build:
    commands:
      - pip install -r requirements.txt
      - pytest -q
      - aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
  build:
    commands:
      - docker build -t $ECR_REGISTRY/$APP:$CODEBUILD_RESOLVED_SOURCE_VERSION .
  post_build:
    commands:
      - docker push $ECR_REGISTRY/$APP:$CODEBUILD_RESOLVED_SOURCE_VERSION
artifacts:
  files: [ appspec.yaml, taskdef.json ]
reports:
  junit: { files: ["report.xml"], file-format: JUNITXML }
cache:
  paths: [ "/root/.cache/pip/**/*" ]
```

## 3. Stratégies de déploiement

| Stratégie | Principe | Risque / coût |
|---|---|---|
| **All-at-once** | Tout d'un coup | Indisponibilité possible, retour lent |
| **Rolling** | Par lots | Versions mixtes temporaires |
| **Rolling with extra batch / immutable** | Nouvelles instances puis bascule | Capacité temporaire supplémentaire |
| **Blue/Green** | Deux environnements, bascule du trafic | Coût doublé brièvement, retour instantané |
| **Canary** | 5-10 % du trafic puis le reste | Nécessite métriques/alarmes |
| **Linear** | Augmentation par paliers (10 %/min) | |
| **Feature flags** | Découpler déploiement et activation | AppConfig |

CodeDeploy Lambda : alias avec `Canary10Percent5Minutes`, alarmes CloudWatch → **rollback automatique**.

## 4. GitHub Actions + OIDC → AWS (sans clé longue durée)

Principe : GitHub émet un **JWT** pour chaque job ; AWS IAM l'accepte via un *OIDC provider* et un rôle dont la trust policy filtre par dépôt/branche/environnement.

1. Créer le provider `token.actions.githubusercontent.com` (audience `sts.amazonaws.com`).
2. Créer un rôle avec une trust policy limitée à `repo:ORG/REPO:ref:refs/heads/main`.
3. Dans le workflow : `permissions: id-token: write` + `aws-actions/configure-aws-credentials`.

Code d'infrastructure : [`labs/lab-oidc/`](labs/lab-oidc/) · Workflow : [`labs/lab-oidc/workflow-example.yml`](labs/lab-oidc/workflow-example.yml)

> Sécurité : ne jamais utiliser un `sub` en joker large (`repo:ORG/*`) sur un rôle puissant ; séparer les rôles *plan* (lecture seule, PR) et *apply* (écriture, branche `main` + environnement protégé avec approbation).

## 5. Pipeline Terraform sur PR (patron courant)

```
PR ouverte   → fmt, validate, tflint, checkov, plan (rôle lecture) → commentaire du plan
Merge main   → apply (rôle écriture, environnement avec approbation manuelle)
Planifié     → plan de détection de dérive + alerte
```
Un exemple complet est fourni dans `labs/lab-oidc/terraform-pipeline.yml`.

## 6. Sécurité de la chaîne d'approvisionnement

- Épingler les actions GitHub par SHA, Dependabot/Renovate.
- Scan : SAST (CodeQL, Semgrep), SCA (Dependabot, Trivy), secrets (gitleaks), images (ECR/Inspector, Trivy), IaC (checkov).
- **SBOM** et **signature** d'images (Sigstore cosign / AWS Signer).
- Principe du moindre privilège pour les rôles de pipeline ; comptes de déploiement séparés ; approbations pour la prod.

## 7. Démos

**Démo 01 — CodeBuild en 10 minutes** : projet relié à un dépôt public, buildspec simple, lecture des logs et rapports de tests.
**Démo 02 — Blue/Green ECS avec CodeDeploy** : bascule 10 % puis 100 %, test d'un rollback (alarme).
**Démo 03 — OIDC en action** : `aws sts get-caller-identity` dans un workflow, observer le `sub` du token.

## 8. Labo 11 — Déployer depuis GitHub Actions sans clé

**Énoncé** :
1. Appliquer `labs/lab-oidc` (variables : `github_org`, `github_repo`) → crée provider OIDC + rôles *plan*/*apply* + bucket de déploiement.
2. Copier `workflow-example.yml` dans `.github/workflows/` d'un dépôt de test, renseigner l'ARN du rôle.
3. Le workflow : tests → assume le rôle → `aws s3 sync` d'un site statique (ajoutez ensuite une invalidation CloudFront si vous avez une distribution).
4. Prouver que la branche `feature/x` **ne peut pas** assumer le rôle apply (lire l'erreur `Not authorized to perform sts:AssumeRoleWithWebIdentity`).
5. **Défi** : ajouter un environnement GitHub « production » avec reviewer obligatoire et le conditionner dans la trust policy (`sub = repo:ORG/REPO:environment:production`).

**Validation** : aucun secret AWS dans les paramètres du dépôt ; déploiement réussi depuis `main`, refusé depuis une autre branche.

## Erreurs fréquentes

| Problème | Cause |
|---|---|
| `Could not assume role with OIDC` | `sub`/`aud` ne correspondent pas, `id-token: write` oublié |
| Pipeline qui déploie un artefact différent par environnement | Rebuild à chaque étape (violer « build once ») |
| Déploiement bloqué sur ECS | Health check, quotas, taskdef invalide |
| Secrets dans les logs | Masquer, utiliser Secrets Manager, `set +x` |
| Rollback impossible | Artefacts supprimés / migrations de base non rétro-compatibles → migrations *expand/contract* |

## Quiz

1. Pourquoi OIDC plutôt que des clés d'accès dans GitHub Secrets ?
2. Différence blue/green et canary ?
3. Quel fichier décrit les étapes CodeBuild ?
4. Comment CodeDeploy sait-il qu'il doit revenir en arrière ?
5. Qu'est-ce que « build once, deploy many » ?

<details><summary>Réponses</summary>

1. Credentials temporaires, aucun secret à stocker/faire tourner, restriction par repo/branche.
2. Blue/green : bascule complète entre deux environnements ; canary : fraction progressive du trafic.
3. `buildspec.yml`.
4. Alarmes CloudWatch associées au déploiement ou échec des hooks de validation.
5. On construit un artefact unique, promu à l'identique dev → staging → prod.
</details>
