import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outRoot = join(root, "screenshots");
const base = process.env.PROTOTYPE_URL || "http://localhost:5173";

const themes = ["wool-brass"];
const shots = [
  { name: "home-mobile", path: "/", width: 390, height: 844, fullPage: true },
  { name: "home-desktop", path: "/", width: 1440, height: 900, fullPage: false },
  { name: "commission-mobile", path: "/commission.html", width: 390, height: 844, fullPage: true },
  { name: "works-desktop", path: "/works.html", width: 1440, height: 900, fullPage: false },
];

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const index = [];

  for (const theme of themes) {
    const dir = join(outRoot, theme);
    await mkdir(dir, { recursive: true });

    for (const shot of shots) {
      const context = await browser.newContext({
        viewport: { width: shot.width, height: shot.height },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      await page.addInitScript(() => {
        localStorage.setItem("nuttyfelt-prototype-lang", "zh-Hant");
      });
      await page.goto(`${base}${shot.path}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);
      const file = `${shot.name}.png`;
      const dest = join(dir, file);
      await page.screenshot({ path: dest, fullPage: shot.fullPage });
      index.push({ theme, ...shot, file: `${theme}/${file}` });
      await context.close();
      console.log(`saved ${theme}/${file}`);
    }
  }

  await writeFile(
    join(outRoot, "index.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), base, shots: index }, null, 2),
  );
  await browser.close();
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
