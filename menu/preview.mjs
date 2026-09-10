import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const browser = await puppeteer.launch({
  executablePath:
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: true,
  userDataDir: path.join(__dirname, ".edge-profile-preview"),
  args: ["--allow-file-access-from-files"],
});
const page = await browser.newPage();
await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 3 });
await page.goto(pathToFileURL(path.join(__dirname, "moonlight-chautari-menu.html")).href, {
  waitUntil: "load",
  timeout: 20000,
});
await page.evaluate(() => document.fonts.ready);
const sheets = await page.$$(".page");
await sheets[0].screenshot({
  path: path.join(__dirname, "Moonlight-Chautari-Menu-page1.jpg"),
  type: "jpeg",
  quality: 95,
});
await sheets[1].screenshot({
  path: path.join(__dirname, "Moonlight-Chautari-Menu-page2.jpg"),
  type: "jpeg",
  quality: 95,
});
await sheets[0].screenshot({ path: path.join(__dirname, "preview-page-1.png") });
await sheets[1].screenshot({ path: path.join(__dirname, "preview-page-2.png") });
await browser.close();
console.log("previews ok");
