# Module 07 — Haute disponibilité, élasticité et edge

**Durée** : 1 jour · **Niveau** : intermédiaire · **Coût** : 💰 ALB ≈ 0,025 $/h + instances
**Certifications** : SAA (cœur), SOA, DOP

## Objectifs

- Répartir la charge avec **ELB (ALB/NLB/GWLB)**
- Faire passer l'application à l'échelle avec **Auto Scaling**
- Gérer le DNS et le basculement avec **Route 53**
- Accélérer et protéger la livraison avec **CloudFront** (+ WAF, Shield)

## 1. Elastic Load Balancing

| Type | Couche | Usage |
|---|---|---|
| **ALB** | 7 (HTTP/HTTPS/gRPC/WebSocket) | Routage par chemin/hôte/header, cibles instances/IP/Lambda/ECS, auth OIDC/Cognito, WAF |
| **NLB** | 4 (TCP/UDP/TLS) | Ultra faible latence, IP statique par AZ, PrivateLink |
| **GWLB** | 3 | Appliances réseau (pare-feu, IDS) |
| CLB | 4/7 | Obsolète |

Notions : **listeners** (port + protocole + règles), **target groups** (cibles + **health checks**), **cross-zone load balancing**, **deregistration delay**, **sticky sessions**, terminaison TLS avec certificat **ACM** (gratuit), redirection HTTP→HTTPS, en-têtes `X-Forwarded-For/Proto`.

Schéma classique :
```
Internet → ALB (subnets publics, 2 AZ) → Target Group → ASG (subnets privés, 2 AZ) → RDS Multi-AZ
```

## 2. Auto Scaling Group (ASG)

Maintient un nombre d'instances entre **min / désiré / max**, réparties sur plusieurs AZ, à partir d'un **Launch Template**.

| Politique | Principe |
|---|---|
| **Target tracking** (recommandé) | Garder une métrique cible (CPU 50 %, `RequestCountPerTarget`) |
| Step scaling | Paliers selon alarme CloudWatch |
| Scheduled | Pics prévisibles |
| Predictive | Prévision par ML |

Autres éléments : **health check ELB** (remplace les instances jugées non saines), **cooldown/warm-up**, **lifecycle hooks**, **instance refresh** (déploiement progressif d'une nouvelle AMI), **mixed instances** (On-Demand + Spot), **warm pools**.

Principe d'architecture : **instances sans état, jetables** ; sessions dans ElastiCache/DynamoDB, fichiers dans S3.

## 3. Route 53

DNS managé (SLA 100 %) + enregistrement de domaines + health checks.

| Enregistrement | Remarque |
|---|---|
| A / AAAA / CNAME / TXT / MX | Classiques |
| **Alias** | Spécifique AWS : pointe vers ALB, CloudFront, S3, API GW… **autorisé à l'apex** (`example.com`), gratuit, sans requête facturée |

### Politiques de routage
Simple · **Pondéré** (canary, A/B) · **Latence** · **Failover** (actif/passif avec health check) · **Géolocalisation** · Géoproximité · Multi-valeurs · Basé sur IP.

DNS privé : **zones hébergées privées** associées à un VPC.

## 4. CloudFront (CDN)

~600 points de présence. Origines : S3, ALB, API Gateway, tout serveur HTTP.

- **Comportements** (par chemin), **politiques de cache**, **TTL**, **invalidations**.
- **OAC (Origin Access Control)** : S3 privé, accessible uniquement via CloudFront.
- **HTTPS** avec certificat **ACM en us-east-1**.
- **Signed URLs / cookies** pour du contenu privé.
- **CloudFront Functions / Lambda@Edge** : logique en bordure (réécriture, auth).
- **WAF** + **Shield** (Standard gratuit, Advanced payant) contre les attaques L7/DDoS.
- **Global Accelerator** : IP anycast statiques, bascule rapide, pour TCP/UDP non cachable.

## 5. Haute disponibilité : règles d'or

1. ≥ 2 AZ pour chaque tier.
2. Health checks à tous les niveaux, suppression automatique des instances défaillantes.
3. Pas d'état local ; pas de « pets ».
4. Données répliquées (Multi-AZ, S3, DynamoDB).
5. Tester la panne (Fault Injection Service).

## 6. Démos

**Démo 01 — ALB + 2 instances** : tuer une instance, observer la bascule (health check) et la recréation par l'ASG.
**Démo 02 — Target tracking** : charge CPU avec `stress-ng` (ou `hey`) et observer le scale-out dans l'historique d'activité ASG.
**Démo 03 — Failover Route 53** : [`demos/demo-01-route53-failover.md`](demos/demo-01-route53-failover.md).
**Démo 04 — CloudFront + S3 privé (OAC)** : voir labo.

## 7. Labo 07 — Application web hautement disponible

**Énoncé** : déployer, via Terraform, un ALB public + ASG (2 → 4 instances, 2 AZ) servant une page indiquant l'AZ, avec scaling par `ALBRequestCountPerTarget`, puis une distribution CloudFront devant l'ALB.

Code : [`labs/lab-ha-web/`](labs/lab-ha-web/)

```bash
cd labs/lab-ha-web
terraform init && terraform apply
curl $(terraform output -raw alb_url)           # rafraîchir : l'AZ alterne
```

Étapes :
1. Vérifier que les requêtes alternent entre 2 AZ.
2. Terminer une instance : mesurer le temps de remédiation.
3. Générer de la charge (`hey -z 3m -c 50 <url>`) → observer le scale-out.
4. **Instance refresh** : changer le `user_data` (nouvelle version de la page) et lancer un refresh sans interruption.
5. Comparer les en-têtes via CloudFront (`x-cache: Hit from cloudfront`).
6. `terraform destroy`.

**Validation** : zéro erreur 5xx pendant la terminaison d'une instance (test avec une boucle `curl`).

## Erreurs fréquentes

| Problème | Cause |
|---|---|
| Cibles `unhealthy` | SG cible n'autorise pas l'ALB, mauvais chemin de health check, appli non démarrée |
| Scale-in qui coupe des requêtes | Deregistration delay trop court / pas de graceful shutdown |
| Certificat CloudFront introuvable | ACM doit être en **us-east-1** |
| CNAME impossible à l'apex | Utiliser un enregistrement Alias |
| Instances recréées en boucle | Health check ELB trop strict ou grace period trop courte |

## Quiz

1. ALB ou NLB pour du routage par chemin ?
2. Quelle métrique cible pour scaler selon le trafic HTTP ?
3. Différence entre Alias et CNAME ?
4. Pourquoi mettre CloudFront devant S3 plutôt que d'exposer le bucket ?
5. Quel service fournit des IP anycast statiques ?

<details><summary>Réponses</summary>

1. ALB.
2. `ALBRequestCountPerTarget` (target tracking).
3. L'Alias fonctionne à l'apex, est natif AWS, gratuit et suit les changements d'IP ; le CNAME est standard mais impossible à l'apex.
4. HTTPS/domaine personnalisé, cache, WAF, bucket privé via OAC.
5. Global Accelerator.
</details>
