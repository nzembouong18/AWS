# Questions d'entraînement (style examen)

45 questions de niveau Associate → Professional. Répondez d'abord, puis ouvrez la correction.
Format : `[SAA]`, `[DVA]`, `[SOA]`, `[DOP]` = certification la plus concernée. « Choisissez 2 » = deux réponses.

---

## Domaine A — Sécurité et IAM

**Q1 [SAA]** Une application sur EC2 doit lire des objets d'un bucket S3. Quelle est la solution la plus sécurisée ?
- A. Stocker des clés d'accès IAM dans un fichier de l'instance
- B. Attacher à l'instance un rôle IAM via un profil d'instance avec les permissions S3 minimales
- C. Rendre le bucket public en lecture
- D. Coder les clés dans les variables d'environnement de l'AMI

<details><summary>Réponse</summary>

**B.** Les rôles fournissent des credentials temporaires renouvelés automatiquement via IMDS ; aucun secret à stocker. A/D exposent des clés longue durée, C expose les données.
</details>

**Q2 [SAA]** Un utilisateur a une policy IAM `Allow s3:*` mais une SCP de l'organisation refuse `s3:DeleteBucket`. Peut-il supprimer un bucket ?
- A. Oui, l'Allow IAM prime
- B. Non, un Deny (ou l'absence d'Allow) dans la SCP plafonne les permissions
- C. Oui, sauf si le bucket est versionné
- D. Seulement avec le compte root

<details><summary>Réponse</summary>

**B.** Les SCP définissent le maximum autorisé ; un Deny explicite l'emporte toujours. Les SCP s'appliquent aussi aux utilisateurs IAM du compte membre (y compris, pour l'essentiel, root du compte membre).
</details>

**Q3 [SAA]** Un partenaire dans un autre compte AWS doit accéder à un bucket S3 de façon sûre. Quelle approche respecte le moindre privilège ?
- A. Créer un utilisateur IAM avec clés pour le partenaire
- B. Un rôle IAM assumable par le compte du partenaire, avec un `ExternalId`
- C. Partager les identifiants root
- D. Bucket public

<details><summary>Réponse</summary>

**B.** Rôle cross-account + trust policy ; l'ExternalId protège contre le *confused deputy*. Alternative : policy de bucket nommant le rôle du partenaire.
</details>

**Q4 [SAA]** Les données S3 doivent être chiffrées avec une clé dont vous contrôlez la rotation et pour laquelle chaque usage est audité dans CloudTrail. Que choisir ?
- A. SSE-S3
- B. SSE-KMS avec une clé gérée par le client
- C. SSE-C
- D. Pas de chiffrement, TLS seulement

<details><summary>Réponse</summary>

**B.** SSE-KMS (CMK) : contrôle de la policy de clé, rotation et journalisation de chaque appel `Decrypt/GenerateDataKey`. SSE-S3 n'offre pas ce contrôle/audit.
</details>

**Q5 [DVA]** Une Lambda lit un secret dans Secrets Manager chiffré avec une CMK. Elle obtient `AccessDeniedException` bien que le rôle ait `secretsmanager:GetSecretValue`. Que manque-t-il ?
- A. `kms:Decrypt` sur la clé (policy de clé ou IAM)
- B. `s3:GetObject`
- C. Un VPC endpoint obligatoire
- D. Le rôle doit être root

<details><summary>Réponse</summary>

**A.** Pour déchiffrer le secret il faut aussi l'autorisation sur la clé KMS (et la policy de clé doit permettre l'accès).
</details>

**Q6 [SAA]** Vous devez bloquer toute requête HTTP non chiffrée vers un bucket. Quel mécanisme ?
- A. NACL
- B. Policy de bucket avec `Deny` si `aws:SecureTransport` est `false`
- C. Security Group
- D. Un rôle IAM

<details><summary>Réponse</summary>

**B.**
</details>

**Q7 [SOA]** Quel outil identifie les ressources partagées avec une entité externe à l'organisation ?
- A. GuardDuty
- B. IAM Access Analyzer
- C. Inspector
- D. Trusted Advisor uniquement

<details><summary>Réponse</summary>

**B.** Access Analyzer analyse les policies de ressource (S3, KMS, rôles, SQS, Lambda…) pour détecter l'accès externe.
</details>

**Q8 [DOP]** GitHub Actions doit déployer dans AWS sans stocker de clé. Quelle architecture ?
- A. Utilisateur IAM + clés dans les secrets GitHub
- B. Fournisseur OIDC IAM + rôle avec trust policy filtrée sur `sub`, assumé avec `AssumeRoleWithWebIdentity`
- C. Clés root
- D. Un bucket S3 public avec les clés

<details><summary>Réponse</summary>

**B.**
</details>

