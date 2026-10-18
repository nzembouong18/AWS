# Module 13 — Sécurité avancée

**Durée** : 1,5 jour · **Niveau** : avancé · **Coût** : ≈ 1–3 € (KMS 1 $/clé/mois, GuardDuty/Config après essai)
**Certifications** : SCS (cœur), DOP, SAA, SOA

## Objectifs

- Maîtriser le **chiffrement** (KMS, envelope encryption, TLS/ACM)
- Gérer les **secrets** (Secrets Manager, Parameter Store)
- Protéger le périmètre (**WAF, Shield**) et détecter les menaces (**GuardDuty, Inspector, Macie, Security Hub**)
- Appliquer **Security by design** : défense en profondeur, automatisation de la conformité, réponse à incident

## 1. Cadre : défense en profondeur

```
Identité (IAM, MFA, SSO)  →  Réseau (VPC, SG, WAF)  →  Hôte/Conteneur (patch, EDR, Inspector)
  →  Application (code, dépendances)  →  Données (KMS, classification)  →  Détection & réponse
```
Principes : moindre privilège, zero trust, chiffrement partout, **tout en code**, journaliser et alerter, automatiser la remédiation.

## 2. AWS KMS

Service de gestion de clés (HSM validés FIPS 140-3). Les clés **ne sortent jamais** de KMS non chiffrées.

| Type de clé | Gestion | Rotation | Coût |
|---|---|---|---|
| **AWS owned** | AWS (invisible) | AWS | gratuit |
| **AWS managed** (`aws/s3`) | AWS dans votre compte | auto (annuelle) | gratuit |
| **Customer managed (CMK)** | Vous (policy, alias, grants) | optionnelle (auto annuelle) | 1 $/mois + requêtes |
| Import / External key store | Vous | manuelle | |

### Envelope encryption
```
GenerateDataKey ─▶ (clé de données en clair + chiffrée par la CMK)
  chiffrer les données avec la clé en clair (AES-256 en local), la jeter de la mémoire
  stocker : données chiffrées + clé de données CHIFFRÉE
Déchiffrer : KMS Decrypt(clé chiffrée) → clé en clair → déchiffrer
```
Raison : KMS chiffre directement ≤ 4 Ko ; au-delà on utilise des clés de données.

### Policies de clé
Une CMK a **sa propre policy de ressource** (obligatoire) : sans elle, même les admins IAM ne peuvent rien. Séparer **administrateurs de clé** et **utilisateurs de clé** ; autoriser les services via `kms:ViaService`. **Contexte de chiffrement** (EncryptionContext) pour lier un chiffrement à un usage. Les clés sont **régionales** ; multi-region keys pour la réplication.

## 3. Secrets

| | Secrets Manager | SSM Parameter Store |
|---|---|---|
| Rotation automatique | **Oui** (RDS, Redshift, Lambda perso) | Non natif |
| Coût | ~0,40 $/secret/mois | Standard gratuit |
| Taille | 64 Ko | 4 Ko (8 Ko avancé) |
| Multi-région | Réplication native | Non |
| Usage | Mots de passe BD, clés API | Configuration, flags, petits secrets (`SecureString`) |

Bonnes pratiques : ne **jamais** mettre de secret dans le code, l'image, la variable d'environnement en clair, les logs ou Git ; lire à l'exécution via le rôle IAM ; mettre en cache ; rotation.

## 4. Certificats et TLS

**ACM** : certificats publics **gratuits**, renouvellement automatique, validation DNS (Route 53), utilisables avec ALB, CloudFront (us-east-1), API Gateway. Les clés privées ne sont pas exportables (sauf ACM Private CA/exportable payant). TLS 1.2+ partout, politiques de sécurité ELB modernes, HSTS.

## 5. Protection du périmètre

| Service | Rôle |
|---|---|
| **AWS WAF** | Pare-feu applicatif L7 (ALB, CloudFront, API GW, AppSync) : règles managées (OWASP, bot control), limitation de débit, géo-blocage |
| **Shield Standard / Advanced** | DDoS L3/L4 (gratuit) / protection avancée, équipe SRT, remboursement de coûts |
| **Network Firewall** | Filtrage réseau stateful dans le VPC, IPS |
| **Firewall Manager** | Gestion centralisée WAF/SG/Network Firewall |
| **Security Groups / NACL** | Voir module 03 |
| **VPC endpoints + policies** | Limiter l'accès aux services AWS aux seules ressources attendues |

## 6. Détection et conformité

| Service | Détecte / apporte |
|---|---|
| **GuardDuty** | Menaces (comptes compromis, crypto-mining, exfiltration) via CloudTrail, VPC Flow, DNS, EKS, S3, Lambda… |
| **Inspector** | Vulnérabilités (EC2, ECR, Lambda) |
| **Macie** | Données sensibles dans S3 (PII) |
| **Security Hub** | Agrégation et score de conformité (CIS, AWS FSBP, PCI) ; findings au format ASFF |
| **Detective** | Investigation (graphes de comportement) |
| **IAM Access Analyzer** | Accès externes, droits inutilisés, validation de policies |
| **Config** | Conformité de configuration (module 12) |
| **Audit Manager / Artifact** | Preuves de conformité / rapports AWS (SOC, ISO) |

