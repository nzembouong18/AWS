# Module 12 — Observabilité, audit et conformité

**Durée** : 1 jour · **Niveau** : intermédiaire · **Coût** : ≈ 0–2 € (logs et métriques personnalisées facturés)
**Certifications** : **SOA (cœur)**, DOP, SAA, SCS

## Objectifs

- Mettre en place **métriques, logs, traces, alarmes, tableaux de bord**
- Distinguer **CloudWatch** (performance), **CloudTrail** (qui a fait quoi), **Config** (état et conformité)
- Construire une chaîne **alerte → notification → remédiation automatique**
- Définir des **SLI/SLO** et réduire le bruit

## 1. Les trois piliers + audit

| Besoin | Service |
|---|---|
| **Métriques** (séries temporelles) | CloudWatch Metrics |
| **Logs** | CloudWatch Logs (+ Logs Insights) |
| **Traces** distribuées | X-Ray / OpenTelemetry (ADOT) |
| **Qui a appelé quelle API ?** | **CloudTrail** |
| **Quelle est la config actuelle/passée, conforme ?** | **AWS Config** |
| Santé de la plateforme AWS | Health Dashboard / EventBridge |
| Recommandations | Trusted Advisor, Compute Optimizer |
| Cartographie d'applications | Application Signals, CloudWatch ServiceLens |

## 2. CloudWatch Metrics

- Espace de noms (`AWS/EC2`), **dimensions** (InstanceId), statistiques (Average, p99), période (60 s standard, 1 s haute résolution).
- EC2 : métriques de base toutes les 5 min (1 min en *detailed*). **Mémoire et disque** : nécessite l'**agent CloudWatch**.
- **Métriques personnalisées** (`put-metric-data`) et **EMF** (Embedded Metric Format : métriques via des logs JSON).
- **Metric math**, **anomaly detection**.

## 3. Alarmes

États `OK` / `ALARM` / `INSUFFICIENT_DATA` ; période × points de données (ex. 3 sur 5). Actions : SNS, Auto Scaling, EC2 (reboot/recover), Systems Manager OpsItem. **Alarmes composites** pour réduire le bruit.

```bash
aws cloudwatch put-metric-alarm --alarm-name alb-5xx --namespace AWS/ApplicationELB \
  --metric-name HTTPCode_Target_5XX_Count --dimensions Name=LoadBalancer,Value=app/xxx/yyy \
  --statistic Sum --period 60 --evaluation-periods 3 --datapoints-to-alarm 2 \
  --threshold 10 --comparison-operator GreaterThanThreshold --treat-missing-data notBreaching \
  --alarm-actions arn:aws:sns:eu-west-3:123456789012:alerts
```

## 4. CloudWatch Logs

Organisation : **log group** (rétention, KMS) → **log streams**. Sources : agent CW, Lambda, ECS `awslogs`, VPC Flow Logs, Route 53…

- **Rétention** : définissez-la toujours (défaut = illimité = coûteux).
- **Metric filters** : transformer un motif de log en métrique (ex. `ERROR`).
- **Subscription filters** : flux temps réel vers Lambda/Kinesis/Firehose/OpenSearch.
- **Logs Insights** : requêtes.
```
fields @timestamp, @message
| filter @message like /ERROR/
| stats count() as erreurs by bin(5m)
| sort @timestamp desc
```
- Export vers S3 pour archivage ; classe de logs *Infrequent Access*.

## 5. Traçage

**X-Ray** : trace de bout en bout (API GW → Lambda → DynamoDB…), service map, analyse de latence. Instrumentation via SDK X-Ray ou **OpenTelemetry (ADOT collector)**.

## 6. CloudTrail

