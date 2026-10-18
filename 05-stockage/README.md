# Module 05 — Stockage : S3, EBS, EFS

**Durée** : 1 jour · **Niveau** : débutant → intermédiaire · **Coût** : ≈ 0 €
**Certifications** : CLF, SAA, SOA, DVA (S3 est omniprésent)

## Objectifs

- Maîtriser **Amazon S3** : classes de stockage, versioning, cycle de vie, sécurité, événements
- Choisir entre **S3, EBS, EFS, FSx** selon le besoin
- Sécuriser les données (chiffrement, Block Public Access, politiques de bucket)
- Automatiser sauvegarde et réplication

## 1. Choisir son stockage

| Service | Type | Accès | Cas d'usage |
|---|---|---|---|
| **S3** | Objet | HTTP/API, global | Fichiers, backups, data lake, sites statiques, artefacts |
| **EBS** | Bloc | 1 instance (Multi-Attach io2 en option), 1 AZ | Disques d'OS, bases |
| **EFS** | Fichier NFS | Milliers d'instances, multi-AZ | Contenu partagé, CMS |
| **FSx** | Fichier managé (Windows, Lustre, NetApp, OpenZFS) | SMB/NFS/Lustre | HPC, Windows |
| Instance store | Bloc local | 1 instance | Cache, temporaire |
| **Storage Gateway / DataSync / Snow** | Hybride / migration | | |

## 2. Amazon S3

Stockage objet **durable (11 neuf)**, quasi illimité, **cohérence forte** lecture-après-écriture. Un objet = clé + données (≤ 5 To) + métadonnées + version. Les « dossiers » ne sont que des préfixes.

### Classes de stockage
| Classe | Accès | Remarque |
|---|---|---|
| Standard | Fréquent | Défaut |
| **Intelligent-Tiering** | Inconnu/variable | Bascule auto, sans frais de récupération |
| Standard-IA / One Zone-IA | Rare, récupération en ms | Durée min 30 j ; One Zone = 1 AZ |
| Glacier Instant Retrieval | Archive, ms | 90 j min |
| Glacier Flexible Retrieval | Archive, min–h | 90 j min |
| **Glacier Deep Archive** | Archive longue, ~12 h | 180 j min, le moins cher |

### Fonctions clés
- **Versioning** : protège contre suppression/écrasement ; **MFA Delete** en option. Un « delete » ajoute un *delete marker*.
- **Lifecycle** : transitions entre classes, expiration, nettoyage des uploads multipart incomplets et des anciennes versions.
- **Réplication** CRR / SRR (versioning requis des deux côtés).
- **Object Lock** (WORM : Governance/Compliance) et **Legal Hold**.
- **S3 Event Notifications / EventBridge** → Lambda, SQS, SNS.
- **Presigned URLs** : accès temporaire sans credentials.
- **Multipart upload** (> 100 Mo recommandé), **Transfer Acceleration**, **S3 Select**, **Batch Operations**, **Inventory**, **Storage Lens**.
- **Static website hosting** (+ CloudFront + OAC pour HTTPS, voir module 07).
- **Access Points**, **Multi-Region Access Points**.

### Sécurité S3 (essentiel)
1. **Block Public Access** activé au niveau du compte.
2. **Chiffrement** : SSE-S3 (défaut, AES-256), **SSE-KMS** (audit, contrôle de clé), SSE-C, côté client. Depuis 2023, le chiffrement SSE-S3 est appliqué à tous les nouveaux objets.
3. **Policy de bucket** : exiger TLS, restreindre par VPC endpoint, par rôle.
4. **Désactiver les ACL** (`BucketOwnerEnforced`).
5. **Journalisation** : server access logs, CloudTrail data events.
6. **Macie** pour détecter les données sensibles.

Exemple — refuser le trafic non chiffré :
```json
{
  "Sid": "DenyInsecureTransport",
  "Effect": "Deny",
  "Principal": "*",
  "Action": "s3:*",
  "Resource": ["arn:aws:s3:::mon-bucket", "arn:aws:s3:::mon-bucket/*"],
  "Condition": {"Bool": {"aws:SecureTransport": "false"}}
}
```

### CLI utile
```bash
aws s3 mb s3://mon-bucket-unique-123
aws s3 cp fichier.txt s3://mon-bucket-unique-123/dossier/
aws s3 sync ./site s3://mon-bucket-unique-123 --delete
aws s3 presign s3://mon-bucket-unique-123/fichier.txt --expires-in 300
aws s3api list-object-versions --bucket mon-bucket-unique-123
aws s3api put-bucket-versioning --bucket B --versioning-configuration Status=Enabled
```