**Q9 [SAA]** (choisissez 2) Quelles mesures protègent un compte root ?
- A. Activer le MFA
- B. Créer des clés d'accès pour l'automatiser
- C. L'utiliser uniquement pour les tâches qui l'exigent
- D. Partager son mot de passe avec l'équipe
- E. Désactiver CloudTrail

<details><summary>Réponse</summary>

**A et C.**
</details>

---

## Domaine B — Réseau et connectivité

**Q10 [SAA]** Des instances dans un subnet privé doivent télécharger des correctifs depuis Internet, sans être joignables depuis Internet. Quelle solution ?
- A. Internet Gateway dans le subnet privé
- B. NAT Gateway dans un subnet public + route `0.0.0.0/0` du subnet privé vers elle
- C. IP publiques sur les instances
- D. VPC peering

<details><summary>Réponse</summary>

**B.**
</details>

**Q11 [SAA]** Le trafic vers S3 depuis un VPC génère de forts coûts de NAT. Comment le réduire sans exposer le trafic à Internet ?
- A. Endpoint de passerelle (Gateway endpoint) S3
- B. Transit Gateway
- C. Direct Connect
- D. Accélération de transfert S3

<details><summary>Réponse</summary>

**A.** Gratuit, via la table de routage, le trafic reste sur le réseau AWS.
</details>

**Q12 [SAA]** Quelle différence principale entre un Security Group et une NACL ?
- A. SG stateless, NACL stateful
- B. SG stateful et au niveau instance (Allow seulement) ; NACL stateless et au niveau subnet (Allow/Deny)
- C. Aucune
- D. NACL s'applique à une région entière

<details><summary>Réponse</summary>

**B.**
</details>

**Q13 [SAA]** Dix VPC dans plusieurs comptes et un site on-premises doivent communiquer, avec routage transitif. Quel service ?
- A. VPC Peering en maillage
- B. AWS Transit Gateway
- C. NAT Gateway
- D. PrivateLink pour chaque VPC

<details><summary>Réponse</summary>

**B.** Hub & spoke transitif ; le peering n'est pas transitif et devient ingérable en maillage.
</details>

**Q14 [SOA]** Une instance dans un subnet public ne répond pas à Internet. Les SG sont corrects. Que vérifier en premier ? (choisissez 2)
- A. Présence d'une route `0.0.0.0/0` vers l'Internet Gateway
- B. L'instance a-t-elle une IP publique/EIP ?
- C. La version du noyau
- D. Le type d'instance
- E. La taille du volume

<details><summary>Réponse</summary>

**A et B.** (puis NACL).
</details>

**Q15 [SAA]** Exposer un service interne (derrière un NLB) à des centaines de VPC clients, sans chevauchement d'adresses ni peering. Que choisir ?
- A. AWS PrivateLink (endpoint service)
- B. VPC Peering
- C. Internet Gateway
- D. Site-to-Site VPN

<details><summary>Réponse</summary>

**A.**
</details>

**Q16 [SAA]** Comment obtenir des adresses IP statiques d'entrée pour une application TCP multi-région avec bascule rapide ?
- A. ALB
- B. AWS Global Accelerator
- C. Route 53 simple
- D. CloudFront

<details><summary>Réponse</summary>

**B.** IP anycast statiques, bascule en secondes, TCP/UDP.
</details>

---

## Domaine C — Compute, scalabilité et haute disponibilité

**Q17 [SAA]** Une charge batch tolérante aux interruptions doit minimiser le coût. Quelle option ?
- A. On-Demand
- B. Instances Spot
- C. Dedicated Hosts
- D. Reserved Instances 3 ans

<details><summary>Réponse</summary>

**B.**
</details>

**Q18 [SAA]** Une application web doit survivre à la perte d'une AZ et absorber des pics de trafic HTTP. Quelle architecture ?
- A. Une grosse instance dans une AZ
- B. ALB + Auto Scaling Group sur ≥ 2 AZ avec scaling target tracking
- C. Une instance avec EIP
- D. NLB et une instance

<details><summary>Réponse</summary>

**B.**
</details>

**Q19 [SAA]** Les instances d'un ASG sont terminées puis recréées en boucle. Quelle est la cause la plus probable ?
- A. Le health check ELB échoue (chemin, SG ou démarrage trop lent vs grace period)
- B. Les AMI sont chiffrées
- C. Le VPC est trop grand
- D. Le type d'instance est trop récent

<details><summary>Réponse</summary>

**A.**
</details>

**Q20 [SAA]** Quelle option améliore la **disponibilité** d'une base RDS ? Et laquelle améliore les **performances en lecture** ?
- A. Multi-AZ / Read Replica
- B. Read Replica / Multi-AZ
- C. Multi-AZ pour les deux
- D. Snapshots / Multi-AZ

