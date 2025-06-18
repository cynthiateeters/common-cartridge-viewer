const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const path = require("path");
const { URL } = require("url");

class CartridgeScraper {
  constructor(baseUrl = "http://localhost:5000") {
    this.baseUrl = baseUrl;
    this.outputDir = "./scraped-cartridge";
    this.visitedUrls = new Set();
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for production
      devtools: false
    });
    this.page = await this.browser.newPage();

    // Set viewport for consistent rendering
    await this.page.setViewport({ width: 1200, height: 800 });

    // Enable request interception to save resources
    await this.page.setRequestInterception(true);
    this.page.on("request", req => {
      if (
        req.resourceType() === "stylesheet" ||
        req.resourceType() === "image" ||
        req.resourceType() === "font"
      ) {
        req.continue();
      } else {
        req.continue();
      }
    });
  }

  async scrapeCartridge(cartridgeUrl) {
    await fs.ensureDir(this.outputDir);

    // Navigate to main page with cartridge
    const startUrl = `${this.baseUrl}/#/?cartridge=${encodeURIComponent(
      cartridgeUrl
    )}`;
    await this.page.goto(startUrl, { waitUntil: "networkidle0" });

    // Wait for cartridge to load
    await this.page.waitForSelector('[data-testid="cartridge-loaded"]', {
      timeout: 30000
    });

    // Get all navigation links
    const links = await this.extractAllLinks();

    // Scrape each page
    for (const link of links) {
      await this.scrapePage(link);
    }

    // Copy static assets
    await this.copyStaticAssets();

    return this.outputDir;
  }

  async extractAllLinks() {
    const links = await this.page.evaluate(() => {
      const allLinks = [];

      // Extract module items
      document.querySelectorAll('a[href*="#/module-items/"]').forEach(link => {
        allLinks.push({
          url: link.href,
          title: link.textContent.trim(),
          type: "module-item"
        });
      });

      // Extract assignment links
      document.querySelectorAll('a[href*="#/assignments"]').forEach(link => {
        allLinks.push({
          url: link.href,
          title: link.textContent.trim(),
          type: "assignment"
        });
      });

      // Extract other navigation links
      document.querySelectorAll('a[href^="#/"]').forEach(link => {
        allLinks.push({
          url: link.href,
          title: link.textContent.trim(),
          type: "navigation"
        });
      });

      return allLinks;
    });

    return [...new Set(links.map(l => l.url))]; // Remove duplicates
  }

  async scrapePage(url) {
    if (this.visitedUrls.has(url)) return;
    this.visitedUrls.add(url);

    console.log(`Scraping: ${url}`);

    try {
      await this.page.goto(url, { waitUntil: "networkidle0" });

      // Wait for content to render
      await this.page.waitForTimeout(2000);

      // Get the rendered HTML
      const html = await this.page.content();

      // Extract the route path from hash
      const hashPath = new URL(url).hash.substring(2); // Remove #/
      const fileName = hashPath
        ? `${hashPath.replace(/[\/\\:*?"<>|]/g, "_")}.html`
        : "index.html";

      // Save the HTML file
      const filePath = path.join(this.outputDir, fileName);
      await fs.writeFile(filePath, html);

      console.log(`Saved: ${fileName}`);
    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
    }
  }

  async copyStaticAssets() {
    // Copy CSS, JS, and other static files from the build directory
    const buildDir = path.join(__dirname, "build");
    if (await fs.pathExists(buildDir)) {
      await fs.copy(buildDir, path.join(this.outputDir, "static"));
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = CartridgeScraper;

// Usage example:
async function main() {
  const scraper = new CartridgeScraper();

  try {
    await scraper.initialize();
    const outputPath = await scraper.scrapeCartridge(
      "https://example.com/cartridge.imscc"
    );
    console.log(`Scraping completed! Files saved to: ${outputPath}`);
  } catch (error) {
    console.error("Scraping failed:", error);
  } finally {
    await scraper.close();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
