# Module 00 — Démarrage : compte, sécurité, outils

**Durée** : 0,5 jour · **Niveau** : débutant · **Coût** : 0 €

## Objectifs

- Créer et **sécuriser** un compte AWS de formation
- Mettre en place **budgets et alertes** de coûts
- Installer et configurer l'**AWS CLI v2**, Terraform et les outils annexes
- Comprendre comment on interagit avec AWS (Console, CLI, SDK, API, IaC)

## 1. Comment interagir avec AWS

Tout service AWS est une **API HTTPS signée** (SigV4). Tous les outils ne sont que des clients de cette API :

| Outil | Usage | Quand |
|---|---|---|
| Console web | Découverte, debug visuel | Apprentissage, lecture |
| AWS CLI | Scripts, automatisation, exploration | Quotidien d'un DevOps |
| SDK (boto3, SDK JS/Go…) | Applications, Lambda | Code applicatif |
| IaC (Terraform, CloudFormation, CDK) | Infrastructure reproductible | **Seul mode accepté en production** |
| CloudShell | CLI dans le navigateur, déjà authentifiée | Dépannage rapide |

Règle d'or DevOps : *la console sert à comprendre, le code sert à construire.*

## 2. Créer et sécuriser le compte

### 2.1 Création
1. Inscrivez-vous sur aws.amazon.com (e-mail dédié, ex. `aws-formation@votredomaine`).
2. Choisissez le plan gratuit/Free Tier selon l'offre en vigueur.

### 2.2 Sécurisation immédiate (checklist)
- [ ] **MFA sur l'utilisateur root** (application TOTP ou clé FIDO2)
- [ ] Ne **jamais** créer de clés d'accès pour root
- [ ] Créer un administrateur via **IAM Identity Center** (recommandé) ou un utilisateur IAM `admin` avec MFA
- [ ] Se connecter avec cet admin pour tout le reste ; ranger le root dans un coffre
- [ ] Renseigner les contacts de facturation/sécurité (Account settings)
- [ ] Activer l'accès aux **données de facturation** pour IAM

### 2.3 Budget d'alerte (obligatoire)
Console → *Billing and Cost Management* → *Budgets* → *Create budget* → *Cost budget* 10 € / mois, alertes à 50 %, 80 %, 100 % (réel) et 100 % (prévu).

Équivalent CLI : voir `demos/demo-01-budget.sh`.

## 3. Installer les outils

```bash
# AWS CLI v2 (Linux x86_64)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip
unzip awscliv2.zip && sudo ./aws/install
aws --version

# Terraform (via tfenv recommandé pour gérer les versions)
git clone --depth=1 https://github.com/tfutils/tfenv.git ~/.tfenv
export PATH="$HOME/.tfenv/bin:$PATH"
tfenv install latest && tfenv use latest

# Outils utiles
sudo apt-get install -y jq git make     # jq = parsing JSON indispensable
pip install --user awscli-local checkov # checkov : scan sécurité IaC
```

Optionnels : `session-manager-plugin` (SSM), `kubectl`, `docker`, `aws-sam-cli`, `cdk` (npm).

## 4. Configurer l'authentification

### Option recommandée : IAM Identity Center (SSO)
```bash
aws configure sso
# SSO session name : formation
# SSO start URL    : https://<id>.awsapps.com/start
# SSO region       : eu-west-3
aws sso login --profile formation
export AWS_PROFILE=formation
aws sts get-caller-identity
```

### Option simple (compte de formation uniquement) : clés IAM
```bash
aws configure --profile formation   # Access key / Secret / region eu-west-3 / output json
```
> Des clés longue durée sont un risque : on les remplace par SSO ou par des rôles temporaires (voir module 02).

### Fichiers
- `~/.aws/config` : profils, régions, SSO
- `~/.aws/credentials` : clés (à protéger, `chmod 600`)
- Variables : `AWS_PROFILE`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`… (priorité sur les fichiers)

Ordre de résolution des credentials : **options CLI → variables d'env → profil → rôle de conteneur → rôle d'instance (IMDS)**.

## 5. Premières commandes

```bash
aws sts get-caller-identity                       # Qui suis-je ?
aws ec2 describe-regions --query 'Regions[].RegionName' --output text
aws s3 ls
aws ec2 describe-availability-zones --region eu-west-3 \
  --query 'AvailabilityZones[].[ZoneName,State]' --output table
```

Astuces CLI essentielles :
- `--query` (JMESPath) pour filtrer, `--output table|json|text|yaml`
- `--dry-run` sur les actions EC2 pour tester les permissions
- `aws <service> help`, `aws configure list`
- `--debug` pour comprendre une erreur d'auth

## 6. Démo

**Démo 01 — Budget en CLI** : [`demos/demo-01-budget.sh`](demos/demo-01-budget.sh)
Le formateur crée un budget de 10 € avec alerte e-mail, puis montre où le consulter dans la console.

**Démo 02 — Tour de la console** : barre de recherche, sélecteur de région, *Service Quotas*, *Cost Explorer*, *CloudShell*, *Tag Editor*.

## 7. Labo 00 — Environnement prêt à l'emploi

**Énoncé** : mettre en place votre poste et valider qu'il peut déployer sur AWS.

Étapes :
1. Compte sécurisé (checklist 2.2) + budget.
2. CLI + Terraform installés.
3. Profil `formation` configuré (SSO de préférence).
4. Exécuter le script de validation : `labs/lab-00/check-env.sh`.
5. Déployer et détruire un bucket S3 via Terraform : `labs/lab-00/terraform/`.

**Validation** : le script affiche `✅ Environnement OK`, et `terraform destroy` supprime tout.

```bash
cd labs/lab-00 && ./check-env.sh
cd terraform && terraform init && terraform apply -auto-approve
terraform destroy -auto-approve
```

## Erreurs fréquentes

| Symptôme | Cause | Remède |
|---|---|---|
| `Unable to locate credentials` | Pas de profil / session SSO expirée | `aws sso login`, vérifier `AWS_PROFILE` |
| `ExpiredToken` | Credentials temporaires expirés | Se reconnecter |
| Ressource introuvable alors qu'elle existe | Mauvaise **région** | Vérifier `--region`, sélecteur console |
| `AccessDenied` | Policy manquante / SCP / boundary | Voir module 02 |

## Quiz

1. Pourquoi ne pas utiliser le compte root au quotidien ?
2. Quelle est la différence entre une clé d'accès longue durée et un credential temporaire ?
3. Citez trois façons de fournir des credentials à la CLI et leur ordre de priorité.
4. Pourquoi créer un budget *avant* de lancer la moindre ressource ?

<details><summary>Réponses</summary>

1. Pouvoirs illimités, non restreignables par IAM, cible n°1 des attaquants ; on le réserve à quelques actions (fermer le compte, changer le support…).
2. Les temporaires (STS) expirent (15 min à 12 h) et limitent l'impact d'une fuite.
3. Options CLI > variables d'environnement > profil/fichiers > rôle de conteneur/instance.
4. Pour détecter tôt une dérive de coûts (ressource oubliée) ; AWS n'impose pas de plafond dur.
</details>

## Pour aller plus loin
- Documentation : *AWS CLI User Guide*, *IAM Identity Center*
- Workshop : « AWS Well-Architected Labs — 100 Level Cost »
