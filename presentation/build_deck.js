// Génère formation-aws-devops.pptx à partir de content.js
// Usage : NODE_PATH=<dossier node_modules> node build_deck.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");

const SKILL = process.env.PPTX_SKILL_DIR;
const { applyTheme } = require(path.join(SKILL, "scripts", "apply_theme.js"));
const slides = require("./content.js");

const OUT = path.join(__dirname, "formation-aws-devops.pptx");
const W = 13.333, MX = 0.6, CW = W - 2 * MX;

const THEME = {
  name: "Formation AWS",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "17233B", lt1: "FFFFFF", dk2: "3A4A66", lt2: "F1F4F9",
    accent1: "E07B16", accent2: "1F9E8E", accent3: "4A62E0", accent4: "D9482B",
    accent5: "7C8AA5", accent6: "6FA35B", hlink: "4A62E0", folHlink: "7C8AA5",
  },
};
const HEX = THEME.colors;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Formation AWS pour ingénieur DevOps";
pres.author = "Formation AWS DevOps";
pres.subject = "Du débutant à l'expert cloud AWS";
const C = pres.SchemeColor;
const S = pres.ShapeType;
const ACC = [C.accent1, C.accent3, C.accent2, C.accent4, C.accent6, C.accent5];

// ---------------------------------------------------------------- icônes
const iconCache = {};
async function loadIcons() {
  const names = new Set(["FaCheckCircle", "FaCloud", "FaCode", "FaShieldAlt", "FaUsers", "FaGlobe", "FaServer", "FaDatabase", "FaUser", "FaRocket", "FaBalanceScale", "FaFlask", "FaQuestionCircle", "FaLightbulb", "FaLock", "FaNetworkWired", "FaLayerGroup", "FaBolt", "FaMobileAlt"]);
  for (const s of slides) (s.cards || []).forEach((c) => names.add(c.i));
  for (const n of names) {
    if (!fa[n]) throw new Error("Icône inconnue : " + n);
    const svg = RDS.renderToStaticMarkup(React.createElement(fa[n], { color: "#FFFFFF", size: 256 }));
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    iconCache[n] = "image/png;base64," + png.toString("base64");
  }
}

// ---------------------------------------------------------------- gabarits
pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: C.background1 },
  objects: [
    { text: { text: "Formation AWS pour ingénieur DevOps", options: { x: MX, y: 7.0, w: 6, h: 0.3, fontSize: 11, color: C.accent5, margin: 0 } } },
    { placeholder: { options: { name: "title", type: "title", x: MX, y: 0.62, w: CW, h: 0.85, fontSize: 36, bold: true, color: C.text1, align: "left", valign: "middle", margin: 0 }, text: "" } },
  ],
  slideNumber: { x: 12.0, y: 7.0, w: 0.73, h: 0.3, fontSize: 11, color: C.accent5, align: "right" },
});
pres.defineSlideMaster({
  title: "DARK",
  background: { color: C.text1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: MX, y: 3.9, w: 6.4, h: 1.9, fontSize: 36, bold: true, color: C.background1, align: "left", valign: "top", margin: 0 }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "COVER",
  background: { color: C.text1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.9, y: 2.0, w: 8.6, h: 2.4, fontSize: 52, bold: true, color: C.background1, align: "left", valign: "bottom", margin: 0 }, text: "" } },
  ],
});