## 7. Réponse à incident (patron)

1. **Détecter** : GuardDuty/Security Hub → EventBridge.
2. **Contenir** : isoler l'instance (SG de quarantaine), révoquer les sessions du rôle (policy `AWSRevokeOlderSessions`), désactiver les clés.
3. **Préserver** : snapshot EBS, copie des logs, capture mémoire si nécessaire.
4. **Éradiquer / récupérer** : reconstruire depuis l'IaC et des images saines, faire tourner les secrets.
5. **Apprendre** : post-mortem sans blâme, règles de détection supplémentaires.

Compte compromis : root + MFA, révoquer clés, CloudTrail pour mesurer l'étendue, contacter AWS Support.

## 8. Checklist « compte sain »

- [ ] MFA root, pas de clés root, contacts de sécurité
- [ ] Identity Center, pas d'utilisateurs IAM humains
- [ ] Block Public Access S3 au niveau du **compte**
- [ ] Chiffrement EBS **par défaut**, S3 chiffré, RDS chiffré
- [ ] IMDSv2 obligatoire
- [ ] CloudTrail organisationnel + Config + GuardDuty + Security Hub activés dans toutes les régions
- [ ] Pas de SG ouvert 0.0.0.0/0 sur 22/3389/BD
- [ ] Secrets dans Secrets Manager, rotation active
- [ ] SCP de garde-fous (module 15)

## 9. Démos

**Démo 01 — Envelope encryption à la main** : [`demos/demo-01-kms-envelope.sh`](demos/demo-01-kms-envelope.sh).
**Démo 02 — Secrets Manager** : création, lecture dynamique depuis Lambda, rotation.
**Démo 03 — GuardDuty** : générer des *sample findings* (`aws guardduty create-sample-findings`) et déclencher une alerte EventBridge.
**Démo 04 — WAF** : bloquer une injection SQL de test (`?id=1' OR '1'='1`) sur un ALB.

## 10. Labo 13 — Durcir un environnement

**Énoncé** : appliquer un socle de sécurité avec Terraform.

Code : [`labs/lab-security/`](labs/lab-security/) crée : CMK avec rotation, dont la policy délègue la gestion à IAM (l'accès est alors donné rôle par rôle), secret chiffré, chiffrement EBS par défaut, Block Public Access au niveau compte, GuardDuty (échoue si un détecteur existe déjà : importez-le), WAF (ACL non associée : à attacher à un ALB/API) avec règles managées + limitation de débit, et règle Config « SSH ouvert » (crée aussi l'enregistreur Config : un seul par région et par compte).

Étapes :
1. `terraform apply`.
2. Tenter de lire le secret avec un rôle sans `kms:Decrypt` → refus malgré `secretsmanager:GetSecretValue`.
3. Créer un SG ouvert sur 22 → voir la règle Config signaler la non-conformité.
4. Générer des sample findings GuardDuty.
5. Scanner le code Terraform du dépôt : `checkov -d .` ; corriger 3 alertes.
6. **Défi** : rédiger un runbook d'incident « clé d'accès exposée sur GitHub » (étapes, commandes, délais).
7. `terraform destroy`.

**Validation** : vous démontrez les trois couches de blocage (IAM, KMS, réseau).

## Erreurs fréquentes

| Problème | Cause |
|---|---|
| `AccessDeniedException` sur secret malgré IAM | La policy de la CMK n'autorise pas le rôle |
| Données illisibles après suppression d'une clé | Suppression KMS (7-30 j de délai) : désactiver d'abord |
| Certificat introuvable pour CloudFront | ACM en **us-east-1** |
| Alertes GuardDuty ignorées | Pas d'intégration EventBridge/Slack/ticket |
| Clé AWS commitée | Révoquer immédiatement, ne pas se contenter de supprimer le commit |

## Quiz

1. Pourquoi l'envelope encryption ?
2. Différence Secrets Manager / Parameter Store ?
3. Quel service surveille les comportements anormaux d'un compte ?
4. Qui peut administrer une CMK dont la policy est vide pour l'IAM ?
5. Que contient une réponse à incident en premier : éradiquer ou contenir ?

<details><summary>Réponses</summary>

1. KMS ne chiffre que de petits volumes ; on chiffre les données localement avec une clé de données protégée par la CMK, ce qui limite les appels et l'exposition.
2. Secrets Manager : rotation, réplication, payant ; Parameter Store : configuration, gratuit en standard.
3. GuardDuty.
4. Personne via IAM seul (sauf l'activation de la délégation IAM dans la policy de clé).
5. Contenir, puis préserver les preuves, éradiquer, récupérer.
</details>
