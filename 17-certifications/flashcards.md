# Flashcards

Format `Question ;; Réponse` (une par ligne) → importable dans Anki (séparateur `;;` à configurer).

## Fondamentaux
Qu'est-ce qu'une Région AWS ;; Zone géographique isolée contenant plusieurs AZ
Qu'est-ce qu'une AZ ;; Un ou plusieurs datacenters isolés dans une région, reliés par réseau à faible latence
Responsabilité partagée : qui patche l'OS d'une EC2 ;; Le client
Responsabilité partagée : qui gère l'hôte physique ;; AWS
Le trafic entrant depuis Internet est-il facturé ;; Non
Modèle d'achat le moins cher pour charge interruptible ;; Spot (jusqu'à -90 %)
Engagement 1-3 ans flexible sur le calcul ;; Compute Savings Plans
Outil pour estimer un coût avant déploiement ;; Pricing Calculator
Outil pour visualiser et analyser les coûts passés ;; Cost Explorer
Les 6 piliers Well-Architected ;; Excellence opérationnelle, Sécurité, Fiabilité, Performance, Coûts, Durabilité

## IAM
Deny explicite vs Allow ;; Le Deny explicite l'emporte toujours
Par défaut une requête est ;; Refusée (deny implicite)
Rôle vs utilisateur ;; Le rôle donne des credentials temporaires, sans mot de passe, assumable
Trust policy ;; Définit qui peut assumer le rôle
Permission boundary ;; Plafond de permissions d'un user/rôle (ne donne aucun droit)
SCP ;; Plafond de permissions au niveau compte/OU (ne donne aucun droit)
Accès cross-account S3 avec policy de ressource ;; Allow requis côté identité ET côté ressource
Condition pour forcer le MFA ;; aws:MultiFactorAuthPresent = true
Service pour SSO multi-comptes ;; IAM Identity Center
Service qui génère des policies depuis l'activité ;; IAM Access Analyzer (policy generation)
Credentials d'une EC2 sans clé ;; Rôle via instance profile (IMDS)
Protection contre le confused deputy ;; ExternalId / aws:SourceArn
GitHub Actions sans clé ;; OIDC + AssumeRoleWithWebIdentity

## Réseau
Un subnet s'étend sur ;; Une seule AZ
IP réservées par subnet ;; 5
Subnet public = ;; Route 0.0.0.0/0 vers une Internet Gateway
Sortie Internet d'un subnet privé ;; NAT Gateway (dans un subnet public)
Security Group ;; Stateful, niveau instance, Allow uniquement
NACL ;; Stateless, niveau subnet, Allow et Deny, règles ordonnées
Endpoint gratuit ;; Gateway endpoint (S3, DynamoDB)
PrivateLink ;; Exposer un service via endpoint d'interface sans peering
Peering est-il transitif ;; Non
Hub & spoke multi-VPC ;; Transit Gateway
VPN site-to-site : nombre de tunnels ;; 2 (IPsec)
Lien dédié on-premises ;; Direct Connect
Diagnostic du trafic accepté/refusé ;; VPC Flow Logs
Analyse statique de connectivité ;; Reachability Analyzer

## Compute
EC2 burstable ;; Famille T (crédits CPU)
Instance Graviton ;; Suffixe g (ARM), ~20 % moins cher
IMDSv2 ;; Jeton de session obligatoire, protège du SSRF
Accès shell sans port SSH ;; SSM Session Manager
Instance store à l'arrêt ;; Données perdues
AMI est ;; Régionale (copiable entre régions)
Launch Configuration vs Template ;; Les Configurations sont obsolètes, utiliser les Templates
Placement group cluster / spread / partition ;; Latence mini / isolation matérielle / gros clusters distribués
Politique de scaling recommandée ;; Target tracking

## Stockage
Durabilité S3 ;; 11 neuf
Classe S3 pour profil inconnu ;; Intelligent-Tiering
Archive la moins chère ;; Glacier Deep Archive
Protéger contre suppression accidentelle S3 ;; Versioning (+ MFA Delete, Object Lock)
WORM S3 ;; Object Lock
Accès temporaire à un objet privé ;; Presigned URL
Réplication S3 requiert ;; Versioning sur source et destination
Bloc partagé multi-AZ ;; Non : EBS est lié à une AZ
Système de fichiers partagé Linux ;; EFS
Système de fichiers Windows ;; FSx for Windows File Server
Sauvegarde centralisée ;; AWS Backup
Type EBS par défaut recommandé ;; gp3
Snapshots EBS ;; Incrémentaux, stockés dans S3, régionaux

