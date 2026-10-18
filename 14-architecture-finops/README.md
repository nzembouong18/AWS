# Module 14 — Architecture, Well-Architected, résilience et FinOps

**Durée** : 1 jour · **Niveau** : avancé · **Coût** : 0 €
**Certifications** : SAA, SAP, DOP (très présent)

## Objectifs

- Appliquer les **6 piliers du Well-Architected Framework**
- Concevoir pour la **haute disponibilité** et la **reprise après sinistre** (RTO/RPO)
- Choisir un **patron d'architecture** adapté
- Mettre en œuvre le **FinOps** : visibilité, optimisation, gouvernance

## 1. Well-Architected Framework

| Pilier | Question centrale | Pratiques clés |
|---|---|---|
| **Excellence opérationnelle** | Comment exploiter et améliorer ? | IaC, CI/CD, runbooks, observabilité, post-mortems |
| **Sécurité** | Comment protéger données et systèmes ? | IAM, chiffrement, détection, réponse à incident |
| **Fiabilité** | Comment résister aux pannes ? | Multi-AZ, auto-recovery, sauvegardes, tests de panne, quotas |
| **Efficacité des performances** | Comment utiliser les bonnes ressources ? | Bon type/taille, cache, CDN, serverless, mesures |
| **Optimisation des coûts** | Comment éviter les dépenses inutiles ? | Right-sizing, Savings Plans, Spot, tags, budgets |
| **Durabilité** | Comment réduire l'impact ? | Graviton, utilisation élevée, régions sobres, cycle de vie des données |

Outil : **AWS Well-Architected Tool** (console) — revue d'une charge de travail, plan d'amélioration ; *lenses* (Serverless, SaaS, Data Analytics…).

## 2. Résilience et reprise après sinistre

**RPO** : perte de données maximale tolérée. **RTO** : durée maximale d'indisponibilité tolérée.

| Stratégie DR | RPO / RTO | Coût | Principe |
|---|---|---|---|
| **Backup & Restore** | heures / heures-jours | $ | Sauvegardes copiées dans une autre région ; reconstruction via IaC |
| **Pilot Light** | minutes / dizaines de min | $$ | BD répliquée, le reste « éteint » (AMI, IaC) |
| **Warm Standby** | secondes-minutes / minutes | $$$ | Version réduite active en permanence, montée en charge au besoin |
| **Multi-site actif-actif** | ~0 / ~0 | $$$$ | Deux régions servent le trafic (Route 53, Global Tables, Aurora Global) |

Niveaux de panne à envisager : instance → **AZ** → **région** → compte (corruption, compromission) → fournisseur. Chaque niveau a sa parade : ASG, Multi-AZ, DR inter-région, comptes de sauvegarde isolés (Backup Vault Lock).

Outils : **AWS Backup**, **Elastic Disaster Recovery (DRS)**, S3 CRR, Aurora Global, DynamoDB Global Tables, Route 53 ARC, **Fault Injection Service** (chaos engineering), **Resilience Hub**.

### Quotas (Service Quotas)
Un DR qui échoue faute de quotas dans la région cible est classique : demandez-les à l'avance.

## 3. Patrons d'architecture

| Patron | Description | Briques AWS |
|---|---|---|
| **3-tiers** | Web / App / Données | CloudFront, ALB, ASG/ECS, RDS Multi-AZ |
| **Serverless** | Sans gestion de serveurs | API GW, Lambda, DynamoDB, SQS |
| **Événementiel** | Découplage par événements | EventBridge, SNS/SQS, Lambda |
| **Microservices** | Services indépendants | ECS/EKS, ALB, App Mesh/Service Connect |
| **Data lake** | Analyse à grande échelle | S3, Glue, Athena, Lake Formation, Redshift |
| **Hub & spoke réseau** | Réseau multi-VPC | Transit Gateway, Network Firewall |
| **Multi-comptes** | Isolation par charge | Organizations, Control Tower (module 15) |
| **Strangler fig** | Migration progressive d'un monolithe | CloudFront/ALB + routage |

Principes : **découpler** (files, événements), **sans état**, **automatiser**, **concevoir pour la panne**, **mesurer avant d'optimiser**, **données au plus près du calcul**.

## 4. Les 7 R de la migration

Retire · Retain · Rehost (lift & shift) · Relocate · Repurchase · **Replatform** · **Refactor**. Outils : Migration Hub, Application Migration Service (MGN), DMS, DataSync, Snow Family.

