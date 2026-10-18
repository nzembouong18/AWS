# Formation AWS pour ingénieur DevOps — du débutant à l'expert

Formation complète, en français, pour **s'auto-former** ou **former des profils** (cours + démos + labos + projet final + préparation aux certifications AWS).

> Tout est « as code » : les labos utilisent l'AWS CLI et Terraform, versionnés dans ce dépôt.

## À qui s'adresse cette formation ?

| Profil | Point de départ | Objectif |
|---|---|---|
| Admin sys / dev junior | Module 00 | Devenir DevOps AWS opérationnel |
| DevOps déjà à l'aise sur un autre cloud | Modules 02 → 10 | Transposer ses acquis sur AWS |
| Ingénieur visant une certification | Module 17 + modules concernés | Réussir SAA / DVA / SOA / DOP |

**Prérequis** : bases Linux (shell, SSH), réseau (IP, DNS, HTTP), Git. Pas de connaissance AWS requise.

## Programme

| # | Module | Durée | Niveau | Contenu clé |
|---|---|---|---|---|
| 00 | [Démarrage](00-demarrage/) | 0,5 j | Débutant | Compte, sécurisation, budgets, CLI, outils |
| 01 | [Fondamentaux du cloud AWS](01-fondamentaux-cloud/) | 0,5 j | Débutant | Régions, AZ, responsabilité partagée, tarification |
| 02 | [IAM](02-iam/) | 1 j | Débutant → Interm. | Users, rôles, policies, STS, IAM Identity Center |
| 03 | [Réseau VPC](03-reseau-vpc/) | 1,5 j | Intermédiaire | Subnets, routage, NAT, SG/NACL, endpoints, peering, TGW |
| 04 | [Compute EC2](04-compute-ec2/) | 1 j | Débutant → Interm. | AMI, types, user-data, SSM, spot, Launch Templates |
| 05 | [Stockage](05-stockage/) | 1 j | Débutant → Interm. | S3, EBS, EFS, cycle de vie, chiffrement |
| 06 | [Bases de données](06-bases-de-donnees/) | 1 j | Intermédiaire | RDS, Aurora, DynamoDB, ElastiCache |
| 07 | [Haute dispo & edge](07-haute-dispo-et-edge/) | 1 j | Intermédiaire | ALB/NLB, Auto Scaling, Route 53, CloudFront |
| 08 | [Serverless & messaging](08-serverless-et-messaging/) | 1,5 j | Intermédiaire | Lambda, API Gateway, SQS/SNS, EventBridge, Step Functions |
| 09 | [Conteneurs](09-conteneurs/) | 2 j | Interm. → Avancé | ECR, ECS/Fargate, EKS |
| 10 | [Infrastructure as Code](10-infrastructure-as-code/) | 2 j | Interm. → Avancé | CloudFormation, CDK, Terraform (modules, state, CI) |
| 11 | [CI/CD](11-cicd/) | 1,5 j | Intermédiaire | GitHub Actions + OIDC, CodePipeline, CodeBuild, CodeDeploy |
| 12 | [Observabilité](12-observabilite/) | 1 j | Intermédiaire | CloudWatch, X-Ray, CloudTrail, Config, alerting |
| 13 | [Sécurité](13-securite/) | 1,5 j | Avancé | KMS, Secrets Manager, WAF, GuardDuty, Security Hub |
| 14 | [Architecture & FinOps](14-architecture-finops/) | 1 j | Avancé | Well-Architected, HA/DR, coûts |
| 15 | [Multi-comptes & gouvernance](15-multi-comptes/) | 1 j | Expert | Organizations, SCP, Control Tower, landing zone |
| 16 | [Projet final](16-projet-final/) | 3 j | Expert | Plateforme 3-tiers + CI/CD + observabilité |
| 17 | [Préparation aux certifications](17-certifications/) | 2 sem. | Tous | Plans de révision, questions, flashcards, stratégie d'examen |

**Total** : environ 20 jours de formation pratique (≈ 8 à 12 semaines en autoformation à mi-temps).

## Structure d'un module

Chaque dossier contient :

- `README.md` — le **cours** : objectifs, concepts, schémas, bonnes pratiques, erreurs fréquentes, résumé, quiz.
- `demos/` ou sections « Démo » — manipulations à **regarder/reproduire** guidées par le formateur.
- `labs/` — **labos** autonomes (énoncé, étapes, critères de validation, nettoyage) avec code de correction.

## Parcours d'apprentissage

```
Débutant      00 → 01 → 02 → 03 (bases) → 04 → 05
Intermédiaire 03 → 06 → 07 → 08 → 12
Avancé        09 → 10 → 11 → 13 → 14
Expert        15 → 16 (projet final) → 17 (certifications)
```

Certifications visées :

| Niveau | Certification |
|---|---|
| Fondation | Cloud Practitioner (CLF-C02) |
| Associate | Solutions Architect (SAA-C03), Developer (DVA-C02), CloudOps Engineer (SOA) |
| Professional | **DevOps Engineer Professional (DOP-C02)**, Solutions Architect Professional (SAP-C02) |
| Spécialité | Security (SCS), Advanced Networking (ANS-C01) |

> Vérifiez toujours les codes et versions d'examen sur [aws.amazon.com/certification](https://aws.amazon.com/certification/) : AWS les renouvelle régulièrement.

## ⚠️ Coûts et sécurité — à lire avant de commencer

1. Créez un **compte dédié à la formation** (jamais de production).
2. Activez **MFA** sur le root et créez un **budget d'alerte** dès le module 00.
3. La plupart des labos tiennent dans le **Free Tier** ; les ressources payantes sont signalées par 💰 (NAT Gateway, EKS, ALB, RDS Multi-AZ…).
4. **Détruisez** systématiquement vos ressources en fin de labo (`terraform destroy` / section « Nettoyage »).
5. Ne commitez jamais de clés d'accès, `*.tfstate` ou fichiers `.pem`.

## Comment utiliser ce dépôt

```bash
git clone https://github.com/nzembouong18/aws.git
cd aws
# Lire le cours
less 00-demarrage/README.md
# Faire un labo
cd 03-reseau-vpc/labs/lab-vpc
terraform init && terraform apply
```

Convention : région par défaut `eu-west-3` (Paris) — adaptable via la variable `region`.

## Méthode pédagogique recommandée (formateur)

- **Format de journée** : 30 % cours, 20 % démo, 50 % labo.
- Chaque module se termine par un **quiz** et un **critère de validation** (« je sais faire X sans aide »).
- Le **projet final** (module 16) sert d'évaluation de fin de parcours.
- Une rétrospective « quels coûts ai-je générés ? » en fin de journée ancre la culture FinOps.

## Licence

Contenu à usage pédagogique. Les noms de services et certifications appartiennent à Amazon Web Services.
