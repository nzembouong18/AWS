# Module 09 — Conteneurs : ECR, ECS, Fargate, EKS

**Durée** : 2 jours · **Niveau** : intermédiaire → avancé · **Coût** : 💰 Fargate ≈ quelques centimes/h ; EKS 0,10 $/h le plan de contrôle
**Certifications** : DOP (cœur), SAA, DVA, SOA

## Objectifs

- Construire, signer et stocker des images dans **ECR**
- Déployer des services sur **ECS/Fargate** derrière un ALB, avec autoscaling
- Comprendre **EKS** : architecture, nœuds managés, Fargate profiles, accès IAM (IRSA / Pod Identity)
- Choisir ECS vs EKS vs Lambda

## 1. Choisir son orchestrateur

| Critère | ECS | EKS | Lambda |
|---|---|---|---|
| Complexité | Faible | Élevée (Kubernetes) | Très faible |
| Portabilité | AWS uniquement | Kubernetes standard, multi-cloud | AWS |
| Écosystème | AWS natif | Helm, operators, CNCF | Événementiel |
| Cas typique | Services web/API, workers | Plateforme multi-équipes, K8s existant | Événements courts |
| Coût de contrôle | 0 | 0,10 $/h/cluster | à l'usage |

**Modes de calcul** : **Fargate** (serverless, pas de nœuds à gérer) ou **EC2** (contrôle, GPU, Spot, densité).

## 2. ECR

Registre privé OCI : scan de vulnérabilités (basic / enhanced Inspector), **immutabilité des tags**, politiques de cycle de vie, réplication inter-région/compte, chiffrement KMS.

```bash
REGION=eu-west-3; ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REG=$ACCOUNT.dkr.ecr.$REGION.amazonaws.com
aws ecr create-repository --repository-name demo/web --image-scanning-configuration scanOnPush=true \
  --image-tag-mutability IMMUTABLE
aws ecr get-login-password | docker login --username AWS --password-stdin $REG
docker build -t $REG/demo/web:1.0.0 . && docker push $REG/demo/web:1.0.0
```
> Dans les pipelines : tag = SHA du commit (traçabilité), jamais `latest` en production.

## 3. ECS — concepts

```
Cluster
 └── Service (désiré = N, ALB, autoscaling, déploiement)
      └── Task (instance d'une Task Definition)
           └── Containers (image, CPU/mémoire, ports, env, secrets, logs)
```

| Élément | Rôle |
|---|---|
| **Task Definition** | Plan versionné : image(s), CPU/RAM, `awsvpc`, rôles |
| **Task Execution Role** | Utilisé par ECS pour tirer l'image ECR, écrire les logs, lire les secrets |
| **Task Role** | Permissions de **votre application** (S3, DynamoDB…) |
| **Service** | Maintient N tâches, enregistre dans le target group, déploie |
| **Capacity providers** | Fargate / Fargate Spot / ASG EC2 |

Mode réseau `awsvpc` : chaque tâche a sa propre ENI, son SG et une IP du subnet.

### Déploiements
- **Rolling update** (défaut) : `minimumHealthyPercent` / `maximumPercent`, avec **circuit breaker** + rollback automatique.
- **Blue/Green via CodeDeploy** : bascule de trafic ALB (canary, linear), tests avant bascule.
- Secrets : référence à Secrets Manager / Parameter Store dans la task definition (jamais en clair).
- **ECS Exec** : shell dans un conteneur en prod (via SSM), audité.
- **Service Connect** / Cloud Map : découverte de services.

## 4. EKS

Plan de contrôle Kubernetes managé (multi-AZ). Options de calcul : **managed node groups**, **Fargate profiles**, **Karpenter** (provisioning rapide des nœuds, optimisation de coût), nœuds auto-gérés.

Éléments propres à AWS :
- **VPC CNI** : les pods reçoivent une IP du VPC.
- **AWS Load Balancer Controller** : `Ingress` → ALB, `Service LoadBalancer` → NLB.
- **EKS Pod Identity / IRSA** : un pod endosse un rôle IAM (plus de clés dans les pods).
- **Accès cluster** : *access entries* (API) / `aws-auth` ConfigMap (hérité) ; `aws eks update-kubeconfig`.
- **Add-ons** managés : CoreDNS, kube-proxy, VPC CNI, EBS CSI, observabilité.
- Mises à jour de version : plan de contrôle puis nœuds, tous les ~14 mois par version (support étendu payant).

