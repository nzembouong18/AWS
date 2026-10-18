# Module 10 — Infrastructure as Code : CloudFormation, CDK, Terraform

**Durée** : 2 jours · **Niveau** : intermédiaire → avancé · **Coût** : ≈ 0 €
**Certifications** : DOP (cœur), DVA, SOA, SAA

## Objectifs

- Comprendre pourquoi et comment décrire l'infrastructure en code
- Maîtriser **CloudFormation** (stacks, change sets, drift, StackSets)
- Découvrir **AWS CDK** et comparer avec **Terraform**
- Structurer un projet **Terraform** : modules, backend S3 + verrouillage, environnements, tests, scan sécurité

## 1. Pourquoi l'IaC ?

Reproductibilité · revue de code (Pull Requests) · traçabilité (Git) · détection de dérive · environnements identiques · reprise après sinistre · automatisation CI/CD.

Principes : **déclaratif**, **idempotent**, **immuable**, **versionné**, **testé**, **modulaire**.

## 2. CloudFormation

Service natif AWS : un **template** (YAML/JSON) → une **stack**.

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: Bucket chiffré
Parameters:
  Env: { Type: String, AllowedValues: [dev, prod], Default: dev }
Conditions:
  IsProd: !Equals [!Ref Env, prod]
Resources:
  Bucket:
    Type: AWS::S3::Bucket
    DeletionPolicy: Retain
    Properties:
      VersioningConfiguration:
        Status: !If [IsProd, Enabled, Suspended]
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault: { SSEAlgorithm: AES256 }
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
Outputs:
  BucketName:
    Value: !Ref Bucket
    Export: { Name: !Sub "${AWS::StackName}-bucket" }
```

### Concepts à retenir
| Concept | Rôle |
|---|---|
| **Fonctions intrinsèques** | `!Ref`, `!GetAtt`, `!Sub`, `!Join`, `!If`, `!FindInMap`, `!ImportValue` |
| **Change set** | Prévisualiser les modifications avant exécution (≈ `terraform plan`) |
| **Drift detection** | Détecte les modifications manuelles hors stack |
| **DeletionPolicy / UpdateReplacePolicy** | `Retain`, `Snapshot` pour protéger les données |
| **Stack policy**, **termination protection** | Empêcher des mises à jour/suppressions accidentelles |
| **Rollback** | Retour automatique en cas d'échec de création/mise à jour |
| **Nested stacks**, **modules**, **StackSets** | Réutilisation, déploiement multi-comptes/régions |
| **Custom resources** | Lambda pour ressources non supportées |
| **cfn-lint**, **cfn-guard** | Lint / politiques « policy as code » |

```bash
aws cloudformation deploy --template-file bucket.yaml --stack-name demo-bucket \
  --parameter-overrides Env=dev --capabilities CAPABILITY_NAMED_IAM
aws cloudformation describe-stack-events --stack-name demo-bucket
aws cloudformation detect-stack-drift --stack-name demo-bucket
```

## 3. AWS CDK

Définir l'infrastructure dans un **vrai langage** (TypeScript, Python, Java, C#, Go) → synthétisée en CloudFormation (`cdk synth`). *Constructs* L1 (CFN brut), **L2** (abstractions avec bonnes pratiques par défaut), L3 (patterns).

```python
# app.py (CDK Python)
from aws_cdk import App, Stack, aws_s3 as s3, RemovalPolicy
from constructs import Construct

class DataStack(Stack):
    def __init__(self, scope: Construct, id: str, **kw):
        super().__init__(scope, id, **kw)
        s3.Bucket(self, "Data", versioned=True, encryption=s3.BucketEncryption.S3_MANAGED,
                  block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
                  removal_policy=RemovalPolicy.RETAIN)