Journal des appels d'API (console, CLI, SDK) : **qui, quoi, quand, d'où**.
- **Événements de gestion** : activés par défaut (90 jours dans *Event history*).
- **Trail** vers S3 (multi-région, toutes les régions, **validation d'intégrité**) pour conservation longue, + CloudWatch Logs pour alerter.
- **Événements de données** (S3 objets, Lambda invoke…) : opt-in, volumineux.
- **CloudTrail Lake** : requêtes SQL sur les événements.
- **Organization trail** : centralisation multi-comptes.

Cas d'usage : « Qui a supprimé ce groupe de sécurité ? » → `lookup-events` ou Athena.

## 7. AWS Config

Enregistre l'**historique de configuration** des ressources et évalue des **règles** de conformité (managées ou Lambda/Guard) : S3 non chiffré, SG ouvert sur 22, volumes EBS non chiffrés… **Remédiation automatique** via Systems Manager Automation. **Conformance packs**, agrégateur multi-comptes.

> Retenir : **CloudTrail = actions (API)** · **Config = état/conformité** · **CloudWatch = performance/opérationnel**.

## 8. Automatisation événementielle

```
EC2 passe en 'stopped' → EventBridge rule → SNS (e-mail) + Lambda/SSM Automation (remédiation)
Config règle non conforme → EventBridge → SSM Automation (corriger)
GuardDuty finding HIGH → EventBridge → Lambda (isoler l'instance) + SNS
```

## 9. SLI / SLO et alertes utiles

- **SLI** : proportion de requêtes réussies, latence p99, saturation.
- **SLO** : objectif (ex. 99,9 %/30 j) → **budget d'erreur** → guide les décisions de déploiement.
- Alerter sur les **symptômes** (erreurs utilisateurs, latence) plutôt que sur chaque cause ; alertes **actionnables** avec runbook.
- Les « 4 signaux dorés » : latence, trafic, erreurs, saturation.

## 10. Démos

**Démo 01 — Alarme + SNS** : CPU d'une instance → e-mail ; provoquer avec `stress`.
**Démo 02 — Logs Insights** : requête sur les logs Lambda du module 08 (erreurs par minute, p95 de durée).
**Démo 03 — Enquête CloudTrail** : retrouver l'auteur d'une suppression ([`demos/demo-01-cloudtrail.sh`](demos/demo-01-cloudtrail.sh)).
**Démo 04 — Config rule + remédiation** : règle `s3-bucket-public-read-prohibited`.

## 11. Labo 12 — Supervision et remédiation automatique

**Énoncé** : instrumenter l'application du module 07/08 et automatiser les réactions.

Code : [`labs/lab-observability/`](labs/lab-observability/) crée : topic SNS + abonnement e-mail, dashboard, alarme sur erreurs Lambda, metric filter sur logs, trail CloudTrail → S3, règle EventBridge qui notifie à chaque `StopInstances`.

Étapes :
1. `terraform apply -var email=vous@exemple.com`, confirmer l'abonnement SNS.
2. Provoquer des erreurs Lambda (`aws lambda invoke` avec payload qui plante) → recevoir l'alerte.
3. Arrêter une instance → recevoir la notification EventBridge.
4. Requête Logs Insights : top 5 des erreurs.
5. CloudTrail : retrouver votre propre `StopInstances` (qui, IP, userAgent).
6. **Défi** : alarme composite « (5xx ALB élevées) ET (latence p99 élevée) ».
7. `terraform destroy`.

**Validation** : vous recevez 2 notifications distinctes et retrouvez l'événement correspondant dans CloudTrail.

## Erreurs fréquentes

| Problème | Cause |
|---|---|
| Pas de métrique mémoire | Agent CloudWatch non installé/configuré |
| Alarme en `INSUFFICIENT_DATA` | Pas de données ; `treat-missing-data` à ajuster |
| Facture CloudWatch élevée | Logs verbeux sans rétention, métriques à forte cardinalité |
| Pas d'historique > 90 j | Aucun trail vers S3 |
| Alertes ignorées | Trop de bruit → SLO, alarmes composites, seuils pertinents |

## Quiz

1. Quel service répond à « qui a supprimé ce bucket ? »
2. Comment obtenir la mémoire d'une instance EC2 dans CloudWatch ?
3. Quelle différence entre metric filter et subscription filter ?
4. Que fait AWS Config que CloudTrail ne fait pas ?
5. Qu'est-ce qu'un budget d'erreur ?

<details><summary>Réponses</summary>

1. CloudTrail.
2. Installer l'agent CloudWatch (métriques personnalisées).
3. Le metric filter crée une métrique à partir des logs ; le subscription filter diffuse les logs en temps réel vers une destination.
4. Historique de configuration et évaluation de conformité (avec remédiation).
5. Le taux d'indisponibilité toléré par le SLO ; consommé, on ralentit les déploiements à risque.
</details>
