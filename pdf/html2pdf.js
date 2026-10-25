// Usage : NODE_PATH=<node_modules avec playwright> node html2pdf.js cours.html formation-aws-devops.pdf
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const [src, out] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file://" + path.resolve(src), { waitUntil: "load" });
  await page.pdf({
    path: out, format: "A4", printBackground: true, outline: true, tagged: true,
    margin: { top: "20mm", bottom: "20mm", left: "17mm", right: "17mm" },
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate: '<div style="width:100%;font-family:Arial;font-size:8px;color:#7C8AA5;padding:0 17mm;display:flex;justify-content:space-between"><span>Formation AWS pour ingénieur DevOps</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
  });
  await browser.close();
})();
