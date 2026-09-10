import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, "moonlight-chautari-menu.html");
const pdfPath = path.join(__dirname, "Moonlight-Chautari-Menu.pdf");
const edge =
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const browser = await puppeteer.launch({
  executablePath: edge,
  headless: true,
  args: ["--allow-file-access-from-files", "--disable-web-security"],
});

const page = await browser.newPage();
await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 3 });
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load", timeout: 30000 });
await page.evaluate(() => document.fonts.ready);
await new Promise((resolve) => setTimeout(resolve, 400));

await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});

const sheets = await page.$$(".page");
await sheets[0].screenshot({
  path: path.join(__dirname, "preview-page-1.png"),
  type: "png",
});
await sheets[1].screenshot({
  path: path.join(__dirname, "preview-page-2.png"),
  type: "png",
});

await browser.close();
console.log(`Wrote ${pdfPath}`);
