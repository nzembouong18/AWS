# Aide-mémoire pour l'examen

## 1. Mot-clé → service

| Dans l'énoncé… | Pensez à… |
|---|---|
| « sans gérer de serveurs », « événementiel » | Lambda, Fargate, API Gateway, DynamoDB |
| « découpler », « tampon », « pic de charge » | SQS (+ SNS fan-out) |
| « ordre garanti », « exactly-once » | SQS FIFO |
| « diffuser à plusieurs abonnés » | SNS / EventBridge |
| « flux temps réel », « rejouer », « analytique en streaming » | Kinesis Data Streams / Firehose |
| « workflow », « étapes », « attente humaine » | Step Functions |
| « latence en microsecondes » | DAX (DynamoDB), ElastiCache |
| « IP statique », « TCP/UDP », « très faible latence » | NLB / Global Accelerator |
| « routage par chemin/hôte », « HTTP » | ALB |
| « cache mondial », « contenu statique », « réduire la latence » | CloudFront |
| « basculer automatiquement vers un site de secours » | Route 53 failover + health checks |
| « DDoS » | Shield (+ WAF, CloudFront) |
| « injection SQL », « XSS », « limitation de débit » | WAF |
| « menaces », « comportement anormal » | GuardDuty |
| « vulnérabilités logicielles » | Inspector |
| « données sensibles / PII dans S3 » | Macie |
| « qui a fait cet appel API » | CloudTrail |
| « configuration conforme / historique » | AWS Config |
| « métrique, alarme, dashboard » | CloudWatch |
| « traçage de requêtes », « goulot entre services » | X-Ray |
| « clés de chiffrement, audit » | KMS |
| « rotation automatique des identifiants » | Secrets Manager |
| « configuration applicative centralisée » | SSM Parameter Store / AppConfig |
| « accès au serveur sans SSH », « patcher à grande échelle » | Systems Manager |
| « infrastructure en code, déclaratif » | CloudFormation / CDK / Terraform |
| « multi-comptes, garde-fous » | Organizations + SCP, Control Tower |
| « partager des ressources entre comptes » | RAM |
| « migrer une base avec peu d'arrêt » | DMS |
| « migrer des serveurs » | Application Migration Service (MGN) |
| « transférer de gros volumes en hors-ligne » | Snow Family |
| « transfert en ligne vers S3/EFS/FSx » | DataSync |
| « data lake / SQL sur S3 sans serveur » | Athena + Glue |
| « conteneurs, pas de Kubernetes » | ECS (Fargate) |
| « Kubernetes managé » | EKS |
| « PaaS web simple » | Elastic Beanstalk / App Runner |
| « moindre effort opérationnel » | service managé / serverless |
| « le plus économique » | Spot, S3 IA/Glacier, Savings Plans, serverless, Graviton |
| « haute disponibilité » | Multi-AZ, ELB, ASG |
| « reprise après sinistre » | Multi-région, Backup, Aurora Global, DRS |

## 2. Limites et chiffres à connaître

| Élément | Valeur |
|---|---|
| Lambda | 15 min max, 10 Go de mémoire, 1 000 exécutions simultanées/région (défaut), paquet 50 Mo zip / 250 Mo |
| SQS | message ≤ 256 Ko ; rétention 1 min–14 j ; visibility timeout 0–12 h ; long polling ≤ 20 s |
| SNS | message ≤ 256 Ko |
| S3 | objet ≤ 5 To ; PUT unique ≤ 5 Go ; multipart conseillé > 100 Mo ; 3 500 PUT / 5 500 GET par seconde et par préfixe |
| DynamoDB | item ≤ 400 Ko ; 1 RCU = 4 Ko fortement cohérent ; 1 WCU = 1 Ko |
| EBS | gp3 jusqu'à 16 000 IOPS ; io2 Block Express 256 000 IOPS ; volumes ≤ 64 Tio |
| VPC | 5 VPC/région (défaut, ajustable) ; CIDR /16 à /28 ; 5 IP réservées/subnet |
| Security Groups | 60 règles entrantes + 60 sortantes (défaut) ; 5 SG par ENI (défaut) |
| Route 53 | health checks toutes les 10 ou 30 s |
| CloudWatch | métriques 5 min (EC2 base), 1 min (détaillé), 1 s (haute résolution) ; métriques conservées 15 mois |
| CloudTrail | historique 90 jours (événements de gestion) |
| API Gateway | timeout d'intégration 29 s (défaut) |
| ALB | 100 règles/listener (défaut) ; idle timeout 60 s |
| IAM | policy managée ≤ 6 144 caractères ; 10 policies managées/rôle (défaut) ; session de rôle 1-12 h |
| KMS | chiffrement direct ≤ 4 Ko |
| RDS | sauvegardes 1-35 jours ; 15 réplicas de lecture (Aurora et RDS MySQL/MariaDB/PostgreSQL) |
| Secrets Manager | secret ≤ 64 Ko |
| EFS | NFSv4.1, port 2049 |