## 3. EBS en détail

- Volumes **gp3** (3 000 IOPS / 125 Mo/s de base), **io2 Block Express** (jusqu'à 256 000 IOPS), **st1/sc1** HDD.
- **Snapshots** incrémentaux ; **Fast Snapshot Restore** ; **Recycle Bin** ; **EBS Snapshots Archive**.
- Redimensionnement à chaud (`modify-volume`, puis `growpart` + `resize2fs`/`xfs_growfs`).
- Chiffrement transparent KMS ; un snapshot d'un volume chiffré est chiffré.
- Sauvegarde centralisée : **AWS Backup** (plans, rétention, copie inter-région/compte, vault lock).

## 4. EFS

NFSv4.1 managé, **élastique**, multi-AZ, accès via *mount targets* (1 par AZ + SG sur le port 2049). Modes de performance (General Purpose / Max I/O), débit (Elastic / Provisioned), classes **Standard / IA** avec lifecycle. Linux uniquement (Windows → FSx).

```bash
sudo dnf install -y amazon-efs-utils
sudo mount -t efs -o tls fs-0123456789abcdef0:/ /mnt/efs
```

## 5. Sauvegarde et PRA (aperçu)

- **RPO** (perte de données acceptable) et **RTO** (temps de reprise) pilotent le choix. Détails au module 14.
- AWS Backup : politiques centralisées pour EBS, EFS, RDS, DynamoDB, S3…

## 6. Démos

**Démo 01 — Cycle de vie d'un objet** : [`demos/demo-01-s3-versioning.sh`](demos/demo-01-s3-versioning.sh) — versioning, suppression, restauration d'une version.
**Démo 02 — Presigned URL** : partager un fichier privé 5 minutes.
**Démo 03 — Site statique sécurisé** (voir module 07 pour la version CloudFront).
**Démo 04 — Agrandir un volume EBS à chaud.**

## 7. Labo 05 — Bucket de production en Terraform

**Énoncé** : créer un bucket « données applicatives » conforme aux bonnes pratiques :
- chiffrement SSE-KMS avec clé dédiée et *bucket key*
- versioning + règle de cycle de vie (Standard → IA à 30 j → Glacier IR à 90 j, expiration des anciennes versions à 180 j)
- Block Public Access, ACL désactivées, TLS obligatoire
- notification d'événement vers SQS lors d'un `ObjectCreated`

Code : [`labs/lab-s3/`](labs/lab-s3/)

Étapes :
1. `terraform apply`, envoyer un fichier, lire le message dans la file SQS (`aws sqs receive-message`).
2. Écraser le fichier 3 fois, lister les versions, restaurer la première.
3. Tenter un accès HTTP (non TLS) : `curl http://bucket.s3.amazonaws.com/...` → refus.
4. **Défi** : ajouter la réplication vers un second bucket d'une autre région.
5. `terraform destroy`.

**Validation** : vous prouvez par commande que (a) l'accès public est bloqué, (b) 3 versions existent, (c) l'événement est reçu.

## Erreurs fréquentes

| Problème | Explication |
|---|---|
| Facture S3 gonflée | Anciennes versions non expirées, uploads multipart incomplets, requêtes (PUT/LIST) massives |
| `AccessDenied` malgré une policy | Chiffrement KMS : il faut aussi `kms:Decrypt` sur la clé |
| Données publiques par erreur | Ne pas activer Block Public Access ; ACL anciennes |
| Nom de bucket refusé | Unique globalement, 3-63 caractères, minuscules |
| Perte de données EBS | Instance store ou volume `DeleteOnTermination=true` sans snapshot |

## Quiz

1. Quelle classe S3 pour des données dont le profil d'accès est inconnu ?
2. Comment annuler la suppression d'un objet versionné ?
3. EBS peut-il être monté depuis deux AZ ?
4. Pourquoi `s3:ListBucket` et `s3:GetObject` ont-ils des ARN différents ?
5. Quel service gère les sauvegardes centralisées ?

<details><summary>Réponses</summary>

1. Intelligent-Tiering.
2. Supprimer le *delete marker* (ou copier une version précédente).
3. Non, un volume EBS est lié à une AZ (utiliser un snapshot pour migrer).
4. `ListBucket` agit sur le bucket, `GetObject` sur les objets (`/*`).
5. AWS Backup.
</details>
