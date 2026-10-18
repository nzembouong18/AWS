# Module 02 — IAM : identités et accès

**Durée** : 1 jour · **Niveau** : débutant → intermédiaire · **Coût** : 0 €
**Certifications** : socle de TOUS les examens (SAA, DVA, SOA, DOP, SCS)

## Objectifs

- Distinguer **utilisateurs, groupes, rôles, policies**
- Écrire et lire une policy JSON, comprendre l'**évaluation** des permissions
- Utiliser **STS / AssumeRole** et les credentials temporaires
- Appliquer le **moindre privilège**, les *permission boundaries* et les conditions
- Connaître **IAM Identity Center** et la fédération (OIDC pour CI/CD)

## 1. Concepts

| Objet | Rôle |
|---|---|
| **Utilisateur** | Identité longue durée (humain ou programme). À éviter pour les humains → Identity Center |
| **Groupe** | Ensemble d'utilisateurs auquel on attache des policies |
| **Rôle** | Identité **assumable**, sans mot de passe, credentials temporaires. Pour services AWS, comptes tiers, fédération |
| **Policy** | Document JSON : *qui peut faire quoi sur quoi sous quelles conditions* |
| **Principal** | L'entité qui fait la requête (user, rôle, service, compte) |

## 2. Anatomie d'une policy

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "LireLeBucketApp",
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:ListBucket"],
    "Resource": [
      "arn:aws:s3:::mon-bucket",
      "arn:aws:s3:::mon-bucket/*"
    ],
    "Condition": {
      "IpAddress": {"aws:SourceIp": "203.0.113.0/24"},
      "Bool": {"aws:MultiFactorAuthPresent": "true"}
    }
  }]
}
```

- **Effect** : Allow / Deny
- **Action** : `service:Operation`, jokers autorisés (`s3:Get*`)
- **Resource** : ARN (`arn:partition:service:region:account-id:resource`)
- **Condition** : clés globales (`aws:RequestedRegion`, `aws:PrincipalTag/*`, `aws:SourceVpce`…) et clés de service
- **Principal** (policies de ressource / de confiance uniquement)
- `NotAction`, `NotResource` : à manier avec précaution

### Types de policies

| Type | Attachée à | Remarque |
|---|---|---|
| Basée sur l'identité (managée AWS / client / inline) | user, groupe, rôle | Cas général |
| Basée sur la ressource | S3, SQS, KMS, Lambda, rôle (trust policy)… | Permet l'accès **cross-account** direct |
| **Permissions boundary** | user, rôle | Plafond de permissions |
| **SCP** | compte / OU (Organizations) | Plafond au niveau organisation |
| **Session policy** | session STS | Restreint encore la session |
| ACL | S3, VPC | Legacy |

## 3. Logique d'évaluation

```
1. Deny explicite quelque part ?               → REFUSÉ
2. SCP (Organizations) autorise ?              → sinon REFUSÉ
3. Permission boundary autorise (si définie) ? → sinon REFUSÉ
4. Session policy autorise (si définie) ?      → sinon REFUSÉ
5. Allow dans une policy identité OU ressource → AUTORISÉ
6. Sinon                                       → REFUSÉ (implicite)
```

Règle de mémoire : **Deny explicite > Allow explicite > Deny implicite**. Pour un accès **même compte**, un Allow dans la policy de ressource *ou* d'identité suffit ; en **cross-account**, il faut un Allow des **deux côtés**.

## 4. Rôles et STS

```
Principal ──sts:AssumeRole──▶ Rôle (trust policy autorise le principal)
                         ◀── AccessKeyId + SecretKey + SessionToken (15 min–12 h)
```

**Trust policy** (qui peut assumer) ≠ **policy de permissions** (ce que le rôle peut faire).

Cas d'usage :
1. **Rôle de service** : EC2 (instance profile), Lambda (execution role), ECS (task role) → plus jamais de clés dans le code.
2. **Cross-account** : un compte « tooling » assume un rôle dans le compte « prod ».
3. **Fédération** : SAML/OIDC (GitHub Actions, EKS IRSA/Pod Identity, Google…).
4. **Break-glass** : rôle d'urgence audité.

```bash
aws sts assume-role --role-arn arn:aws:iam::123456789012:role/Deployer \
  --role-session-name ci --duration-seconds 3600
# External ID : protège contre le « confused deputy » pour les tiers
```

## 5. Bonnes pratiques

1. **MFA** partout, root verrouillé.
2. **Rôles > utilisateurs ; credentials temporaires > clés longues.**
3. **Moindre privilège** : partir de rien, élargir via les journaux (**IAM Access Analyzer** génère des policies depuis CloudTrail ; *last accessed* repère les droits inutilisés).
4. Utiliser des **conditions** (région, tags, IP, VPC endpoint, MFA).
5. **ABAC** (contrôle par tags) pour passer à l'échelle : `aws:PrincipalTag/team == aws:ResourceTag/team`.
6. Pas de `"Action":"*"` + `"Resource":"*"` hors compte bac à sable.
7. Rotation/suppression des clés inutilisées ; rapport d'identifiants (*credential report*).
8. Déléguer la création de rôles avec **permission boundary** obligatoire.

## 6. IAM Identity Center (ex-AWS SSO)

Point d'entrée unique pour les humains : annuaire intégré ou IdP externe (Entra ID, Okta), **permission sets** assignés à des groupes sur des comptes → crée des rôles IAM dans chaque compte. Sessions courtes, SSO CLI (`aws sso login`).

## 7. GitHub Actions → AWS sans clé (OIDC)

Le fournisseur d'identité `token.actions.githubusercontent.com` est déclaré dans IAM ; le rôle est assumable par `sts:AssumeRoleWithWebIdentity` avec conditions sur `sub` (repo/branche). Détaillé et mis en œuvre au **module 11**.

## 8. Démos

### Démo 01 — Lire un refus
```bash
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::<compte>:user/alice \
  --action-names s3:GetObject ec2:RunInstances \
  --resource-arns "*"
```
Puis décoder un message `AccessDenied` via `aws sts decode-authorization-message --encoded-message <...>`.

### Démo 02 — AssumeRole en ligne de commande
[`demos/demo-02-assume-role.sh`](demos/demo-02-assume-role.sh)

### Démo 03 — Access Analyzer
Console → IAM → *Access Analyzer* : créer un analyzer, lister les ressources partagées en externe, générer une policy depuis l'activité CloudTrail.

## 9. Labo 02 — Délégation sécurisée avec Terraform

**Scénario** : l'équipe `dev` doit pouvoir (1) lire et écrire dans un bucket applicatif, (2) lancer des instances **uniquement** en `eu-west-3` et seulement si elles portent le tag `team=dev`, avec MFA obligatoire pour assumer le rôle.

Code : [`labs/lab-iam/`](labs/lab-iam/)

Étapes :
1. `terraform init && terraform apply`
2. Examinez les policies créées (`main.tf`).
3. Assumez le rôle `dev-role` (output `assume_command`) — avec un utilisateur de test dans le groupe `devs`.
4. Tentez `aws ec2 run-instances --dry-run` en `us-east-1` → refus attendu ; en `eu-west-3` sans tag → refus ; avec tag → `DryRunOperation`.
5. Utilisez le **Policy Simulator** pour vérifier.
6. **Défi** : ajoutez une *permission boundary* empêchant la création de nouveaux utilisateurs IAM.
7. `terraform destroy`.

**Validation** : vous expliquez à voix haute pourquoi chaque appel est autorisé ou refusé, en citant l'étape d'évaluation concernée.

## Erreurs fréquentes

| Erreur | Pourquoi |
|---|---|
| Rôle créé mais « not authorized to perform sts:AssumeRole » | La **trust policy** ne cite pas le principal, ou l'appelant n'a pas `sts:AssumeRole` |
| S3 : Allow `s3:GetObject` mais refus | La Resource doit finir par `/*` pour les objets, le bucket sans `/*` pour `ListBucket` |
| Accès cross-account échoue | Il manque l'un des deux côtés (identité + ressource) |
| Policy trop large « pour que ça marche » | Utiliser Access Analyzer pour affiner |
| Clés commitées sur Git | Révoquer **immédiatement**, auditer CloudTrail |

## Quiz

1. Un Deny dans une SCP est-il contournable par un Allow dans une policy d'identité ?
2. Différence entre trust policy et permission policy ?
3. Pourquoi préférer un rôle à un utilisateur pour une application sur EC2 ?
4. Que fait une permission boundary : accorde-t-elle des droits ?
5. Quelle condition force MFA ?

<details><summary>Réponses</summary>

1. Non, le Deny (ou l'absence d'Allow) dans la SCP plafonne.
2. La trust policy dit qui peut assumer le rôle ; la permission policy dit ce que le rôle peut faire.
3. Credentials temporaires auto-renouvelés via IMDS, pas de secret à stocker.
4. Non, elle fixe un maximum ; il faut quand même un Allow.
5. `"Bool": {"aws:MultiFactorAuthPresent": "true"}`.
</details>