## Bases de données
Multi-AZ RDS ;; HA/DR, réplication synchrone, standby non lisible
Read Replica ;; Performance lecture, asynchrone, inter-région possible
RDS Proxy ;; Pool de connexions, utile avec Lambda
Aurora : copies de données ;; 6 copies sur 3 AZ
Aurora multi-région ;; Aurora Global Database (RPO ~1 s)
Chiffrer une RDS existante non chiffrée ;; Snapshot → copie chiffrée → restauration
DynamoDB : clé primaire ;; Partition key (+ sort key optionnelle)
GSI vs LSI ;; GSI: autre PK, créé à tout moment ; LSI: même PK, à la création de la table
Éviter ;; Scan sur grandes tables
Cache DynamoDB microseconde ;; DAX
DynamoDB multi-région actif-actif ;; Global Tables
Expiration automatique d'items ;; TTL
Cache en mémoire ;; ElastiCache (Redis/Valkey, Memcached)
Entrepôt de données ;; Redshift
Migration de BD avec peu d'arrêt ;; DMS (+ SCT si hétérogène)

## HA et edge
ALB vs NLB ;; ALB: L7 HTTP, routage chemin/hôte ; NLB: L4, IP statique, très faible latence
Certificat TLS gratuit ;; ACM
Certificat pour CloudFront ;; ACM en us-east-1
Alias vs CNAME ;; Alias: apex autorisé, gratuit, cible AWS
Routage Route 53 pour basculement ;; Failover avec health check
CDN ;; CloudFront
Protéger S3 derrière CloudFront ;; OAC (Origin Access Control)
IP anycast statiques ;; Global Accelerator
Protection DDoS L3/L4 gratuite ;; Shield Standard
Pare-feu L7 ;; WAF

## Serverless et messaging
Durée max Lambda ;; 15 minutes
Concurrence réservée vs provisionnée ;; Plafond/garantie vs instances pré-chauffées (pas de cold start)
Lambda asynchrone : réessais ;; 2, puis DLQ/destination
SQS Standard vs FIFO ;; At-least-once non ordonné vs ordre + exactly-once (300 msg/s)
Visibility timeout ;; Doit dépasser la durée de traitement
Taille max message SQS ;; 256 Ko
SNS ;; Pub/Sub push, fan-out
EventBridge ;; Bus d'événements, règles, Scheduler
Orchestration de workflow ;; Step Functions
Flux ordonné rejouable ;; Kinesis Data Streams
API Gateway HTTP vs REST ;; HTTP: moins cher/simple ; REST: clés d'API, plans d'usage, cache, validation

## Conteneurs
Task role vs execution role ;; Task: code de l'appli ; Execution: pull ECR, logs, secrets
Mode réseau Fargate ;; awsvpc
Serveurs à gérer sur Fargate ;; Aucun
Accès AWS pour un pod EKS ;; IRSA ou Pod Identity
Registre d'images ;; ECR
Rollback auto ECS ;; Deployment circuit breaker / CodeDeploy
Shell dans un conteneur Fargate ;; ECS Exec

## IaC et CI/CD
Prévisualiser CloudFormation ;; Change set
Détecter les modifications manuelles ;; Drift detection
Conserver une ressource à la suppression de stack ;; DeletionPolicy: Retain
Déploiement multi-comptes CFN ;; StackSets
CDK : commande qui génère le template ;; cdk synth
Verrouiller le state Terraform ;; Backend S3 + DynamoDB (ou lock S3)
Fichier de build CodeBuild ;; buildspec.yml
Fichier de déploiement CodeDeploy EC2 ;; appspec.yml
Blue/green vs canary ;; Bascule complète vs progressive
Build once, deploy many ;; Même artefact promu sur tous les environnements

## Observabilité et sécurité
Qui a appelé l'API ;; CloudTrail
Historique/conformité de configuration ;; AWS Config
Métriques/alarmes ;; CloudWatch
Mémoire EC2 dans CloudWatch ;; Agent CloudWatch
Traçage distribué ;; X-Ray / OpenTelemetry
Requêtes sur les logs ;; CloudWatch Logs Insights
Détection de menaces ;; GuardDuty
Vulnérabilités EC2/ECR/Lambda ;; Inspector
Données sensibles dans S3 ;; Macie
Agrégation sécurité/conformité ;; Security Hub
Chiffrement de grandes données avec KMS ;; Envelope encryption (GenerateDataKey)
Rotation auto de mot de passe BD ;; Secrets Manager
Config sensible gratuite ;; SSM Parameter Store (SecureString)
Garde-fous multi-comptes ;; SCP via Organizations / Control Tower
Landing zone ;; AWS Control Tower

## Résilience et coûts
RPO / RTO ;; Perte de données tolérée / durée d'indisponibilité tolérée
Stratégies DR (du moins au plus cher) ;; Backup&Restore, Pilot Light, Warm Standby, Multi-site actif-actif
Tester la résilience ;; AWS Fault Injection Service
Recommandation de taille d'instances ;; Compute Optimizer
Détecter les dépenses anormales ;; Cost Anomaly Detection
Attribuer les coûts ;; Tags d'allocation de coûts
Premier levier FinOps ;; Visibilité (tags, budgets) puis suppression du gaspillage
