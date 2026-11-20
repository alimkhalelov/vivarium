const { chromium } = require('playwright-core');
const fs = require('fs');

async function buildPerfectTransparentBanner() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1000, height: 400 } });
  await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/index.html', { waitUntil: 'load' });

  const dataUrl = await page.evaluate(() => {
    const W = 960, H = 200;
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;

    // 100% TRANSPARENT BACKGROUND (ALPHA = 0)
    // No painted stars - itch.io's background_stars.png shows through naturally!
    c.clearRect(0, 0, W, H);

    const midX = W / 2;
    const titleY = 68;

    // 1. Subtle Celestial Runic Header
    tx(c, '- THE REINCARNATION PROTOCOL -', midX, titleY - 26, '#00ffcc', 1, true, 'c');

    // 2. Main Title: "VIVARIUM" in authentic in-game bitmap font!
    // Scale 8: crisp, bold, unmistakable golden amber (#ffd040) with black shadow
    tx(c, 'VIVARIUM', midX, titleY, '#ffd040', 8, true, 'c');

    // 3. Subtitle / Tagline: "BREAK THE ETERNAL CYCLE"
    tx(c, 'BREAK THE ETERNAL CYCLE', midX, titleY + 70, '#80e8ff', 2, true, 'c');

    // 4. Subtle ornamental divider line with gold diamond
    const divY = titleY + 92;
    c.fillStyle = '#ffd040';
    c.fillRect(midX - 3, divY - 2, 7, 5);
    c.fillStyle = '#00ffcc';
    c.fillRect(midX - 9, divY, 4, 1);
    c.fillRect(midX + 6, divY, 4, 1);
    c.fillStyle = 'rgba(100, 80, 160, 0.4)';
    c.fillRect(midX - 160, divY, 144, 1);
    c.fillRect(midX + 16, divY, 144, 1);

    // 5. Flanking Floating Islands (Left & Right)
    const titleW = 8 * 48; // 384px
    const islandY = titleY + 58;

    // Left Island: Overworld Floating Grass Island (Knight & Wizard)
    const leftIslandX = midX - titleW / 2 - 195;
    // Green grass
    c.fillStyle = '#3ca048';
    c.fillRect(leftIslandX, islandY, 145, 4);
    c.fillStyle = '#227030';
    c.fillRect(leftIslandX, islandY + 4, 145, 2);
    // Brown earth
    c.fillStyle = '#5a3818';
    c.fillRect(leftIslandX + 8, islandY + 6, 129, 6);
    c.fillStyle = '#3a200a';
    c.fillRect(leftIslandX + 22, islandY + 12, 101, 4);
    c.fillStyle = '#221206';
    c.fillRect(leftIslandX + 42, islandY + 16, 61, 3);
    // Grass blades
    c.fillStyle = '#60e060';
    for (let i = 0; i < 145; i += 6) c.fillRect(leftIslandX + i, islandY - 2, 2, 2);

    // Right Island: Celestial Altar (Liberator & Archangel)
    const rightIslandX = midX + titleW / 2 + 50;
    // White/cyan cloud top
    c.fillStyle = '#e8f4fc';
    c.fillRect(rightIslandX, islandY, 145, 4);
    c.fillStyle = '#00ffcc';
    c.fillRect(rightIslandX, islandY + 4, 145, 2);
    // Deep obsidian/marble underbelly
    c.fillStyle = '#3a3258';
    c.fillRect(rightIslandX + 8, islandY + 6, 129, 6);
    c.fillStyle = '#241a3c';
    c.fillRect(rightIslandX + 22, islandY + 12, 101, 4);
    c.fillStyle = '#140e24';
    c.fillRect(rightIslandX + 42, islandY + 16, 61, 3);
    // Celestial sparkles
    c.fillStyle = '#ffd040';
    for (let i = 0; i < 145; i += 8) c.fillRect(rightIslandX + i, islandY - 2, 2, 2);

    // 6. Draw the 16x16 Sprites from Sprites.proc
    if (Sprites && Sprites.proc) {
      // Left: Knight & Wizard
      const knight = Sprites.proc.getBySubject('golden knight') || Sprites.proc.getBySubject('knight');
      if (knight) {
        drawSpr(c, knight, leftIslandX + 105, islandY, 4, { plain: 1 });
        c.fillStyle = '#ffd040';
        c.fillRect(leftIslandX + 133, islandY - 42, 4, 4);
        c.fillRect(leftIslandX + 137, islandY - 32, 3, 3);
      }
      const wizard = Sprites.proc.getBySubject('wizard');
      if (wizard) {
        drawSpr(c, wizard, leftIslandX + 40, islandY, 3.8, { plain: 1 });
        c.fillStyle = '#60e0ff';
        c.fillRect(leftIslandX + 63, islandY - 38, 4, 4);
      }

      // Right: Liberator & Archangel
      const liberator = Sprites.proc.getBySubject('teal liberator') || Sprites.proc.getBySubject('liberator');
      if (liberator) {
        drawSpr(c, liberator, rightIslandX + 45, islandY, 4, { plain: 1, flip: -1 });
        c.fillStyle = '#00ffcc';
        c.fillRect(rightIslandX + 17, islandY - 42, 4, 4);
        c.fillRect(rightIslandX + 21, islandY - 32, 3, 3);
      }
      const angel = Sprites.proc.getBySubject('holy angel') || Sprites.proc.getBySubject('golden angel');
      if (angel) {
        drawSpr(c, angel, rightIslandX + 110, islandY, 3.8, { plain: 1, flip: -1 });
        c.fillStyle = '#ffd040';
        c.fillRect(rightIslandX + 87, islandY - 38, 4, 4);
      }

      // Floating loot items
      const coin = Sprites.proc.getBySubject('golden coin');
      if (coin) drawSpr(c, coin, leftIslandX + 140, islandY - 12, 2, { plain: 1 });
      const gem = Sprites.proc.getBySubject('ruby gem');
      if (gem) drawSpr(c, gem, leftIslandX - 8, islandY - 12, 2, { plain: 1 });

      const crystal = Sprites.proc.getBySubject('crystal crystal') || Sprites.proc.getBySubject('void crystal');
      if (crystal) drawSpr(c, crystal, rightIslandX + 8, islandY - 12, 2, { plain: 1 });
      const key = Sprites.proc.getBySubject('golden key');
      if (key) drawSpr(c, key, rightIslandX + 148, islandY - 12, 2, { plain: 1 });
    }

    return cv.toDataURL('image/png');
  });

  const bannerBuf = Buffer.from(dataUrl.split(',')[1], 'base64');
  fs.writeFileSync('itch-assets/banner_vivarium.png', bannerBuf);
  console.log('Saved transparent itch-assets/banner_vivarium.png');

  // Preview composite over background_stars.png
  const bgBuf = fs.readFileSync('itch-assets/background_stars.png');
  const bgBase64 = bgBuf.toString('base64');
  const bannerBase64 = bannerBuf.toString('base64');

  const testHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        margin: 0;
        background-color: #06040e;
        background-image: url('data:image/png;base64,${bgBase64}');
        background-repeat: repeat;
        display: flex;
        justify-content: center;
        padding-top: 20px;
      }
      .banner-box {
        width: 960px;
        height: 200px;
      }
      .banner-box img {
        width: 960px;
        height: 200px;
        image-rendering: pixelated;
      }
    </style>
  </head>
  <body>
    <div class="banner-box">
      <img src="data:image/png;base64,${bannerBase64}">
    </div>
  </body>
  </html>
  `;

  await page.setContent(testHtml);
  const outPath = 'C:/Users/alimz/.gemini/antigravity/brain/c6d3944d-e1c1-462b-bf65-04de3132e188/perfect_transparent_banner_preview.png';
  await page.screenshot({ path: outPath });
  console.log('Saved inspection screenshot to:', outPath);

  await browser.close();
}

buildPerfectTransparentBanner().catch(console.error);
