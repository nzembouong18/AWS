# Module 04 — Compute : Amazon EC2

**Durée** : 1 jour · **Niveau** : débutant → intermédiaire · **Coût** : Free Tier (`t3.micro`/`t2.micro` selon région)
**Certifications** : CLF, SAA, SOA, DVA

## Objectifs

- Choisir le bon **type d'instance** et le bon **modèle d'achat**
- Créer, durcir et accéder à une instance (**SSM**, pas de SSH ouvert)
- Utiliser **AMI, user-data, Launch Templates, IMDSv2**
- Comprendre **EBS, snapshots, placement groups**

## 1. EC2 en bref

Machines virtuelles à la demande (virtualisation **Nitro**). Une instance = type + AMI + réseau (subnet, SG) + stockage + rôle IAM + clé/accès + user-data.

### Familles d'instances
| Famille | Optimisée pour | Exemple |
|---|---|---|
| **T** (t3, t4g) | Usage général, burstable (crédits CPU) | Dev, petits sites |
| **M** | Équilibre CPU/RAM | Applications |
| **C** | Calcul | Batch, encodage, CI |
| **R / X** | Mémoire | Bases, caches |
| **I / D** | Stockage local NVMe | Bases NoSQL |
| **G / P / Inf / Trn** | GPU / accélérateurs | ML/IA |

Nomenclature : `m7g.xlarge` = famille **m**, génération **7**, processeur **g** (Graviton ARM, ~20 % moins cher à perf égale), taille **xlarge**.

## 2. Modèles d'achat

| Modèle | Idéal |
|---|---|
| On-Demand | Court terme, imprévisible |
| **Savings Plans** (Compute / EC2 Instance) | Engagement $/h 1-3 ans, flexible |
| Reserved Instances | Engagement sur une configuration |
| **Spot** | Jusqu'à -90 %, interruption avec 2 min de préavis : CI, batch, workers sans état |
| Dedicated Hosts/Instances | Licences au socket, conformité |
| Capacity Reservations | Garantir la capacité en AZ |

## 3. AMI, user-data, métadonnées

- **AMI** : image (OS + logiciels), régionale, copiable ; construisez vos « golden images » avec **EC2 Image Builder** ou **Packer**.
- **User-data** : script exécuté au 1er boot (cloud-init), limité à 16 Ko.
- **IMDS** (`http://169.254.169.254`) : métadonnées et credentials du rôle. **Imposer IMDSv2** (`http_tokens = required`) pour contrer le SSRF.

```bash
TOKEN=$(curl -sX PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 60")
curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id
```

## 4. Accès : SSM plutôt que SSH

**AWS Systems Manager Session Manager** : shell dans le navigateur ou CLI, **sans port 22, sans bastion, sans clé**, journalisé (CloudTrail, S3/CloudWatch). Prérequis : agent SSM (présent sur Amazon Linux 2023), rôle `AmazonSSMManagedInstanceCore`, accès sortant HTTPS ou endpoints VPC.

```bash
aws ssm start-session --target i-0123456789abcdef0
aws ssm start-session --target i-0123 --document-name AWS-StartPortForwardingSession \
  --parameters '{"portNumber":["5432"],"localPortNumber":["5432"]}'
```

Autres capacités SSM : **Run Command**, **Patch Manager**, **State Manager**, **Parameter Store**, **Automation**, **Inventory**.

## 5. Stockage d'instance

| Type | Caractéristique |
|---|---|
| **EBS gp3** | SSD par défaut, IOPS/débit réglables indépendamment de la taille |
| EBS io2 | IOPS provisionnées, bases critiques |
| EBS st1 / sc1 | HDD débit / froid |
| Instance store | NVMe local, éphémère (perdu à l'arrêt) |

EBS est **zonal**, répliqué dans l'AZ ; **snapshots** incrémentaux dans S3 (régionaux, copiables, automatisables avec **Data Lifecycle Manager**). Chiffrement KMS recommandé (activez le chiffrement par défaut du compte/région).

## 6. Launch Templates

Modèle versionné d'une instance (AMI, type, SG, user-data, IAM profile, tags…) réutilisé par **Auto Scaling**, EC2 Fleet, Spot Fleet. Remplace les *Launch Configurations* (obsolètes).

## 7. Réseau d'instance

ENI (carte réseau virtuelle), IP privée fixe, IP publique (éphémère) ou **Elastic IP**. **Placement groups** : *cluster* (latence mini, une AZ), *spread* (instances sur matériels distincts), *partition* (gros clusters distribués).

## 8. Cycle de vie

`pending → running → stopping/stopped → terminated`. À l'arrêt : plus de facturation compute, mais EBS et EIP restent facturés. *Hibernate* sauvegarde la RAM. **Protection contre la résiliation** et **Stop protection** disponibles.

## 9. Démos

**Démo 01 — Lancer une instance en CLI avec user-data + SSM** : [`demos/demo-01-run-instance.sh`](demos/demo-01-run-instance.sh)
**Démo 02 — IMDSv1 vs IMDSv2** : montrer qu'un `curl` simple échoue quand IMDSv2 est obligatoire.
**Démo 03 — Spot** : demander une instance Spot, comparer le prix (`aws ec2 describe-spot-price-history`).

## 10. Labo 04 — Serveur web durci avec Terraform

**Énoncé** : déployer un serveur nginx dans le VPC par défaut (ou celui du module 03), sans SSH, accessible via SSM, avec IMDSv2, volume chiffré gp3, et AMI toujours à jour.

Code : [`labs/lab-ec2/`](labs/lab-ec2/)

Étapes :
1. `terraform apply`, ouvrir l'URL en sortie → page web.
2. `aws ssm start-session` → `systemctl status nginx`, `curl` IMDSv2.
3. Créer un **snapshot** du volume racine (`aws ec2 create-snapshot`), puis une **AMI** depuis l'instance.
4. Modifier le `user_data` : observer pourquoi l'instance est **remplacée** (immutabilité).
5. **Défi** : passez en `t4g.micro` (Graviton) ; que faut-il changer côté AMI ?
6. `terraform destroy` (supprimer aussi snapshot/AMI manuellement : hors state).

**Validation** : port 22 fermé, session SSM ouverte, `http_tokens=required` vérifié via `aws ec2 describe-instances`.

## Erreurs fréquentes

| Symptôme | Cause |
|---|---|
| Instance absente de SSM | Rôle manquant, pas de sortie HTTPS/endpoint, agent arrêté |
| `UnauthorizedOperation` | Permissions IAM/SCP (tester `--dry-run`) |
| `InsufficientInstanceCapacity` | Réessayer, changer d'AZ ou de type |
| Facture inattendue | Volumes EBS orphelins, EIP non attachées, snapshots |
| User-data non exécuté | Erreur dans le script : lire `/var/log/cloud-init-output.log` |

## Quiz

1. Pourquoi préférer Session Manager au SSH ?
2. Que devient l'instance store lors d'un arrêt ?
3. Quand choisir Spot ? Quand l'éviter ?
4. Quelle différence entre Launch Template et AMI ?
5. Que protège IMDSv2 ?

<details><summary>Réponses</summary>

1. Pas de port exposé ni de clés à gérer, accès via IAM, audit centralisé.
2. Les données sont perdues.
3. Charges tolérantes aux interruptions (batch, CI, stateless) ; à éviter pour bases de données/stateful critiques.
4. L'AMI est l'image disque ; le Launch Template est la configuration complète de lancement qui référence l'AMI.
5. Contre le vol de credentials via SSRF (jeton de session requis, saut de réseau limité).
</details>
