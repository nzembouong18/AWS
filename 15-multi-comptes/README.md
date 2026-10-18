# Module 15 — Multi-comptes et gouvernance

**Durée** : 1 jour · **Niveau** : expert · **Coût** : ≈ 0 € (Organizations gratuit ; Control Tower : coûts des services sous-jacents)
**Certifications** : SAP, DOP, SCS

## Objectifs

- Comprendre pourquoi **un compte = une frontière** (sécurité, coûts, quotas)
- Structurer avec **AWS Organizations**, **OU** et **SCP**
- Concevoir une **landing zone** (Control Tower) et un **accès centralisé** (Identity Center)
- Centraliser logs, sécurité, réseau et coûts

## 1. Pourquoi plusieurs comptes ?

Un compte AWS est la **frontière d'isolation la plus forte** : identité, facturation, quotas, blast radius. Bonnes pratiques : comptes séparés par **environnement** (dev / staging / prod), par **charge de travail** ou équipe, comptes **transverses** dédiés (sécurité, logs, réseau, outils CI/CD).

## 2. AWS Organizations

```
Root (management account — ne rien y déployer)
├── OU Security      : audit (lecture), log-archive (logs immuables)
├── OU Infrastructure: network (TGW, DNS), shared-services (CI/CD, ECR, AMI)
├── OU Workloads
│   ├── OU Prod    : app1-prod, app2-prod
│   └── OU NonProd : app1-dev, app1-staging
├── OU Sandbox       : comptes de formation (budget plafonné, nettoyage auto)
└── OU Suspended     : comptes fermés
```

Fonctions : facturation consolidée (remises de volume, partage des Savings Plans), **création programmatique de comptes**, **SCP**, politiques de tags/sauvegarde, **services de confiance** (CloudTrail, Config, GuardDuty, Security Hub, RAM… avec administrateur délégué).

## 3. Service Control Policies (SCP)

Plafond de permissions pour **tous les principaux d'un compte** (sauf le compte de gestion). Elles **ne donnent aucun droit**, elles limitent. Héritage : une action doit être autorisée à **chaque niveau** (Root → OU → compte).

