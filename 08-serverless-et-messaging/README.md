# Module 08 — Serverless et messaging

**Durée** : 1,5 jour · **Niveau** : intermédiaire · **Coût** : ≈ 0 € (Free Tier généreux)
**Certifications** : DVA (cœur), SAA, DOP

## Objectifs

- Construire une API **serverless** (API Gateway + Lambda + DynamoDB)
- Découpler avec **SQS, SNS, EventBridge**
- Orchestrer avec **Step Functions**
- Connaître limites, cold start, concurrence, idempotence, DLQ

## 1. Lambda

Code exécuté à la demande, facturé à la ms × mémoire. Runtimes : Python, Node.js, Java, .NET, Go, Ruby, ou **image conteneur** (≤ 10 Go).

### Paramètres clés
| Paramètre | Valeur / remarque |
|---|---|
| Mémoire | 128 Mo – 10 Go ; **CPU proportionnel** à la mémoire |
| Timeout | max **15 min** |
| /tmp | 512 Mo – 10 Go |
| Concurrence | 1 000 par région (défaut, relevable) ; **réservée** (plafond+garantie) ; **provisionnée** (pas de cold start) |
| Package | 50 Mo zip / 250 Mo décompressé ; **layers** |
| Architecture | x86_64 ou **arm64** (moins cher) |

### Modèles d'invocation
- **Synchrone** : API Gateway, ALB, SDK → le client attend.
- **Asynchrone** : S3, SNS, EventBridge → file interne, 2 réessais, **DLQ / destinations**.
- **Polling (event source mapping)** : SQS, Kinesis, DynamoDB Streams → Lambda lit par lots ; gérer `batchItemFailures`.

### Cold start
Initialisation du conteneur + du runtime + de votre code. Réduire : paquet léger, init hors handler (connexions réutilisées), arm64, SnapStart (Java), concurrence provisionnée.

### Handler Python minimal
```python
import json, os, boto3
table = boto3.resource("dynamodb").Table(os.environ["TABLE"])   # initialisé 1 fois par environnement

def handler(event, context):
    item = json.loads(event["body"])
    table.put_item(Item=item)
    return {"statusCode": 201, "body": json.dumps({"ok": True})}
```

### Bonnes pratiques
1. **Rôle d'exécution** au moindre privilège, une fonction = un rôle.
2. **Idempotence** (les événements peuvent être livrés plusieurs fois) → clés d'idempotence, *Powertools for AWS Lambda*.
3. Variables d'environnement pour la config ; secrets via Secrets Manager/Parameter Store (cache).
4. Logs structurés JSON, X-Ray.
5. Lambda en VPC seulement si nécessaire (accès RDS) → RDS Proxy.
6. Versions + **alias** (`prod`) + déploiements progressifs (CodeDeploy canary).

## 2. API Gateway

| Type | Usage |
|---|---|
| **HTTP API** | Moins cher/rapide, JWT, CORS ; cas courant |
| **REST API** | Clés d'API, plans d'usage, validation, cache, WAF, transformations |
| WebSocket API | Temps réel |

Autorisation : IAM, **Cognito**, **JWT**, Lambda authorizer. Throttling, stages, domaines personnalisés. Alternative : **Lambda Function URL** (HTTPS direct, sans API GW).

## 3. Messaging : SQS, SNS, EventBridge

| Service | Modèle | Points clés |
|---|---|---|
| **SQS Standard** | File, pull | Débit illimité, *at-least-once*, ordre non garanti |
| **SQS FIFO** | File ordonnée | Exactly-once processing, groupes de messages, 300 msg/s (3 000 en batch) ; nom `.fifo` |
| **SNS** | Pub/Sub, push | Topics, abonnés SQS/Lambda/HTTP/e-mail/SMS, **filtrage** par attributs |
| **EventBridge** | Bus d'événements | Règles à motifs, sources AWS + SaaS + custom, **Scheduler**, Pipes, archivage/rejeu |
| Kinesis Data Streams | Flux ordonné partitionné | Rejeu, plusieurs consommateurs, temps réel |
| Amazon MQ | Brokers ActiveMQ/RabbitMQ | Migration d'applis existantes |

