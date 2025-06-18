#!/usr/bin/env node

const PuppeteerScraper = require("./scraper-puppeteer");
const PlaywrightScraper = require("./scraper-playwright");
const SimpleScraper = require("./scraper-simple");

class CartridgeExporter {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || "http://localhost:5000";
    this.method = options.method || "puppeteer"; // 'puppeteer', 'playwright', 'simple'
    this.cartridgeUrl = options.cartridgeUrl;
    this.outputDir = options.outputDir || "./exported-cartridge";
  }

  async export() {
    console.log(`Starting export using ${this.method} method...`);

    switch (this.method) {
      case "puppeteer":
        return await this.exportWithPuppeteer();
      case "playwright":
        return await this.exportWithPlaywright();
      case "simple":
        return await this.exportSimple();
      default:
        throw new Error(`Unknown method: ${this.method}`);
    }
  }

  async exportWithPuppeteer() {
    const scraper = new PuppeteerScraper(this.baseUrl);
    try {
      await scraper.initialize();
      const result = await scraper.scrapeCartridge(this.cartridgeUrl);
      console.log(`✅ Puppeteer export completed: ${result}`);
      return result;
    } finally {
      await scraper.close();
    }
  }

  async exportWithPlaywright() {
    const scraper = new PlaywrightScraper(this.baseUrl);
    try {
      await scraper.initialize();
      const result = await scraper.scrapeCartridge(this.cartridgeUrl);
      console.log(`✅ Playwright export completed: ${result}`);
      return result;
    } finally {
      await scraper.close();
    }
  }

  async exportSimple() {
    const scraper = new SimpleScraper(this.baseUrl);
    const result = await scraper.scrapeStaticBuild();
    console.log(`✅ Simple export completed: ${result}`);
    return result;
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const method = args[0] || "puppeteer";
  const cartridgeUrl = args[1] || "https://example.com/sample.imscc";

  const exporter = new CartridgeExporter({
    method,
    cartridgeUrl
  });

  exporter
    .export()
    .then(result => {
      console.log(`🎉 Export successful! Check: ${result}`);
      process.exit(0);
    })
    .catch(error => {
      console.error("❌ Export failed:", error.message);
      process.exit(1);
    });
}

module.exports = CartridgeExporter;
