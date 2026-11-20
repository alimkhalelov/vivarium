const { chromium } = require('playwright-core');
const fs = require('fs');

async function buildMasterpieceBannerV2() {
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

    // Deep cosmic space background #06040e
    c.fillStyle = '#06040e';
    c.fillRect(0, 0, W, H);

    // Seeded PRNG
    let s = 987654321;
    const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

    // Starfield matching background_stars.png
    const starCols = ['#ffffff', '#ffffff', '#e2dcff', '#80e8ff', '#ffd040', '#ff80a0', '#7209b7', '#4cc9f0'];
    for (let i = 0; i < 220; i++) {
      const x = Math.floor(rnd() * W);
      const y = Math.floor(rnd() * H);
      c.fillStyle = starCols[Math.floor(rnd() * starCols.length)];
      c.globalAlpha = 0.25 + rnd() * 0.75;
      const sz = rnd() < 0.12 ? 2 : 1;
      c.fillRect(x, y, sz, sz);
      if (sz === 2 && rnd() < 0.25) {
        c.fillRect(x - 1, y, 1, 1);
        c.fillRect(x + 2, y, 1, 1);
        c.fillRect(x, y - 1, 1, 1);
        c.fillRect(x, y + 2, 1, 1);
      }
    }
    c.globalAlpha = 1.0;

    // Subtle cosmic nebula glow (dithered pixel clusters)
    for (let i = 0; i < 60; i++) {
      const nx = W / 2 + (rnd() - 0.5) * 600;
      const ny = H / 2 + (rnd() - 0.5) * 100;
      const col = rnd() < 0.5 ? 'rgba(0, 255, 204, 0.04)' : 'rgba(114, 9, 183, 0.04)';
      c.fillStyle = col;
      c.fillRect(nx, ny, Math.floor(rnd() * 24 + 10), Math.floor(rnd() * 16 + 6));
    }

    // Handcrafted Monumental Chunky Pixel Letters for "V I V A R I U M"
    // Characters:
    // . = empty
    // # = highlight ivory (#fffde0)
    // : = primary gold (#ffd040)
    // = = dark gold/bronze (#d48e14)
    // * = 3D bevel / shadow (#7a3806)
    // D = deep outline (#140602)
    const CHUNKY = {
      V: [
        "##:::.....:::##..",
        "##:::.....:::##*D",
        ".##:::...:::##*D.",
        ".##:::...:::##*D.",
        "..##:::..:::##*D.",
        "..##:::..:::##*D.",
        "...##::::::##**D.",
        "...##======##**D.",
        "....##====##***D.",
        "....##====##***D.",
        ".....##==##****D.",
        ".....##==##****D.",
        "......####*****D.",
        "......====*****D.",
        ".......##******D.",
        "........*******D.",
        ".........DDDDDD.."
      ],
      I: [
        "#####:::::::##..",
        "#####:::::::##*D",
        "....###:::##..*D",
        "....###:::##..*D",
        "....###:::##..*D",
        "....###:::##..*D",
        "....###:::##..*D",
        "....###:::##..*D",
        "....###:::##..*D",
        "....###:::##..*D",
        "....###===##..*D",
        "....###===##..*D",
        "....###===##..*D",
        "....###===##..*D",
        "#####=======##*D",
        "#####=======##*D",
        ".....DDDDDDDDD.."
      ],
      A: [
        "......######......",
        ".....##::::##.....",
        "....###::::###....",
        "....###::::###*D..",
        "...###::::::###*D.",
        "...###::::::###*D.",
        "..###::....::###*D",
        "..###::....::###*D",
        ".###::::::::::###*",
        ".###::::::::::###*",
        "###::::::::::::###",
        "###::::::::::::###",
        "###:::......:::###",
        "###===......===###",
        "###===......===###",
        "###===......===###",
        "DDDDDD......DDDDDD"
      ],
      R: [
        "#####::::::::##...",
        "#####:::::::::##*D",
        "###:::.....:::##*D",
        "###:::.....:::##*D",
        "###:::.....:::##*D",
        "###:::.....:::##*D",
        "#####:::::::::##*D",
        "#####::::::::##**D",
        "###:::::::#####**D",
        "###:::::###***D...",
        "###:::::###*D.....",
        "###:::...###*D....",
        "###===...###*D....",
        "###===....###*D...",
        "###===....###*D...",
        "###===.....###*D..",
        "DDDDDD.....DDDDD.."
      ],
      U: [
        "###:::......:::###..",
        "###:::......:::###*D",
        "###:::......:::###*D",
        "###:::......:::###*D",
        "###:::......:::###*D",
        "###:::......:::###*D",
        "###:::......:::###*D",
        "###:::......:::###*D",
        "###:::......:::###*D",
        "###:::......:::###*D",
        "###===......===###*D",
        ".###===....===###*D.",
        "..###========###**D.",
        "...############***D.",
        "....==========****D.",
        "......********DDD...",
        ".......DDDDDD......."
      ],
      M: [
        "##:::..........:::##..",
        "###:::........:::###*D",
        "####:::......:::####*D",
        "###.##:::....:::##.###*D",
        "###..##:::..:::##..###*D",
        "###...##::::::##...###*D",
        "###....##::::##....###*D",
        "###.....######.....###*D",
        "###......####......###*D",
        "###......####......###*D",
        "###................###*D",
        "###................###*D",
        "###===..........===###*D",
        "###===..........===###*D",
        "###===..........===###*D",
        "###===..........===###*D",
        "DDDDDD..........DDDDDD.."
      ]
    };

    const PAL = {
      '#': '#fffde0', // highlight ivory
      ':': '#ffd040', // radiant gold
      '=': '#d48e14', // rich bronze-gold
      '*': '#7a3806', // 3D shadow bevel
      'D': '#140602'  // bottom deep outline
    };

    function drawChunkyLetter(letter, x, y, scale = 3) {
      const grid = CHUNKY[letter];
      if (!grid) return 0;
      const gh = grid.length;
      const gw = grid[0].length;
      for (let r = 0; r < gh; r++) {
        for (let cl = 0; cl < gw; cl++) {
          const ch = grid[r][cl];
          if (ch !== '.' && PAL[ch]) {
            c.fillStyle = PAL[ch];
            c.fillRect(x + cl * scale, y + r * scale, scale, scale);
          }
        }
      }
      return gw * scale;
    }

    const word = ['V', 'I', 'V', 'A', 'R', 'I', 'U', 'M'];
    const scale = 3;
    const spacing = 8;
    const widths = word.map(w => CHUNKY[w][0].length * scale);
    const totalW = widths.reduce((a, b) => a + b, 0) + (word.length - 1) * spacing;

    const startX = Math.round((W - totalW) / 2);
    const startY = 70;

    // Find center of 'A'
    let aCenterX = 0;
    let tempX = startX;
    for (let i = 0; i < word.length; i++) {
      if (word[i] === 'A') aCenterX = tempX + Math.round(widths[i] / 2);
      tempX += widths[i] + spacing;
    }

    // 1. Central Monument: Upward Arching Seraph Wings & Wrapped Ring World
    const px = aCenterX;
    const py = startY - 26;

    // Upward-arching celestial angel wings (arching UP and OUT)
    const wingUpL = [
      ".........###",
      ".......#####",
      ".....#######",
      "...#########",
      "..##########",
      ".###########",
      ".###########",
      "############",
      "############",
      ".###########",
      "..##########",
      "...#########",
      ".....#######",
      ".......#####",
      ".........###"
    ];
    const wSc = 2;
    for (let r = 0; r < wingUpL.length; r++) {
      const line = wingUpL[r];
      for (let cl = 0; cl < line.length; cl++) {
        if (line[cl] === '#') {
          const t = cl / line.length;
          c.fillStyle = t > 0.7 ? '#ffffff' : (t > 0.35 ? '#80f0ff' : '#00b8a0');
          // Left wing curving up-left
          const lx = px - (line.length - cl) * wSc - 16;
          const ly = py + r * wSc - 20 - (cl * 0.5);
          c.fillRect(lx, ly, wSc, wSc);
          // Right wing curving up-right (mirrored)
          const rx = px + (line.length - cl) * wSc + 16 - wSc;
          c.fillRect(rx, ly, wSc, wSc);
        }
      }
    }

    // Golden divine halo / aura rays rising above the world
    for (let i = -14; i <= 14; i += 2) {
      const rayH = Math.round(18 - Math.abs(i) * 0.9);
      c.fillStyle = Math.abs(i) < 4 ? '#ffffff' : (Math.abs(i) < 9 ? '#ffd040' : '#ff9820');
      c.fillRect(px + i * 2, py - 18 - rayH, 2, rayH);
    }

    // The Wrapped Planet Body (16x16 pixel disk)
    const planetR = 11;
    for (let dy = -planetR; dy <= planetR; dy++) {
      for (let dx = -planetR; dx <= planetR; dx++) {
        const d2 = dx * dx + dy * dy;
        if (d2 <= planetR * planetR) {
          if (dy > -3 && dy < 5 && (dx > -7 && dx < 2 || dx > 4)) {
            c.fillStyle = '#2ea055'; // green continents
          } else if (dy < -6) {
            c.fillStyle = '#f0f8ff'; // polar ice cap
          } else {
            c.fillStyle = '#183870'; // deep blue ocean
          }
          c.fillRect(px + dx * 2, py + dy * 2, 2, 2);
        }
      }
    }

    // Planet atmosphere rim highlight
    for (let a = 0; a < Math.PI * 2; a += 0.1) {
      const rx = Math.round(Math.cos(a) * (planetR * 2 + 1));
      const ry = Math.round(Math.sin(a) * (planetR * 2 + 1));
      if (Math.cos(a) < 0.25) {
        c.fillStyle = '#00ffcc';
        c.fillRect(px + rx, py + ry, 2, 2);
      }
    }

    // Golden Reincarnation Orbital Ring tilted around planet
    for (let a = 0; a < Math.PI * 2; a += 0.08) {
      const ringRadX = 34;
      const ringRadY = 9;
      const tilt = -0.28;
      const unrotX = Math.cos(a) * ringRadX;
      const unrotY = Math.sin(a) * ringRadY;
      const rx = Math.round(unrotX * Math.cos(tilt) - unrotY * Math.sin(tilt));
      const ry = Math.round(unrotX * Math.sin(tilt) + unrotY * Math.cos(tilt));
      if (Math.sin(a) > 0 || Math.abs(rx) > planetR * 2 - 2) {
        c.fillStyle = Math.sin(a) > 0.5 ? '#fff8d0' : '#ffd040';
        c.fillRect(px + rx, py + ry, 2, 2);
      }
    }

    // 2. Render each chunky letter of VIVARIUM
    let curX = startX;
    for (let i = 0; i < word.length; i++) {
      drawChunkyLetter(word[i], curX, startY, scale);
      curX += widths[i] + spacing;
    }

    // 3. Subtitle: "THE REINCARNATION PROTOCOL"
    tx(c, 'THE REINCARNATION PROTOCOL', W / 2, startY + 62, '#00ffcc', 2, true, 'c');

    // 4. Tech / Runic Divider line with gold diamond
    const divY = startY + 82;
    c.fillStyle = '#ffd040';
    c.fillRect(W / 2 - 3, divY - 2, 7, 5);
    c.fillStyle = '#00ffcc';
    c.fillRect(W / 2 - 9, divY, 4, 1);
    c.fillRect(W / 2 + 6, divY, 4, 1);
    c.fillStyle = '#3a2e58';
    c.fillRect(W / 2 - 160, divY, 144, 1);
    c.fillRect(W / 2 + 16, divY, 144, 1);

    // 5. Ground Islands for the Heroes!
    // Left Island: Floating Overworld Grass/Dirt Island (under Wizard and Knight)
    const leftIslandX = startX - 165;
    const islandY = startY + 54;
    // Green grass top
    c.fillStyle = '#3ca048';
    c.fillRect(leftIslandX, islandY, 130, 4);
    c.fillStyle = '#227030';
    c.fillRect(leftIslandX, islandY + 4, 130, 2);
    // Brown dirt base
    c.fillStyle = '#5a3818';
    c.fillRect(leftIslandX + 6, islandY + 6, 118, 6);
    c.fillStyle = '#3a200a';
    c.fillRect(leftIslandX + 16, islandY + 12, 98, 4);
    c.fillRect(leftIslandX + 32, islandY + 16, 66, 3);
    // Grass blades
    c.fillStyle = '#60e060';
    for (let i = 0; i < 130; i += 6) c.fillRect(leftIslandX + i, islandY - 2, 2, 2);

    // Right Island: Floating Celestial Cloud / Marble Ruin (under Liberator and Archangel)
    const rightIslandX = startX + totalW + 35;
    // Golden marble / white cloud top
    c.fillStyle = '#e8e8f8';
    c.fillRect(rightIslandX, islandY, 130, 4);
    c.fillStyle = '#ffd040';
    c.fillRect(rightIslandX, islandY + 4, 130, 2);
    // Deep marble / cloud underbelly
    c.fillStyle = '#3a3258';
    c.fillRect(rightIslandX + 6, islandY + 6, 118, 6);
    c.fillStyle = '#1c1634';
    c.fillRect(rightIslandX + 16, islandY + 12, 98, 4);
    c.fillRect(rightIslandX + 32, islandY + 16, 66, 3);
    // Celestial spark crests
    c.fillStyle = '#00ffcc';
    for (let i = 0; i < 130; i += 8) c.fillRect(rightIslandX + i, islandY - 2, 2, 2);

    // 6. Flanking Heroes from the 1.4 Million Sprite System!
    if (Sprites && Sprites.proc) {
      // Left Flank: Knight & Wizard standing on the overworld island
      const knight = Sprites.proc.getBySubject('golden knight') || Sprites.proc.getBySubject('knight');
      if (knight) {
        drawSpr(c, knight, startX - 55, islandY, 4, { plain: 1 });
        // Golden sword blade sparkle
        c.fillStyle = '#ffd040';
        c.fillRect(startX - 27, islandY - 42, 4, 4);
        c.fillRect(startX - 23, islandY - 32, 3, 3);
      }
      const wizard = Sprites.proc.getBySubject('wizard');
      if (wizard) {
        drawSpr(c, wizard, startX - 125, islandY, 3.8, { plain: 1 });
        // Magic orb spark
        c.fillStyle = '#60e0ff';
        c.fillRect(startX - 100, islandY - 38, 4, 4);
      }

      // Right Flank: The Liberator & The Holy Archangel standing on the celestial island
      const liberator = Sprites.proc.getBySubject('teal liberator') || Sprites.proc.getBySubject('liberator');
      if (liberator) {
        drawSpr(c, liberator, startX + totalW + 55, islandY, 4, { plain: 1, flip: -1 });
        // Teal celestial sparks
        c.fillStyle = '#00ffcc';
        c.fillRect(startX + totalW + 27, islandY - 42, 4, 4);
        c.fillRect(startX + totalW + 23, islandY - 32, 3, 3);
      }
      const angel = Sprites.proc.getBySubject('holy angel') || Sprites.proc.getBySubject('golden angel');
      if (angel) {
        drawSpr(c, angel, startX + totalW + 125, islandY, 3.8, { plain: 1, flip: -1 });
        c.fillStyle = '#ffd040';
        c.fillRect(startX + totalW + 100, islandY - 38, 4, 4);
      }

      // Floating loot/artifacts around the islands:
      const coin = Sprites.proc.getBySubject('golden coin');
      if (coin) drawSpr(c, coin, startX - 25, islandY - 10, 2, { plain: 1 });
      const gem = Sprites.proc.getBySubject('ruby gem');
      if (gem) drawSpr(c, gem, startX - 155, islandY - 12, 2, { plain: 1 });

      const crystal = Sprites.proc.getBySubject('crystal crystal') || Sprites.proc.getBySubject('void crystal');
      if (crystal) drawSpr(c, crystal, startX + totalW + 25, islandY - 10, 2, { plain: 1 });
      const key = Sprites.proc.getBySubject('golden key');
      if (key) drawSpr(c, key, startX + totalW + 155, islandY - 12, 2, { plain: 1 });
    }

    return cv.toDataURL('image/png');
  });

  const bannerBuf = Buffer.from(dataUrl.split(',')[1], 'base64');
  fs.writeFileSync('itch-assets/banner_vivarium.png', bannerBuf);
  console.log('Saved itch-assets/banner_vivarium.png');

  const previewPath = 'C:/Users/alimz/.gemini/antigravity/brain/c6d3944d-e1c1-462b-bf65-04de3132e188/masterpiece_v2_preview.png';
  fs.writeFileSync(previewPath, bannerBuf);
  console.log('Saved inspection preview to:', previewPath);

  await browser.close();
}

buildMasterpieceBannerV2().catch(console.error);
