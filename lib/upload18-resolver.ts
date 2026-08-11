import chromium from "@sparticuz/chromium";
import puppeteer, { type Page } from "puppeteer-core";
import { getServerlessChromiumExecutable } from "@/lib/serverless-chromium";
import { validateUpstreamUrl } from "@/lib/security";

const UPLOAD18_HOSTS = new Set(["upload18.org", "www.upload18.org"]);

export type Upload18ResolveResult = {
  playerPageUrl: string;
  finalPageUrl: string;
  m3u8: string;
  title: string;
  pageStatus: number;
  elapsedMs: number;
};

export function validateUpload18PlayerUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Player URL ไม่ถูกต้อง");
  }

  if (url.protocol !== "https:" || !UPLOAD18_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error("อนุญาตเฉพาะ Player URL จาก upload18.org");
  }

  return url;
}

async function readPlayerConfig(page: Page) {
  await page.waitForFunction(
    () => {
      const config = (window as Window & { PLAYER_CONFIG?: { m3u8?: unknown } }).PLAYER_CONFIG;
      return typeof config?.m3u8 === "string" && config.m3u8.length > 0;
    },
    { timeout: 15_000 },
  );

  return page.evaluate(() => {
    const config = (window as Window & {
      PLAYER_CONFIG?: { m3u8?: string };
    }).PLAYER_CONFIG;
    return {
      m3u8: config?.m3u8 || "",
      title: document.title || "Upload18 Player",
    };
  });
}

export async function resolveUpload18Player(rawPlayerPageUrl: string): Promise<Upload18ResolveResult> {
  const playerUrl = validateUpload18PlayerUrl(rawPlayerPageUrl);
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
  const startedAt = Date.now();

  try {
    chromium.setGraphicsMode = false;
    const executablePath = await getServerlessChromiumExecutable();
    const launchArgs = await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" });

    browser = await puppeteer.launch({
      args: launchArgs,
      executablePath,
      headless: "shell",
      defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(25_000);
    page.setDefaultTimeout(15_000);
    await page.setUserAgent(
      process.env.HLS_TEST_USER_AGENT ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0",
    );
    await page.setExtraHTTPHeaders({
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7",
    });

    const response = await page.goto(playerUrl.toString(), {
      waitUntil: "domcontentloaded",
      timeout: 25_000,
      referer: "https://upload18.org/",
    });
    const pageStatus = response?.status() || 0;
    if (pageStatus >= 400) {
      throw new Error(`Upload18 Player ตอบ HTTP ${pageStatus}`);
    }

    const config = await readPlayerConfig(page);
    if (!config.m3u8) throw new Error("ไม่พบ window.PLAYER_CONFIG.m3u8");

    const manifestUrl = validateUpstreamUrl(new URL(config.m3u8, page.url()).toString());
    return {
      playerPageUrl: playerUrl.toString(),
      finalPageUrl: page.url(),
      m3u8: manifestUrl.toString(),
      title: config.title,
      pageStatus,
      elapsedMs: Date.now() - startedAt,
    };
  } catch (error) {
    if (error instanceof Error && /timeout/i.test(error.message)) {
      throw new Error("Upload18 ไม่แสดง PLAYER_CONFIG.m3u8 ภายในเวลาที่กำหนด");
    }
    throw error instanceof Error ? error : new Error("Upload18 Resolver ล้มเหลว");
  } finally {
    if (browser) await browser.close().catch(() => undefined);
  }
}
