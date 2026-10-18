# Module 17 — Préparation aux certifications AWS

**Durée** : 2 à 10 semaines selon la certification · **Format** : révision guidée + questions + examens blancs

> Les codes, durées, prix et pondérations d'examen évoluent. **Vérifiez toujours le guide d'examen officiel** (« Exam Guide » PDF) sur [aws.amazon.com/certification](https://aws.amazon.com/certification/) avant de planifier.

## 1. Le parcours de certification

```
                         ┌──────────────────────────────┐
                         │ Cloud Practitioner (CLF)     │  Fondation
                         └──────────────┬───────────────┘
        ┌──────────────────────┬────────┴─────────┬─────────────────────┐
  Solutions Architect     Developer         CloudOps Engineer         (Data Engineer, ML…)
  Associate (SAA)         Associate (DVA)   Associate (SOA)                Associate
        │                      │                  │
        └──────────┬───────────┴──────────────────┘
                   ▼
        DevOps Engineer Professional (DOP)   ◀── cible « ingénieur DevOps »
        Solutions Architect Professional (SAP)
                   │
        Spécialités : Security (SCS), Advanced Networking (ANS), Machine Learning, Data Analytics…
```

### Que passer, dans quel ordre ?

| Votre profil | Recommandation |
|---|---|
| Débutant total / non technique | CLF → SAA |
| Dev ou DevOps | **SAA → DVA → DOP** (le SAA donne la vision d'ensemble) |
| Ops / SRE / admin | SAA → SOA → DOP |
| Architecte | SAA → SAP → spécialités |
| Sécurité | SAA → SCS |

Les associate sont valables 3 ans ; la certification d'un niveau supérieur **renouvelle** les inférieures du même domaine selon les règles en vigueur — à vérifier.

## 2. Format général des examens

- **QCM à choix unique** et **à choix multiples** (« choisissez 2/3 »), des questions de type ordre/appariement possibles.
- Associate : ~65 questions, ~130 min. Professional : ~75 questions, ~180 min. Fondation : ~65 questions, 90 min.
- Score de 100 à 1000, seuil de réussite 700 (CLF/associate) ou 750 (professional/spécialités).
- Certaines questions ne sont **pas notées** (items de test).
- Passage en centre Pearson VUE ou en ligne surveillé ; 30 min supplémentaires possibles pour les non-natifs anglophones (demande préalable) ; examens disponibles en plusieurs langues dont le français.

## 3. Domaines et pondérations (à confirmer avec le guide officiel)

### CLF-C02 — Cloud Practitioner
| Domaine | % |
|---|---|
| Concepts du cloud | 24 |
| Sécurité et conformité | 30 |
| Technologie et services cloud | 34 |
| Facturation, tarification, support | 12 |

### SAA-C03 — Solutions Architect Associate
| Domaine | % |
|---|---|
| Architectures **sécurisées** | 30 |
| Architectures **résilientes** | 26 |
| Architectures **performantes** | 24 |
| Architectures **optimisées en coût** | 20 |

### DVA-C02 — Developer Associate
| Domaine | % |
|---|---|
| Développement avec les services AWS | 32 |
| Sécurité | 26 |
| Déploiement | 24 |
| Dépannage et optimisation | 18 |

### DOP-C02 — DevOps Engineer Professional
| Domaine | % |
|---|---|
| Automatisation du SDLC (CI/CD) | 22 |
| Gestion de configuration et IaC | 17 |
| Solutions résilientes | 15 |
| Surveillance et journalisation | 15 |
| Réponse aux incidents et événements | 14 |
| Sécurité et conformité | 17 |

### SOA (CloudOps Engineer) — Associate
Surveillance/observabilité, fiabilité et continuité, déploiement/automatisation, sécurité et conformité, réseau, coûts et performances. **Consultez le guide à jour** : l'examen a été renommé et remanié, il comporte des labs pratiques dans certaines versions.

## 4. Correspondance modules ↔ examens

| Module | CLF | SAA | DVA | SOA | DOP |
|---|:-:|:-:|:-:|:-:|:-:|
| 01 Fondamentaux | ●●● | ● | ● | ● | |
| 02 IAM | ●● | ●●● | ●●● | ●●● | ●●● |
| 03 VPC | ● | ●●● | ● | ●●● | ●● |
| 04 EC2 | ●● | ●●● | ●● | ●●● | ●● |
| 05 Stockage | ●● | ●●● | ●● | ●●● | ●● |
| 06 BD | ● | ●●● | ●●● | ●● | ●● |
| 07 HA & edge | ● | ●●● | ●● | ●●● | ●●● |
| 08 Serverless | ● | ●●● | ●●● | ●● | ●●● |
| 09 Conteneurs | ● | ●● | ●● | ●● | ●●● |
| 10 IaC | ● | ● | ●● | ●●● | ●●● |
| 11 CI/CD | | ● | ●●● | ●● | ●●● |
| 12 Observabilité | ● | ●● | ●● | ●●● | ●●● |
| 13 Sécurité | ●●● | ●●● | ●●● | ●●● | ●●● |
| 14 Architecture/FinOps | ●●● | ●●● | ● | ●● | ●● |
| 15 Multi-comptes | ● | ●● | | ●● | ●●● |

## 5. Plans de révision

Hypothèse : 8-10 h/semaine. Chaque semaine : cours + labos du module + 25 questions + flashcards.

### SAA-C03 — 8 semaines
| Sem. | Contenu |
|---|---|
| 1 | Modules 01-02 (cloud, IAM) |
| 2 | Module 03 (VPC) |
| 3 | Modules 04-05 (EC2, stockage) |
| 4 | Modules 06-07 (BD, HA, edge) |
| 5 | Module 08 (serverless, messaging) + conteneurs (aperçu) |
| 6 | Module 13 (sécurité) + 12 (monitoring) |
| 7 | Module 14 (Well-Architected, DR, coûts) + analytique/migration (aperçu) |
| 8 | 2 examens blancs complets + revue des erreurs |

### DOP-C02 — 10 semaines (après SAA ou expérience équivalente)
| Sem. | Contenu |
|---|---|
| 1 | IaC 1 : CloudFormation avancé (change sets, StackSets, custom resources, helper scripts, `cfn-signal`) |
| 2 | IaC 2 : CDK/SAM, Terraform ; Service Catalog |
| 3 | CI/CD 1 : CodeBuild, CodePipeline, artefacts, approbations, tests |
| 4 | CI/CD 2 : stratégies de déploiement (EC2, Lambda, ECS), Beanstalk, rollback |
| 5 | Conteneurs ECS/EKS, ECR, déploiements |
| 6 | Observabilité : CloudWatch avancé, X-Ray, Logs Insights, agrégation multi-comptes |
| 7 | Réponse aux incidents : EventBridge, SSM Automation, Config remediation, Systems Manager |
| 8 | Sécurité & conformité : IAM avancé, KMS, Secrets, GuardDuty, Security Hub, Control Tower, SCP |
| 9 | Résilience : DR, multi-région, Route 53 (failover, latence), Aurora Global, ASG avancé |
| 10 | 3 examens blancs, lecture des FAQ et whitepapers clés |

### CLF-C02 — 2 à 3 semaines
Semaine 1 : modules 01, 02, 13 · Semaine 2 : survol des services (04-08) et modèle de tarification · Semaine 3 : examens blancs.

### DVA-C02 — 6 semaines
Priorité : modules 02, 06 (DynamoDB), 08 (Lambda, API GW, SQS/SNS), 10 (SAM/CloudFormation), 11 (CI/CD), 12 (X-Ray, CloudWatch), 13 (KMS, Cognito, Secrets).

## 6. Méthode de travail efficace

1. **Pratiquer d'abord, mémoriser ensuite** : chaque service doit avoir été manipulé (labos de ce dépôt).
2. **Lire le guide d'examen** et cocher chaque compétence.
3. **Réviser en espaçant** : flashcards (Anki) → [flashcards.md](flashcards.md).
4. **Examens blancs** : au moins 3 ; analyser *toutes* les réponses, y compris les justes.
5. **Cahier d'erreurs** : une ligne par erreur, concept manquant + règle de décision.
6. **Whitepapers & docs** : Well-Architected Framework, FAQ des services majeurs (S3, EC2, VPC, IAM, RDS, DynamoDB, Lambda).
7. **Écrire des schémas** de mémoire (VPC 3 niveaux, pipeline, DR).
8. Passer l'examen quand vous obtenez **≥ 80 %** régulièrement sur des examens blancs de qualité.

## 7. Stratégie le jour de l'examen

- **Lisez la dernière phrase en premier** : « le plus économique », « le moins d'effort opérationnel », « la plus haute disponibilité »… elle fixe le critère.
- **Mots-clés** → services (voir [cheatsheet.md](cheatsheet.md)).
- **Éliminez** d'abord les réponses fausses : techniquement impossibles, trop complexes, sur-dimensionnées.
- AWS préfère : **managé > auto-géré**, **serverless > serveurs**, **découplé > couplé**, **moindre privilège**, **rôle > clé d'accès**, **chiffrement partout**, **multi-AZ**.
- Questions « choisissez 2 » : chaque option doit être *correcte* **et** répondre à la question.
- Marquez les questions longues, **ne bloquez pas** plus de 2 min en première passe (≈ 1,8 min/question en moyenne ; ≈ 2,4 min en professional).
- Gardez 10-15 min pour relire les questions marquées.
- Pas de pénalité pour les mauvaises réponses : **répondez toujours**.

## 8. Ressources

| Type | Ressource |
|---|---|
| Officiel | AWS Skill Builder (cours gratuits, Exam Prep, **examens blancs officiels**), Exam Guides, Sample Questions |
| Docs | Documentation, FAQ de chaque service, Well-Architected, *Architecture Center* |
| Pratique | AWS Workshops (workshops.aws), Well-Architected Labs, ce dépôt |
| Communauté | re:Post, Reddit r/AWSCertifications, GitHub « aws-samples » |
| Avancé | re:Invent (vidéos « deep dive » : VPC, IAM, S3, DynamoDB, Lambda) |

## 9. Contenu de ce module

| Fichier | Rôle |
|---|---|
| [questions-entrainement.md](questions-entrainement.md) | 45 questions d'examen commentées par domaine |
| [flashcards.md](flashcards.md) | ~135 cartes question/réponse (import Anki possible) |
| [cheatsheet.md](cheatsheet.md) | Aide-mémoire : mots-clés → service, limites, comparatifs |
| [suivi-progression.md](suivi-progression.md) | Tableau de suivi et cahier d'erreurs |

## 10. Évaluation de fin de module

- Examen blanc cible : **≥ 80 %** sur 3 tentatives de qualité.
- Quiz de fin de chaque module (≥ 90 %).
- Projet final (module 16) noté ≥ 70.

Bon courage — et n'oubliez pas : **la certification valide des compétences, la pratique les construit.**
