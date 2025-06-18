const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs-extra");
const path = require("path");

class SimpleScraper {
  constructor(baseUrl = "http://localhost:5000") {
    this.baseUrl = baseUrl;
    this.outputDir = "./scraped-cartridge-simple";
  }

  async scrapeStaticBuild() {
    await fs.ensureDir(this.outputDir);

    try {
      // This approach works better with the build folder
      const buildDir = path.join(__dirname, "build");

      if (await fs.pathExists(buildDir)) {
        // Copy the entire build directory
        await fs.copy(buildDir, this.outputDir);
        console.log("Copied static build files");

        // Modify index.html to work offline
        await this.modifyIndexForOffline();

        return this.outputDir;
      } else {
        throw new Error("Build directory not found. Run npm run build first.");
      }
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  async modifyIndexForOffline() {
    const indexPath = path.join(this.outputDir, "index.html");
    let html = await fs.readFile(indexPath, "utf8");

    // Add base tag for relative paths
    html = html.replace("<head>", '<head>\n  <base href="./">');

    // Modify any absolute paths to relative
    html = html.replace(/href="\//g, 'href="./');
    html = html.replace(/src="\//g, 'src="./');

    await fs.writeFile(indexPath, html);
    console.log("Modified index.html for offline use");
  }
}

module.exports = SimpleScraper;