<details><summary>Réponse</summary>

**A.** Multi-AZ = disponibilité (standby synchrone) ; Read Replica = lecture (asynchrone).
</details>

**Q21 [DVA]** Des milliers de Lambdas saturent les connexions d'une base RDS. Que faire ?
- A. Augmenter la mémoire Lambda
- B. Utiliser RDS Proxy
- C. Supprimer le VPC
- D. Passer en Multi-AZ

<details><summary>Réponse</summary>

**B.**
</details>

**Q22 [DOP]** Vous devez déployer une nouvelle AMI sur un ASG sans interruption et avec retour arrière simple. Quelle approche ?
- A. Modifier les instances en SSH
- B. Nouveau Launch Template + Instance Refresh (rolling) avec min healthy %, ou déploiement blue/green avec un second ASG
- C. Terminer toutes les instances
- D. Redémarrer l'ASG

<details><summary>Réponse</summary>

**B.**
</details>

**Q23 [SAA]** Un site statique mondial doit être rapide, en HTTPS, avec un bucket S3 non public. Que choisir ?
- A. Static website hosting public S3
- B. CloudFront avec OAC vers le bucket privé, certificat ACM (us-east-1)
- C. EC2 nginx
- D. Route 53 uniquement

<details><summary>Réponse</summary>

**B.**
</details>

**Q24 [SAA]** Lors d'une panne du site principal, Route 53 doit rediriger vers un site de secours. Quelle politique ?
- A. Pondérée sans health check
- B. Failover avec health check
- C. Simple
- D. Géolocalisation

<details><summary>Réponse</summary>

**B.**
</details>

---

## Domaine D — Stockage et bases de données

**Q25 [SAA]** Des données dont le profil d'accès est imprévisible doivent minimiser le coût sans gestion manuelle. Quelle classe S3 ?
- A. Standard
- B. Intelligent-Tiering
- C. Glacier Deep Archive
- D. One Zone-IA

<details><summary>Réponse</summary>

**B.**
</details>

**Q26 [SAA]** Un fichier S3 versionné a été « supprimé » par erreur. Comment le récupérer ?
- A. Impossible
- B. Supprimer le delete marker (ou restaurer une version précédente)
- C. Restaurer depuis EBS
- D. Contacter le support

<details><summary>Réponse</summary>

**B.**
</details>

**Q27 [SAA]** Plusieurs instances Linux dans différentes AZ doivent partager un système de fichiers POSIX. Quel service ?
- A. EBS
- B. EFS
- C. Instance store
- D. S3 Glacier

<details><summary>Réponse</summary>

**B.**
</details>

**Q28 [DVA]** Une table DynamoDB subit du throttling sur une seule valeur de partition key. Quelle est la cause ? Comment y remédier ?
- A. Hot partition : mieux répartir la clé (suffixe/sharding), ou passer en on-demand/DAX pour les lectures
- B. Le TTL est actif
- C. Les index sont absents
- D. La région est trop lointaine

<details><summary>Réponse</summary>

**A.**
</details>

**Q29 [DVA]** Vous devez interroger des commandes par `statut`, alors que la clé primaire est `clientId`. Que faire ?
- A. `Scan` avec filtre
- B. Créer un Global Secondary Index sur `statut`
- C. Dupliquer la table
- D. Ajouter un LSI sur `statut`

<details><summary>Réponse</summary>

**B.** Le LSI doit partager la partition key et se crée à la création de la table ; ici GSI.
</details>

**Q30 [SAA]** Besoin d'un RPO ≈ 1 s et d'un failover régional pour une base MySQL-compatible. Quelle solution ?
- A. RDS Multi-AZ
- B. Aurora Global Database
- C. Snapshots quotidiens
- D. Read Replica dans la même AZ

<details><summary>Réponse</summary>

**B.**
</details>

**Q31 [SAA]** Un cache en mémoire pour réduire la charge de lecture d'une base relationnelle ?
- A. ElastiCache
- B. S3
- C. Glacier
- D. Redshift

<details><summary>Réponse</summary>

**A.**
</details>

---

## Domaine E — Serverless, intégration et messaging

**Q32 [DVA]** Une file SQS reçoit des messages retraités à répétition alors que la Lambda réussit. Cause probable ?
- A. Visibility timeout inférieur à la durée de traitement
- B. Long polling activé
- C. Le message dépasse 256 Ko
- D. Le DLQ est vide

<details><summary>Réponse</summary>

**A.**
</details>

**Q33 [SAA]** Un message doit déclencher trois traitements indépendants et fiables. Quelle conception ?
- A. Une file SQS unique avec trois consommateurs
- B. Topic SNS avec trois files SQS abonnées (fan-out)
- C. Trois appels synchrones
- D. Une seule Lambda séquentielle