// ---------------------------------------------------------------- utilitaires
let curSection = null, curKicker = "INTRODUCTION";
function ns(master) {
  return pres.addSlide({ masterName: master, sectionTitle: curSection });
}
function base(spec) {
  const s = ns("CONTENT");
  s.addText((spec.kicker || curKicker), { x: MX, y: 0.3, w: 10, h: 0.3, fontSize: 12, bold: true, color: C.accent1, charSpacing: 3, margin: 0, isTextBox: true, objectName: "Rubrique" });
  s.addText(spec.title, { placeholder: "title" });
  if (spec.notes) s.addNotes(spec.notes);
  return s;
}
function circleIcon(s, name, x, y, d, color) {
  s.addShape(S.ellipse, { x, y, w: d, h: d, fill: { color }, line: { color, width: 0 }, objectName: "Pastille " + name });
  const p = d * 0.26;
  s.addImage({ data: iconCache[name], x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, altText: "icône", objectName: "Icône " + name });
}
function callout(s, text, y = 6.12) {
  s.addShape(S.roundRect, { x: MX, y, w: CW, h: 0.68, fill: { color: C.text1 }, line: { color: C.text1, width: 0 }, rectRadius: 0.12, objectName: "Encart" });
  circleIcon(s, "FaLightbulb", MX + 0.15, y + 0.1, 0.48, C.accent1);
  s.addText(text, { x: MX + 0.8, y, w: CW - 1.0, h: 0.68, fontSize: 16, color: C.background1, valign: "middle", margin: 0, isTextBox: true, objectName: "Texte encart" });
}
function bullets(items, size, extra = {}) {
  return items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1, ...extra } }));
}

// ---------------------------------------------------------------- types de diapos
const R = {};

