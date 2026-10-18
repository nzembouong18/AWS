# Module 03 — Réseau : Amazon VPC

**Durée** : 1,5 jour · **Niveau** : intermédiaire · **Coût** : 0 € (💰 NAT Gateway ≈ 0,05 $/h)
**Certifications** : SAA, SOA, DOP, ANS (très présent)

## Objectifs

- Concevoir un **VPC multi-AZ** (plan d'adressage CIDR, subnets publics/privés)
- Maîtriser **tables de routage, IGW, NAT, Security Groups, NACL**
- Connecter privément les services AWS (**endpoints**) et d'autres réseaux (**peering, Transit Gateway, VPN**)
- Diagnostiquer avec **VPC Flow Logs** et **Reachability Analyzer**

## 1. Le VPC

Un **VPC** est un réseau virtuel privé et isolé, **régional**, défini par un ou plusieurs blocs CIDR (RFC 1918, de /16 à /28). Les **subnets** sont **zonaux** (une seule AZ).

Chaque subnet réserve **5 adresses** (réseau, routeur, DNS, futur, broadcast). Un /24 offre donc 251 adresses utilisables.

### Plan d'adressage recommandé
```
VPC 10.0.0.0/16                     (65 531 IP)
 ├─ public-a   10.0.0.0/24   AZ a   → ALB, NAT, bastion
 ├─ public-b   10.0.1.0/24   AZ b
 ├─ private-a  10.0.10.0/24  AZ a   → applications
 ├─ private-b  10.0.11.0/24  AZ b
 ├─ data-a     10.0.20.0/24  AZ a   → bases de données (aucune route Internet)
 └─ data-b     10.0.21.0/24  AZ b
```
Règle : **ne pas chevaucher** les CIDR des VPC/réseaux que vous voudrez relier (peering, VPN, TGW non transitifs sur overlap). Prévoyez large dès le départ.

## 2. Public vs privé

Un subnet est **public** s'il a une route `0.0.0.0/0 → Internet Gateway` ; ses instances ont aussi besoin d'une IP publique/Elastic IP.

Un subnet **privé** n'a pas de route directe vers l'IGW. Sa sortie Internet passe par une **NAT Gateway** (placée dans un subnet public, 1 par AZ pour la HA).

```
Internet ──▶ IGW ──▶ [subnet public: ALB, NAT-GW]
                               │
                               ▼
                     [subnet privé: app]──▶ NAT-GW ──▶ IGW ──▶ Internet
                               │
                               ▼
                     [subnet data: RDS]   (aucune route Internet)
```

## 3. Composants

| Composant | Rôle | Points d'attention |
|---|---|---|
| **Route table** | Route par subnet (association explicite) ; règle la plus spécifique gagne | Table `main` = défaut, ne pas l'utiliser pour du public |
| **Internet Gateway** | Entrée/sortie Internet, scalable, gratuite | 1 par VPC |
| **NAT Gateway** | Sortie IPv4 pour le privé 💰 | Par AZ, facturée à l'heure + Go ; alternative : NAT instance (moins fiable) |
| **Egress-only IGW** | Sortie IPv6 | |
| **Security Group** | Pare-feu **stateful**, niveau ENI, **Allow uniquement** | Peut référencer un autre SG |
| **NACL** | Pare-feu **stateless**, niveau subnet, Allow + Deny, règles numérotées | Ouvrir les ports éphémères 1024-65535 en retour |
| **VPC Endpoint – Gateway** | S3 et DynamoDB, via table de routage, **gratuit** | |
| **VPC Endpoint – Interface** | PrivateLink : ENI + IP privée vers un service AWS/tiers 💰 | DNS privé |
| **Elastic IP** | IP publique statique | Facturée si inutilisée |

### Security Group vs NACL

| | Security Group | NACL |
|---|---|---|
| Niveau | Instance / ENI | Subnet |
| État | Stateful | Stateless |
| Règles | Allow seulement | Allow & Deny, ordre numérique |
| Défaut | Tout sortant, rien entrant | Tout autorisé (défaut) |

Bonne pratique : chaîner les SG (`alb-sg` → `app-sg` → `db-sg`) en référençant les SG sources plutôt que des CIDR.

## 4. Connecter des réseaux

| Besoin | Solution |
|---|---|
| 2 VPC | **VPC Peering** (1-1, non transitif, pas d'overlap) |
| N VPC / on-prem (hub & spoke) | **Transit Gateway** (transitif, tables de routage, inter-régions) |
| On-prem chiffré via Internet | **Site-to-Site VPN** (2 tunnels IPsec) |
| On-prem lien dédié | **Direct Connect** (+ VPN pour chiffrer, ou MACsec) |
| Exposer un service à des centaines de VPC | **PrivateLink** (Endpoint Service + NLB) |
| Accès SSH/RDP sans port ouvert | **SSM Session Manager** (voir module 04) |

## 5. DNS et IPv6

- Le DNS du VPC (`enableDnsSupport`, `enableDnsHostnames`) résout les noms internes ; le résolveur est à `base du VPC + 2`.
- **Route 53 Resolver** (endpoints entrants/sortants) pour le DNS hybride.
- IPv6 : blocs /56 attribués par AWS, adresses publiques par défaut → gérer avec SG et egress-only IGW.

## 6. Observabilité réseau

- **VPC Flow Logs** (ENI/subnet/VPC → CloudWatch Logs ou S3) : `ACCEPT`/`REJECT`, ports, volumes.
- **Reachability Analyzer** : analyse statique « A peut-il joindre B ? » avec le composant bloquant.
- **Traffic Mirroring**, **Network Access Analyzer**.

## 7. Démos

**Démo 01 — Construire un VPC à la main** (console) pour *comprendre* : VPC → subnets → IGW → route table → instance → échec/réussite de ping, puis l'équivalent CLI dans [`demos/demo-01-vpc-cli.sh`](demos/demo-01-vpc-cli.sh).

**Démo 02 — SG vs NACL** : bloquer une IP avec une NACL (Deny) montre qu'un SG ne peut pas le faire ; constater l'effet *stateless* en retirant les ports éphémères.

**Démo 03 — Reachability Analyzer** : analyse entre une instance privée et Internet, repérer la route NAT manquante.

## 8. Labo 03 — VPC 3 niveaux avec Terraform

**Énoncé** : déployer un VPC 2 AZ avec subnets public/privé/data, IGW, NAT (optionnelle), SG chaînés, endpoint S3 gratuit, Flow Logs, puis valider les chemins réseau.

Code : [`labs/lab-vpc/`](labs/lab-vpc/)

```bash
cd labs/lab-vpc
terraform init
terraform apply -var="enable_nat=false"        # 0 € : le privé n'a pas de sortie Internet
# Test : l'instance de test est atteignable via SSM, sans IP publique ni SSH
terraform apply -var="enable_nat=true"         # 💰 active la NAT (1 seule, mode économique)
terraform destroy
```

Questions guidées :
1. Pourquoi `curl https://example.com` échoue avec `enable_nat=false` mais `aws s3 ls` fonctionne (endpoint S3) ?
2. Quel est le nombre d'IP utilisables dans un /24 ? Pourquoi ?
3. Lisez les Flow Logs : retrouvez un `REJECT`.
4. Utilisez Reachability Analyzer : app privée → data privée sur 5432. Que manque-t-il ?
5. **Défi** : passez à une NAT par AZ (HA) et chiffrez le coût mensuel de la différence.

**Validation** : schéma annoté du VPC + capture d'un Flow Log `ACCEPT` et d'un `REJECT`.

## Erreurs fréquentes

| Symptôme | Cause |
|---|---|
| Instance publique inaccessible | Pas d'IP publique, route IGW absente, SG ou NACL |
| Instance privée sans Internet | Route vers NAT manquante ; NAT dans un subnet **privé** (doit être public) |
| Peering sans trafic | Routes non ajoutées des deux côtés / SG |
| Réponse bloquée avec NACL | Ports éphémères non ouverts (stateless) |
| Facture NAT élevée | Trafic vers S3/ECR via NAT → utiliser des endpoints |

## Quiz

1. Pourquoi un subnet ne peut-il pas s'étendre sur deux AZ ?
2. Quelle différence entre IGW et NAT Gateway ?
3. Le peering est-il transitif ?
4. Comment autoriser uniquement le trafic de l'ALB vers l'application ?
5. Quel endpoint est gratuit ?

<details><summary>Réponses</summary>

1. Un subnet est zonal par conception (isolation de panne).
2. L'IGW permet l'accès bidirectionnel Internet (IP publique requise) ; la NAT permet uniquement les connexions sortantes initiées depuis le privé.
3. Non ; utiliser Transit Gateway.
4. Règle entrante du SG de l'app avec comme source le SG de l'ALB.
5. Gateway endpoint (S3, DynamoDB).
</details>
