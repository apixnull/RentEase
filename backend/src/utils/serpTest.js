#!/usr/bin/env node
// yandexImageCheck.js — reliable Yandex reverse image check with screenshots

import puppeteer from "puppeteer";
import fs from "fs";

async function checkYandexImage(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.setViewport({ width: 1366, height: 768 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/120 Safari/537.36"
  );

  try {
    console.log("🔍 Searching image on Yandex...");
    const searchUrl = `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(
      url
    )}`;
    console.log("🌐 URL:", searchUrl);

    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 110000 });

    console.log("🕓 Waiting for Yandex to load visible results...");

    // Wait for the "Similar images" or "Sites" section
    await page.waitForSelector(".serp-item, .CbirSites", { timeout: 20000 }).catch(() => null);

    // Extra wait for lazy rendering
    await new Promise((r) => setTimeout(r, 5000));

    // Ensure folder
    if (!fs.existsSync("./screenshots")) fs.mkdirSync("./screenshots");

    const filePath = `./screenshots/yandex_result_${Date.now()}.png`;
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`📸 Screenshot saved: ${filePath}`);

    // Evaluate matches
    const result = await page.evaluate(() => {
      const similar = document.querySelectorAll(".serp-item").length;
      const sites = document.querySelectorAll(".CbirSites, .CbirSites-Item").length;
      return { similarCount: similar, siteCount: sites };
    });

    console.log("🔎 Page extract:", result);

    const duplicate = result.similarCount > 0 || result.siteCount > 0;
    console.log(
      duplicate
        ? "⚠️ Image appears on Yandex — possible duplicate."
        : "✅ No Yandex matches — likely original."
    );

    await browser.close();
    return { duplicate, screenshot: filePath, debug: result };
  } catch (err) {
    console.error("❌ Error during Yandex check:", err.message);
    await browser.close();
    return { duplicate: false, error: err.message };
  }
}

// Run directly
const imageUrl =
  process.argv[2] ||
  "https://ikqdyczsveeqnfwtrkaf.supabase.co/storage/v1/object/public/rentease-images/avatars/Cesa_Lab7Activity.pdf";

(async () => {
  console.log("🚀 Running Yandex image check...");
  const result = await checkYandexImage(imageUrl);
  console.log("\n🧩 Final Result:", result);
})();
