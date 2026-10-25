// Contenu du deck « Formation AWS pour ingénieur DevOps ».
// Types de diapos : title, stats, table, flow, cards, cmp, code, lab, recap, div, agenda, vpc, ha, org
// Chaque diapo a des notes de présentation (explication orale).

module.exports = [
  // ============================== INTRODUCTION ==============================
  { t: "title",
    title: "Formation AWS pour ingénieur DevOps",
    sub: "Du débutant à l'expert cloud : cours, démos, labos et préparation aux certifications",
    notes: "Bienvenue. Cette formation suit le dépôt GitHub nzembouong18/aws : chaque module a son cours, ses démos et son labo Terraform. L'objectif : vous rendre autonome sur AWS, puis vous préparer aux certifications." },

  { t: "stats", kicker: "INTRODUCTION", title: "La formation en chiffres",
    stats: [
      { v: "18", l: "modules, de 00 à 17" },
      { v: "~22 j", l: "de formation pratique" },
      { v: "15", l: "labos Terraform déployables" },
      { v: "135", l: "flashcards et 45 questions d'examen" },
    ],
    foot: "Chaque module suit le même rythme : cours, démos, labo, quiz.",
    notes: "Environ 8 à 12 semaines en autoformation à mi-temps. Les 15 labos sont écrits en Terraform et ont été validés avec terraform validate. Le rythme conseillé en présentiel : 30 % de cours, 20 % de démo, 50 % de labo." },

  { t: "table", kicker: "INTRODUCTION", title: "À qui s'adresse ce cours ?",
    head: ["Profil", "Point de départ", "Objectif"],
    rows: [
      ["Admin système ou développeur junior", "Module 00", "Devenir DevOps AWS opérationnel"],
      ["DevOps venant d'un autre cloud", "Modules 02 à 10", "Transposer ses acquis sur AWS"],
      ["Ingénieur visant une certification", "Module 17 + modules ciblés", "Réussir SAA, DVA, SOA ou DOP"],
    ],
    w: [4.6, 3.4, 4.13],
    foot: "Prérequis : bases Linux (shell, SSH), réseau (IP, DNS, HTTP) et Git. Aucune connaissance AWS n'est requise.",
    notes: "Ajustez le point d'entrée selon le public. Quelqu'un qui connaît déjà Azure ou GCP peut passer les modules 00 et 01 en lecture rapide." },

  { t: "flow", kicker: "INTRODUCTION", title: "Le parcours d'apprentissage",
    steps: [
      { h: "Débutant", p: "Modules 00 à 05 : compte, IAM, réseau, EC2, stockage" },
      { h: "Intermédiaire", p: "Modules 06 à 08 et 12 : bases de données, haute dispo, serverless, supervision" },
      { h: "Avancé", p: "Modules 09 à 11, 13, 14 : conteneurs, IaC, CI/CD, sécurité, architecture" },
      { h: "Expert", p: "Modules 15 à 17 : multi-comptes, projet final, certifications" },
    ],
    note: "On avance par paliers : chaque niveau réutilise ce qui a été construit au précédent.",
    notes: "Le parcours est progressif. Le projet final du module 16 sert d'évaluation de fin de formation." },

  { t: "cards", kicker: "INTRODUCTION", title: "Quatre règles d'or avant de commencer",
    cards: [
      { i: "FaUserShield", h: "Compte dédié", p: "Un compte de formation, jamais celui de la production." },
      { i: "FaKey", h: "MFA partout", p: "MFA sur le compte root, et aucune clé d'accès root." },
      { i: "FaCoins", h: "Budget d'alerte", p: "Créez-le avant la première ressource : AWS ne plafonne pas." },
      { i: "FaTrashAlt", h: "Tout détruire", p: "terraform destroy en fin de labo. Les ressources payantes sont signalées dans chaque labo." },
    ],
    notes: "Insistez sur le budget et le nettoyage : la plupart des mauvaises surprises viennent d'une NAT Gateway, d'un load balancer ou d'une base oubliés." },

  { t: "agenda", kicker: "INTRODUCTION", title: "Au programme",
    left: [["00", "Démarrage"], ["01", "Fondamentaux du cloud"], ["02", "IAM"], ["03", "Réseau VPC"], ["04", "Compute EC2"], ["05", "Stockage"], ["06", "Bases de données"], ["07", "Haute dispo et edge"], ["08", "Serverless et messaging"]],
    right: [["09", "Conteneurs"], ["10", "Infrastructure as Code"], ["11", "CI/CD"], ["12", "Observabilité"], ["13", "Sécurité"], ["14", "Architecture et FinOps"], ["15", "Multi-comptes"], ["16", "Projet final"], ["17", "Certifications"]],
    notes: "Voici les 18 modules. Les numéros correspondent aux dossiers du dépôt." },

  // ============================== MODULE 00 ==============================
  { t: "div", n: "00", title: "Démarrage", dur: "0,5 jour",
    obj: ["Créer et sécuriser un compte AWS", "Mettre en place budgets et alertes", "Installer la CLI et Terraform", "Comprendre les façons d'appeler AWS"],
    notes: "Avant toute architecture, on prépare un terrain sûr : compte protégé, coûts surveillés, outils installés." },

  { t: "cards", title: "Comment parle-t-on à AWS ?",
    cards: [
      { i: "FaDesktop", h: "Console web", p: "Pour découvrir et comprendre. Pas pour construire." },
      { i: "FaTerminal", h: "AWS CLI", p: "Scripts et automatisation. L'outil du quotidien." },
      { i: "FaCode", h: "SDK", p: "boto3, SDK JS ou Go : dans le code applicatif." },
      { i: "FaCubes", h: "IaC", p: "Terraform, CloudFormation, CDK : seul mode valable en production." },
    ],
    foot: "Règle d'or : la console sert à comprendre, le code sert à construire.",
    notes: "Tout service AWS est une API HTTPS signée. Tous ces outils ne sont que des clients de cette API. En entreprise, rien n'est créé à la main dans la console." },

  { t: "cards", title: "Sécuriser son compte dès le premier jour",
    cards: [
      { i: "FaMobileAlt", h: "MFA sur le root", p: "Application TOTP ou clé FIDO2." },
      { i: "FaBan", h: "Pas de clé root", p: "Le root sert seulement aux rares actions qui l'exigent." },
      { i: "FaUsers", h: "IAM Identity Center", p: "Un administrateur nominatif avec MFA pour tout le reste." },
      { i: "FaBell", h: "Budget d'alerte", p: "10 € par mois, alertes à 50 %, 80 % et prévision 100 %." },
    ],
    notes: "Le compte root a des pouvoirs illimités qu'aucune policy IAM ne peut restreindre. On le verrouille et on l'oublie. Le budget protège votre carte bancaire." },

  { t: "code", title: "Installer et configurer ses outils",
    points: ["AWS CLI v2 pour parler à l'API", "Terraform pour décrire l'infrastructure", "jq pour lire le JSON", "aws sso login : des credentials temporaires, pas de clé longue durée"],
    lang: "bash",
    code: "# Authentification (recommandé : SSO)\naws configure sso\naws sso login --profile formation\nexport AWS_PROFILE=formation\n\n# Qui suis-je ?\naws sts get-caller-identity\n\n# Zones de disponibilité de Paris\naws ec2 describe-availability-zones \\\n  --region eu-west-3 \\\n  --query 'AvailabilityZones[].ZoneName'",
    notes: "L'ordre de résolution des credentials : options CLI, variables d'environnement, profil, rôle de conteneur, rôle d'instance. get-caller-identity est la commande à lancer en premier à chaque doute." },

  { t: "lab", title: "Labo 00 : un poste prêt à déployer",
    scenario: "Valider que votre poste peut déployer sur AWS, puis créer et détruire un bucket S3 avec Terraform.",
    steps: ["Sécuriser le compte et créer le budget", "Installer CLI, Terraform et jq", "Configurer le profil formation (SSO)", "Lancer check-env.sh", "terraform apply puis destroy du bucket"],
    valid: "Le script affiche « Environnement OK » et le destroy supprime tout.",
    cost: "0 €", path: "00-demarrage/labs/lab-00",
    notes: "Ce labo est court mais indispensable : il prouve que la chaîne complète fonctionne avant de commencer les choses sérieuses." },

  { t: "recap",
    keep: ["La console aide à comprendre, le code construit", "Root verrouillé, MFA partout, identités nominatives", "Un budget d'alerte avant la première ressource"],
    quiz: ["Pourquoi ne pas utiliser le root au quotidien ?", "Clé longue durée ou credential temporaire : lequel préférer, et pourquoi ?", "Pourquoi créer un budget avant tout déploiement ?"],
    notes: "Réponses : 1) pouvoirs illimités, cible n°1, non restreignable par IAM. 2) Temporaire : il expire (15 min à 12 h) et limite l'impact d'une fuite. 3) AWS n'impose aucun plafond dur, le budget détecte tôt la dérive." },

  // ============================== MODULE 01 ==============================
  { t: "div", n: "01", title: "Fondamentaux du cloud", dur: "0,5 jour",
    obj: ["Comprendre IaaS, PaaS et SaaS", "Régions, zones et edge locations", "Responsabilité partagée", "Principes de tarification"],
    notes: "Le vocabulaire commun à toute la formation. Cœur du Cloud Practitioner." },

  { t: "table", title: "Trois modèles de service",
    head: ["Modèle", "Vous gérez", "AWS gère", "Exemples"],
    rows: [
      ["IaaS", "OS, runtime, application, données", "Matériel, virtualisation", "EC2, EBS, VPC"],
      ["PaaS", "Application et données", "OS, runtime, mise à l'échelle", "RDS, Lambda, Fargate"],
      ["SaaS", "Uniquement l'usage", "Tout le reste", "WorkMail, Amazon Connect"],
    ],
    w: [1.6, 4.0, 3.6, 2.93],
    foot: "Plus le service est managé, moins vous avez de travail d'exploitation, mais moins de contrôle.",
    notes: "Le curseur de responsabilité se déplace du client vers AWS à mesure qu'on monte dans les modèles. Pour un DevOps, le bon choix par défaut est le plus managé qui répond au besoin." },

  { t: "flow", title: "Régions, zones et edge",
    steps: [
      { h: "Région", p: "Zone géographique isolée, ex. eu-west-3 (Paris)" },
      { h: "Availability Zone", p: "Un ou plusieurs datacenters, latence inférieure à 2 ms entre zones" },
      { h: "Edge location", p: "Points de présence pour CloudFront et Route 53" },
    ],
    note: "Concevoir pour la panne : répartir chaque tier sur au moins 2 zones.",
    notes: "Choisir une région selon la conformité, la latence, la disponibilité des services et le coût. IAM et Route 53 sont globaux, EC2 est régional, un subnet est zonal." },

  { t: "cmp", title: "La responsabilité partagée",
    l: { h: "AWS : sécurité DU cloud", items: ["Datacenters et matériel", "Réseau physique", "Hyperviseur", "Plateforme des services managés"] },
    r: { h: "Vous : sécurité DANS le cloud", items: ["Données et chiffrement", "IAM, MFA, politiques d'accès", "Système d'exploitation et correctifs EC2", "Security Groups et configuration"] },
    notes: "La frontière dépend du service. Sur RDS, AWS patche le moteur et vous gérez utilisateurs et schéma. Sur EC2, vous patchez l'OS vous-même." },

  { t: "table", title: "Comprendre la facture",
    head: ["Modèle d'achat EC2", "Réduction typique", "Usage idéal"],
    rows: [
      ["On-Demand", "0 %", "Imprévisible, courte durée"],
      ["Savings Plans / Réservations", "jusqu'à ~70 %", "Charge stable sur 1 à 3 ans"],
      ["Spot", "jusqu'à ~90 %", "Batch, CI, workers interruptibles"],
      ["Dedicated Host", "variable", "Licences, conformité"],
    ],
    w: [4.6, 3.2, 4.33],
    foot: "Trois leviers de coût : calcul, stockage, transfert sortant. Le trafic entrant est gratuit.",
    notes: "Outils à connaître : Pricing Calculator avant de déployer, Cost Explorer et Budgets après. Le transfert sortant Internet et inter-AZ est facturé." },

  { t: "recap",
    keep: ["Région > zone > datacenter, edge pour la diffusion", "AWS sécurise le cloud, vous sécurisez ce que vous y mettez", "Spot pour l'interruptible, Savings Plans pour le stable"],
    quiz: ["Quelle différence entre une région et une zone ?", "Vrai ou faux : AWS patche l'OS de vos instances EC2.", "Quel modèle d'achat pour un job batch interruptible ?"],
    notes: "Réponses : 1) la région contient plusieurs zones isolées. 2) Faux, c'est votre responsabilité. 3) Spot." },

  // ============================== MODULE 02 ==============================
  { t: "div", n: "02", title: "IAM : identités et accès", dur: "1 jour",
    obj: ["Utilisateurs, groupes, rôles et policies", "Lire et écrire une policy JSON", "Comprendre l'évaluation des permissions", "Credentials temporaires avec STS"],
    notes: "IAM est la base de tous les examens et de toute la sécurité AWS. Prenez le temps de bien comprendre l'évaluation des permissions." },

  { t: "cards", title: "Les quatre briques d'IAM",
    cards: [
      { i: "FaUser", h: "Utilisateur", p: "Identité longue durée. Pour les humains, préférez Identity Center." },
      { i: "FaUsers", h: "Groupe", p: "Ensemble d'utilisateurs qui partagent des policies." },
      { i: "FaIdBadge", h: "Rôle", p: "Identité assumable, sans mot de passe, avec credentials temporaires." },
      { i: "FaFileContract", h: "Policy", p: "Document JSON : qui peut faire quoi, sur quoi, sous quelles conditions." },
    ],
    notes: "Le rôle est la brique la plus importante : services AWS, comptes tiers, fédération et CI/CD passent tous par des rôles." },

  { t: "code", title: "Anatomie d'une policy",
    points: ["Effect : Allow ou Deny", "Action : service:Opération", "Resource : l'ARN ciblé", "Condition : MFA, IP, région, tags"],
    lang: "json",
    code: "{\n  \"Effect\": \"Allow\",\n  \"Action\": [\"s3:GetObject\", \"s3:ListBucket\"],\n  \"Resource\": [\n    \"arn:aws:s3:::mon-bucket\",\n    \"arn:aws:s3:::mon-bucket/*\"\n  ],\n  \"Condition\": {\n    \"Bool\": {\n      \"aws:MultiFactorAuthPresent\": \"true\"\n    }\n  }\n}",
    notes: "Piège classique : ListBucket s'applique au bucket, GetObject aux objets (avec /*). D'où les deux ARN." },

  { t: "flow", title: "Comment AWS décide : autoriser ou refuser",
    steps: [
      { h: "1. Deny explicite ?", p: "Si oui, refusé. Le Deny gagne toujours." },
      { h: "2. SCP autorise ?", p: "Plafond de l'organisation. Sinon, refusé." },
      { h: "3. Boundary autorise ?", p: "Plafond du principal, s'il est défini." },
      { h: "4. Allow trouvé ?", p: "Dans une policy d'identité ou de ressource." },
      { h: "5. Sinon", p: "Refus implicite : tout est interdit par défaut." },
    ],
    note: "Deny explicite > Allow explicite > Deny implicite. En cross-account, il faut un Allow des deux côtés.",
    notes: "C'est la diapositive la plus utile du module. Quand un accès est refusé, parcourez ces cinq étapes dans l'ordre pour trouver la cause." },

  { t: "cmp", title: "Rôles et STS : deux policies, deux questions",
    l: { h: "Trust policy : QUI ?", items: ["Définit qui peut assumer le rôle", "Principal : compte, service, fédération", "Peut exiger MFA ou ExternalId"] },
    r: { h: "Permission policy : QUOI ?", items: ["Définit ce que le rôle peut faire", "Actions et ressources autorisées", "Plafonnée par SCP et boundary"] },
    foot: "sts:AssumeRole renvoie des credentials temporaires (15 min à 12 h).",
    notes: "Erreur fréquente : créer le rôle avec les bonnes permissions mais oublier la trust policy. Message typique : not authorized to perform sts:AssumeRole." },

  { t: "cards", title: "Les bonnes pratiques IAM",
    cards: [
      { i: "FaMobileAlt", h: "MFA partout", p: "Root verrouillé, MFA exigé pour les actions sensibles." },
      { i: "FaIdBadge", h: "Rôles avant clés", p: "Credentials temporaires. EC2, Lambda et ECS utilisent des rôles." },
      { i: "FaSlidersH", h: "Moindre privilège", p: "Partir de rien, élargir avec Access Analyzer et CloudTrail." },
      { i: "FaTags", h: "Conditions et ABAC", p: "Région, tags, IP, VPC endpoint : des droits qui suivent le contexte." },
      { i: "FaUserFriends", h: "Identity Center", p: "Un portail SSO, des permission sets par compte." },
      { i: "FaGithub", h: "OIDC pour la CI/CD", p: "GitHub Actions assume un rôle, sans aucune clé stockée." },
    ],
    notes: "Si le temps manque, retenez trois idées : rôles plutôt que clés, moindre privilège, MFA." },

  { t: "lab", title: "Labo 02 : déléguer en sécurité",
    scenario: "L'équipe dev lit et écrit dans un bucket, et lance des instances uniquement en eu-west-3 avec le tag team=dev, MFA obligatoire.",
    steps: ["terraform apply, lire les policies créées", "Assumer dev-role avec MFA", "run-instances en us-east-1 : refus attendu", "En eu-west-3 sans tag : refus, avec tag : DryRunOperation", "Défi : ajouter une permission boundary"],
    valid: "Vous expliquez chaque autorisation ou refus en citant l'étape d'évaluation.",
    cost: "0 €", path: "02-iam/labs/lab-iam",
    notes: "Terraform ne crée ni clé d'accès ni MFA pour alice-test : à ajouter à la main dans la console, car la trust policy exige le MFA." },

  { t: "recap",
    keep: ["Deny explicite > Allow > refus implicite", "Trust policy = qui, permission policy = quoi", "Rôles et credentials temporaires, jamais de clés dans le code"],
    quiz: ["Un Allow IAM peut-il contourner un Deny de SCP ?", "Qu'accorde une permission boundary ?", "Quelle condition force le MFA ?"],
    notes: "Réponses : 1) Non, la SCP plafonne. 2) Rien : elle fixe un maximum, il faut toujours un Allow. 3) aws:MultiFactorAuthPresent = true." },

  // ============================== MODULE 03 ==============================
  { t: "div", n: "03", title: "Réseau : Amazon VPC", dur: "1,5 jour",
    obj: ["Concevoir un VPC multi-zones", "Routage, NAT, Security Groups, NACL", "Endpoints et connexions entre réseaux", "Diagnostiquer avec Flow Logs"],
    notes: "Le réseau est la partie la plus dense de l'examen architecte. Ici on construit un VPC à trois niveaux, réutilisé dans le projet final." },

  { t: "vpc", title: "Un VPC à trois niveaux sur deux zones",
    notes: "Public : load balancer et NAT, route vers l'Internet Gateway. Privé : applications, sortie Internet via NAT. Data : bases de données, aucune route Internet. Les Security Groups sont chaînés : ALB vers app vers base." },

  { t: "table", title: "Les composants à connaître",
    head: ["Composant", "Rôle", "À retenir"],
    rows: [
      ["Internet Gateway", "Entrée et sortie Internet", "Gratuite, 1 par VPC"],
      ["NAT Gateway (payant)", "Sortie Internet du privé", "Dans un subnet public, 1 par zone"],
      ["Security Group", "Pare-feu de l'instance", "Stateful, Allow uniquement"],
      ["NACL", "Pare-feu du subnet", "Stateless, Allow et Deny"],
      ["Endpoint Gateway", "Accès privé à S3 et DynamoDB", "Gratuit, via la table de routage"],
      ["Endpoint Interface", "Accès privé aux autres services", "PrivateLink, payant"],
    ],
    w: [3.2, 4.4, 4.53],
    notes: "Astuce coût : le trafic S3 ou ECR via NAT est facturé au Go. Un endpoint gratuit pour S3 supprime ce poste." },

  { t: "cmp", title: "Security Group ou NACL ?",
    l: { h: "Security Group", items: ["Niveau instance (ENI)", "Stateful : la réponse est automatique", "Allow uniquement", "Peut référencer un autre SG"] },
    r: { h: "NACL", items: ["Niveau subnet", "Stateless : ouvrir les ports éphémères", "Allow et Deny, règles ordonnées", "Utile pour bloquer une IP"] },
    foot: "Bonne pratique : chaîner les SG (alb-sg vers app-sg vers db-sg) plutôt que des CIDR.",
    notes: "Un SG ne peut pas bloquer une IP précise, car il n'a pas de Deny. Pour cela on utilise une NACL ou WAF." },

  { t: "table", title: "Relier des réseaux",
    head: ["Besoin", "Solution", "Remarque"],
    rows: [
      ["2 VPC", "VPC Peering", "Non transitif, pas de CIDR qui se chevauchent"],
      ["Beaucoup de VPC et on-premises", "Transit Gateway", "Hub and spoke transitif"],
      ["On-premises chiffré via Internet", "Site-to-Site VPN", "2 tunnels IPsec"],
      ["Lien dédié", "Direct Connect", "Latence stable, ajouter un VPN pour chiffrer"],
      ["Exposer un service à des centaines de VPC", "PrivateLink", "Endpoint service derrière un NLB"],
    ],
    w: [4.0, 3.4, 4.73],
    notes: "Prévoyez ses plages d'adresses dès le départ : on ne peut pas relier deux réseaux dont les CIDR se chevauchent." },

  { t: "lab", title: "Labo 03 : VPC à trois niveaux",
    scenario: "Déployer un VPC sur 2 zones avec subnets public, privé et data, SG chaînés, endpoint S3 et Flow Logs.",
    steps: ["terraform apply -var enable_nat=false", "Se connecter à l'instance privée via SSM", "Constater : curl échoue, aws s3 ls fonctionne", "Lire un REJECT dans les Flow Logs", "Activer la NAT (payante) puis comparer"],
    valid: "Schéma annoté et captures d'un Flow Log ACCEPT et d'un REJECT.",
    cost: "0 € sans NAT", path: "03-reseau-vpc/labs/lab-vpc",
    notes: "Sans NAT, l'instance privée atteint SSM grâce aux endpoints d'interface créés par le labo. N'oubliez pas le destroy : la NAT est facturée à l'heure." },

  { t: "recap",
    keep: ["Un subnet = une zone. Public = route vers l'IGW", "NAT pour sortir, endpoints pour éviter la NAT", "SG stateful, NACL stateless, peering non transitif"],
    quiz: ["Pourquoi un subnet ne s'étend-il pas sur deux zones ?", "Comment n'autoriser que l'ALB à joindre l'application ?", "Quel endpoint est gratuit ?"],
    notes: "Réponses : 1) isolation de panne, un subnet est zonal. 2) Règle entrante du SG de l'app avec le SG de l'ALB comme source. 3) L'endpoint de type Gateway (S3, DynamoDB)." },

  // ============================== MODULE 04 ==============================
  { t: "div", n: "04", title: "Compute : Amazon EC2", dur: "1 jour",
    obj: ["Choisir type d'instance et modèle d'achat", "Accéder sans SSH grâce à SSM", "AMI, user-data, Launch Templates", "Durcir avec IMDSv2 et EBS chiffré"],
    notes: "EC2 reste le socle de nombreuses architectures, même si l'on préfère le managé quand c'est possible." },

  { t: "cards", title: "Les familles d'instances",
    cards: [
      { i: "FaBalanceScale", h: "T et M", p: "Usage général. T est burstable, M est équilibré CPU et mémoire." },
      { i: "FaMicrochip", h: "C", p: "Calcul intensif : batch, encodage, CI." },
      { i: "FaMemory", h: "R et X", p: "Mémoire : bases de données, caches." },
      { i: "FaHdd", h: "I et D", p: "Stockage NVMe local à haut débit." },
      { i: "FaBolt", h: "G, P, Inf, Trn", p: "GPU et accélérateurs pour le machine learning." },
      { i: "FaLeaf", h: "Suffixe g", p: "Graviton (ARM) : environ 20 % moins cher à performance égale." },
    ],
    foot: "Lecture d'un nom : m7g.xlarge = famille m, génération 7, processeur Graviton, taille xlarge.",
    notes: "Commencez petit, mesurez, puis dimensionnez. Compute Optimizer recommande des tailles à partir de l'usage réel." },

  { t: "flow", title: "Lancer une instance : les six choix",
    steps: [
      { h: "AMI", p: "L'image : OS et logiciels, régionale" },
      { h: "Type", p: "Famille et taille" },
      { h: "Réseau", p: "Subnet et Security Group" },
      { h: "Stockage", p: "EBS gp3 chiffré" },
      { h: "Rôle IAM", p: "Instance profile, pas de clé" },
      { h: "User-data", p: "Script exécuté au premier boot" },
    ],
    note: "Un Launch Template regroupe ces choix, versionné, pour Auto Scaling.",
    notes: "L'immutabilité : on ne répare pas une instance, on la remplace à partir d'une nouvelle AMI ou d'un nouveau user-data." },

  { t: "cmp", title: "Accéder au serveur : SSH ou SSM ?",
    l: { h: "SSH classique", items: ["Port 22 ouvert", "Clés à distribuer et à faire tourner", "Bastion à maintenir", "Audit limité"] },
    r: { h: "SSM Session Manager", items: ["Aucun port entrant", "Authentification par IAM", "Aucun bastion", "Sessions journalisées"] },
    foot: "Prérequis SSM : agent, rôle AmazonSSMManagedInstanceCore, sortie HTTPS ou endpoints.",
    notes: "SSM est aussi un outil de patching, d'exécution de commandes à grande échelle et de stockage de paramètres. C'est le couteau suisse de l'exploitation." },

  { t: "code", title: "Durcir une instance dès la création",
    points: ["IMDSv2 obligatoire contre le vol de credentials par SSRF", "Volume racine gp3 chiffré", "Aucun port 22 ouvert", "Remplacement si le user-data change"],
    lang: "hcl",
    code: "resource \"aws_instance\" \"web\" {\n  ami           = data.aws_ssm_parameter.al2023.value\n  instance_type = \"t3.micro\"\n\n  metadata_options {\n    http_tokens = \"required\" # IMDSv2\n  }\n  root_block_device {\n    volume_type = \"gp3\"\n    encrypted   = true\n  }\n  user_data_replace_on_change = true\n}",
    notes: "IMDS est le service de métadonnées à l'adresse 169.254.169.254. IMDSv2 exige un jeton de session, ce qui bloque la plupart des attaques SSRF." },

  { t: "lab", title: "Labo 04 : un serveur web durci",
    scenario: "Déployer nginx sans SSH, accessible par SSM, avec IMDSv2, volume chiffré et AMI toujours à jour.",
    steps: ["terraform apply, ouvrir l'URL de sortie", "aws ssm start-session puis tester IMDSv2", "Créer un snapshot puis une AMI", "Modifier le user-data : l'instance est remplacée", "Défi : passer en t4g.micro (Graviton)"],
    valid: "Port 22 fermé, session SSM ouverte, http_tokens=required vérifié.",
    cost: "Free Tier", path: "04-compute-ec2/labs/lab-ec2",
    notes: "Snapshot et AMI créés à la main ne sont pas dans le state Terraform : pensez à les supprimer à part." },

  { t: "recap",
    keep: ["Choisir la famille selon la charge, Graviton pour économiser", "SSM plutôt que SSH, IMDSv2 obligatoire", "Instances jetables : on remplace, on ne répare pas"],
    quiz: ["Pourquoi préférer Session Manager à SSH ?", "Que devient l'instance store à l'arrêt ?", "Quand choisir Spot ?"],
    notes: "Réponses : 1) aucun port ni clé, accès par IAM, audit centralisé. 2) Les données sont perdues. 3) Charges tolérantes aux interruptions : batch, CI, workers sans état." },

  // ============================== MODULE 05 ==============================
  { t: "div", n: "05", title: "Stockage : S3, EBS, EFS", dur: "1 jour",
    obj: ["Choisir entre objet, bloc et fichier", "Maîtriser S3 : classes, versioning, cycle de vie", "Sécuriser les données", "Automatiser sauvegarde et réplication"],
    notes: "S3 est omniprésent dans AWS : sauvegardes, sites statiques, data lakes, logs, artefacts." },

  { t: "table", title: "Quel stockage choisir ?",
    head: ["Service", "Type", "Accès", "Cas d'usage"],
    rows: [
      ["S3", "Objet", "API HTTP, global", "Fichiers, backups, data lake, artefacts"],
      ["EBS", "Bloc", "1 instance, 1 zone", "Disque d'OS, bases de données"],
      ["EFS", "Fichier NFS", "Milliers d'instances, multi-zones", "Contenu partagé, CMS"],
      ["FSx", "Fichier managé", "SMB, NFS, Lustre", "Windows, calcul haute performance"],
    ],
    w: [1.8, 2.4, 3.9, 4.03],
    notes: "EBS est lié à une zone : pour migrer un volume, on passe par un snapshot. EFS est réservé à Linux, pour Windows on utilise FSx." },

  { t: "table", title: "Les classes de stockage S3",
    head: ["Classe", "Accès", "À retenir"],
    rows: [
      ["Standard", "Fréquent", "Par défaut"],
      ["Intelligent-Tiering", "Inconnu ou variable", "Bascule automatique, sans frais de récupération"],
      ["Standard-IA", "Rare, en millisecondes", "30 jours minimum"],
      ["Glacier Instant Retrieval", "Archive, en millisecondes", "90 jours minimum"],
      ["Glacier Flexible Retrieval", "Archive, minutes à heures", "Moins cher"],
      ["Glacier Deep Archive", "Archive longue, ~12 h", "Le moins cher, 180 jours minimum"],
    ],
    w: [3.8, 3.4, 4.93],
    foot: "Durabilité : 11 neuf sur toutes les classes.",
    notes: "En cas de doute sur le profil d'accès, Intelligent-Tiering est la réponse sûre, et c'est aussi une réponse fréquente à l'examen." },

  { t: "cards", title: "Sécuriser un bucket S3",
    cards: [
      { i: "FaEyeSlash", h: "Block Public Access", p: "Activé au niveau du compte et du bucket." },
      { i: "FaLock", h: "Chiffrement", p: "SSE-S3 par défaut, SSE-KMS pour contrôler et auditer la clé." },
      { i: "FaShieldAlt", h: "TLS obligatoire", p: "Policy qui refuse aws:SecureTransport=false." },
      { i: "FaHistory", h: "Versioning", p: "Protège de l'écrasement et de la suppression. Object Lock pour le WORM." },
      { i: "FaBan", h: "ACL désactivées", p: "Propriété BucketOwnerEnforced : tout passe par les policies." },
      { i: "FaClipboardList", h: "Journalisation", p: "Server access logs et CloudTrail data events." },
    ],
    notes: "Avec SSE-KMS, il faut aussi la permission kms:Decrypt sur la clé : cause fréquente d'AccessDenied malgré une policy S3 correcte." },

  { t: "lab", title: "Labo 05 : un bucket de production",
    scenario: "Créer un bucket conforme : SSE-KMS, versioning, cycle de vie, accès public bloqué, TLS obligatoire, événements vers SQS.",
    steps: ["terraform apply puis envoyer un fichier", "Lire l'événement dans la file SQS", "Écraser 3 fois, lister et restaurer une version", "Tester un accès HTTP : refus attendu", "Défi : réplication vers une autre région"],
    valid: "Accès public bloqué, 3 versions existantes, événement reçu.",
    cost: "≈ 0 €", path: "05-stockage/labs/lab-s3",
    notes: "Le cycle de vie du labo : Standard, puis IA à 30 jours, puis Glacier Instant Retrieval à 90 jours, expiration des anciennes versions à 180 jours." },

  { t: "recap",
    keep: ["Objet (S3), bloc (EBS), fichier (EFS/FSx)", "Block Public Access, chiffrement et TLS par défaut", "Versioning et cycle de vie contrôlent la durée et le coût"],
    quiz: ["Quelle classe S3 pour un profil d'accès inconnu ?", "Comment annuler la suppression d'un objet versionné ?", "Un volume EBS peut-il être monté depuis deux zones ?"],
    notes: "Réponses : 1) Intelligent-Tiering. 2) Supprimer le delete marker. 3) Non, EBS est lié à une zone." },

  // ============================== MODULE 06 ==============================
  { t: "div", n: "06", title: "Bases de données", dur: "1 jour",
    obj: ["Choisir la bonne base", "RDS : Multi-AZ, réplicas, sauvegardes", "DynamoDB : clés, index, capacité", "Sécuriser l'accès aux données"],
    notes: "Le choix de la base conditionne l'architecture entière. On apprend à choisir selon le besoin, pas selon l'habitude." },

  { t: "table", title: "Quelle base pour quel besoin ?",
    head: ["Besoin", "Service"],
    rows: [
      ["SQL classique (PostgreSQL, MySQL, Oracle…)", "RDS"],
      ["SQL cloud-native, 6 copies sur 3 zones", "Aurora, Aurora Serverless v2"],
      ["Clé-valeur ou documents, latence en millisecondes", "DynamoDB"],
      ["Cache en mémoire", "ElastiCache (Redis, Valkey, Memcached)"],
      ["Entrepôt de données et analytique", "Redshift, Athena"],
    ],
    w: [7.4, 4.73],
    notes: "Si le besoin est transactionnel avec jointures, pensez relationnel. Si c'est de la lecture par clé à très grande échelle, pensez DynamoDB." },

  { t: "cmp", title: "Multi-AZ ou Read Replica ?",
    l: { h: "Multi-AZ : disponibilité", items: ["Standby synchrone dans une autre zone", "Bascule automatique en 1 à 2 minutes", "Le standby ne sert pas les lectures", "Protège d'une panne de zone"] },
    r: { h: "Read Replica : performance", items: ["Réplication asynchrone", "Soulage la base en lecture", "Possible dans une autre région", "Promouvable en base autonome"] },
    foot: "Mnémo : Multi-AZ = disponibilité, Read Replica = performance.",
    notes: "Question d'examen très fréquente. Ajoutez RDS Proxy quand beaucoup de Lambdas ouvrent des connexions : il met les connexions en commun." },

  { t: "cards", title: "DynamoDB en quatre idées",
    cards: [
      { i: "FaKey", h: "Clé primaire", p: "Partition key, plus sort key en option. Elle doit répartir la charge." },
      { i: "FaSearch", h: "Index GSI", p: "Une autre clé pour d'autres requêtes. Créé à tout moment." },
      { i: "FaTachometerAlt", h: "Capacité", p: "On-demand pour l'imprévisible, provisioned avec autoscaling pour le stable." },
      { i: "FaHourglassHalf", h: "TTL et Streams", p: "Expiration gratuite des items et capture des changements." },
    ],
    foot: "On modélise à partir des requêtes à servir. On évite Scan, on utilise Query.",
    notes: "Un Scan lit toute la table : coûteux et lent. Une hot partition provoque du throttling même si la capacité globale est suffisante." },

  { t: "lab", title: "Labo 06 : RDS sécurisé et DynamoDB",
    scenario: "Une base PostgreSQL privée, chiffrée, avec mot de passe géré, et une table DynamoDB avec GSI et TTL.",
    steps: ["terraform apply -var multi_az=false", "Lire le secret dans Secrets Manager", "Se connecter via SSM, créer un snapshot et restaurer", "Insérer des items avec TTL dans DynamoDB", "Défi : ajouter un Read Replica et mesurer le lag"],
    valid: "Base non publique, chiffrée, aucun mot de passe dans le code.",
    cost: "Payant : RDS : détruire aussitôt", path: "06-bases-de-donnees/labs/lab-db",
    notes: "Avec manage_master_user_password, RDS génère et stocke le mot de passe dans Secrets Manager : il n'apparaît jamais dans le code." },

  { t: "recap",
    keep: ["Multi-AZ pour la disponibilité, réplicas pour la lecture", "RDS dans des subnets privés, secrets gérés, chiffrement", "DynamoDB : Query + bonnes clés, jamais Scan en production"],
    quiz: ["Multi-AZ ou Read Replica pour soulager la lecture ?", "Quel service limite les connexions depuis des milliers de Lambdas ?", "Quelle option pour du multi-région actif-actif sur DynamoDB ?"],
    notes: "Réponses : 1) Read Replica. 2) RDS Proxy. 3) Global Tables." },

  // ============================== MODULE 07 ==============================
  { t: "div", n: "07", title: "Haute disponibilité et edge", dur: "1 jour",
    obj: ["Répartir la charge avec ELB", "Auto Scaling et politiques", "DNS et bascule avec Route 53", "Accélérer avec CloudFront"],
    notes: "On assemble les briques précédentes pour qu'une application survive à une panne de zone et absorbe des pics de trafic." },

  { t: "ha", title: "Une application web hautement disponible",
    notes: "Les utilisateurs passent par CloudFront et WAF, puis un ALB réparti sur deux zones, des instances dans un Auto Scaling Group, et une base Multi-AZ. Chaque couche survit à la perte d'une zone." },

  { t: "cmp", title: "ALB ou NLB ?",
    l: { h: "ALB : couche 7", items: ["HTTP, HTTPS, gRPC, WebSocket", "Routage par chemin, hôte, en-tête", "Cibles : instances, IP, Lambda, ECS", "S'associe à WAF"] },
    r: { h: "NLB : couche 4", items: ["TCP, UDP, TLS", "Latence ultra faible", "Une IP statique par zone", "Base de PrivateLink"] },
    foot: "Dans les deux cas : des health checks, et un certificat ACM gratuit pour le TLS.",
    notes: "Règle simple : si on parle de chemins d'URL, c'est un ALB. Si on a besoin d'IP fixes ou de TCP brut, c'est un NLB." },

  { t: "cards", title: "Auto Scaling : trois idées",
    cards: [
      { i: "FaLayerGroup", h: "Min, désiré, max", p: "Le groupe maintient le nombre d'instances, réparties sur plusieurs zones." },
      { i: "FaBullseye", h: "Target tracking", p: "On fixe une cible, par exemple 100 requêtes par instance. AWS ajuste." },
      { i: "FaSyncAlt", h: "Instance refresh", p: "Déploiement progressif d'une nouvelle AMI, sans interruption." },
    ],
    foot: "Principe d'architecture : instances sans état et jetables. Sessions dans ElastiCache, fichiers dans S3.",
    notes: "Utilisez le health check ELB, pas seulement EC2, pour que les instances en échec applicatif soient remplacées." },

  { t: "cards", title: "DNS et distribution mondiale",
    cards: [
      { i: "FaGlobe", h: "Route 53", p: "DNS managé. Politiques : pondéré, latence, failover, géolocalisation." },
      { i: "FaLink", h: "Alias", p: "Pointe vers ALB ou CloudFront, autorisé à l'apex, gratuit." },
      { i: "FaRocket", h: "CloudFront", p: "CDN : cache, HTTPS, bucket S3 privé via OAC. Certificat en us-east-1." },
      { i: "FaShieldAlt", h: "WAF et Shield", p: "Filtrage applicatif et protection DDoS en bordure." },
    ],
    notes: "Pour un basculement automatique, on associe un health check à un enregistrement failover. Global Accelerator offre des IP anycast statiques pour le TCP et l'UDP." },

  { t: "lab", title: "Labo 07 : une application hautement disponible",
    scenario: "ALB et Auto Scaling sur 2 zones, page qui affiche la zone, scaling par requêtes, puis CloudFront devant.",
    steps: ["terraform apply, rafraîchir : la zone alterne", "Terminer une instance, mesurer la remédiation", "Charger avec hey et observer le scale-out", "Changer le user-data et lancer un instance refresh", "Comparer les en-têtes via CloudFront"],
    valid: "Aucune erreur 5xx pendant la terminaison d'une instance.",
    cost: "Payant : ALB et instances", path: "07-haute-dispo-et-edge/labs/lab-ha-web",
    notes: "Test simple : une boucle curl pendant que vous tuez une instance. Si vous voyez des erreurs, vérifiez le health check et le deregistration delay." },

  { t: "recap",
    keep: ["Au moins 2 zones pour chaque tier", "ALB pour le HTTP, NLB pour le TCP et les IP fixes", "Target tracking, instances jetables, health checks partout"],
    quiz: ["Quelle métrique cible pour scaler selon le trafic HTTP ?", "Quelle différence entre Alias et CNAME ?", "Pourquoi CloudFront devant S3 ?"],
    notes: "Réponses : 1) ALBRequestCountPerTarget. 2) L'Alias fonctionne à l'apex et est natif AWS. 3) HTTPS et domaine personnalisé, cache, WAF, bucket privé via OAC." },

  // ============================== MODULE 08 ==============================
  { t: "div", n: "08", title: "Serverless et messaging", dur: "1,5 jour",
    obj: ["Lambda et API Gateway", "Découpler avec SQS, SNS et EventBridge", "Orchestrer avec Step Functions", "Limites, DLQ et idempotence"],
    notes: "Serverless ne veut pas dire sans serveur, mais sans serveur à gérer. On paie à l'usage et AWS fait la mise à l'échelle." },

  { t: "stats", title: "Lambda : les limites à connaître",
    stats: [
      { v: "15 min", l: "durée maximale d'une exécution" },
      { v: "10 Go", l: "mémoire maximale, CPU proportionnel" },
      { v: "1 000", l: "exécutions simultanées par région (défaut)" },
    ],
    foot: "Plus long que 15 minutes : Step Functions, Fargate ou Batch.",
    notes: "Trois modes d'invocation : synchrone (API Gateway), asynchrone (S3, SNS, EventBridge, avec réessais et DLQ), et polling (SQS, Kinesis, DynamoDB Streams). Le cold start se réduit avec un paquet léger, arm64, SnapStart ou la concurrence provisionnée." },

  { t: "flow", title: "L'API du labo : de la requête au worker",
    steps: [
      { h: "API Gateway", p: "Reçoit POST /tasks (HTTP API)" },
      { h: "Lambda api", p: "Valide, écrit dans DynamoDB" },
      { h: "SNS", p: "Publie l'événement tâche créée" },
      { h: "SQS + DLQ", p: "File avec 3 essais puis DLQ" },
      { h: "Lambda worker", p: "Traite par lot, rapporte les échecs" },
    ],
    note: "Synchrone jusqu'à la réponse, asynchrone ensuite : l'utilisateur n'attend pas le traitement.",
    notes: "Chaque fonction a son propre rôle IAM au moindre privilège. Le worker utilise batchItemFailures pour ne retraiter que les messages en échec." },

  { t: "table", title: "SQS, SNS, EventBridge ou Kinesis ?",
    head: ["Service", "Modèle", "À retenir"],
    rows: [
      ["SQS Standard", "File, pull", "Débit illimité, at-least-once, ordre non garanti"],
      ["SQS FIFO", "File ordonnée", "Ordre et exactly-once, débit plus limité"],
      ["SNS", "Pub/Sub, push", "Fan-out vers files, Lambda, e-mail"],
      ["EventBridge", "Bus d'événements", "Règles à motifs, sources SaaS, Scheduler, rejeu"],
      ["Kinesis Data Streams", "Flux partitionné", "Ordonné, rejouable, plusieurs consommateurs"],
    ],
    w: [3.0, 3.0, 6.13],
    foot: "Patron fan-out : un topic SNS vers plusieurs files SQS, chaque consommateur à son rythme.",
    notes: "Réglages SQS essentiels : visibility timeout supérieur à la durée de traitement, long polling à 20 s, DLQ avec maxReceiveCount. Ne jamais oublier l'idempotence, car les messages peuvent arriver en double." },

  { t: "lab", title: "Labo 08 : une API de tâches serverless",
    scenario: "POST /tasks et GET /tasks/{id} sur API Gateway, Lambda et DynamoDB, avec publication SNS et worker SQS.",
    steps: ["terraform apply puis créer une tâche avec curl", "Suivre les logs du worker", "Publier un message {fail:true} : voir la DLQ", "Mesurer le cold start dans les logs REPORT", "Défi : un Scheduler de nettoyage nocturne"],
    valid: "Vous décrivez le chemin d'un message et où il peut échouer.",
    cost: "≈ 0 €", path: "08-serverless-et-messaging/labs/lab-serverless",
    notes: "Message échoué trois fois : il passe en DLQ. C'est le filet de sécurité qui évite qu'un message empoisonné bloque la file." },

  { t: "recap",
    keep: ["Lambda : 15 minutes max, événementiel, idempotent", "Découpler avec SQS, diffuser avec SNS, router avec EventBridge", "Toujours une DLQ"],
    quiz: ["Pourquoi combiner SNS et SQS ?", "Que garantit une file FIFO ?", "Comment éviter le cold start d'un endpoint critique ?"],
    notes: "Réponses : 1) SNS diffuse, SQS bufferise et fiabilise chaque consommateur. 2) Ordre par groupe et dé-duplication. 3) Concurrence provisionnée ou SnapStart." },

  // ============================== MODULE 09 ==============================
  { t: "div", n: "09", title: "Conteneurs : ECR, ECS, EKS", dur: "2 jours",
    obj: ["Stocker et scanner les images avec ECR", "Déployer sur ECS Fargate", "Comprendre EKS côté AWS", "Choisir ECS, EKS ou Lambda"],
    notes: "Les conteneurs sont le mode de déploiement dominant. L'examen DevOps professionnel y revient souvent." },

  { t: "table", title: "ECS, EKS ou Lambda ?",
    head: ["Critère", "ECS", "EKS", "Lambda"],
    rows: [
      ["Complexité", "Faible", "Élevée (Kubernetes)", "Très faible"],
      ["Portabilité", "AWS uniquement", "Standard K8s, multi-cloud", "AWS"],
      ["Cas typique", "Services web, API, workers", "Plateforme multi-équipes", "Événements courts"],
      ["Coût de contrôle", "0", "0,10 $/h par cluster", "À l'usage"],
    ],
    w: [2.9, 3.0, 3.4, 2.83],
    foot: "Calcul : Fargate (aucun serveur à gérer) ou EC2 (contrôle, GPU, Spot).",
    notes: "Sans compétence Kubernetes existante, ECS sur Fargate est presque toujours le chemin le plus simple." },

  { t: "cards", title: "ECS : les objets à connaître",
    cards: [
      { i: "FaFileCode", h: "Task Definition", p: "Plan versionné : image, CPU, mémoire, ports, logs." },
      { i: "FaServer", h: "Service", p: "Maintient N tâches, les enregistre dans le target group, déploie." },
      { i: "FaUserCog", h: "Execution role", p: "Utilisé par ECS : tirer l'image ECR, écrire les logs, lire les secrets." },
      { i: "FaIdBadge", h: "Task role", p: "Permissions de votre application : S3, DynamoDB…" },
    ],
    foot: "Confusion fréquente : mettre les droits applicatifs sur l'execution role au lieu du task role.",
    notes: "Mode réseau awsvpc : chaque tâche a sa propre interface réseau, son Security Group et une IP du subnet." },

  { t: "flow", title: "Du code au service en production",
    steps: [
      { h: "Build", p: "Image minimale, utilisateur non-root" },
      { h: "Scan", p: "Vulnérabilités à chaque push (ECR, Trivy)" },
      { h: "Push ECR", p: "Tag = SHA du commit, tags immuables" },
      { h: "Déployer", p: "Rolling avec circuit breaker, ou blue/green" },
      { h: "Rollback", p: "Automatique si les health checks échouent" },
    ],
    note: "Jamais de tag latest en production : non traçable, retour arrière impossible.",
    notes: "Côté sécurité : un rôle IAM par service, tâches en subnets privés, endpoints ECR et S3 pour éviter la NAT, secrets hors image." },

  { t: "lab", title: "Labo 09 : un service ECS Fargate",
    scenario: "Déployer une API sur ECS Fargate derrière un ALB : 2 tâches, logs, autoscaling CPU et circuit breaker.",
    steps: ["terraform apply puis curl sur l'ALB", "Construire l'image, la pousser dans ECR", "Redéployer avec l'image du labo", "Casser l'image : constater le rollback", "Ouvrir un shell avec ECS Exec"],
    valid: "Zéro interruption pendant un déploiement, rollback constaté.",
    cost: "Payant : Fargate et ALB", path: "09-conteneurs/labs/lab-ecs",
    notes: "Construisez l'image en linux/amd64 pour correspondre à la plateforme de la task definition." },

  { t: "recap",
    keep: ["ECS/Fargate simple, EKS pour l'écosystème Kubernetes", "Task role pour l'appli, execution role pour ECS", "Circuit breaker pour un rollback automatique"],
    quiz: ["Différence entre task role et execution role ?", "Comment donner à un pod EKS l'accès à S3 sans clé ?", "Pourquoi éviter le tag latest ?"],
    notes: "Réponses : 1) task role = code de l'appli ; execution role = pull ECR, logs, secrets. 2) IRSA ou EKS Pod Identity. 3) Non reproductible et non traçable." },

  // ============================== MODULE 10 ==============================
  { t: "div", n: "10", title: "Infrastructure as Code", dur: "2 jours",
    obj: ["Pourquoi décrire l'infrastructure en code", "CloudFormation et CDK", "Terraform : state, modules, backend", "Qualité et sécurité de l'IaC"],
    notes: "L'IaC est le cœur du métier DevOps. Sans elle, ni reproductibilité, ni revue de code, ni reprise après sinistre." },

  { t: "cards", title: "Pourquoi l'IaC ?",
    cards: [
      { i: "FaCopy", h: "Reproductible", p: "Mêmes environnements, de dev à prod." },
      { i: "FaCodeBranch", h: "Versionné", p: "Pull requests, historique, retour arrière." },
      { i: "FaSearch", h: "Détection de dérive", p: "On repère les modifications manuelles." },
      { i: "FaFirstAid", h: "Reprise rapide", p: "Reconstruire une plateforme en quelques minutes." },
    ],
    foot: "Principes : déclaratif, idempotent, immuable, versionné, testé, modulaire.",
    notes: "Chaque ressource créée à la main est une dette : personne ne sait comment la recréer." },

  { t: "code", title: "CloudFormation : un template minimal",
    points: ["Parameters, Conditions, Resources, Outputs", "Change set pour prévisualiser", "Drift detection", "DeletionPolicy: Retain protège les données"],
    lang: "yaml",
    code: "Parameters:\n  Env: { Type: String, Default: dev }\nConditions:\n  IsProd: !Equals [!Ref Env, prod]\nResources:\n  Bucket:\n    Type: AWS::S3::Bucket\n    DeletionPolicy: Retain\n    Properties:\n      VersioningConfiguration:\n        Status: !If [IsProd, Enabled, Suspended]\nOutputs:\n  BucketName:\n    Value: !Ref Bucket",
    notes: "CloudFormation est géré par AWS et gère lui-même l'état et le rollback. Les StackSets déploient une même baseline sur plusieurs comptes et régions." },

  { t: "table", title: "CloudFormation, CDK ou Terraform ?",
    head: ["", "CloudFormation", "CDK", "Terraform"],
    rows: [
      ["Langage", "YAML ou JSON", "TypeScript, Python, Java…", "HCL"],
      ["Multi-cloud", "Non", "Non", "Oui"],
      ["État", "Géré par AWS", "Géré par AWS", "À gérer (backend)"],
      ["Atout", "Rollback, StackSets", "Productivité, abstractions", "Écosystème, modules"],
    ],
    w: [2.2, 3.3, 3.5, 3.13],
    foot: "Les examens AWS attendent CloudFormation, CDK et SAM. Le marché attend Terraform : maîtrisez les deux.",
    notes: "CDK synthétise un template CloudFormation avec cdk synth. Terraform a une licence BSL, OpenTofu en est le fork communautaire." },

  { t: "flow", title: "Terraform : le cycle de travail",
    steps: [
      { h: "init", p: "Télécharge providers et modules" },
      { h: "validate", p: "fmt, validate, tflint, checkov" },
      { h: "plan", p: "Compare le code et l'état réel" },
      { h: "apply", p: "Applique les changements" },
      { h: "destroy", p: "Supprime ce qui est géré" },
    ],
    note: "Le state fait le lien entre code et réalité : backend S3 versionné, chiffré, avec verrouillage. Jamais dans Git.",
    notes: "Préférez for_each à count : les clés sont stables. Utilisez moved pour refactorer sans détruire, import pour adopter une ressource existante. Découpez l'état par domaine : réseau, données, applications." },

  { t: "lab", title: "Labo 10 : module Terraform et backend distant",
    scenario: "Amorcer un backend S3, puis créer des buckets dev et prod avec un module réutilisable et for_each.",
    steps: ["Lancer bootstrap : bucket d'état et verrou", "Appliquer envs/demo avec le module", "Modifier un bucket à la main : voir la dérive", "Refactorer avec un bloc moved", "Passer tflint et checkov, défi terraform test"],
    valid: "Le plan affiche « No changes » après apply, la dérive est détectée.",
    cost: "≈ 0 €", path: "10-infrastructure-as-code/labs/lab-terraform",
    notes: "Détruisez d'abord l'environnement de démo, puis le bootstrap. Détruire le backend en premier perdrait l'état." },

  { t: "recap",
    keep: ["Tout en code : versionné, revu, testé", "Change set et plan avant d'appliquer", "State distant verrouillé, for_each plutôt que count"],
    quiz: ["Comment prévisualiser une mise à jour CloudFormation ?", "À quoi sert le verrouillage du state ?", "Comment adopter une ressource existante dans Terraform ?"],
    notes: "Réponses : 1) change set. 2) Éviter deux apply concurrents. 3) terraform import ou bloc import, puis écrire la ressource." },

  // ============================== MODULE 11 ==============================
  { t: "div", n: "11", title: "CI/CD sur AWS", dur: "1,5 jour",
    obj: ["Concevoir un pipeline complet", "GitHub Actions avec OIDC", "CodeBuild, CodePipeline, CodeDeploy", "Stratégies de déploiement"],
    notes: "Module central pour la certification DevOps Professional." },

  { t: "flow", title: "Le pipeline idéal",
    steps: [
      { h: "Qualité", p: "Lint et tests unitaires" },
      { h: "Build", p: "Un seul artefact, tag = SHA" },
      { h: "Scans", p: "Code, dépendances, secrets, image, IaC" },
      { h: "Déployer", p: "Dev automatique, tests de fumée" },
      { h: "Production", p: "Approbation puis déploiement progressif" },
    ],
    note: "Build once, deploy many : le même artefact est promu de l'environnement dev à la production.",
    notes: "Si l'on reconstruit à chaque environnement, on ne teste plus ce que l'on déploie. Après la production, des alarmes surveillent et déclenchent un rollback." },

  { t: "table", title: "Stratégies de déploiement",
    head: ["Stratégie", "Interruption", "Retour arrière", "Coût"],
    rows: [
      ["All-at-once", "Oui", "Lent", "Bas"],
      ["Rolling", "Non, capacité réduite", "Moyen", "Bas"],
      ["Blue/green", "Non", "Instantané", "Doublé brièvement"],
      ["Canary", "Non", "Rapide", "Moyen"],
      ["Feature flags", "Non", "Immédiat", "Faible"],
    ],
    w: [3.2, 3.6, 2.8, 2.53],
    foot: "CodeDeploy Lambda ou ECS : bascule progressive et rollback automatique sur alarme CloudWatch.",
    notes: "Les migrations de base de données doivent rester compatibles avec la version précédente (expand puis contract), sinon le rollback est impossible." },

  { t: "flow", title: "GitHub Actions vers AWS sans clé (OIDC)",
    steps: [
      { h: "Job GitHub", p: "Reçoit un jeton JWT signé" },
      { h: "Fournisseur OIDC", p: "IAM vérifie signature et audience" },
      { h: "Trust policy", p: "Filtre sur le dépôt et la branche" },
      { h: "STS", p: "Échange le jeton contre un rôle" },
      { h: "Credentials", p: "Valables 1 heure, rien à stocker" },
    ],
    note: "Séparer deux rôles : plan (lecture seule, pull requests) et apply (branche main, environnement protégé).",
    notes: "L'appel d'API s'appelle AssumeRoleWithWebIdentity. Ne jamais utiliser un sub en joker large comme repo:ORG/* sur un rôle puissant." },

  { t: "code", title: "Workflow de déploiement sans secret",
    points: ["permissions: id-token: write", "Rôle à assumer, aucune clé", "Déploiement seulement depuis main"],
    lang: "yaml",
    code: "name: deploy-site\non:\n  push:\n    branches: [main]\npermissions:\n  id-token: write\n  contents: read\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: aws-actions/configure-aws-credentials@v4\n        with:\n          role-to-assume: arn:aws:iam::<ID>:role/deploy\n          aws-region: eu-west-3\n      - run: aws s3 sync ./site s3://<BUCKET>",
    notes: "Pensez aussi à épingler les actions par SHA et à activer Dependabot pour la chaîne d'approvisionnement." },

  { t: "lab", title: "Labo 11 : déployer sans clé depuis GitHub",
    scenario: "Créer le fournisseur OIDC et deux rôles, puis déployer un site statique depuis la branche main uniquement.",
    steps: ["terraform apply avec org et dépôt", "Copier le workflow dans un dépôt de test", "Vérifier get-caller-identity dans le job", "Tenter depuis feature/x : refus attendu", "Défi : environnement production avec reviewer"],
    valid: "Aucun secret AWS dans le dépôt, déploiement réussi depuis main et refusé ailleurs.",
    cost: "0 €", path: "11-cicd/labs/lab-oidc",
    notes: "Le message à reconnaître : Not authorized to perform sts:AssumeRoleWithWebIdentity. Il confirme que la trust policy joue bien son rôle de garde-fou." },

  { t: "recap",
    keep: ["Build once, deploy many", "OIDC plutôt que clés d'accès dans la CI", "Canary ou blue/green avec rollback sur alarme"],
    quiz: ["Pourquoi OIDC plutôt que des clés dans les secrets GitHub ?", "Quel fichier décrit les étapes CodeBuild ?", "Quelle différence entre blue/green et canary ?"],
    notes: "Réponses : 1) credentials temporaires et restreints par dépôt et branche. 2) buildspec.yml. 3) Blue/green bascule tout, canary une fraction progressive." },

  // ============================== MODULE 12 ==============================
  { t: "div", n: "12", title: "Observabilité et audit", dur: "1 jour",
    obj: ["Métriques, logs et traces", "CloudWatch, CloudTrail, Config", "De l'alerte à la remédiation", "SLI, SLO et alertes utiles"],
    notes: "Ce qu'on ne mesure pas, on ne le maîtrise pas. L'objectif est aussi d'éviter la fatigue d'alertes." },

  { t: "cards", title: "Qui répond à quelle question ?",
    cards: [
      { i: "FaChartLine", h: "CloudWatch", p: "Comment va le système ? Métriques, logs, alarmes, tableaux de bord." },
      { i: "FaUserSecret", h: "CloudTrail", p: "Qui a fait quoi ? Journal des appels d'API." },
      { i: "FaClipboardCheck", h: "AWS Config", p: "Quelle configuration, est-elle conforme ? Historique et règles." },
      { i: "FaProjectDiagram", h: "X-Ray", p: "Où est la lenteur ? Traces de bout en bout." },
    ],
    foot: "CloudTrail = actions, Config = état, CloudWatch = performance.",
    notes: "Piège d'examen classique. Qui a supprimé ce groupe de sécurité ? CloudTrail. Ce groupe est-il conforme ? Config. Le CPU est-il saturé ? CloudWatch." },

  { t: "flow", title: "De l'événement à la remédiation",
    steps: [
      { h: "Événement", p: "Instance arrêtée, finding GuardDuty, règle Config non conforme" },
      { h: "EventBridge", p: "Règle à motif qui filtre l'événement" },
      { h: "Action", p: "SNS, Lambda ou SSM Automation" },
      { h: "Résultat", p: "Notification, ticket ou correction automatique" },
    ],
    note: "Alarmes composites et seuils pertinents : une alerte doit être actionnable, avec un runbook.",
    notes: "L'automatisation événementielle remplace le script cron sur une instance : plus fiable, plus auditable." },

  { t: "cards", title: "SLI, SLO et quatre signaux dorés",
    cards: [
      { i: "FaStopwatch", h: "Latence", p: "Temps de réponse, p95 et p99 plutôt que la moyenne." },
      { i: "FaExchangeAlt", h: "Trafic", p: "Volume de requêtes servies." },
      { i: "FaExclamationTriangle", h: "Erreurs", p: "Taux de requêtes en échec, 5xx." },
      { i: "FaTachometerAlt", h: "Saturation", p: "CPU, mémoire, connexions, files qui se remplissent." },
    ],
    foot: "SLO = objectif, par exemple 99,9 % sur 30 jours. Le budget d'erreur guide les décisions de déploiement.",
    notes: "Alerter sur les symptômes visibles par l'utilisateur plutôt que sur chaque cause possible. La mémoire d'une EC2 exige l'agent CloudWatch." },

  { t: "lab", title: "Labo 12 : supervision et remédiation",
    scenario: "Topic SNS, alarme sur les erreurs Lambda, metric filter, trail CloudTrail, règle EventBridge sur l'arrêt d'instance, tableau de bord.",
    steps: ["terraform apply avec votre e-mail, confirmer SNS", "Provoquer des erreurs Lambda : recevoir l'alerte", "Arrêter une instance : recevoir la notification", "Requête Logs Insights sur les erreurs", "Retrouver votre StopInstances dans CloudTrail"],
    valid: "Deux notifications distinctes reçues et l'événement retrouvé dans CloudTrail.",
    cost: "≈ 0 à 2 €", path: "12-observabilite/labs/lab-observability",
    notes: "Prérequis : la Lambda lab08-api du module 08 doit exister et avoir été invoquée au moins une fois, pour que le log group existe." },

  { t: "recap",
    keep: ["CloudTrail = qui, Config = quoi, CloudWatch = comment", "Définir des alertes sur les symptômes, avec runbook", "Rétention des logs toujours définie"],
    quiz: ["Quel service répond à : qui a supprimé ce bucket ?", "Comment obtenir la mémoire d'une EC2 dans CloudWatch ?", "Qu'est-ce qu'un budget d'erreur ?"],
    notes: "Réponses : 1) CloudTrail. 2) Installer l'agent CloudWatch. 3) L'indisponibilité tolérée par le SLO ; une fois consommée, on ralentit les déploiements à risque." },

  // ============================== MODULE 13 ==============================
  { t: "div", n: "13", title: "Sécurité avancée", dur: "1,5 jour",
    obj: ["Chiffrement avec KMS", "Secrets et certificats", "Protection du périmètre et détection", "Réponse à incident"],
    notes: "Sécurité par conception : défense en profondeur, automatisation de la conformité." },

  { t: "flow", title: "La défense en profondeur",
    steps: [
      { h: "Identité", p: "IAM, MFA, SSO, moindre privilège" },
      { h: "Réseau", p: "VPC, Security Groups, WAF" },
      { h: "Hôte et conteneur", p: "Correctifs, Inspector, images saines" },
      { h: "Données", p: "KMS, chiffrement, classification" },
      { h: "Détection", p: "GuardDuty, Security Hub, CloudTrail" },
    ],
    note: "Aucune couche n'est suffisante seule : si l'une cède, la suivante protège.",
    notes: "Principes : moindre privilège, zero trust, chiffrement partout, tout en code, journaliser et alerter, automatiser la remédiation." },

  { t: "flow", title: "KMS : l'envelope encryption",
    steps: [
      { h: "GenerateDataKey", p: "KMS renvoie une clé de données en clair et sa version chiffrée" },
      { h: "Chiffrer", p: "Chiffrement local AES-256 avec la clé en clair" },
      { h: "Jeter", p: "La clé en clair est effacée de la mémoire" },
      { h: "Stocker", p: "Données chiffrées + clé de données chiffrée" },
    ],
    note: "Pour déchiffrer : KMS Decrypt la clé de données, puis déchiffrement local. KMS chiffre directement 4 Ko au maximum.",
    notes: "La clé maîtresse ne sort jamais de KMS. Une CMK a sa propre policy : sans elle, même un administrateur IAM ne peut rien faire." },

  { t: "cmp", title: "Secrets Manager ou Parameter Store ?",
    l: { h: "Secrets Manager", items: ["Rotation automatique (RDS, Lambda)", "Réplication multi-région", "Environ 0,40 $ par secret et par mois", "Mots de passe de bases, clés d'API"] },
    r: { h: "SSM Parameter Store", items: ["Pas de rotation native", "Gratuit en version standard", "SecureString chiffré avec KMS", "Configuration et petits secrets"] },
    foot: "Jamais de secret dans le code, l'image, les logs ou Git : lecture à l'exécution via le rôle IAM.",
    notes: "Mettez en cache la valeur du secret côté application pour limiter les appels et les coûts." },

  { t: "table", title: "Détecter et protéger",
    head: ["Service", "Rôle"],
    rows: [
      ["WAF", "Pare-feu applicatif : règles OWASP, limitation de débit"],
      ["Shield", "Protection DDoS (Standard gratuit)"],
      ["GuardDuty", "Détection de menaces et comportements anormaux"],
      ["Inspector", "Vulnérabilités EC2, ECR, Lambda"],
      ["Macie", "Données sensibles dans S3"],
      ["Security Hub", "Agrégation des findings et score de conformité"],
    ],
    w: [3.2, 8.93],
    notes: "GuardDuty analyse CloudTrail, Flow Logs et DNS sans agent. Il ne sert à rien sans intégration à EventBridge pour déclencher des actions." },

  { t: "flow", title: "Réponse à incident en cinq étapes",
    steps: [
      { h: "Détecter", p: "GuardDuty ou Security Hub vers EventBridge" },
      { h: "Contenir", p: "Isoler l'instance, révoquer les sessions" },
      { h: "Préserver", p: "Snapshot EBS, copie des logs" },
      { h: "Éradiquer", p: "Reconstruire depuis l'IaC, tourner les secrets" },
      { h: "Apprendre", p: "Post-mortem sans blâme" },
    ],
    note: "Contenir avant d'éradiquer, et préserver les preuves avant de reconstruire.",
    notes: "Cas d'école : clé d'accès exposée sur GitHub. Révoquer immédiatement, auditer CloudTrail pour l'étendue, ne pas se contenter de supprimer le commit." },

  { t: "lab", title: "Labo 13 : durcir un environnement",
    scenario: "Socle de sécurité : CMK avec rotation, secret chiffré, EBS chiffré par défaut, Block Public Access, GuardDuty, WAF, règle Config.",
    steps: ["terraform apply", "Lire le secret sans kms:Decrypt : refus", "Créer un SG ouvert sur 22 : voir la non-conformité", "Générer des sample findings GuardDuty", "Scanner avec checkov et corriger 3 alertes"],
    valid: "Vous démontrez trois couches de blocage : IAM, KMS, réseau.",
    cost: "≈ 1 à 3 €", path: "13-securite/labs/lab-security",
    notes: "GuardDuty et AWS Config échouent si un détecteur ou un enregistreur existe déjà dans le compte : importez-les alors dans l'état." },

  { t: "recap",
    keep: ["Chiffrer partout : KMS, TLS, EBS, S3, RDS", "Secrets dans Secrets Manager avec rotation", "Détecter, contenir, préserver, éradiquer, apprendre"],
    quiz: ["Pourquoi l'envelope encryption ?", "Différence Secrets Manager et Parameter Store ?", "Contenir ou éradiquer en premier ?"],
    notes: "Réponses : 1) KMS ne chiffre que de petits volumes ; on chiffre localement avec une clé de données protégée par la CMK. 2) Rotation et réplication contre configuration gratuite. 3) Contenir." },

  // ============================== MODULE 14 ==============================
  { t: "div", n: "14", title: "Architecture et FinOps", dur: "1 jour",
    obj: ["Les 6 piliers Well-Architected", "Résilience et reprise après sinistre", "Choisir un patron d'architecture", "Maîtriser les coûts"],
    notes: "On prend de la hauteur : savoir justifier une architecture, la chiffrer et la faire évoluer." },

  { t: "cards", title: "Les six piliers du Well-Architected",
    cards: [
      { i: "FaCogs", h: "Excellence opérationnelle", p: "IaC, CI/CD, runbooks, post-mortems." },
      { i: "FaShieldAlt", h: "Sécurité", p: "IAM, chiffrement, détection, réponse." },
      { i: "FaHeartbeat", h: "Fiabilité", p: "Multi-AZ, auto-récupération, tests de panne." },
      { i: "FaTachometerAlt", h: "Performance", p: "Bon type, cache, CDN, serverless." },
      { i: "FaCoins", h: "Coûts", p: "Right-sizing, Savings Plans, Spot, tags." },
      { i: "FaLeaf", h: "Durabilité", p: "Graviton, forte utilisation, cycle de vie des données." },
    ],
    notes: "Le Well-Architected Tool de la console permet de mener une revue de charge de travail et de produire un plan d'amélioration." },

  { t: "table", title: "Reprise après sinistre : quatre stratégies",
    head: ["Stratégie", "RTO / RPO", "Coût", "Principe"],
    rows: [
      ["Backup & Restore", "Heures", "$", "Sauvegardes copiées dans une autre région"],
      ["Pilot Light", "Dizaines de minutes", "$$", "Données répliquées, le reste éteint"],
      ["Warm Standby", "Minutes", "$$$", "Version réduite toujours active"],
      ["Actif-actif", "Proche de 0", "$$$$", "Deux régions servent le trafic"],
    ],
    w: [3.0, 2.8, 1.5, 4.83],
    foot: "RPO = perte de données tolérée. RTO = durée d'indisponibilité tolérée. Un DR non testé n'existe pas.",
    notes: "Choisissez selon les exigences chiffrées, pas par réflexe. Un actif-actif pour un RTO d'une heure est du gaspillage. Pensez aux quotas dans la région de secours." },

  { t: "cards", title: "FinOps : les leviers qui comptent",
    cards: [
      { i: "FaEye", h: "Visibilité", p: "Tags de coût, Cost Explorer, budgets, détection d'anomalies." },
      { i: "FaPowerOff", h: "Éteindre l'inutile", p: "Dev la nuit, volumes et IP orphelins, snapshots anciens." },
      { i: "FaRulerCombined", h: "Right-sizing", p: "Compute Optimizer : de 20 à 40 % d'économie." },
      { i: "FaPercent", h: "Engagements", p: "Savings Plans jusqu'à 70 %, Spot jusqu'à 90 %." },
    ],
    foot: "Pièges fréquents : NAT Gateway, transferts inter-zones, logs sans rétention, clusters oubliés.",
    notes: "Premier réflexe sur un compte inconnu : rendre les coûts visibles avant d'optimiser." },

  { t: "lab", title: "Labo 14 : étude de cas ShopFlow",
    scenario: "E-commerce de 200 000 visiteurs par jour, pics ×5 aux soldes, RGPD, RTO 1 h, RPO 5 min, budget 6 000 € par mois.",
    steps: ["Dessiner l'architecture et justifier chaque service", "Choisir et argumenter la stratégie de DR", "Estimer le coût au Pricing Calculator", "Chiffrer 5 leviers d'optimisation", "Soutenance de 10 minutes"],
    valid: "Grille de 100 points : adéquation, sécurité, coût, exploitabilité, clarté.",
    cost: "0 €", path: "14-architecture-finops/labs/lab-etude-de-cas",
    notes: "Pistes de correction : CloudFront et WAF devant, ECS Fargate sur 3 zones, Aurora avec réplica inter-région, Warm Standby, Savings Plans et Graviton." },

  { t: "recap",
    keep: ["Les exigences (RTO, RPO, SLA) pilotent l'architecture", "Multi-AZ n'est pas multi-région", "Mesurer avant d'optimiser, taguer pour attribuer"],
    quiz: ["Quelle caractéristique implique un RPO de 5 minutes ?", "Pilot Light ou Warm Standby : quelle différence ?", "Quel outil recommande des tailles d'instances ?"],
    notes: "Réponses : 1) réplication continue des données. 2) Pilot Light : seul le cœur de données est actif ; Warm Standby : environnement réduit entièrement fonctionnel. 3) Compute Optimizer." },

  // ============================== MODULE 15 ==============================
  { t: "div", n: "15", title: "Multi-comptes et gouvernance", dur: "1 jour",
    obj: ["Un compte = une frontière", "Organizations, OU et SCP", "Control Tower et landing zone", "Services partagés"],
    notes: "À l'échelle d'une entreprise, on ne travaille jamais dans un seul compte." },

  { t: "org", title: "Une organisation bien structurée",
    notes: "Le compte de gestion ne sert qu'à la facturation et à Organizations. Les comptes de sécurité hébergent les logs immuables et la sécurité centralisée. Les charges de travail sont séparées entre production et hors-production. Le sandbox est plafonné en budget." },

  { t: "code", title: "Une SCP : un garde-fou, pas un droit",
    points: ["Plafonne tous les principaux d'un compte", "Hérite de l'OU vers le compte", "Ne s'applique pas au compte de gestion", "À tester en sandbox d'abord"],
    lang: "json",
    code: "{\n  \"Sid\": \"DenyOutsideEU\",\n  \"Effect\": \"Deny\",\n  \"NotAction\": [\"iam:*\", \"organizations:*\",\n               \"route53:*\", \"cloudfront:*\",\n               \"support:*\", \"sts:*\"],\n  \"Resource\": \"*\",\n  \"Condition\": {\n    \"StringNotEquals\": {\n      \"aws:RequestedRegion\":\n        [\"eu-west-3\", \"eu-west-1\", \"eu-central-1\"]\n    }\n  }\n}",
    notes: "Les services globaux sont exclus avec NotAction, sinon on se bloque. Autres garde-fous classiques : interdire l'arrêt de CloudTrail ou la sortie de l'organisation." },

  { t: "cards", title: "Industrialiser avec Control Tower",
    cards: [
      { i: "FaLayerGroup", h: "Landing zone", p: "OU, comptes log archive et audit, CloudTrail et Config organisationnels." },
      { i: "FaShieldAlt", h: "Contrôles", p: "Garde-fous préventifs (SCP) et détectifs (Config)." },
      { i: "FaIndustry", h: "Account Factory", p: "Créer des comptes standardisés en libre-service, avec AFT pour Terraform." },
      { i: "FaShareAlt", h: "Services partagés", p: "RAM, Transit Gateway, logs et sécurité centralisés." },
    ],
    notes: "Identity Center donne l'accès humain centralisé. Pour la CI/CD, un compte tooling assume un rôle de déploiement dans chaque compte cible." },

  { t: "lab", title: "Labo 15 : gouverner par SCP",
    scenario: "Créer une OU Sandbox et rattacher trois SCP : régions autorisées, protection des services de sécurité, interdiction de quitter l'organisation.",
    steps: ["terraform apply depuis le compte de gestion", "Déplacer un compte de test dans l'OU", "Tenter une action en us-east-1 : refus", "Tenter d'arrêter CloudTrail : refus", "Défi : exiger le tag owner à la création d'EC2"],
    valid: "Le message « explicit deny in a service control policy » observé deux fois.",
    cost: "≈ 0 €", path: "15-multi-comptes/labs/lab-organizations",
    notes: "Sans organisation disponible, lisez le code et simulez avec le Policy Simulator." },

  { t: "recap",
    keep: ["Compte = frontière d'isolation la plus forte", "SCP = plafond, jamais une permission", "Comptes de logs et de sécurité séparés"],
    quiz: ["Une SCP peut-elle donner des permissions ?", "Quel compte échappe aux SCP ?", "Pourquoi un compte de logs séparé ?"],
    notes: "Réponses : 1) Non. 2) Le compte de gestion. 3) Logs immuables et hors d'atteinte d'un compte compromis." },

  // ============================== MODULE 16 ==============================
  { t: "div", n: "16", title: "Projet final : TaskHub", dur: "3 jours",
    obj: ["Plateforme complète de production", "Tout en code, déployée par pipeline", "Observable et sécurisée", "Documentée et chiffrée en coût"],
    notes: "Évaluation de fin de parcours et pièce de portfolio. À réaliser seul ou en binôme." },

  { t: "flow", title: "L'architecture cible",
    steps: [
      { h: "Edge", p: "Route 53, CloudFront, WAF, S3 privé (OAC)" },
      { h: "Application", p: "ALB, ECS Fargate sur 2 zones, ECR" },
      { h: "Données", p: "RDS PostgreSQL Multi-AZ, Secrets Manager, KMS" },
      { h: "Asynchrone", p: "SQS et worker Lambda" },
      { h: "Exploitation", p: "CloudWatch, SNS, CloudTrail, Config, GuardDuty" },
    ],
    note: "Tout est décrit en Terraform et déployé par GitHub Actions avec OIDC.",
    notes: "Reprenez le VPC à trois niveaux du module 03, le service ECS du module 09, le pipeline du module 11 et l'observabilité du module 12." },

  { t: "cards", title: "Les exigences obligatoires",
    cards: [
      { i: "FaNetworkWired", h: "Réseau et calcul", p: "VPC 2 zones à 3 niveaux, ECS Fargate d'au moins 2 tâches." },
      { i: "FaDatabase", h: "Données", p: "RDS chiffré, Multi-AZ, secret géré, sauvegardes." },
      { i: "FaCubes", h: "IaC et CI/CD", p: "100 % Terraform, backend S3, pipeline OIDC avec rollback." },
      { i: "FaShieldAlt", h: "Sécurité", p: "Moindre privilège, WAF, IMDSv2, aucun secret en clair." },
      { i: "FaChartLine", h: "Observabilité", p: "Dashboard, alarmes 5xx et latence, logs avec rétention." },
      { i: "FaBook", h: "Documentation", p: "Architecture, runbook, coûts, décisions (ADR)." },
    ],
    notes: "Bonus possibles : blue/green, multi-comptes, autoscaling testé en charge, DR inter-région, tracing, tests d'infrastructure." },

  { t: "table", title: "Planning et grille d'évaluation",
    head: ["Jour", "Objectif", "Domaine noté", "Points"],
    rows: [
      ["J1 Fondations", "État, réseau, ECR, RDS, secrets", "Architecture et réseau / IaC", "15 / 15"],
      ["J2 Application", "ECS, edge, OIDC, pipeline", "CI/CD / Sécurité", "15 / 15"],
      ["J3 Production", "Observabilité, WAF, rollback, doc", "Exploitation / Fiabilité", "10 / 10"],
      ["Soutenance", "Démo de 15 minutes", "Coûts / Documentation", "5 / 15"],
    ],
    w: [2.6, 4.4, 3.9, 1.23],
    foot: "Seuils : moins de 50 à retravailler, 50 à 69 acquis, 70 à 84 solide, 85 et plus expert.",
    notes: "La démo : un push de code déclenche le pipeline, puis on simule des pannes (tuer une tâche, forcer un failover RDS) et on montre l'alerte reçue." },

  { t: "recap",
    keep: ["Commencer par les fondations, pas par l'application", "Découper l'état Terraform : réseau, données, applications", "Détruire entre deux sessions : NAT, ALB et RDS coûtent"],
    quiz: ["Par quoi commencer : l'application ou le réseau et l'état ?", "Pourquoi tester les restaurations ?", "Où placer les secrets de la base ?"],
    notes: "Réponses : 1) Par les fondations. 2) Une sauvegarde non restaurée n'est pas une sauvegarde. 3) Secrets Manager, jamais dans le code." },

  // ============================== MODULE 17 ==============================
  { t: "div", n: "17", title: "Préparation aux certifications", dur: "2 à 10 semaines",
    obj: ["Choisir son parcours de certification", "Plans de révision", "Méthode et stratégie d'examen", "Questions, flashcards, aide-mémoire"],
    notes: "La certification valide des compétences, la pratique les construit. Vérifiez toujours le guide d'examen officiel : codes, durées et pondérations évoluent." },

  { t: "flow", title: "Le parcours de certification",
    steps: [
      { h: "Fondation", p: "Cloud Practitioner (CLF)" },
      { h: "Associate", p: "Solutions Architect (SAA), Developer (DVA), CloudOps (SOA)" },
      { h: "Professional", p: "DevOps Engineer (DOP), Solutions Architect (SAP)" },
      { h: "Spécialités", p: "Security (SCS), Advanced Networking (ANS)" },
    ],
    note: "Profil DevOps : SAA, puis DVA, puis DOP.",
    notes: "Le SAA donne la vision d'ensemble, le DVA couvre le développement et le déploiement, le DOP valide l'expertise DevOps." },

  { t: "table", title: "Les domaines du SAA et du DOP",
    head: ["SAA-C03", "%", "DOP-C02", "%"],
    rows: [
      ["Architectures sécurisées", "30", "Automatisation du SDLC", "22"],
      ["Architectures résilientes", "26", "Configuration et IaC", "17"],
      ["Architectures performantes", "24", "Sécurité et conformité", "17"],
      ["Optimisées en coût", "20", "Résilience", "15"],
      ["", "", "Surveillance et logs", "15"],
      ["", "", "Réponse aux incidents", "14"],
    ],
    w: [4.3, 1.5, 4.8, 1.53],
    foot: "Pondérations à confirmer sur les guides d'examen officiels, qui évoluent.",
    notes: "Servez-vous de ces pondérations pour répartir le temps de révision. Le tableau de correspondance modules et examens est dans le README du module 17." },

  { t: "cards", title: "Un plan de révision efficace",
    cards: [
      { i: "FaFlask", h: "Pratiquer d'abord", p: "Chaque service doit avoir été manipulé : labos du dépôt." },
      { i: "FaLayerGroup", h: "Réviser par répétition", p: "Flashcards espacées : environ 135 cartes fournies." },
      { i: "FaClipboardList", h: "Examens blancs", p: "Au moins 3, en analysant toutes les réponses." },
      { i: "FaBookOpen", h: "Cahier d'erreurs", p: "Une ligne par erreur : la règle de décision manquante." },
    ],
    foot: "Se présenter quand on obtient au moins 80 % de façon régulière sur des examens blancs de qualité.",
    notes: "SAA en 8 semaines, DOP en 10 semaines, CLF en 2 à 3 semaines, à 8 à 10 heures par semaine." },

  { t: "cards", title: "Stratégie le jour de l'examen",
    cards: [
      { i: "FaSearch", h: "Lire la dernière phrase", p: "Le critère : moins cher, moins d'effort, plus disponible." },
      { i: "FaTimesCircle", h: "Éliminer", p: "Écarter les réponses impossibles, manuelles ou sur-dimensionnées." },
      { i: "FaStar", h: "Préférences AWS", p: "Managé, serverless, découplé, rôle plutôt que clé, multi-AZ." },
      { i: "FaRegClock", h: "Gérer le temps", p: "Marquer les questions longues, relire à la fin. Toujours répondre." },
    ],
    notes: "Aucune pénalité pour une mauvaise réponse : ne laissez rien en blanc. Dans une question à choix multiples, chaque option retenue doit être correcte et répondre à la question." },

  // ============================== CONCLUSION ==============================
  { t: "cards", kicker: "CONCLUSION", title: "Ce que vous savez faire maintenant",
    cards: [
      { i: "FaNetworkWired", h: "Concevoir", p: "Un VPC multi-zones, une architecture résiliente et chiffrée en coût." },
      { i: "FaCubes", h: "Automatiser", p: "Tout en Terraform, déployé par un pipeline OIDC sans clé." },
      { i: "FaShieldAlt", h: "Sécuriser", p: "IAM au moindre privilège, KMS, secrets, détection, SCP." },
      { i: "FaChartLine", h: "Exploiter", p: "Observer, alerter, remédier automatiquement, maîtriser les coûts." },
    ],
    notes: "Reprenez la liste d'auto-évaluation du module 16 : cochez uniquement ce que vous savez faire sans aide." },

  { t: "cards", kicker: "CONCLUSION", title: "Pour continuer",
    cards: [
      { i: "FaGithub", h: "Le dépôt", p: "github.com/nzembouong18/aws : cours, démos, labos et projet final." },
      { i: "FaGraduationCap", h: "AWS Skill Builder", p: "Cours officiels et examens blancs officiels." },
      { i: "FaTools", h: "AWS Workshops", p: "workshops.aws et Well-Architected Labs pour pratiquer." },
      { i: "FaUsers", h: "Communauté", p: "re:Post, r/AWSCertifications, vidéos re:Invent." },
    ],
    notes: "Rappel final : détruisez vos ressources de formation et gardez votre budget d'alerte actif." },

  { t: "end", title: "Merci",
    sub: "Questions, retours et amélioration du cours : ouvrez une issue sur le dépôt",
    notes: "Fin de la formation. Invitez les participants à réaliser le projet final et à planifier leur première certification." },
];
