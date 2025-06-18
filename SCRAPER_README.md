# Common Cartridge Scraper

Export your Common Cartridge Viewer to static files for offline use or archival.

## Installation

```bash
# Install scraper dependencies
npm install puppeteer playwright cheerio axios fs-extra

# Or copy the scraper-package.json and install
cp scraper-package.json package-scraper.json
npm install --prefix ./scraper -f package-scraper.json
```

## Usage

### Method 1: Puppeteer (Recommended)
- **Best for**: Complete page rendering, JavaScript execution
- **Output**: HTML files with full interactivity
- **Complexity**: Moderate

```bash
node scraper.js puppeteer "https://example.com/cartridge.imscc"
```

### Method 2: Playwright (Alternative)
- **Best for**: Multiple formats (HTML, PDF, PNG)
- **Output**: HTML, PDF, and screenshot files
- **Complexity**: Moderate

```bash
node scraper.js playwright "https://example.com/cartridge.imscc"
```

### Method 3: Simple Static Copy (Fastest)
- **Best for**: Quick offline copy of build files
- **Output**: Static React build with modifications
- **Complexity**: Easy

```bash
# First build the project
npm run build

# Then export
node scraper.js simple
```

## Advanced Usage

```javascript
const CartridgeExporter = require('./scraper');

const exporter = new CartridgeExporter({
  baseUrl: 'http://localhost:3000',
  method: 'puppeteer',
  cartridgeUrl: 'https://yoursite.com/course.imscc',
  outputDir: './my-exported-course'
});

exporter.export().then(path => {
  console.log(`Course exported to: ${path}`);
});
```

## Output Structure

```
exported-cartridge/
├── index.html              # Main page
├── module-items_xxx.html   # Individual module items
├── assignments.html        # Assignment list
├── discussions.html        # Discussion list
├── quizzes.html           # Quiz list
├── files.html             # File list
├── static/                # CSS, JS, images
│   ├── css/
│   ├── js/
│   └── media/
└── screenshots/           # (Playwright only)
    ├── main-page.png
    └── *.pdf
```

## Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `baseUrl` | `http://localhost:5000` | Local server URL |
| `method` | `puppeteer` | Scraping method |
| `outputDir` | `./exported-cartridge` | Output directory |
| `headless` | `false` | Run browser headlessly |

## Requirements

- Node.js 16+
- Chrome/Chromium browser (for Puppeteer)
- Running Common Cartridge Viewer server

## Troubleshooting

### Common Issues:

1. **"Failed to launch browser"**
   ```bash
   # Install browser dependencies
   npx puppeteer browsers install chrome
   # or for Playwright
   npx playwright install chromium
   ```

2. **"Connection refused"**
   - Ensure the dev server is running: `npm start`
   - Check the correct port (default: 3000 or 5000)

3. **"Module not found"**
   ```bash
   npm install --save-dev puppeteer playwright
   ```

4. **Memory issues with large cartridges**
   ```bash
   node --max-old-space-size=4096 scraper.js
   ```

## Performance Tips

- Use `headless: true` for production
- Add delays for slow-loading content
- Implement request filtering for faster scraping
- Use concurrent page processing for multiple cartridges
