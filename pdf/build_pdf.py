#!/usr/bin/env python3
"""Assemble les cours Markdown du dépôt en un PDF (pandoc + Chromium/Playwright)."""
import re, subprocess, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = pathlib.Path(__file__).resolve().parent
ORDER = ["README.md"] + sorted(str(p.relative_to(ROOT)) for p in ROOT.glob("[0-1][0-9]-*/README.md"))
ORDER += [f"17-certifications/{n}" for n in ("questions-entrainement.md", "flashcards.md", "cheatsheet.md", "suivi-progression.md")]

ARCHI = """```text
Utilisateurs
   |
Route 53  ->  CloudFront + WAF  --(/ statique)-->  S3 front (accès privé, OAC)
                   |
                   +--(/api)-->  ALB (subnets publics)
                                   |
                                 ECS Fargate (subnets privés, 2 zones)
                                   |-- RDS PostgreSQL Multi-AZ (subnets data)
                                   |-- SQS --> Worker Lambda
                                   '-- Secrets Manager + KMS

GitHub Actions (OIDC) --> ECR --> ECS      et      Terraform apply
CloudWatch (logs, métriques, alarmes) --> SNS
CloudTrail / Config / GuardDuty --> S3 logs
```"""

def prep(path: str, text: str) -> str:
    text = re.sub(r"```mermaid.*?```", lambda m: ARCHI, text, flags=re.S)
    # liens relatifs -> texte seul (le PDF n'a pas les autres fichiers)
    text = re.sub(r"\[([^\]]+)\]\((?!https?://|#|mailto:)[^)]*\)", r"\1", text)
    if path.endswith("flashcards.md"):
        out = []
        for line in text.splitlines():
            if " ;; " in line and not line.startswith("Format"):
                q, r = line.split(" ;; ", 1)
                out.append(f"- **{q.strip()}** : {r.strip()}")
            else:
                out.append(line)
        text = "\n".join(out)
    return text

parts = []
for rel in ORDER:
    p = ROOT / rel
    if not p.exists():
        sys.exit(f"manquant : {rel}")
    parts.append(prep(rel, p.read_text(encoding="utf8")).strip() + "\n")
(OUT / "cours.md").write_text("\n\n".join(parts), encoding="utf8")

subprocess.run([
    "pandoc", str(OUT / "cours.md"), "-f", "gfm+hard_line_breaks", "-t", "html5", "--standalone", "--embed-resources",
    "--no-highlight", "--toc", "--toc-depth=1", "--css", str(OUT / "style.css"), "--metadata", "pagetitle=Formation AWS pour ingénieur DevOps",
    "--metadata", "lang=fr", "-H", "/dev/null", "--include-before-body", str(OUT / "cover.html"), "-o", str(OUT / "cours.html"),
], check=True)

html = (OUT / "cours.html").read_text(encoding="utf8")
html = html.replace("<details>", "<details open>")                      # réponses des quiz visibles
html = html.replace("<h1 id=\"formation-aws-pour-ingénieur-devops\"", "<h1 class=\"first\" id=\"formation-aws-pour-ingénieur-devops\"", 1)
(OUT / "cours.html").write_text(html, encoding="utf8")
print("HTML prêt :", len(html) // 1024, "Ko")