```bash
aws eks update-kubeconfig --name demo --region eu-west-3
kubectl get nodes
kubectl create deployment web --image=public.ecr.aws/nginx/nginx:stable --replicas=3
kubectl expose deployment web --port 80 --type LoadBalancer
```

> Un cours Kubernetes complet est disponible dans le dépôt `K8s` ; ici on se concentre sur l'intégration AWS.

## 5. Sécurité des conteneurs

1. Image minimale, utilisateur non-root, scan à chaque push (ECR + Trivy en CI).
2. Un rôle IAM **par service** (task role / Pod Identity).
3. Réseau : tâches en subnets **privés**, SG limités, endpoints ECR/S3/Logs pour éviter la NAT.
4. Secrets hors image ; fichiers système en lecture seule.
5. Journalisation vers CloudWatch Logs (`awslogs`) ou FireLens.

## 6. Démos

**Démo 01 — Build & push ECR** (voir commandes ci-dessus + scan).
**Démo 02 — ECS Fargate en 5 minutes** via la console (« Create service ») pour voir tous les objets, puis recréation en Terraform.
**Démo 03 — Rollback automatique** : déployer une image qui échoue au health check ; constater le circuit breaker.

## 7. Labo 09 — Service ECS Fargate derrière un ALB

**Énoncé** : déployer une petite API (image publique `nginx` puis votre image ECR) sur ECS Fargate, 2 tâches sur 2 AZ, ALB, logs CloudWatch, autoscaling CPU, circuit breaker.

Code : [`labs/lab-ecs/`](labs/lab-ecs/) — application d'exemple dans [`labs/lab-ecs/app/`](labs/lab-ecs/app/).

```bash
cd labs/lab-ecs
terraform init && terraform apply
curl $(terraform output -raw alb_url)/
```

Étapes :
1. Vérifier les tâches (`aws ecs list-tasks`) et les logs (`aws logs tail /ecs/lab09 --follow`).
2. Construire l'image de `app/`, la pousser dans ECR (output `ecr_repo`), puis relancer `terraform apply -var image=<URI:tag> -var container_port=8080 -var health_path=/health`. (Le dépôt ECR est créé par le premier `apply` ; l'image est en `linux/amd64` : `docker build --platform linux/amd64`.)
3. Casser volontairement l'image (port erroné) → observer l'échec et le rollback.
4. Ouvrir un shell : `aws ecs execute-command ...`.
5. **Défi** : passer à **Fargate Spot** pour 50 % des tâches (capacity provider strategy).
6. `terraform destroy` 💰.

**Validation** : 0 downtime lors d'un déploiement (boucle `curl` pendant le déploiement), rollback automatique constaté.

## 8. Labo 09 bis (optionnel) — EKS avec eksctl

```bash
eksctl create cluster --name demo --region eu-west-3 --nodes 2 --node-type t3.medium --managed
# ... déployer, exposer via Ingress
eksctl delete cluster --name demo       # 💰 ne pas oublier
```

## Erreurs fréquentes

| Problème | Cause |
|---|---|
| Tâche bloquée en `PENDING` / `CannotPullContainerError` | Pas de route vers ECR (NAT/endpoints) ou execution role incomplet |
| Cibles ALB `unhealthy` | Port conteneur ≠ port target group, SG, chemin de health check |
| `AccessDenied` dans l'appli | Permissions mises sur l'execution role au lieu du task role |
| Pods `Pending` sur EKS | Plus d'IP dans le subnet, ressources insuffisantes |
| Facture NAT forte | Pull d'images ECR via NAT → endpoints ECR + S3 |

## Quiz

1. Différence entre task role et task execution role ?
2. Quand préférer EKS à ECS ?
3. Quel mécanisme évite de laisser un mauvais déploiement actif ?
4. Comment donner à un pod EKS l'accès à S3 sans clé ?
5. Pourquoi ne pas utiliser le tag `latest` ?

<details><summary>Réponses</summary>

1. Execution role : ECS (pull ECR, logs, secrets). Task role : le code de l'application.
2. Compétences/outillage Kubernetes existants, portabilité, écosystème (Helm, operators) ; sinon ECS est plus simple.
3. Deployment circuit breaker avec rollback (ou blue/green CodeDeploy).
4. IRSA ou EKS Pod Identity.
5. Non reproductible, non traçable, impossible de revenir en arrière de façon déterministe.
</details>
