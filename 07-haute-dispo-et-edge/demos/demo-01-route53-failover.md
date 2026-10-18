# Démo — Failover Route 53

Objectif : montrer la bascule DNS automatique d'un site principal vers une page de secours.

1. Créer un health check HTTP sur l'ALB principal :
   ```bash
   aws route53 create-health-check --caller-reference "hc-$(date +%s)" --health-check-config \
     '{"Type":"HTTP","FullyQualifiedDomainName":"<alb-dns>","Port":80,"ResourcePath":"/health","RequestInterval":10,"FailureThreshold":2}'
   ```
2. Créer deux enregistrements Alias pour `app.exemple.com` :
   - `PRIMARY` → ALB, avec `HealthCheckId`
   - `SECONDARY` → bucket S3 (site statique « maintenance ») ou second ALB
3. Arrêter les instances (ou changer le chemin de health check pour renvoyer 500).
4. Observer : le health check passe `Unhealthy` (~30 s) puis `dig app.exemple.com` renvoie la cible secondaire (TTL bas, 60 s).
5. Discussion : coût des health checks, TTL, `Evaluate Target Health`, alternatives (Global Accelerator, multi-région actif-actif).

> Sans domaine : utiliser une zone privée Route 53 dans un VPC de test et `dig` depuis une instance.