## 5. FinOps

### Cycle Inform → Optimize → Operate
1. **Visibilité** : tags de coût obligatoires (`env`, `team`, `app`, `owner`) activés comme *cost allocation tags*, **Cost Explorer**, **CUR** (Cost & Usage Report) + Athena, **Budgets** par équipe, **Cost Anomaly Detection**.
2. **Optimisation** :

| Levier | Gain |
|---|---|
| Éteindre / supprimer l'inutile (dev la nuit, volumes et EIP orphelins) | Immédiat |
| **Right-sizing** (Compute Optimizer) | 20–40 % |
| **Savings Plans / RI** sur la charge de base | jusqu'à 70 % |
| **Spot** (CI, batch, workers) | jusqu'à 90 % |
| **Graviton** | ~20 % |
| Stockage : S3 Intelligent-Tiering, gp3 vs gp2, snapshots anciens | 10–50 % |
| Réseau : endpoints (éviter NAT), CloudFront, 1 AZ pour trafics lourds si possible | variable |
| Serverless/scale to zero pour charges intermittentes | variable |
| Rétention des logs, métriques à forte cardinalité | variable |

3. **Gouvernance** : SCP limitant les régions et types coûteux, quotas, Budget Actions, revues mensuelles, *unit economics* (coût par client / par transaction).

### Pièges de coût fréquents
NAT Gateway (trafic de données) · transferts inter-AZ/inter-régions/Internet · logs sans rétention · snapshots oubliés · load balancers inactifs · clusters EKS oubliés · Multi-AZ en dev · Elastic IP inutilisées · requêtes S3 massives.

## 6. Démos

**Démo 01 — Well-Architected Tool** : mener une revue express (sécurité + fiabilité) sur le projet du module 07, générer le plan d'amélioration.
**Démo 02 — Cost Explorer** : regrouper par service/tag, repérer les 3 plus gros postes, activer Anomaly Detection ([`demos/demo-01-cost-cli.sh`](demos/demo-01-cost-cli.sh)).
**Démo 03 — Test de panne** : arrêter une AZ « simulée » (terminer les instances d'une AZ) et mesurer la reprise ; optionnel avec AWS FIS.

## 7. Labo 14 — Étude de cas : concevoir et chiffrer

**Énoncé** : *« ShopFlow »*, e-commerce français, 200 000 visiteurs/jour, pic ×5 lors des soldes, données clients RGPD, RTO 1 h / RPO 5 min, budget 6 000 €/mois.

Livrables (voir la grille dans [`labs/lab-etude-de-cas/README.md`](labs/lab-etude-de-cas/README.md)) :
1. Schéma d'architecture (Mermaid fourni en modèle) avec justification de chaque service.
2. Stratégie DR et tests associés.
3. Estimation de coût via le Pricing Calculator + 5 leviers d'optimisation chiffrés.
4. Revue Well-Architected : 3 risques par pilier et plans d'atténuation.
5. Présentation orale de 10 minutes (jeu de rôle architecte vs client).

**Validation** : grille d'évaluation sur 100 points (fournie).

## Erreurs fréquentes

| Erreur | Conséquence |
|---|---|
| Multi-AZ confondu avec multi-région | Panne régionale non couverte |
| DR jamais testé | Échec le jour J |
| Pas de tags | Coûts non attribuables |
| Sur-ingénierie | Coût et complexité inutiles : l'architecture suit les exigences (RTO/RPO/SLA) |
| Optimiser sans mesurer | Gains illusoires |

## Quiz

1. Un RPO de 5 minutes implique quelle caractéristique ?
2. Pilot Light vs Warm Standby ?
3. Quelle première action FinOps sur un compte inconnu ?
4. Quel outil recommande des tailles d'instances ?
5. Pourquoi tester le DR ?

<details><summary>Réponses</summary>

1. Réplication continue des données (≤ 5 min de perte), pas de simples sauvegardes quotidiennes.
2. Pilot Light : cœur de données seul actif ; Warm Standby : environnement réduit entièrement fonctionnel.
3. Rendre les coûts visibles : tags, Cost Explorer, budgets, repérer les gaspillages évidents.
4. AWS Compute Optimizer.
5. Pour valider RTO/RPO, runbooks, quotas, permissions et automatisation avant l'incident.
</details>
