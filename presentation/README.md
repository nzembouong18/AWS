# Support de présentation PowerPoint

`formation-aws-devops.pptx` : 124 diapositives, une par idée, avec **notes de présentation** (explication orale et réponses aux quiz) sur chaque diapo.

Structure : introduction, puis modules 00 à 17 (diapo de titre, 2 à 4 diapos de cours, labo, « À retenir et quiz »), conclusion.

## Régénérer le fichier
Le deck est produit par `build_deck.js` à partir de `content.js` (tout le texte et les notes).

```bash
npm install pptxgenjs react-icons react react-dom sharp
PPTX_SKILL_DIR=<dossier du skill pptx> node build_deck.js
```
Modifiez `content.js` pour changer le contenu, `build_deck.js` pour changer le design.