> Les quotas évoluent : confirmez dans **Service Quotas** et la documentation.

## 3. Comparatifs à savoir par cœur

### Stockage de blocs/fichiers/objets
| | EBS | EFS | S3 |
|---|---|---|---|
| Type | Bloc | Fichier NFS | Objet |
| Portée | 1 AZ | Multi-AZ (région) | Région (accès global) |
| Accès concurrent | 1 instance (Multi-Attach io2) | Milliers | Illimité |

### Messaging
| | SQS | SNS | EventBridge | Kinesis |
|---|---|---|---|---|
| Modèle | File (pull) | Pub/Sub (push) | Bus à règles | Flux partitionné |
| Rétention | ≤ 14 j | non | archive/replay | 1-365 j |
| Rejeu | non | non | oui (archive) | oui |

### Chiffrement S3
SSE-S3 (clés AWS, défaut) · SSE-KMS (clé client, audit) · SSE-C (clé fournie par le client à chaque requête) · côté client.

### Déploiements
| Stratégie | Interruption | Retour arrière | Coût |
|---|---|---|---|
| All-at-once | oui | lent | bas |
| Rolling | non (capacité réduite) | moyen | bas |
| Immutable / Blue-Green | non | rapide | élevé (doublé brièvement) |
| Canary | non | rapide | moyen |

### DR
| Stratégie | RTO/RPO | Coût |
|---|---|---|
| Backup & Restore | heures | $ |
| Pilot Light | dizaines de minutes | $$ |
| Warm Standby | minutes | $$$ |
| Actif-actif | ~0 | $$$$ |

## 4. Règles de décision AWS (heuristiques d'examen)

1. **Managé** > auto-géré ; **serverless** > serveurs ; **découplage** > appel direct.
2. **Rôle IAM** > clés d'accès ; **credentials temporaires** partout.
3. **Moindre privilège** + conditions.
4. **Multi-AZ** par défaut ; multi-région seulement si RTO/RPO ou conformité l'exigent.
5. **Chiffrer** au repos (KMS) et en transit (TLS).
6. **Automatiser** (IaC, CI/CD, remédiation événementielle).
7. Réseau privé : **endpoints** plutôt que Internet/NAT.
8. Coûts : choisir le **moins cher qui satisfait toutes les exigences** (pas le plus puissant).
9. Si deux réponses semblent bonnes, retenir celle qui demande **le moins d'effort opérationnel** (si la question le demande).
10. Méfiez-vous des réponses « manuelles », « script cron sur EC2 », « clé stockée ».

## 5. Pièges classiques

- Multi-AZ ≠ réplica de lecture.
- Un subnet = une AZ ; EBS = une AZ.
- SG stateful, NACL stateless.
- ACM pour CloudFront = us-east-1.
- Chiffrer une RDS/EBS existante non chiffrée = via snapshot + copie.
- CloudTrail (API) ≠ CloudWatch (perfs) ≠ Config (config).
- SCP ne s'applique pas au compte de gestion ; ne donne pas de droits.
- S3 : `ListBucket` sur le bucket, `GetObject` sur `bucket/*`.
- Lambda ne peut pas dépasser 15 min.
- SQS Standard peut livrer des doublons : idempotence.