R.title = (sp) => {
  const s = ns("COVER");
  s.addText(sp.title, { placeholder: "title" });
  s.addText(sp.sub, { x: 0.9, y: 4.65, w: 8.4, h: 1.0, fontSize: 22, color: C.background2, margin: 0, valign: "top", isTextBox: true, objectName: "Sous-titre" });
  const tags = ["Cours", "Démos", "Labos", "Certifications"];
  tags.forEach((t, i) => {
    s.addShape(S.roundRect, { x: 0.9 + i * 2.05, y: 6.1, w: 1.85, h: 0.45, fill: { color: C.text2 }, line: { color: C.text2, width: 0 }, rectRadius: 0.22 });
    s.addText(t, { x: 0.9 + i * 2.05, y: 6.1, w: 1.85, h: 0.45, fontSize: 14, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  circleIcon(s, "FaCloud", 10.2, 1.0, 2.4, C.accent1);
  circleIcon(s, "FaCode", 11.3, 3.6, 1.5, C.accent3);
  circleIcon(s, "FaShieldAlt", 9.4, 3.9, 1.3, C.accent2);
  circleIcon(s, "FaRocket", 10.6, 5.3, 1.1, C.accent4);
  if (sp.notes) s.addNotes(sp.notes);
};

R.end = (sp) => {
  const s = ns("COVER");
  s.addText(sp.title, { placeholder: "title" });
  s.addText(sp.sub, { x: 0.9, y: 4.65, w: 8.4, h: 1.0, fontSize: 22, color: C.background2, margin: 0, valign: "top", isTextBox: true });
  circleIcon(s, "FaCheckCircle", 10.4, 2.0, 2.6, C.accent2);
  if (sp.notes) s.addNotes(sp.notes);
};

R.div = (sp) => {
  curSection = `${sp.n} ${sp.title}`;
  pres.addSection({ title: curSection });
  curKicker = `${sp.n} · ${sp.title.toUpperCase()}`;
  const s = ns("DARK");
  s.addText("MODULE", { x: MX, y: 1.0, w: 4, h: 0.35, fontSize: 14, bold: true, color: C.accent1, charSpacing: 4, margin: 0, isTextBox: true });
  s.addText(sp.n, { x: MX, y: 1.3, w: 5.5, h: 2.4, fontSize: 130, bold: true, fontFace: "Cambria", color: C.accent1, margin: 0, valign: "middle", isTextBox: true, objectName: "Numéro du module" });
  s.addText(sp.title, { placeholder: "title" });
  s.addShape(S.roundRect, { x: MX, y: 6.0, w: 2.2, h: 0.45, fill: { color: C.text2 }, line: { color: C.text2, width: 0 }, rectRadius: 0.22 });
  s.addText("Durée : " + sp.dur, { x: MX, y: 6.0, w: 2.2, h: 0.45, fontSize: 14, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addShape(S.roundRect, { x: 7.3, y: 1.3, w: 5.43, h: 5.15, fill: { color: C.text2 }, line: { color: C.text2, width: 0 }, rectRadius: 0.15, objectName: "Panneau objectifs" });
  s.addText("OBJECTIFS", { x: 7.7, y: 1.6, w: 4.6, h: 0.4, fontSize: 14, bold: true, color: C.accent1, charSpacing: 3, margin: 0, isTextBox: true });
  sp.obj.forEach((o, i) => {
    const y = 2.25 + i * 1.0;
    circleIcon(s, "FaCheckCircle", 7.7, y + 0.1, 0.5, C.accent2);
    s.addText(o, { x: 8.4, y, w: 4.05, h: 0.7, fontSize: 18, color: C.background1, valign: "middle", margin: 0, isTextBox: true });
  });
  if (sp.notes) s.addNotes(sp.notes);
};

R.agenda = (sp) => {
  const s = base(sp);
  [[sp.left, MX], [sp.right, 6.9]].forEach(([items, x]) => {
    items.forEach(([n, label], i) => {
      const y = 1.75 + i * 0.54;
      s.addShape(S.ellipse, { x, y, w: 0.44, h: 0.44, fill: { color: C.text1 }, line: { color: C.text1, width: 0 } });
      s.addText(n, { x, y, w: 0.44, h: 0.44, fontSize: 13, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
      s.addText(label, { x: x + 0.65, y, w: 5.0, h: 0.44, fontSize: 20, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
    });
  });
};

R.stats = (sp) => {
  const s = base(sp);
  const n = sp.stats.length, gap = 0.3, w = (CW - gap * (n - 1)) / n;
  sp.stats.forEach((st, i) => {
    const x = MX + i * (w + gap);
    s.addShape(S.roundRect, { x, y: 1.85, w, h: 3.9, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.15, objectName: "Carte chiffre" });
    s.addText(st.v, { x: x + 0.2, y: 2.3, w: w - 0.4, h: 1.5, fontSize: 60, bold: true, fontFace: "Cambria", color: C.accent1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "Chiffre" });
    s.addText(st.l, { x: x + 0.3, y: 3.95, w: w - 0.6, h: 1.4, fontSize: 20, color: C.text2, align: "center", valign: "top", margin: 0, isTextBox: true });
  });
  if (sp.foot) callout(s, sp.foot);
};

R.table = (sp) => {
  const s = base(sp);
  const nr = sp.rows.length;
  const avail = sp.foot ? 4.15 : 4.9;
  const rh = Math.min(0.85, avail / (nr + 1));
  const fs = rh >= 0.8 ? 19 : rh >= 0.68 ? 17 : rh >= 0.58 ? 16 : 15;
  const head = sp.head.map((h) => ({ text: h, options: { bold: true, color: HEX.lt1, fill: { color: HEX.dk1 }, fontSize: fs, valign: "middle" } }));
  const rows = sp.rows.map((r, ri) => r.map((c, ci) => ({
    text: c,
    options: { fontSize: fs, color: ci === 0 ? HEX.dk1 : HEX.dk2, bold: ci === 0, fill: { color: ri % 2 ? HEX.lt1 : HEX.lt2 }, valign: "middle" },
  })));
  s.addTable([head, ...rows], {
    x: MX, y: 1.75, w: CW, colW: sp.w, rowH: rh,
    border: { type: "solid", pt: 0.5, color: "D5DBE6" }, fontFace: "Calibri",
    objectName: "Tableau",
  });
  if (sp.foot) callout(s, sp.foot);
};

R.flow = (sp) => {
  const s = base(sp);
  const n = sp.steps.length;
  const two = n > 5;
  const perRow = two ? Math.ceil(n / 2) : n;
  const gap = two ? 0.5 : 0.4;
  const w = (CW - gap * (perRow - 1)) / perRow;
  const hasNote = !!sp.note;
  const big = n <= 3;
  const hf = n <= 3 ? 26 : n === 4 ? 22 : 18;
  const bf = n <= 3 ? 21 : n === 4 ? 17 : 16;
  const rowsH = two ? 1.95 : (hasNote ? 3.95 : 4.6);
  sp.steps.forEach((st, i) => {
    const row = two ? Math.floor(i / perRow) : 0, col = two ? i % perRow : i;
    const x = MX + col * (w + gap), y = 1.75 + row * (rowsH + 0.2);
    s.addShape(S.roundRect, { x, y, w, h: rowsH, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.12, objectName: "Étape " + (i + 1) });
    const col6 = ACC[i % 4];
    if (two) {
      s.addShape(S.ellipse, { x: x + 0.2, y: y + 0.2, w: 0.5, h: 0.5, fill: { color: col6 }, line: { color: col6, width: 0 } });
      s.addText(String(i + 1), { x: x + 0.2, y: y + 0.2, w: 0.5, h: 0.5, fontSize: 16, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
      s.addText(st.h, { x: x + 0.85, y: y + 0.2, w: w - 1.05, h: 0.5, fontSize: 20, bold: true, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
      s.addText(st.p, { x: x + 0.2, y: y + 0.85, w: w - 0.4, h: rowsH - 0.95, fontSize: 18, color: C.text2, valign: "top", margin: 0, isTextBox: true });
    } else {
      s.addShape(S.ellipse, { x: x + 0.25, y: y + 0.25, w: 0.6, h: 0.6, fill: { color: col6 }, line: { color: col6, width: 0 } });
      s.addText(String(i + 1), { x: x + 0.25, y: y + 0.25, w: 0.6, h: 0.6, fontSize: 20, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
      s.addText(st.h, { x: x + 0.25, y: y + 1.05, w: w - 0.5, h: 0.85, fontSize: hf, bold: true, color: C.text1, valign: "top", margin: 0, isTextBox: true });
      s.addText(st.p, { x: x + 0.25, y: y + 1.95, w: w - 0.5, h: rowsH - 2.1, fontSize: bf, color: C.text2, valign: "top", margin: 0, isTextBox: true });
    }
    if (col < perRow - 1) {
      s.addShape(S.rightArrow, { x: x + w + (gap - 0.3) / 2, y: y + (two ? rowsH / 2 - 0.15 : 0.4), w: 0.3, h: 0.3, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0 }, objectName: "Flèche" });
    }
  });
  if (hasNote) callout(s, sp.note);
};

R.cards = (sp) => {
  const s = base(sp);
  const n = sp.cards.length;
  const hasFoot = !!sp.foot;
  if (n <= 4) {
    const gap = 0.3, w = (CW - gap * (n - 1)) / n, h = hasFoot ? 4.2 : 4.6;
    sp.cards.forEach((c, i) => {
      const x = MX + i * (w + gap), y = 1.75;
      s.addShape(S.roundRect, { x, y, w, h, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.12, objectName: "Carte " + c.h });
      circleIcon(s, c.i, x + 0.3, y + 0.3, 0.75, ACC[i % 4]);
      s.addText(c.h, { x: x + 0.3, y: y + 1.3, w: w - 0.6, h: 0.8, fontSize: 22, bold: true, color: C.text1, valign: "top", margin: 0, isTextBox: true });
      s.addText(c.p, { x: x + 0.3, y: y + 2.15, w: w - 0.6, h: h - 2.3, fontSize: 19, color: C.text2, valign: "top", margin: 0, isTextBox: true });
    });
  } else {
    const gap = 0.3, w = (CW - gap * 2) / 3, h = hasFoot ? 2.05 : 2.4;
    sp.cards.forEach((c, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = MX + col * (w + gap), y = 1.7 + row * (h + 0.22);
      s.addShape(S.roundRect, { x, y, w, h, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.12, objectName: "Carte " + c.h });
      circleIcon(s, c.i, x + 0.25, y + 0.22, 0.62, ACC[i % 4]);
      s.addText(c.h, { x: x + 1.05, y: y + 0.2, w: w - 1.25, h: 0.66, fontSize: 19, bold: true, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
      s.addText(c.p, { x: x + 0.25, y: y + 1.0, w: w - 0.5, h: h - 1.1, fontSize: 16, color: C.text2, valign: "top", margin: 0, isTextBox: true });
    });
  }
  if (hasFoot) callout(s, sp.foot);
};

R.cmp = (sp) => {
  const s = base(sp);
  const w = 5.9, gap = CW - 2 * w, hasFoot = !!sp.foot, ph = hasFoot ? 3.4 : 4.1;
  [[sp.l, MX, C.accent3], [sp.r, MX + w + gap, C.accent2]].forEach(([side, x, color]) => {
    s.addShape(S.roundRect, { x, y: 1.75, w, h: 0.75, fill: { color }, line: { color, width: 0 }, rectRadius: 0.12, objectName: "En-tête " + side.h });
    s.addText(side.h, { x: x + 0.3, y: 1.75, w: w - 0.6, h: 0.75, fontSize: 22, bold: true, color: C.background1, valign: "middle", margin: 0, isTextBox: true });
    s.addShape(S.roundRect, { x, y: 2.65, w, h: ph, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.12, objectName: "Panneau " + side.h });
    s.addText(bullets(side.items, 22, { paraSpaceAfter: 14 }), { x: x + 0.35, y: 2.9, w: w - 0.7, h: ph - 0.4, fontSize: 22, color: C.text1, valign: "top", margin: 0, isTextBox: true });
  });
  if (hasFoot) callout(s, sp.foot);
};

R.code = (sp) => {
  const s = base(sp);
  s.addText(bullets(sp.points, 20, { paraSpaceAfter: 16 }), { x: MX, y: 1.85, w: 5.0, h: 4.6, fontSize: 20, color: C.text1, valign: "top", margin: 0, isTextBox: true, objectName: "Points clés" });
  s.addShape(S.roundRect, { x: 5.95, y: 1.7, w: 6.78, h: 5.0, fill: { color: C.text1 }, line: { color: C.text1, width: 0 }, rectRadius: 0.12, objectName: "Bloc de code" });
  s.addText(sp.lang.toUpperCase(), { x: 6.25, y: 1.85, w: 3, h: 0.3, fontSize: 12, bold: true, color: C.accent1, charSpacing: 3, margin: 0, isTextBox: true });
  const lines = sp.code.split("\n"), maxlen = Math.max(...lines.map((l) => l.length));
  const cfs = Math.floor(Math.min(17, 6.2 / (maxlen * 0.00833), (4.2 * 72) / (lines.length * 1.25)));
  s.addText(sp.code, { x: 6.25, y: 2.25, w: 6.3, h: 4.3, fontSize: cfs, fontFace: "Courier New", color: C.background2, valign: "top", margin: 0, isTextBox: true, objectName: "Code" });
};

R.lab = (sp) => {
  const s = base(sp);
  s.addShape(S.roundRect, { x: 11.43, y: 0.27, w: 1.3, h: 0.36, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0 }, rectRadius: 0.18 });
  s.addText("LABO", { x: 11.43, y: 0.27, w: 1.3, h: 0.36, fontSize: 13, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true, charSpacing: 3 });
  s.addShape(S.roundRect, { x: MX, y: 1.7, w: 7.3, h: 1.25, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.12, objectName: "Scénario" });
  s.addText(sp.scenario, { x: MX + 0.3, y: 1.7, w: 6.7, h: 1.25, fontSize: 18, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  s.addText("ÉTAPES", { x: MX, y: 3.15, w: 4, h: 0.3, fontSize: 13, bold: true, color: C.accent1, charSpacing: 3, margin: 0, isTextBox: true });
  const steps = sp.steps.map((t, i) => ({ text: t, options: { bullet: { type: "number" }, breakLine: i < sp.steps.length - 1, paraSpaceAfter: 8 } }));
  s.addText(steps, { x: MX, y: 3.55, w: 7.3, h: 3.2, fontSize: 18, color: C.text1, valign: "top", margin: 0, isTextBox: true, objectName: "Étapes du labo" });
  const x = 8.2, w = W - MX - x;
  s.addShape(S.roundRect, { x, y: 1.7, w, h: 2.45, fill: { color: C.text1 }, line: { color: C.text1, width: 0 }, rectRadius: 0.12, objectName: "Validation" });
  s.addText("VALIDATION", { x: x + 0.3, y: 1.9, w: w - 0.6, h: 0.3, fontSize: 13, bold: true, color: C.accent1, charSpacing: 3, margin: 0, isTextBox: true });
  s.addText(sp.valid, { x: x + 0.3, y: 2.3, w: w - 0.6, h: 1.7, fontSize: 19, color: C.background1, valign: "top", margin: 0, isTextBox: true });
  s.addShape(S.roundRect, { x, y: 4.3, w, h: 1.1, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.12, objectName: "Coût" });
  s.addText("COÛT", { x: x + 0.3, y: 4.42, w: w - 0.6, h: 0.3, fontSize: 13, bold: true, color: C.accent4, charSpacing: 3, margin: 0, isTextBox: true });
  s.addText(sp.cost, { x: x + 0.3, y: 4.74, w: w - 0.6, h: 0.55, fontSize: 20, bold: true, color: C.text1, valign: "top", margin: 0, isTextBox: true });
  s.addShape(S.roundRect, { x, y: 5.55, w, h: 1.2, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.12, objectName: "Chemin du code" });
  s.addText("CODE DANS LE DÉPÔT", { x: x + 0.3, y: 5.67, w: w - 0.6, h: 0.3, fontSize: 13, bold: true, color: C.accent3, charSpacing: 3, margin: 0, isTextBox: true });
  s.addText(sp.path, { x: x + 0.3, y: 6.0, w: w - 0.6, h: 0.65, fontSize: 14, fontFace: "Courier New", color: C.text1, valign: "top", margin: 0, isTextBox: true });
};

R.recap = (sp) => {
  const s = base({ ...sp, title: "À retenir et quiz" });
  s.addShape(S.roundRect, { x: MX, y: 1.7, w: 6.1, h: 5.0, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.12, objectName: "À retenir" });
  s.addText("À RETENIR", { x: MX + 0.4, y: 1.95, w: 5, h: 0.35, fontSize: 14, bold: true, color: C.accent2, charSpacing: 3, margin: 0, isTextBox: true });
  sp.keep.forEach((k, i) => {
    const y = 2.55 + i * 1.35;
    circleIcon(s, "FaCheckCircle", MX + 0.4, y + 0.12, 0.5, C.accent2);
    s.addText(k, { x: MX + 1.15, y, w: 4.7, h: 1.1, fontSize: 20, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  });
  s.addShape(S.roundRect, { x: 6.93, y: 1.7, w: 5.8, h: 5.0, fill: { color: C.text1 }, line: { color: C.text1, width: 0 }, rectRadius: 0.12, objectName: "Quiz" });
  s.addText("QUIZ", { x: 7.35, y: 1.95, w: 5, h: 0.35, fontSize: 14, bold: true, color: C.accent1, charSpacing: 3, margin: 0, isTextBox: true });
  sp.quiz.forEach((q, i) => {
    const y = 2.55 + i * 1.35;
    s.addShape(S.ellipse, { x: 7.35, y: y + 0.12, w: 0.5, h: 0.5, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0 } });
    s.addText(String(i + 1), { x: 7.35, y: y + 0.12, w: 0.5, h: 0.5, fontSize: 16, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(q, { x: 8.1, y, w: 4.35, h: 1.1, fontSize: 19, color: C.background1, valign: "middle", margin: 0, isTextBox: true });
  });
};

// ---- schémas
function tierBox(s, x, y, w, h, color, text) {
  s.addShape(S.roundRect, { x, y, w, h, fill: { color, transparency: 72 }, line: { color, width: 1.5 }, rectRadius: 0.1 });
  s.addText(text, { x: x + 0.15, y, w: w - 0.3, h, fontSize: 17, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true });
}

R.vpc = (sp) => {
  const s = base(sp);
  s.addShape(S.roundRect, { x: MX, y: 1.65, w: 8.4, h: 5.2, fill: { color: C.background1 }, line: { color: C.accent3, width: 2 }, rectRadius: 0.12, objectName: "VPC" });
  s.addText("VPC 10.0.0.0/16", { x: MX + 0.25, y: 1.72, w: 4, h: 0.3, fontSize: 16, bold: true, color: C.accent3, margin: 0, isTextBox: true });
  s.addShape(S.roundRect, { x: 1.0, y: 2.1, w: 7.6, h: 0.45, fill: { color: C.accent5 }, line: { color: C.accent5, width: 0 }, rectRadius: 0.08 });
  s.addText("Internet Gateway", { x: 1.0, y: 2.1, w: 7.6, h: 0.45, fontSize: 16, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  const cols = [[1.0, "Zone A", "RDS primaire"], [4.9, "Zone B", "RDS standby"]];
  cols.forEach(([x, z, db]) => {
    s.addText(z, { x, y: 2.65, w: 3.7, h: 0.35, fontSize: 16, bold: true, color: C.text2, align: "center", margin: 0, isTextBox: true });
    tierBox(s, x, 3.05, 3.7, 1.0, C.accent1, "Public : ALB, NAT");
    tierBox(s, x, 4.15, 3.7, 1.0, C.accent3, "Privé : application");
    tierBox(s, x, 5.25, 3.7, 1.0, C.accent2, "Data : " + db);
  });
  s.addShape(S.roundRect, { x: 9.3, y: 1.65, w: 3.43, h: 5.2, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.12 });
  s.addText("LECTURE", { x: 9.6, y: 1.85, w: 3, h: 0.3, fontSize: 13, bold: true, color: C.accent1, charSpacing: 3, margin: 0, isTextBox: true });
  s.addText(bullets(["Public : route 0.0.0.0/0 vers l'Internet Gateway", "Privé : sortie Internet via la NAT", "Data : aucune route Internet", "Security Groups chaînés : ALB, application, base"], 16, { paraSpaceAfter: 12 }),
    { x: 9.6, y: 2.3, w: 2.95, h: 4.3, fontSize: 18, color: C.text1, valign: "top", margin: 0, isTextBox: true });
};

R.ha = (sp) => {
  const s = base(sp);
  const cols = [
    { x: 0.6, w: 1.7, icon: "FaUsers", h: "Utilisateurs", sub: [] },
    { x: 2.75, w: 2.0, icon: "FaGlobe", h: "CloudFront + WAF", sub: [] },
    { x: 5.2, w: 1.7, icon: "FaNetworkWired", h: "ALB", sub: [] },
    { x: 7.35, w: 2.7, icon: "FaServer", h: "Auto Scaling", sub: ["EC2 · Zone A", "EC2 · Zone B"] },
    { x: 10.5, w: 2.23, icon: "FaDatabase", h: "RDS Multi-AZ", sub: ["Primaire · Zone A", "Standby · Zone B"] },
  ];
  cols.forEach((c, i) => {
    s.addShape(S.roundRect, { x: c.x, y: 1.75, w: c.w, h: 3.3, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.12, objectName: "Bloc " + c.h });
    circleIcon(s, c.icon, c.x + c.w / 2 - 0.35, 1.95, 0.7, ACC[i % 4]);
    s.addText(c.h, { x: c.x + 0.1, y: 2.8, w: c.w - 0.2, h: 0.6, fontSize: 17, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true });
    c.sub.forEach((t, k) => {
      s.addShape(S.roundRect, { x: c.x + 0.2, y: 3.5 + k * 0.7, w: c.w - 0.4, h: 0.55, fill: { color: C.background1 }, line: { color: C.accent5, width: 1 }, rectRadius: 0.08 });
      s.addText(t, { x: c.x + 0.2, y: 3.5 + k * 0.7, w: c.w - 0.4, h: 0.55, fontSize: 14, bold: true, color: C.text2, align: "center", valign: "middle", margin: 0, isTextBox: true });
    });
    if (i < cols.length - 1) {
      const gx = c.x + c.w, gw = cols[i + 1].x - gx;
      s.addShape(S.rightArrow, { x: gx + (gw - 0.3) / 2, y: 3.25, w: 0.3, h: 0.3, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0 }, objectName: "Flèche" });
    }
  });
  const info = ["Zone perdue : l'ALB retire les cibles en panne", "Charge en hausse : Auto Scaling ajoute des instances", "Base : bascule Multi-AZ automatique"];
  const w = (CW - 0.6) / 3;
  info.forEach((t, i) => {
    const x = MX + i * (w + 0.3);
    s.addShape(S.roundRect, { x, y: 5.35, w, h: 1.3, fill: { color: C.text1 }, line: { color: C.text1, width: 0 }, rectRadius: 0.12 });
    s.addText(t, { x: x + 0.3, y: 5.35, w: w - 0.6, h: 1.3, fontSize: 18, color: C.background1, valign: "middle", margin: 0, isTextBox: true });
  });
};

R.org = (sp) => {
  const s = base(sp);
  const line = { color: C.accent5, width: 2 };
  s.addShape(S.roundRect, { x: 5.17, y: 1.7, w: 3.0, h: 0.65, fill: { color: C.text1 }, line: { color: C.text1, width: 0 }, rectRadius: 0.1 });
  s.addText("Root · compte de gestion", { x: 5.17, y: 1.7, w: 3.0, h: 0.65, fontSize: 15, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  const ous = [
    ["Security", ["log-archive", "audit"]],
    ["Infrastructure", ["network", "shared-services"]],
    ["Workloads", ["app-prod", "app-dev / staging"]],
    ["Sandbox", ["comptes de formation"]],
  ];
  const w = 2.68, gap = (CW - 4 * w) / 3;
  s.addShape(S.line, { x: 6.67, y: 2.35, w: 0, h: 0.35, line });
  s.addShape(S.line, { x: MX + w / 2, y: 2.7, w: 3 * (w + gap), h: 0, line });
  ous.forEach(([name, accts], i) => {
    const x = MX + i * (w + gap), cx = x + w / 2;
    s.addShape(S.line, { x: cx, y: 2.7, w: 0, h: 0.3, line });
    s.addShape(S.roundRect, { x, y: 3.0, w, h: 0.65, fill: { color: ACC[i], transparency: 72 }, line: { color: ACC[i], width: 1.5 }, rectRadius: 0.1 });
    s.addText("OU " + name, { x, y: 3.0, w, h: 0.65, fontSize: 16, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true });
    accts.forEach((a, k) => {
      s.addShape(S.roundRect, { x: x + 0.2, y: 3.9 + k * 0.7, w: w - 0.4, h: 0.55, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.08 });
      s.addText(a, { x: x + 0.2, y: 3.9 + k * 0.7, w: w - 0.4, h: 0.55, fontSize: 16, color: C.text2, align: "center", valign: "middle", margin: 0, isTextBox: true });
    });
  });
  const infos = ["SCP : plafond de permissions hérité de Root vers OU puis compte", "Compte de gestion : uniquement la facturation et Organizations"];
  infos.forEach((t, i) => {
    const x = MX + i * 6.23;
    s.addShape(S.roundRect, { x, y: 5.55, w: 5.9, h: 1.1, fill: { color: C.text1 }, line: { color: C.text1, width: 0 }, rectRadius: 0.12 });
    s.addText(t, { x: x + 0.3, y: 5.55, w: 5.3, h: 1.1, fontSize: 18, color: C.background1, valign: "middle", margin: 0, isTextBox: true });
  });
};

// ---------------------------------------------------------------- build
(async () => {
  await loadIcons();
  pres.addSection({ title: "Introduction" });
  curSection = "Introduction";
  for (const sp of slides) {
    if (sp.kicker === "CONCLUSION" && curKicker !== "CONCLUSION") {
      curSection = "Conclusion";
      pres.addSection({ title: "Conclusion" });
      curKicker = "CONCLUSION";
    }
    if (!R[sp.t]) throw new Error("Type inconnu : " + sp.t);
    R[sp.t](sp);
  }
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("OK", OUT, slides.length, "diapos");
})().catch((e) => { console.error(e); process.exit(1); });
