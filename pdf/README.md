# Version PDF du cours

`formation-aws-devops.pdf` : le cours complet (index, modules 00 à 17, questions d'entraînement, flashcards, aide-mémoire, suivi), prêt à imprimer ou à lire hors ligne. Signets par module, réponses des quiz dépliées.

Le PDF contient les cours, pas le code des démos et des labos : il reste dans le dépôt, dossier `labs/` et `demos/` de chaque module.

## Régénérer
```bash
python3 build_pdf.py                 # assemble les README (pandoc requis) -> cours.html
NODE_PATH=<node_modules avec playwright> node html2pdf.js cours.html formation-aws-devops.pdf
```
`cours.md` et `cours.html` sont des fichiers intermédiaires (non versionnés).
