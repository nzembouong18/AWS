# Module 01 — Fondamentaux du cloud AWS

**Durée** : 0,5 jour · **Niveau** : débutant · **Coût** : 0 €
**Certification** : cœur du Cloud Practitioner (CLF-C02)

## Objectifs

- Expliquer le cloud computing (IaaS / PaaS / SaaS) et ses avantages
- Comprendre **Régions, Availability Zones, Edge Locations**
- Appliquer le **modèle de responsabilité partagée**
- Comprendre la **tarification** et choisir une région
- Situer les familles de services AWS

## 1. Le cloud computing

Caractéristiques (NIST) : libre-service à la demande, accès réseau large, mutualisation des ressources, élasticité rapide, service mesuré.

| Modèle | Vous gérez | AWS gère | Exemples |
|---|---|---|---|
| **IaaS** | OS, runtime, app, données | Matériel, virtualisation | EC2, EBS, VPC |
| **PaaS** | App, données | OS, runtime, scaling | Elastic Beanstalk, RDS, Lambda, Fargate |
| **SaaS** | Usage | Tout | WorkMail, Amazon Connect |

Avantages classiques : passer du **CapEx à l'OpEx**, élasticité, rapidité de déploiement, couverture mondiale en quelques minutes, économies d'échelle.

## 2. L'infrastructure globale

```
Partition AWS (aws, aws-cn, aws-us-gov)
 └── Région (ex. eu-west-3 Paris) — zone géographique isolée
      └── Availability Zone (eu-west-3a/b/c) — 1+ datacenters, latence < 2 ms entre AZ
           └── Datacenters
 └── Edge Locations / Points of Presence — CloudFront, Route 53, Global Accelerator
 └── Local Zones, Wavelength, Outposts — extensions proches des utilisateurs/on-prem
```

Critères de choix d'une région : **conformité/souveraineté**, **latence**, **disponibilité des services**, **coût**.

Services selon leur portée :
- **Globaux** : IAM, Route 53, CloudFront, Organizations, WAF (scope CloudFront)
- **Régionaux** : EC2, S3 (bucket dans une région, nom global), VPC, RDS, Lambda…
- **Zonaux** : subnet, instance EC2, volume EBS

> Principe de conception : concevoir pour la panne. Une AZ peut tomber → répartir sur ≥ 2 AZ (voir modules 03 et 07).

## 3. Responsabilité partagée

| AWS : sécurité **DU** cloud | Vous : sécurité **DANS** le cloud |
|---|---|
| Datacenters, matériel, réseau physique | Données et chiffrement |
| Hyperviseur, services managés (plateforme) | IAM, MFA, politiques d'accès |
| Hôte de S3/DynamoDB/Lambda | OS invité, correctifs EC2, pare-feu (SG), config applicative |

La répartition **varie selon le service** : plus il est managé, moins vous en gérez (RDS : AWS patche le moteur, vous gérez les utilisateurs et le schéma ; EC2 : vous patchez l'OS).

## 4. Tarification

Trois leviers principaux : **calcul**, **stockage**, **transfert sortant** (le trafic entrant est gratuit, le trafic inter-AZ et sortant Internet est facturé).

| Modèle d'achat EC2 | Réduction typique | Usage |
|---|---|---|
| On-Demand | 0 % | Imprévisible, courte durée |
| Savings Plans / RI (1-3 ans) | jusqu'à ~70 % | Charge stable |
| Spot | jusqu'à ~90 % | Tolérant aux interruptions (batch, CI) |
| Dedicated Host | variable | Licences, conformité |

Outils : **Pricing Calculator**, **Cost Explorer**, **Budgets**, **Cost and Usage Report**, **Trusted Advisor**.

Free Tier : trois types (essai, 12 mois, toujours gratuit) — vérifiez les conditions actuelles sur la page officielle.

## 5. Cartographie des services

| Domaine | Services |
|---|---|
| Calcul | EC2, Lambda, ECS, EKS, Fargate, Batch, Elastic Beanstalk |
| Stockage | S3, EBS, EFS, FSx, Glacier, Storage Gateway |
| Base de données | RDS, Aurora, DynamoDB, ElastiCache, Redshift, DocumentDB, Neptune |
| Réseau | VPC, Route 53, CloudFront, ELB, API Gateway, Direct Connect, Transit Gateway |
| Sécurité | IAM, KMS, Secrets Manager, WAF, Shield, GuardDuty, Inspector, Security Hub |
| Intégration | SQS, SNS, EventBridge, Step Functions, MQ |
| Gestion/DevOps | CloudFormation, CloudWatch, CloudTrail, Config, Systems Manager, CodeBuild/Pipeline/Deploy |
| Analytique/ML | Athena, Glue, Kinesis, EMR, SageMaker, Bedrock |

## 6. Les 6 piliers du Well-Architected (aperçu)

Excellence opérationnelle · Sécurité · Fiabilité · Performance · Optimisation des coûts · Durabilité. Développé au module 14.

## 7. Démos

**Démo 01 — Explorer l'infrastructure globale** : [`demos/demo-01-global-infra.sh`](demos/demo-01-global-infra.sh) liste régions, AZ et services disponibles dans une région.

**Démo 02 — Calculer un coût** : avec le *Pricing Calculator*, estimer 2 × `t3.small` + 100 Go EBS + 500 Go de S3 + 1 To de sortie à Paris, puis comparer avec Virginie (us-east-1).

## 8. Labo 01 — Cartographier son compte

**Énoncé** : produire un inventaire de votre compte et estimer le coût d'une architecture.

1. Lister les régions activées et choisir une région primaire et une de secours (justifier).
2. Pour la région primaire, lister les AZ et leurs IDs (`use1-az1` ≠ `us-east-1a` selon les comptes).
3. Avec `aws ssm get-parameters-by-path --path /aws/service/global-infrastructure/regions/eu-west-3/services`, lister les services disponibles à Paris.
4. Dans le Pricing Calculator, estimer le coût mensuel d'un site web : 2 EC2 t3.small, 1 ALB, 1 RDS db.t3.micro Multi-AZ, 50 Go S3, 200 Go de transfert sortant. Exporter et conserver le lien.
5. Rédiger 5 lignes : quelles parties relèvent de votre responsabilité sur cette architecture ?

**Validation** : fichier `inventaire.md` contenant régions, AZ, estimation chiffrée et responsabilités.

## Quiz

1. Qu'est-ce qui distingue une Région d'une AZ ?
2. Vrai/faux : AWS patche l'OS de vos instances EC2.
3. Le transfert de données *entrant* depuis Internet est-il facturé ?
4. Quels services sont globaux : EC2, IAM, Route 53, S3 (bucket) ?
5. Quel modèle d'achat pour un job batch interruptible ?

<details><summary>Réponses</summary>

1. La région est une zone géographique contenant plusieurs AZ isolées ; une AZ est un ou plusieurs datacenters.
2. Faux, c'est votre responsabilité (sauf services managés).
3. Non, gratuit.
4. IAM et Route 53 (S3 : espace de noms global mais bucket régional).
5. Spot.
</details>
