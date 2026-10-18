# Module 06 — Bases de données : RDS, Aurora, DynamoDB, ElastiCache

**Durée** : 1 jour · **Niveau** : intermédiaire · **Coût** : 💰 RDS/Aurora (Free Tier limité), DynamoDB on-demand ≈ 0 €
**Certifications** : SAA, DVA, SOA, DOP

## Objectifs

- Choisir la bonne base selon le besoin (relationnel, clé-valeur, cache, analytique)
- Déployer **RDS Multi-AZ**, répliques de lecture, sauvegardes, restauration PITR
- Modéliser et interroger **DynamoDB** (clés, index, capacité, TTL, streams)
- Sécuriser (réseau privé, KMS, Secrets Manager, IAM auth)

## 1. Quelle base choisir ?

| Besoin | Service |
|---|---|
| SQL classique (MySQL, PostgreSQL, MariaDB, Oracle, SQL Server) | **RDS** |
| SQL cloud-native, haute perf, 6 copies sur 3 AZ | **Aurora** (MySQL/PostgreSQL), **Aurora Serverless v2** |
| Clé-valeur / documents, latence ms, échelle illimitée | **DynamoDB** |
| Cache en mémoire (Redis/Valkey, Memcached) | **ElastiCache** / MemoryDB |
| Entrepôt de données | **Redshift** |
| Documents Mongo-compatible | DocumentDB |
| Graphe / série temporelle / ledger | Neptune / Timestream / QLDB (remplacé) |
| Analyse sur S3 | Athena |

## 2. RDS

Base managée : AWS gère matériel, OS, installation, patches du moteur, sauvegardes, bascule. Vous gérez schéma, requêtes, paramètres, utilisateurs.

### Haute disponibilité et scalabilité
| Fonction | Objectif | Détail |
|---|---|---|
| **Multi-AZ** (instance) | **Disponibilité / DR** | Réplication **synchrone** vers un standby d'une autre AZ ; bascule auto (1-2 min) ; *le standby ne sert pas les lectures* |
| **Multi-AZ cluster** | HA + lectures | 2 standbys lisibles |
| **Read Replicas** | **Performance (lecture)** | Réplication **asynchrone**, jusqu'à 15, inter-régions possibles, promouvables |
| Sauvegardes auto | Restauration PITR | Rétention 1-35 j, restauration vers une **nouvelle** instance |
| Snapshots manuels | Archivage | Copie inter-région/compte |
| **RDS Proxy** | Pool de connexions | Indispensable avec Lambda ; réduit le temps de bascule |

Mnémo : **Multi-AZ = disponibilité ; Read Replica = performance.**

