const { chromium } = require("playwright");
const fs = require("fs-extra");
const path = require("path");

class PlaywrightScraper {
  constructor(baseUrl = "http://localhost:5000") {
    this.baseUrl = baseUrl;
    this.outputDir = "./scraped-cartridge-playwright";
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async initialize() {
    this.browser = await chromium.launch({ headless: false });
    this.context = await this.browser.newContext({
      viewport: { width: 1200, height: 800 }
    });
    this.page = await this.context.newPage();
  }

  async scrapeCartridge(cartridgeUrl) {
    await fs.ensureDir(this.outputDir);

    const startUrl = `${this.baseUrl}/#/?cartridge=${encodeURIComponent(
      cartridgeUrl
    )}`;
    await this.page.goto(startUrl);

    // Wait for cartridge to load
    await this.page.waitForLoadState("networkidle");

    // Screenshot the main page
    await this.page.screenshot({
      path: path.join(this.outputDir, "main-page.png"),
      fullPage: true
    });

    // Extract and visit all routes
    const routes = await this.extractRoutes();

    for (const route of routes) {
      await this.scrapeRoute(route);
    }

    return this.outputDir;
  }

  async extractRoutes() {
    return await this.page.evaluate(() => {
      const routes = new Set();

      // Find all hash-based navigation links
      document.querySelectorAll('a[href^="#/"]').forEach(link => {
        const hash = link.getAttribute("href");
        if (hash && hash !== "#/") {
          routes.add(hash.substring(2)); // Remove #/
        }
      });

      return Array.from(routes);
    });
  }

  async scrapeRoute(route) {
    const url = `${this.baseUrl}/#/${route}`;
    console.log(`Scraping route: ${route}`);

    try {
      await this.page.goto(url);
      await this.page.waitForLoadState("networkidle");

      // Generate filename from route
      const fileName = route.replace(/[\/\\:*?"<>|]/g, "_") || "index";

      // Save HTML
      const html = await this.page.content();
      await fs.writeFile(path.join(this.outputDir, `${fileName}.html`), html);

      // Save screenshot
      await this.page.screenshot({
        path: path.join(this.outputDir, `${fileName}.png`),
        fullPage: true
      });

      // Save PDF
      await this.page.pdf({
        path: path.join(this.outputDir, `${fileName}.pdf`),
        format: "A4",
        printBackground: true
      });
    } catch (error) {
      console.error(`Error scraping route ${route}:`, error.message);
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = PlaywrightScraper;