Exemples de garde-fous :
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyOutsideEU",
      "Effect": "Deny",
      "NotAction": ["iam:*", "organizations:*", "route53:*", "cloudfront:*", "support:*", "sts:*"],
      "Resource": "*",
      "Condition": { "StringNotEquals": { "aws:RequestedRegion": ["eu-west-3", "eu-west-1", "eu-central-1"] } }
    },
    {
      "Sid": "ProtectSecurityServices",
      "Effect": "Deny",
      "Action": ["guardduty:DeleteDetector", "cloudtrail:StopLogging", "cloudtrail:DeleteTrail", "config:StopConfigurationRecorder"],
      "Resource": "*"
    },
    {
      "Sid": "DenyLeaveOrg",
      "Effect": "Deny",
      "Action": "organizations:LeaveOrganization",
      "Resource": "*"
    },
    {
      "Sid": "NoRootUser",
      "Effect": "Deny",
      "Action": "*",
      "Resource": "*",
      "Condition": { "StringLike": { "aws:PrincipalArn": "arn:aws:iam::*:root" } }
    }
  ]
}
```
Stratégies : *deny list* (défaut `FullAWSAccess` + Deny ciblés, recommandé) ou *allow list* (plus strict, plus lourd). **Testez dans une OU sandbox** avant la production.

Autres politiques : **tag policies**, **backup policies**, **AI opt-out**, **declarative policies** (config de base d'un service appliquée à l'organisation).

## 4. Accès centralisé

**IAM Identity Center** : un portail, des **permission sets** assignés à des groupes sur des comptes. Intégration IdP (Entra ID, Okta, Google) via SAML/SCIM. Sessions courtes, MFA imposée, pas d'utilisateurs IAM humains.

**Accès cross-account pour la CI/CD** : le compte *tooling* assume un rôle `DeployRole` dans chaque compte cible (trust vers le compte tooling + conditions OIDC/ExternalId).

## 5. AWS Control Tower

Met en place une **landing zone** conforme aux bonnes pratiques en quelques clics :
- structure d'OU, comptes *log archive* et *audit*,
- CloudTrail et Config organisationnels,
- **contrôles** (guardrails) préventifs (SCP), détectifs (Config) et proactifs (CloudFormation hooks),
- **Account Factory** (+ AFT : *Account Factory for Terraform*) pour vendre des comptes standardisés en self-service.

## 6. Services partagés

| Besoin | Service |
|---|---|
| Partager VPC subnets, TGW, règles DNS entre comptes | **AWS RAM** |
| Réseau hub & spoke | Transit Gateway + Network Firewall + inspection centralisée |
| Logs centralisés | Organization trail → bucket dans *log-archive* (Object Lock) |
| Sécurité centralisée | GuardDuty / Security Hub / Config avec administrateur délégué dans *audit* |
| Facturation | Compte de gestion + Cost Categories + CUR |
| Déploiement multi-comptes IaC | CloudFormation **StackSets** (organization-aware), Terraform + AFT |
| Images/artefacts | ECR avec réplication, AMI partagées |

## 7. Modèle opérationnel

- **Compte de gestion** : uniquement facturation et Organizations ; très peu d'accès, MFA matérielle.
- **Break-glass** : rôle d'urgence, alerté à chaque usage.
- **Cycle de vie des comptes** : vente (Account Factory) → baseline (StackSet) → exploitation → fermeture (OU Suspended).
- **Quotas et coûts** par compte, budgets par OU.

## 8. Démos

**Démo 01 — Créer une OU et rattacher un compte** : [`demos/demo-01-organizations.sh`](demos/demo-01-organizations.sh).
**Démo 02 — Effet d'une SCP** : attacher `DenyOutsideEU` à l'OU Sandbox, tenter de lancer une instance à `us-east-1` → `explicit deny in a service control policy`.
**Démo 03 — Control Tower** : parcours de la landing zone et d'Account Factory (lecture).

## 9. Labo 15 — Gouvernance par SCP (en Terraform)

> Prérequis : un compte de gestion Organizations (créez une organisation avec un compte secondaire de test). Si vous n'avez pas ce droit, lisez le code et simulez avec l'IAM Policy Simulator.

Code : [`labs/lab-organizations/`](labs/lab-organizations/) — crée une OU `Sandbox`, trois SCP (régions, protection des services de sécurité, interdiction de quitter l'organisation) et les rattache.

Étapes :
1. `terraform apply`.
2. Déplacer un compte de test dans l'OU Sandbox.
3. Depuis ce compte, tenter une action dans `us-east-1` et arrêter CloudTrail : refus attendus.
4. Retirer la SCP régions, constater la levée du blocage.
5. **Défi** : écrire une SCP imposant le tag `owner` à la création d'instances EC2 (`ec2:RunInstances` avec condition `Null` sur `aws:RequestTag/owner`).
6. `terraform destroy`.

**Validation** : message `explicit deny in a service control policy` observé deux fois.

## Erreurs fréquentes

| Problème | Cause |
|---|---|
| SCP « sans effet » | Elles ne s'appliquent pas au compte de gestion ; ou une autre SCP héritée autorise tout |
| Verrouillage total | SCP trop stricte sur l'OU Root ; toujours tester en sandbox, garder un chemin de secours |
| Déploiements cross-account refusés | Trust policy ou SCP bloquant `sts:AssumeRole` |
| Coûts dispersés | Absence de tags et de Cost Categories |
| Compte de gestion utilisé pour des charges | Risque et blast radius : à interdire |

## Quiz

1. Une SCP peut-elle donner des permissions ?
2. Quel compte n'est pas soumis aux SCP ?
3. Pourquoi un compte de logs séparé ?
4. Comment industrialiser la création de comptes ?
5. À quoi sert un administrateur délégué ?

<details><summary>Réponses</summary>

1. Non, elle ne fait que limiter.
2. Le compte de gestion.
3. Logs immuables et hors de portée d'un compte potentiellement compromis.
4. Control Tower Account Factory / AFT ou Organizations API + baseline en StackSet.
5. Gérer un service organisationnel (GuardDuty, Security Hub…) depuis un compte dédié sans utiliser le compte de gestion.
</details>