### Sécurité
- Subnet group **privé** (subnets « data »), SG n'autorisant que l'application.
- Chiffrement au repos (KMS, à l'**activation à la création**), TLS en transit.
- Identifiants dans **Secrets Manager** avec rotation ; **IAM database authentication** (jetons de 15 min).
- Protection contre la suppression, snapshot final.

## 3. Aurora

Stockage distribué partagé (6 copies sur 3 AZ, 10 → 128 To auto), jusqu'à 15 réplicas de lecture avec failover en < 30 s. Endpoints : **cluster** (écriture), **reader** (lecture répartie), **custom**. **Serverless v2** : capacité en ACU, scale fin ; **Global Database** : réplication inter-régions < 1 s, RPO ~1 s ; **Backtrack** (MySQL), clonage rapide.

## 4. DynamoDB

Base NoSQL serverless, latence à un chiffre en ms, multi-AZ native.

### Modèle
- **Table** → **items** (≤ 400 Ko) → **attributs**.
- Clé primaire : **partition key** seule, ou **partition key + sort key**. La partition key doit répartir uniformément (éviter les « hot keys »).
- **GSI** (autre PK/SK, éventuellement cohérence éventuelle, capacité propre) / **LSI** (même PK, créé à la création).
- Concevoir **à partir des patterns d'accès**, pas du schéma : *single-table design*.

### Capacité
| Mode | Quand |
|---|---|
| **On-demand** | Trafic imprévisible, démarrage |
| **Provisioned** (+ Auto Scaling) | Trafic prévisible, optimisation du coût |

1 RCU = 1 lecture fortement cohérente de 4 Ko/s (2 si éventuelle). 1 WCU = 1 écriture de 1 Ko/s.

### Fonctions
Lectures **éventuellement cohérentes** (défaut) ou **fortement cohérentes** ; **transactions** ; **TTL** (expiration gratuite) ; **Streams** (→ Lambda, CDC) ; **Global Tables** (multi-région actif-actif) ; **PITR** (35 j) ; **DAX** (cache microseconde) ; export vers S3.

```bash
aws dynamodb put-item --table-name Commandes --item '{
  "client":{"S":"c42"}, "commande":{"S":"2026-001"}, "total":{"N":"59.90"}}'
aws dynamodb query --table-name Commandes \
  --key-condition-expression "client = :c AND begins_with(commande, :p)" \
  --expression-attribute-values '{":c":{"S":"c42"},":p":{"S":"2026"}}'
```
> `Scan` parcourt tout : à proscrire en production sur grandes tables. Préférez `Query`.

## 5. ElastiCache

Redis/Valkey (persistance, réplication, Multi-AZ, clustering, pub/sub) ou Memcached (simple, multithread). Stratégies : **lazy loading** (cache-aside) + **write-through** ; toujours définir un **TTL**. Cas d'usage : sessions, cache de requêtes, classements, rate limiting.

## 6. Migration : DMS et SCT

**DMS** migre/réplique (full load + CDC) avec peu d'interruption ; **SCT** convertit les schémas pour migrations hétérogènes (Oracle → PostgreSQL).

## 7. Démos

**Démo 01 — RDS PostgreSQL Multi-AZ** : créer l'instance, forcer un **failover** (`aws rds reboot-db-instance --force-failover`) et observer la bascule du CNAME.
**Démo 02 — Restauration PITR** : supprimer des lignes puis restaurer à T-5 min vers une nouvelle instance.
**Démo 03 — DynamoDB** : [`demos/demo-01-dynamodb.sh`](demos/demo-01-dynamodb.sh) (clé composite, Query, GSI, TTL).

## 8. Labo 06 — Base relationnelle sécurisée + table DynamoDB

**Énoncé** : déployer en Terraform (a) une instance RDS PostgreSQL dans des subnets privés avec mot de passe géré par Secrets Manager, chiffrée, sauvegardée, (b) une table DynamoDB on-demand avec GSI et TTL.

Code : [`labs/lab-db/`](labs/lab-db/) — utilise le VPC par défaut (la base reste privée : `publicly_accessible=false`). Pour la connexion, lancez une instance SSM dans le même VPC (module 04).

Étapes :
1. `terraform apply -var="multi_az=false"` (économique) puis comparez avec `true`.
2. Récupérez le secret (`aws secretsmanager get-secret-value`) et connectez-vous via un hôte SSM (port forwarding).
3. Créez une table, insérez des données, créez un snapshot, restaurez-le.
4. Dans DynamoDB, insérez des items avec TTL ; vérifiez la suppression automatique.
5. **Défi** : ajoutez un Read Replica et mesurez le *replica lag* (CloudWatch `ReplicaLag`).
6. 💰 `terraform destroy` **immédiatement** après les tests.

**Validation** : la base n'est pas publique (`PubliclyAccessible=false`), chiffrée, et le mot de passe n'apparaît nulle part dans le code.

## Erreurs fréquentes

| Problème | Cause / solution |
|---|---|
| Timeout de connexion | SG, subnet group, ou DB dans le mauvais VPC |
| Lambda épuise les connexions | Utiliser RDS Proxy |
| Chiffrement impossible après coup | Restaurer un snapshot chiffré (copie avec KMS) |
| DynamoDB throttling | Hot partition ou capacité insuffisante |
| Coûts élevés | Instances oubliées, Multi-AZ en dev, snapshots conservés |

## Quiz

1. Multi-AZ ou Read Replica pour réduire la charge de lecture ?
2. Comment se connecter à RDS sans mot de passe statique ?
3. Pourquoi éviter `Scan` ?
4. Quelle option pour du multi-région actif-actif ?
5. Quel service pour limiter les connexions depuis des milliers de Lambdas ?

<details><summary>Réponses</summary>

1. Read Replica (Multi-AZ = HA).
2. IAM database authentication, ou secret géré/rotatif dans Secrets Manager.
3. Lit toute la table, coûteux et lent ; utiliser Query/GSI.
4. DynamoDB Global Tables (ou Aurora Global Database pour du relationnel avec écriture dans une seule région).
5. RDS Proxy.
</details>