<details><summary>Réponse</summary>

**B.**
</details>

**Q34 [DVA]** Comment isoler les messages qui échouent après 3 tentatives ?
- A. Augmenter le timeout
- B. Dead-letter queue avec `maxReceiveCount=3`
- C. Supprimer le message
- D. FIFO uniquement

<details><summary>Réponse</summary>

**B.**
</details>

**Q35 [DVA]** Quelle est la durée maximale d'exécution d'une Lambda ?
- A. 5 min  B. 15 min  C. 1 h  D. 24 h

<details><summary>Réponse</summary>

**B.** Pour plus long : Step Functions, ECS/Fargate, Batch.
</details>

**Q36 [SAA]** Un workflow multi-étapes avec attente, parallélisme et reprise sur erreur : quel service ?
- A. Step Functions
- B. SQS
- C. SNS
- D. CloudFront

<details><summary>Réponse</summary>

**A.**
</details>

**Q37 [DVA]** Quelle intégration réduit le cold start d'une API critique en Java ?
- A. SnapStart ou concurrence provisionnée
- B. Réduire le timeout
- C. Utiliser x86 uniquement
- D. Désactiver les logs

<details><summary>Réponse</summary>

**A.**
</details>

---

## Domaine F — IaC, CI/CD, déploiement

**Q38 [DOP]** Comment prévisualiser l'impact d'une mise à jour CloudFormation en production ?
- A. Exécuter directement
- B. Créer un change set et l'examiner avant exécution
- C. Supprimer la stack
- D. Drift detection

<details><summary>Réponse</summary>

**B.**
</details>

**Q39 [DOP]** Une ressource a été modifiée manuellement hors CloudFormation. Quelle fonctionnalité le détecte ?
- A. Change set
- B. Drift detection
- C. Stack policy
- D. Rollback trigger

<details><summary>Réponse</summary>

**B.**
</details>

**Q40 [DOP]** Un déploiement ECS doit basculer 10 % du trafic, valider, puis le reste, avec rollback automatique sur alarme. Quel service ?
- A. CodeDeploy blue/green avec configuration canary et alarmes CloudWatch
- B. Rolling update sans alarme
- C. Redémarrage manuel
- D. CodeCommit

<details><summary>Réponse</summary>

**A.**
</details>

**Q41 [DOP]** Déployer une même baseline (rôle, Config, GuardDuty) dans tous les comptes et régions d'une organisation, y compris les futurs comptes. Quelle solution ?
- A. CloudFormation StackSets avec déploiement géré par les services (organization-aware, auto-deployment)
- B. Script manuel
- C. Une stack par console
- D. Elastic Beanstalk

<details><summary>Réponse</summary>

**A.**
</details>

**Q42 [DOP]** Le state Terraform est partagé par une équipe. Comment éviter les `apply` concurrents et la perte de données ?
- A. State local sur un poste
- B. Backend S3 versionné et chiffré avec verrouillage (DynamoDB ou lock S3)
- C. Commit du state dans Git
- D. Aucun contrôle

<details><summary>Réponse</summary>

**B.**
</details>

---

## Domaine G — Observabilité, opérations, résilience, coûts

**Q43 [SOA]** Comment obtenir la mémoire utilisée par une instance EC2 dans CloudWatch ?
- A. Métrique native EC2
- B. Installer l'agent CloudWatch et collecter les métriques personnalisées
- C. Cost Explorer
- D. CloudTrail

<details><summary>Réponse</summary>

**B.**
</details>

**Q44 [DOP]** À chaque arrêt d'une instance EC2 de production, une alerte doit être envoyée et un ticket créé automatiquement. Comment ?
- A. Alarme CPU
- B. Règle EventBridge sur « EC2 Instance State-change Notification » (stopped) vers SNS/Lambda
- C. Lecture manuelle des logs
- D. Config uniquement

<details><summary>Réponse</summary>

**B.**
</details>

**Q45 [SAA]** (RTO 30 min, RPO 5 min, budget limité) Quelle stratégie de DR ?
- A. Backup & Restore
- B. Pilot Light ou Warm Standby avec réplication continue des données
- C. Multi-site actif-actif
- D. Aucune

<details><summary>Réponse</summary>

**B.** Backup & Restore ne tient pas le RTO ; l'actif-actif est surdimensionné (coût).
</details>

---

## Grille d'auto-évaluation

| Score | Niveau |
|---|---|
| < 60 % | Retravailler les modules concernés |
| 60-79 % | Bon ; cibler les domaines faibles |
| ≥ 80 % | Prêt pour un examen blanc complet |

Notez vos erreurs dans [suivi-progression.md](suivi-progression.md).