Paramètres SQS essentiels : **visibility timeout** (> durée de traitement), **long polling** (`WaitTimeSeconds=20`), **DLQ** (`maxReceiveCount`), délai, rétention (≤ 14 j), taille ≤ 256 Ko.

**Patron « fan-out »** : SNS → N files SQS (chaque consommateur à son rythme).

```
Événement ──▶ SNS topic ──┬─▶ SQS facturation ──▶ Lambda
                          ├─▶ SQS stock       ──▶ Lambda
                          └─▶ e-mail
```

## 4. Step Functions

Orchestration visuelle par machine à états (ASL JSON) : `Task`, `Choice`, `Parallel`, `Map`, `Wait`, `Retry/Catch`. **Standard** (≤ 1 an, exactly-once, auditable) vs **Express** (≤ 5 min, volume élevé, at-least-once). Intégrations SDK directes avec 200+ services (sans Lambda « colle »).

## 5. Autres briques serverless

S3 · DynamoDB · **Cognito** (authentification utilisateurs) · **AppSync** (GraphQL) · **Fargate** (conteneurs sans serveur, module 09) · **Athena** · **Kinesis Firehose** · **AWS SAM** (framework IaC serverless).

## 6. Démos

**Démo 01 — Lambda en CLI** : [`demos/demo-01-lambda.sh`](demos/demo-01-lambda.sh) (création, invocation, logs).
**Démo 02 — SQS + DLQ** : envoyer un message « empoisonné », constater 3 essais puis arrivée en DLQ.
**Démo 03 — Step Functions** : workflow `Validate → Choice → (Process | Reject)` avec Retry.

## 7. Labo 08 — API de gestion de tâches serverless

**Énoncé** : API REST `POST /tasks`, `GET /tasks/{id}` (HTTP API → Lambda → DynamoDB). Chaque tâche créée publie un événement sur SNS qui alimente une file SQS traitée par une seconde Lambda, avec DLQ.

Code : [`labs/lab-serverless/`](labs/lab-serverless/)

```bash
cd labs/lab-serverless
terraform init && terraform apply
API=$(terraform output -raw api_url)
curl -X POST $API/tasks -H 'content-type: application/json' -d '{"title":"Apprendre AWS"}'
curl $API/tasks/<id>
aws logs tail /aws/lambda/lab08-worker --follow
```

Étapes :
1. Créer une tâche et vérifier la trace complète dans les logs du worker.
2. Envoyer un message invalide (`{"fail":true}` via SNS) → vérifier la DLQ après 3 échecs.
3. Mesurer le cold start (`REPORT … Init Duration`).
4. **Défi** : ajouter une règle EventBridge Scheduler qui nettoie les tâches terminées chaque nuit.
5. `terraform destroy`.

**Validation** : vous expliquez le chemin d'un message (sync puis async) et où il peut échouer.

## Erreurs fréquentes

| Problème | Cause |
|---|---|
| Messages SQS retraités en boucle | Visibility timeout < durée de traitement |
| Lambda timeout sur RDS | Lambda en VPC sans route/SG, pas de pool de connexions |
| Facture Lambda inattendue | Boucle récursive S3 → Lambda → S3 |
| 502 API Gateway | Mauvais format de réponse du handler |
| Doublons | Pas d'idempotence (at-least-once) |

## Quiz

1. Quelle durée maximale pour une Lambda ?
2. SNS ou SQS pour un fan-out ? Pourquoi les combiner ?
3. Que garantit une file FIFO ?
4. À quoi sert une DLQ ?
5. Comment éviter le cold start d'un endpoint critique ?

<details><summary>Réponses</summary>

1. 15 minutes.
2. SNS diffuse ; SQS bufferise et fiabilise chaque consommateur ; on combine : SNS → plusieurs SQS.
3. Ordre (par groupe de messages) et dé-duplication.
4. Isoler les messages échoués pour analyse sans bloquer le flux.
5. Provisioned concurrency / SnapStart / paquet léger.
</details>