app = App(); DataStack(app, "DataStack"); app.synth()
```
```bash
npm i -g aws-cdk && cdk bootstrap && cdk diff && cdk deploy && cdk destroy
```

## 4. Terraform

Outil **multi-cloud** de HashiCorp (licence BSL ; fork communautaire **OpenTofu**). Langage HCL, **state** décrivant ce qui est géré, ~3000 providers.

Cycle : `init` → `fmt` / `validate` → `plan` → `apply` → `destroy`.

### Concepts
| Notion | Détail |
|---|---|
| **Provider** | Plugin d'API (`hashicorp/aws`), version épinglée |
| **Resource / Data source** | Créer / lire |
| **Variables, locals, outputs** | Entrées, calculs, sorties |
| **State** | Fichier de correspondance code ↔ réel. **Sensible**, jamais dans Git |
| **Backend distant** | S3 + verrouillage (DynamoDB ou verrou natif S3 `use_lockfile` dans les versions récentes) |
| **Modules** | Composants réutilisables et versionnés |
| `count` / `for_each` | Répétition ; préférer `for_each` (clés stables) |
| `lifecycle` | `prevent_destroy`, `create_before_destroy`, `ignore_changes` |
| `moved`, `import`, `removed` | Refactoring et adoption de l'existant |
| Workspaces | Séparation légère ; préférer des dossiers/états distincts par environnement |

### Backend S3 (à amorcer une fois)
```hcl
terraform {
  backend "s3" {
    bucket         = "acme-tfstate-<account>"
    key            = "prod/network/terraform.tfstate"
    region         = "eu-west-3"
    encrypt        = true
    dynamodb_table = "tf-locks"   # ou: use_lockfile = true (Terraform ≥ 1.10)
  }
}
```
Bucket : versioning, chiffrement KMS, accès restreint, aucune suppression publique.

### Structure recommandée
```
infra/
├── modules/            # briques réutilisables (vpc, ecs-service, rds…)
│   └── vpc/{main,variables,outputs}.tf
├── envs/
│   ├── dev/{main.tf,backend.tf,terraform.tfvars}
│   └── prod/…
└── .github/workflows/terraform.yml   # plan sur PR, apply sur merge
```

### Qualité et sécurité
`terraform fmt -check` · `validate` · **tflint** · **checkov / tfsec / trivy config** · tests natifs (`terraform test`) ou **Terratest** · estimation de coûts (**Infracost**) · politiques (OPA/Sentinel).

## 5. Comparatif

| | CloudFormation | CDK | Terraform |
|---|---|---|---|
| Langage | YAML/JSON | TS/Python/Java/… | HCL |
| Multi-cloud | Non | Non (CDKTF existe) | **Oui** |
| État | Géré par AWS | Géré par AWS (via CFN) | **À gérer** (backend) |
| Nouveautés AWS | Jour 1 | Via CFN | Délai possible |
| Atouts | Intégration native, StackSets, rollback | Productivité, abstraction | Écosystème, lisibilité, modules |

Examen AWS : **CloudFormation/CDK/SAM** sont attendus. Terraform est le standard du marché : maîtrisez les deux.

## 6. Démos

**Démo 01 — Stack CloudFormation** : [`demos/bucket.yaml`](demos/bucket.yaml) — déploiement, change set, drift (modifier le bucket à la main), suppression avec `Retain`.
**Démo 02 — Terraform : le state** : `terraform state list`, `terraform import`, `moved`, et ce qui se passe quand on supprime le state.
**Démo 03 — Backend distant** : migrer un state local vers S3 (`terraform init -migrate-state`).

## 7. Labo 10 — Un module Terraform réutilisable et un backend distant

**Énoncé** :
1. Amorcer le backend (`labs/lab-terraform/bootstrap`) : bucket d'état versionné/chiffré + verrouillage.
2. Utiliser le **module** `modules/s3-bucket-secure` pour créer deux buckets (`dev`, `prod`) avec `for_each`, depuis `labs/lab-terraform/envs/demo`.
3. Lancer `terraform plan` avec `-out`, lire le plan, appliquer.
4. Modifier un bucket à la main (console) puis `terraform plan` → constater la **dérive**.
5. Refactorer avec un bloc `moved` sans destruction.
6. Passer `tflint` / `checkov -d .` et corriger les alertes.
7. **Défi** : écrire un test `terraform test` qui vérifie que le chiffrement est actif.
8. Détruire (démo d'abord, puis bootstrap).

Code : [`labs/lab-terraform/`](labs/lab-terraform/)

**Validation** : `plan` = « No changes » après apply ; dérive détectée et corrigée.

## Erreurs fréquentes

| Problème | Remède |
|---|---|
| State perdu / divergent | Backend distant versionné + verrou ; `terraform import` |
| Secrets dans le state | Chiffrer le backend, restreindre l'accès, utiliser `manage_master_user_password`, Secrets Manager |
| `count` qui recrée tout en retirant un élément | Utiliser `for_each` |
| Drift permanent | Interdire les changements manuels (SCP/rôles lecture seule), détecter via `plan` planifié |
| Stack CloudFormation en `ROLLBACK_COMPLETE` | Supprimer puis recréer ; lire les events |
| Un seul gros state | Découper par domaine (réseau / données / applis) |

## Quiz

1. Quelle commande prévisualise les changements avec CloudFormation ?
2. À quoi sert le verrouillage du state ?
3. Pourquoi `for_each` plutôt que `count` ?
4. Que fait `cdk synth` ?
5. Comment adopter une ressource existante dans Terraform ?

<details><summary>Réponses</summary>

1. Un *change set* (`aws cloudformation deploy --no-execute-changeset` ou `create-change-set`).
2. Éviter deux `apply` concurrents qui corrompent le state.
3. Les éléments sont identifiés par une clé stable, pas par un index qui bouge.
4. Génère le template CloudFormation depuis le code.
5. `terraform import` ou un bloc `import {}` puis écrire la ressource dans le code.
</details>
