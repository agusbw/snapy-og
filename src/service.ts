import { db } from "./db/index.js";
import { domains } from "./db/schema.js";
import { isCacheExist, getImageFromCache, setCache } from "./lib/utils.js";
import puppeteer from "puppeteer";

export const getImage = async (targetUrl: string) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const lists = await db.select().from(domains);
    const isWhitelisted = lists.some(
      (domain) => domain.address.split("/")[2] === new URL(targetUrl).hostname
    );

    if (!isWhitelisted) {
      throw new Error("Domain is not registered");
    }

    if (isCacheExist(targetUrl)) {
      return getImageFromCache(targetUrl);
    }

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630 });
    await page.goto(targetUrl, {
      waitUntil: "networkidle0",
    });

    const imageBuffer = await page.screenshot({
      fullPage: false,
      type: "png",
    });
    setCache(targetUrl, imageBuffer);
    return imageBuffer;
  } finally {
    await browser.close();
  }
};
