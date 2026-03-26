import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { PORTFOLIO_CONFIG } from '../../data/portfolio-config';
import { ZONES, CLOUDS, ZoneData, SignData } from '../../data/world-data';
import Loader from '../../../../../../../core/loader';

interface SignSprite {
  container: Container;
  data: SignData;
  worldX: number;
  indicator: Container;
}

export default class WorldBuilder {
  private groundLayer: Container;
  private decorationLayer: Container;
  private backgroundLayer: Container;
  private signSprites: SignSprite[];
  private groundTiles: Graphics[];
  private pulseTimer: number = 0;
  private ytScreen: Graphics | null = null;
  private ytScreenTimer: number = 0;
  private cameraLight: Graphics | null = null;
  private cameraPreview: Graphics | null = null;
  private cameraPreviewActive: boolean = false;
  private cameraFlashTimer: number = 0;
  private cameraFlash: Graphics | null = null;
  private labTable: Graphics | null = null;
  private genomeSequencer: Graphics | null = null;

  constructor(groundLayer: Container, decorationLayer: Container, backgroundLayer: Container) {
    this.groundLayer = groundLayer;
    this.decorationLayer = decorationLayer;
    this.backgroundLayer = backgroundLayer;
    this.signSprites = [];
    this.groundTiles = [];

    this.build();
  }

  public getSignSprites(): SignSprite[] {
    return this.signSprites;
  }

  public update(dt: number, playerWorldX: number = -1): void {
    this.pulseTimer += dt * 5;
    const billboardRange = 25;
    for (const sign of this.signSprites) {
      const near = playerWorldX >= 0 && Math.abs(playerWorldX - sign.worldX) <= billboardRange;
      sign.indicator.visible = near;
      if (near) {
        sign.indicator.alpha = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(this.pulseTimer));
      }
    }

    // Animate yt-screen — funny cat videos on loop
    if (this.ytScreen) {
      this.ytScreenTimer += dt;
      const timer = this.ytScreenTimer;
      const g = this.ytScreen;
      g.clear();
      this.drawYtScreenFrame(g);

      const videoDuration = 5.0;
      const videoCount = 3;
      const videoIndex = Math.floor(timer / videoDuration) % videoCount;
      const videoTime = timer % videoDuration;
      const progressWidth = Math.floor((videoTime / videoDuration) * 20);

      // Screen background
      g.rect(2, 2, 20, 11).fill(0x6699BB);

      this.drawCatVideo(g, videoIndex, videoTime);

      // Progress bar track
      g.rect(2, 12, 20, 1).fill(0x444444);
      // Red progress bar
      if (progressWidth > 0) {
        g.rect(2, 12, progressWidth, 1).fill(0xFF0000);
      }
    }

    // Camera recording dot blink — faster when player is in filming area
    const inFilmingArea = playerWorldX >= 488 && playerWorldX <= 525;
    if (this.cameraLight) {
      const blinkSpeed = inFilmingArea ? 1.6 : 0.8;
      this.cameraLight.alpha = 0.5 + 0.5 * Math.sin(this.pulseTimer * blinkSpeed);
    }

    // Camera preview monitor
    if (this.cameraPreview) {
      const g = this.cameraPreview;
      g.clear();
      // Bezel
      g.rect(0, 0, 22, 16).fill(0x333333);
      // Stand arm
      g.rect(9, 15, 4, 2).fill(0x444444);
      g.rect(6, 16, 10, 2).fill(0x444444);

      if (inFilmingArea) {
        // Screen on — beach background (green screen effect)
        // Sky
        g.rect(2, 1, 18, 7).fill(0x54C4F0);
        // Sun
        g.rect(16, 2, 3, 3).fill(0xFFDD44);
        g.rect(15, 3, 1, 1).fill(0xFFDD44);
        g.rect(19, 3, 1, 1).fill(0xFFDD44);
        // Cloud
        g.rect(5, 2, 4, 1).fill(0xFFFFFF);
        g.rect(6, 1, 2, 1).fill(0xFFFFFF);
        // Ocean
        g.rect(2, 8, 18, 2).fill(0x2288CC);
        // Wave highlights
        g.rect(4, 8, 2, 1).fill(0x44AAEE);
        g.rect(10, 9, 3, 1).fill(0x44AAEE);
        g.rect(16, 8, 2, 1).fill(0x44AAEE);
        // Sand
        g.rect(2, 10, 18, 4).fill(0xE8D68C);
        // Wet sand near water
        g.rect(2, 10, 18, 1).fill(0xC4B078);
        // Palm tree
        g.rect(4, 7, 1, 5).fill(0x8B6914);
        g.rect(2, 5, 2, 2).fill(0x33AA33);
        g.rect(4, 5, 2, 1).fill(0x33AA33);
        g.rect(5, 6, 2, 1).fill(0x33AA33);
        g.rect(3, 4, 1, 1).fill(0x33AA33);

        // Map player worldX (488–525) → screen X (3–16)
        const px = 3 + Math.round(((playerWorldX - 488) / 37) * 13);
        // Mini player (~6px tall)
        g.rect(px, 6, 2, 1).fill(0x1A1A1A);       // Hair
        g.rect(px + 2, 6, 1, 1).fill(0xFF4466);    // Pink ponytail
        g.rect(px, 7, 2, 1).fill(0xC68642);        // Head
        g.rect(px, 8, 2, 3).fill(0x1C1C1C);        // Body/legs

        // Blinking REC dot
        const recAlpha = Math.sin(this.pulseTimer * 1.2) > 0 ? 1 : 0;
        if (recAlpha > 0) {
          g.rect(3, 2, 2, 2).fill(0xFF0000);
        }

        if (!this.cameraPreviewActive) {
          this.cameraPreviewActive = true;
          this.cameraFlashTimer = 3.5; // flash fires almost immediately on entry
        }
      } else {
        // Screen off — dark
        g.rect(2, 1, 18, 13).fill(0x222233);
        this.cameraPreviewActive = false;
      }
    }

    // Camera flash effect
    if (inFilmingArea && this.cameraFlash) {
      this.cameraFlashTimer += dt;
      if (this.cameraFlashTimer >= 4.0) {
        this.cameraFlashTimer = 0;
      }
      // Flash fires in the last 0.15s of each 4s cycle
      const flashStart = 4.0 - 0.15;
      if (this.cameraFlashTimer >= flashStart) {
        const flashProgress = (this.cameraFlashTimer - flashStart) / 0.15;
        // Ramp up then down: peak at 0.3 of the flash duration
        this.cameraFlash.alpha = flashProgress < 0.3 ? (flashProgress / 0.3) * 0.8 : 0.8 * (1 - (flashProgress - 0.3) / 0.7);
      } else {
        this.cameraFlash.alpha = 0;
      }
    } else if (this.cameraFlash) {
      this.cameraFlash.alpha = 0;
    }

    // Lab table — animated bubbling liquid in test tubes and flask
    if (this.labTable) {
      const lg = this.labTable;
      const h = 22;
      const t = this.pulseTimer;
      // Redraw animated parts — flask liquid and test tube liquids
      // Erlenmeyer flask liquid — bubbles rising
      const flaskLiquidY = h - 15;
      const bubble1Y = flaskLiquidY + 2 - (t * 0.6 % 4);
      const bubble2Y = flaskLiquidY + 4 - ((t * 0.6 + 2) % 4);
      lg.rect(14, h - 15, 6, 4).fill(0x2E3640); // clear flask area
      lg.rect(14, h - 15, 6, 4).fill({ color: 0xBB66FF, alpha: 0.5 }); // purple liquid
      if (bubble1Y > flaskLiquidY && bubble1Y < flaskLiquidY + 3) {
        lg.circle(16, bubble1Y, 0.8).fill({ color: 0xFFFFFF, alpha: 0.7 });
      }
      if (bubble2Y > flaskLiquidY && bubble2Y < flaskLiquidY + 3) {
        lg.circle(18, bubble2Y, 0.8).fill({ color: 0xFFFFFF, alpha: 0.7 });
      }
      // Test tube liquids — levels bob up and down
      const bob1 = Math.floor(Math.sin(t * 0.8) * 2);
      const bob2 = Math.floor(Math.sin(t * 0.8 + 2) * 2);
      const bob3 = Math.floor(Math.sin(t * 0.8 + 4) * 2);
      // Clear and redraw tube contents
      lg.rect(25, h - 17, 2, 5).fill(0x2E3640);
      lg.rect(29, h - 17, 2, 5).fill(0x2E3640);
      lg.rect(33, h - 17, 2, 5).fill(0x2E3640);
      lg.rect(25, h - 14 + bob1, 2, 4 - bob1).fill({ color: 0x66FF66, alpha: 0.6 });
      lg.rect(29, h - 14 + bob2, 2, 4 - bob2).fill({ color: 0xFF6688, alpha: 0.6 });
      lg.rect(33, h - 14 + bob3, 2, 4 - bob3).fill({ color: 0x66CCFF, alpha: 0.6 });
    }

    // Genome sequencer — scrolling colored base-pair bars
    if (this.genomeSequencer) {
      const sg = this.genomeSequencer;
      const w = 18;
      const h = 26;
      const standH = 5;
      const bezelY = 2;
      const bezelH = h - standH - 2;
      const screenX = 2;
      const screenY = bezelY + 2;
      const screenW = w - 4;
      const screenH = bezelH - 4;
      // Clear screen area
      sg.rect(screenX, screenY, screenW, screenH).fill(0x112211);
      // Base pair colors: A=green, T=red, G=yellow, C=blue
      const baseColors = [0x44CC44, 0xCC4444, 0xCCCC44, 0x4488CC];
      const barH = 2;
      const scrollOffset = Math.floor(this.pulseTimer * 0.6) % barH;
      const numBars = Math.ceil(screenH / barH) + 1;
      for (let i = 0; i < numBars; i++) {
        const barY = screenY + i * barH - scrollOffset;
        if (barY + barH <= screenY || barY >= screenY + screenH) continue;
        // Deterministic color per bar based on index + scroll
        const colorIdx = (i + Math.floor(this.pulseTimer * 0.6 / barH)) % baseColors.length;
        const barWidth = 3 + ((i * 7 + colorIdx * 3) % (screenW - 3));
        const clippedY = Math.max(barY, screenY);
        const clippedH = Math.min(barY + barH, screenY + screenH) - clippedY;
        if (clippedH > 0) {
          sg.rect(screenX, clippedY, barWidth, clippedH).fill(baseColors[colorIdx]);
        }
      }
    }
  }

  public cullTiles(visibleLeft: number, visibleRight: number): void {
    const tileSize = PORTFOLIO_CONFIG.world.tileSize;
    const buffer = tileSize;

    for (const tile of this.groundTiles) {
      const tileX = tile.x;
      tile.visible = tileX + tileSize >= visibleLeft - buffer && tileX <= visibleRight + buffer;
    }
  }

  private build(): void {
    this.buildClouds();
    this.buildSkyline();
    this.buildGround();
    this.buildDecorations();
    this.buildEndZone();
  }

  private buildClouds(): void {
    for (const cloud of CLOUDS) {
      const g = new Graphics();
      g.roundRect(0, 0, cloud.width, cloud.height, 3).fill(0xDDDDDD);
      g.x = cloud.worldX;
      g.y = cloud.worldY;
      this.backgroundLayer.addChild(g);
    }

    // Hills — drawn after clouds so they appear in front
    const hills = new Graphics();
    hills.rect(0, 60, PORTFOLIO_CONFIG.world.width, 30).fill(0xBBCCBB);
    for (let hx = 0; hx < PORTFOLIO_CONFIG.world.width; hx += 80) {
      const hillH = 15 + Math.sin(hx * 0.03) * 10;
      hills.ellipse(hx + 40, 60, 50, hillH).fill(0xAABBAA);
    }
    this.backgroundLayer.addChild(hills);
  }

  private buildSkyline(): void {
    const groundY = 128;
    const soft = 0xCCDDEE;
    const g = new Graphics();

    // === Simplified SF Skyline (bgX ~400–552) ===
    // Light, subtle silhouettes that don't compete with foreground

    g.rect(400, groundY - 18, 12, 18).fill(soft);
    g.rect(416, groundY - 28, 10, 28).fill(soft);
    // Transamerica Pyramid — simple triangle
    g.moveTo(437, groundY - 42).lineTo(430, groundY).lineTo(444, groundY).closePath().fill(soft);
    g.rect(450, groundY - 32, 12, 32).fill(soft);
    // Salesforce Tower
    g.roundRect(470, groundY - 48, 8, 48, 3).fill(soft);
    g.rect(484, groundY - 24, 14, 24).fill(soft);
    g.rect(504, groundY - 34, 10, 34).fill(soft);
    g.rect(520, groundY - 16, 14, 16).fill(soft);

    // === Golden Gate Bridge (bgX ~610–700) ===
    const red = 0xCC5533;
    const darkRed = 0xAA3311;

    // Left tower — Art Deco stepped profile
    g.rect(620, groundY - 60, 6, 60).fill(red);
    g.rect(618, groundY - 60, 10, 3).fill(red);
    g.rect(619, groundY - 42, 8, 3).fill(darkRed);
    // Right tower
    g.rect(686, groundY - 60, 6, 60).fill(red);
    g.rect(684, groundY - 60, 10, 3).fill(red);
    g.rect(685, groundY - 42, 8, 3).fill(darkRed);

    // Main cable — two parallel catenary lines for thickness
    const cL = 623;
    const cR = 689;
    const cTopY = groundY - 58;
    const cMidY = groundY - 36;
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const x = cL + (cR - cL) * t;
      const droop = 4 * t * (1 - t);
      const y = cTopY + (cMidY - cTopY) * droop;
      g.rect(Math.round(x), Math.round(y), 2, 2).fill(red);

      // Vertical suspender cables every few steps
      if (i > 0 && i < 14 && i % 2 === 0) {
        const deckTop = groundY - 22;
        g.rect(Math.round(x), Math.round(y) + 2, 1, deckTop - Math.round(y) - 2).fill(red);
      }
    }

    // Road deck — two-tone for depth
    g.rect(616, groundY - 22, 80, 2).fill(darkRed);
    g.rect(616, groundY - 20, 80, 3).fill(red);
    // Top railing
    g.rect(616, groundY - 24, 80, 1).fill(red);
    // Bottom railing
    g.rect(616, groundY - 17, 80, 1).fill(darkRed);

    this.backgroundLayer.addChild(g);
  }

  private buildGround(): void {
    const tileSize = PORTFOLIO_CONFIG.world.tileSize;
    const groundY = PORTFOLIO_CONFIG.world.groundY;
    const worldWidth = PORTFOLIO_CONFIG.world.width + 100; // extra for ending area

    for (let x = 0; x < worldWidth; x += tileSize) {
      const zone = this.getZoneAtX(x);
      const topColor = zone ? zone.groundTopColor : 0x909090;
      const fillColor = zone ? zone.groundColor : 0xC0C0C0;

      // Top ground tile
      const topTile = new Graphics();
      topTile.rect(0, 0, tileSize, tileSize).fill(topColor);
      topTile.x = x;
      topTile.y = groundY;
      this.groundLayer.addChild(topTile);
      this.groundTiles.push(topTile);

      // Fill tile below
      const fillTile = new Graphics();
      fillTile.rect(0, 0, tileSize, tileSize).fill(fillColor);
      fillTile.x = x;
      fillTile.y = groundY + tileSize;
      this.groundLayer.addChild(fillTile);
      this.groundTiles.push(fillTile);
    }
  }

  private buildDecorations(): void {
    for (const zone of ZONES) {
      for (const dec of zone.decorations) {
        const g = new Graphics();
        const decY = PORTFOLIO_CONFIG.world.groundY - dec.height;

        if (dec.type === 'arch-building') {
          // Main sandstone body
          g.rect(0, 0, dec.width, dec.height).fill(dec.color);
          // Red tile roof strip
          g.rect(-2, -3, dec.width + 4, 4).fill(0xB22222);
          // Three arched openings along the bottom
          const archCount = 3;
          const archW = 8;
          const archH = 12;
          const archSpacing = Math.floor(dec.width / (archCount + 1));
          for (let i = 0; i < archCount; i++) {
            const ax = archSpacing * (i + 1) - Math.floor(archW / 2);
            const ay = dec.height - archH;
            // Rectangle opening
            g.rect(ax, ay, archW, archH).fill(0x4A3728);
            // Half-circle arch top
            g.circle(ax + Math.floor(archW / 2), ay, Math.floor(archW / 2)).fill(0x4A3728);
          }
          // Row of small square windows above the arches
          const winY = dec.height - archH - 10;
          for (let wx = 4; wx < dec.width - 4; wx += 8) {
            g.rect(wx, winY, 3, 3).fill(0xFFFF99);
          }
        } else if (dec.type === 'tower') {
          // Tall narrow tower body (Hoover Tower)
          g.rect(0, 0, dec.width, dec.height).fill(dec.color);
          // Pointed cap at the top
          g.moveTo(Math.floor(dec.width / 2), -8)
            .lineTo(dec.width + 2, 0)
            .lineTo(-2, 0)
            .closePath()
            .fill(dec.color - 0x111111);
          // Observation deck near the top
          g.rect(-3, 6, dec.width + 6, 4).fill(dec.color - 0x222222);
          // Window slits
          const slitX = Math.floor(dec.width / 2) - 1;
          g.rect(slitX, 14, 2, 6).fill(0xFFFF99);
          g.rect(slitX, 26, 2, 6).fill(0xFFFF99);
          g.rect(slitX, 38, 2, 6).fill(0xFFFF99);
        } else if (dec.type === 'building') {
          // Main structure
          g.rect(0, 0, dec.width, dec.height).fill(dec.color);
          // Roof
          g.rect(-2, -3, dec.width + 4, 4).fill(dec.color - 0x222222);
          // Windows
          const windowSize = 4;
          const windowGap = 6;
          const windowColor = 0xFFFF99;
          for (let wy = 6; wy < dec.height - 8; wy += windowGap + windowSize) {
            for (let wx = 4; wx < dec.width - 4; wx += windowGap + windowSize) {
              g.rect(wx, wy, windowSize, windowSize).fill(windowColor);
            }
          }
          // Door
          g.rect(Math.floor(dec.width / 2) - 3, dec.height - 8, 6, 8).fill(0x8B4513);
        } else if (dec.type === 'tree') {
          // Trunk
          const trunkW = Math.max(2, Math.floor(dec.width / 4));
          const trunkH = Math.floor(dec.height / 3);
          g.rect(Math.floor(dec.width / 2) - Math.floor(trunkW / 2), dec.height - trunkH, trunkW, trunkH).fill(0x8B4513);
          // Canopy
          const canopyH = dec.height - trunkH;
          g.ellipse(Math.floor(dec.width / 2), Math.floor(canopyH / 2), Math.floor(dec.width / 2), Math.floor(canopyH / 2)).fill(dec.color);
        } else if (dec.type === 'lamp') {
          // Pole
          g.rect(Math.floor(dec.width / 2) - 1, 4, 2, dec.height - 4).fill(0x666666);
          // Light
          g.circle(Math.floor(dec.width / 2), 3, 3).fill(dec.color);
        } else if (dec.type === 'flag') {
          // Pole
          g.rect(0, 0, 2, dec.height).fill(0x888888);
          // Flag cloth
          g.rect(2, 2, dec.width - 2, 8).fill(dec.color);
        } else if (dec.type === 'palm-tree') {
          const cx = Math.floor(dec.width / 2);
          const crownY = Math.floor(dec.height * 0.3);
          // Trunk — slight taper: wider at base, thinner at top
          g.moveTo(cx - 2, dec.height)
            .lineTo(cx + 2, dec.height)
            .lineTo(cx + 1, crownY + 2)
            .lineTo(cx - 1, crownY + 2)
            .closePath()
            .fill(0x8B6914);
          // Trunk segments (horizontal lines for texture)
          for (let ty = crownY + 6; ty < dec.height - 2; ty += 4) {
            g.rect(cx - 2, ty, 4, 1).fill(0x705410);
          }
          // Drooping fronds — 5 leaf shapes fanning out
          const frondColor = dec.color;
          const frondLen = Math.floor(dec.height * 0.38);
          const angles = [-2.4, -1.3, -0.2, 0.9, 2.0]; // fan spread
          for (const angle of angles) {
            const tipX = cx + Math.round(Math.sin(angle) * frondLen);
            const tipY = crownY - Math.round(Math.cos(angle) * frondLen * 0.5);
            const midX = cx + Math.round(Math.sin(angle) * frondLen * 0.5);
            const midY = crownY - Math.round(Math.cos(angle) * frondLen * 0.35);
            // Each frond: a triangle from crown to tip with slight width
            g.moveTo(cx, crownY)
              .lineTo(midX - Math.round(Math.cos(angle) * 2), midY - Math.round(Math.sin(angle) * 2))
              .lineTo(tipX, tipY)
              .lineTo(midX + Math.round(Math.cos(angle) * 2), midY + Math.round(Math.sin(angle) * 2))
              .closePath()
              .fill(frondColor);
          }
          // Coconut cluster at the crown
          g.circle(cx - 1, crownY + 1, 1.5).fill(0x8B6914);
          g.circle(cx + 1, crownY + 1, 1.5).fill(0x8B6914);
        } else if (dec.type === 'yt-headquarters') {
          const w = dec.width;
          const h = dec.height;
          // Main building body
          g.rect(0, 0, w, h).fill(dec.color);
          // Flat dark roof strip
          g.rect(-1, -3, w + 2, 4).fill(0x555555);
          // Tinted window panels — 2 rows
          const winW = 8;
          const winH = 6;
          for (let row = 0; row < 2; row++) {
            const wy = 6 + row * 14;
            for (let wx = 5; wx + winW < w - 2; wx += winW + 3) {
              g.rect(wx, wy, winW, winH).fill(0x88AACC);
            }
          }
          // RED play-button triangle centered on facade
          const cx = Math.floor(w / 2);
          const cy = Math.floor(h / 2) + 2;
          const triSize = 7;
          // Red rounded rectangle background
          g.roundRect(cx - triSize - 3, cy - triSize - 1, triSize * 2 + 6, triSize * 2 + 2, 3).fill(0xFF0000);
          // White play triangle
          g.moveTo(cx - Math.floor(triSize * 0.5), cy - triSize + 2)
            .lineTo(cx + Math.floor(triSize * 0.7), cy)
            .lineTo(cx - Math.floor(triSize * 0.5), cy + triSize - 2)
            .closePath()
            .fill(0xFFFFFF);
          // Glass door at bottom center
          g.rect(cx - 4, h - 10, 8, 10).fill(0x88AACC);
          g.rect(cx, h - 10, 1, 10).fill(0x6688AA);
        } else if (dec.type === 'google-bike') {
          const blk = 0x111111;
          const frm = dec.color;
          // Pixel-art bike — all rects for chunky blocky look
          // Left wheel (pixel octagon)
          g.rect(2, 5, 3, 1).fill(blk);
          g.rect(1, 6, 1, 1).fill(blk);
          g.rect(5, 6, 1, 1).fill(blk);
          g.rect(0, 7, 1, 2).fill(blk);
          g.rect(6, 7, 1, 2).fill(blk);
          g.rect(1, 9, 1, 1).fill(blk);
          g.rect(5, 9, 1, 1).fill(blk);
          g.rect(2, 10, 3, 1).fill(blk);
          // Right wheel (same shape, offset +9)
          g.rect(11, 5, 3, 1).fill(blk);
          g.rect(10, 6, 1, 1).fill(blk);
          g.rect(14, 6, 1, 1).fill(blk);
          g.rect(9, 7, 1, 2).fill(blk);
          g.rect(15, 7, 1, 2).fill(blk);
          g.rect(10, 9, 1, 1).fill(blk);
          g.rect(14, 9, 1, 1).fill(blk);
          g.rect(11, 10, 3, 1).fill(blk);
          // Frame — top tube
          g.rect(5, 3, 6, 1).fill(frm);
          // Seat tube (down-left diagonal)
          g.rect(4, 4, 2, 1).fill(frm);
          g.rect(3, 5, 2, 1).fill(frm);
          g.rect(2, 6, 2, 1).fill(frm);
          // Down tube (down-right diagonal)
          g.rect(10, 4, 2, 1).fill(frm);
          g.rect(11, 5, 2, 1).fill(frm);
          g.rect(12, 6, 2, 1).fill(frm);
          // Chain stay (bottom horizontal)
          g.rect(3, 7, 10, 1).fill(frm);
          // Seat (black)
          g.rect(4, 1, 3, 1).fill(blk);
          g.rect(5, 2, 1, 1).fill(blk);
          // Handlebar (black)
          g.rect(11, 1, 1, 2).fill(blk);
          g.rect(10, 2, 3, 1).fill(blk);
        } else if (dec.type === 'android-statue') {
          const w = dec.width;
          const h = dec.height;
          const bodyW = w - 2;
          const bodyH = Math.floor(h * 0.45);
          const bodyX = 1;
          const bodyY = Math.floor(h * 0.3);
          const green = dec.color;
          // Body — rounded rectangle
          g.roundRect(bodyX, bodyY, bodyW, bodyH, 2).fill(green);
          // Head — semicircle on top of body
          const headR = Math.floor(bodyW / 2);
          g.arc(Math.floor(w / 2), bodyY, headR, Math.PI, 0).fill(green);
          // Eyes — two small white dots
          g.circle(Math.floor(w / 2) - 2, bodyY - Math.floor(headR * 0.4), 1).fill(0xFFFFFF);
          g.circle(Math.floor(w / 2) + 2, bodyY - Math.floor(headR * 0.4), 1).fill(0xFFFFFF);
          // Antennae
          g.moveTo(Math.floor(w / 2) - 2, bodyY - headR + 2)
            .lineTo(Math.floor(w / 2) - 3, bodyY - headR - 2)
            .stroke({ color: green, width: 1 });
          g.moveTo(Math.floor(w / 2) + 2, bodyY - headR + 2)
            .lineTo(Math.floor(w / 2) + 3, bodyY - headR - 2)
            .stroke({ color: green, width: 1 });
          // Arms — small rectangles on sides
          g.roundRect(bodyX - 2, bodyY + 2, 2, bodyH - 4, 1).fill(green);
          g.roundRect(bodyX + bodyW, bodyY + 2, 2, bodyH - 4, 1).fill(green);
          // Legs — two small rectangles at bottom
          g.roundRect(bodyX + 1, bodyY + bodyH, 2, 4, 1).fill(green);
          g.roundRect(bodyX + bodyW - 3, bodyY + bodyH, 2, 4, 1).fill(green);
        } else if (dec.type === 'food-cart') {
          const w = dec.width;
          const h = dec.height;
          const cartH = Math.floor(h * 0.5);
          const cartY = h - cartH - 3;
          // Cart body
          g.rect(1, cartY, w - 2, cartH).fill(dec.color);
          // Serving window
          g.rect(3, cartY + 2, w - 6, Math.floor(cartH * 0.5)).fill(0xFFFFDD);
          // Wheels
          g.circle(4, h - 1, 2).fill(0x555555);
          g.circle(w - 4, h - 1, 2).fill(0x555555);
          // Awning — striped canopy on top
          const awningY = cartY - 4;
          const awningH = 4;
          g.rect(0, awningY, w, awningH).fill(0xCC3333);
          // White stripes
          for (let sx = 0; sx < w; sx += 4) {
            g.rect(sx, awningY, 2, awningH).fill(0xFFFFFF);
          }
          // Awning support poles
          g.rect(1, awningY, 1, cartY - awningY + 2).fill(0x8B6914);
          g.rect(w - 2, awningY, 1, cartY - awningY + 2).fill(0x8B6914);
        } else if (dec.type === 'sofa') {
          const w = dec.width;
          const h = dec.height;
          const fabric = dec.color;
          const darkFabric = 0x6B5010;
          // Short stubby legs
          g.rect(1, h - 2, 2, 2).fill(0x5C4A1E);
          g.rect(w - 3, h - 2, 2, 2).fill(0x5C4A1E);
          // Seat cushion
          g.roundRect(1, Math.floor(h * 0.5), w - 2, Math.floor(h * 0.35), 1).fill(fabric);
          // Backrest
          g.roundRect(1, 1, w - 2, Math.floor(h * 0.5), 1).fill(darkFabric);
          // Left armrest
          g.roundRect(0, Math.floor(h * 0.25), 2, Math.floor(h * 0.55), 1).fill(darkFabric);
          // Right armrest
          g.roundRect(w - 2, Math.floor(h * 0.25), 2, Math.floor(h * 0.55), 1).fill(darkFabric);
        } else if (dec.type === 'church') {
          const w = dec.width;
          const h = dec.height;
          const bodyH = Math.floor(h * 0.7);
          const bodyY = h - bodyH;
          // Main sandstone body
          g.rect(0, bodyY, w, bodyH).fill(dec.color);
          // Red roof strip at top of body
          g.rect(0, bodyY, w, 3).fill(0xB22222);
          // Triangular pediment above body
          g.moveTo(Math.floor(w / 2), 4)
            .lineTo(w, bodyY)
            .lineTo(0, bodyY)
            .closePath()
            .fill(0xC4A070);
          // Cross at the peak
          const crossX = Math.floor(w / 2);
          g.rect(crossX - 1, 0, 2, 6).fill(0xC4A070);    // vertical
          g.rect(crossX - 3, 2, 6, 2).fill(0xC4A070);    // horizontal
          // Central arch opening
          const archW = Math.floor(w * 0.28);
          const archH = Math.floor(bodyH * 0.5);
          const archX = Math.floor(w / 2) - Math.floor(archW / 2);
          const archY = h - archH;
          g.rect(archX, archY, archW, archH).fill(0x3A2718);
          g.circle(archX + Math.floor(archW / 2), archY, Math.floor(archW / 2)).fill(0x3A2718);
          // Small windows above arch
          const winY = bodyY + 5;
          g.rect(Math.floor(w * 0.2), winY, 3, 3).fill(0xFFFF99);
          g.rect(Math.floor(w * 0.75), winY, 3, 3).fill(0xFFFF99);
        } else if (dec.type === 'lab-building') {
          const w = dec.width;
          const h = dec.height;
          // Main building body — light gray-white
          g.rect(0, 0, w, h).fill(0xF0F0F5);
          // Lavender roof accent strip
          g.rect(-2, -3, w + 4, 4).fill(dec.color);
          // Rounded-corner lavender windows — 2 rows of 3
          const winW = 6;
          const winH = 5;
          const winGapX = Math.floor((w - 6 - winW * 3) / 2);
          for (let row = 0; row < 2; row++) {
            const wy = 6 + row * 11;
            for (let col = 0; col < 3; col++) {
              const wx = 3 + col * (winW + winGapX);
              g.roundRect(wx, wy, winW, winH, 1).fill(dec.color);
            }
          }
          // Glass door with divider
          const doorW = 8;
          const doorH = 10;
          const doorX = Math.floor(w / 2) - Math.floor(doorW / 2);
          g.rect(doorX, h - doorH, doorW, doorH).fill(0x88AACC);
          g.rect(doorX + Math.floor(doorW / 2), h - doorH, 1, doorH).fill(0x6688AA);
          // Tiny molecule "M" logo above door — 3 small lavender circles
          const logoY = h - doorH - 5;
          const logoCX = Math.floor(w / 2);
          g.circle(logoCX - 3, logoY, 1.5).fill(dec.color);
          g.circle(logoCX, logoY - 2, 1.5).fill(dec.color);
          g.circle(logoCX + 3, logoY, 1.5).fill(dec.color);
        } else if (dec.type === 'microscope') {
          const charcoal = 0x242C32;
          const cx = Math.floor(dec.width / 2);
          // Rounded base
          g.roundRect(0, dec.height - 4, dec.width, 4, 2).fill(charcoal);
          // Vertical pillar
          g.rect(cx - 1, 6, 3, dec.height - 10).fill(charcoal);
          // Arm extending right with specimen stage
          g.rect(cx, 10, 6, 2).fill(charcoal);
          // Specimen stage (small platform)
          g.rect(cx + 4, 12, 4, 2).fill(charcoal);
          // Angled eyepiece tube
          g.moveTo(cx - 1, 6)
            .lineTo(cx - 4, 0)
            .lineTo(cx - 2, 0)
            .lineTo(cx + 1, 6)
            .closePath()
            .fill(charcoal);
          // Eyepiece lens circle
          g.circle(cx - 3, 0, 2).fill(charcoal);
          // Green glowing dot on stage (active sample)
          g.circle(cx + 6, 12, 1.5).fill(0x66FF66);
        } else if (dec.type === 'dna-helix') {
          const lavender = 0xA2ABFB;
          const peach = 0xFADAB8;
          const green = 0xC3E5B2;
          const steps = 9;
          const stepH = Math.floor(dec.height / steps);
          const cx = Math.floor(dec.width / 2);
          const amplitude = Math.floor(dec.width / 2) - 1;
          // Two sinusoidal strands with connecting rungs
          for (let i = 0; i < steps; i++) {
            const y = i * stepH;
            const offset = Math.sin((i / steps) * Math.PI * 2) * amplitude;
            const x1 = cx + Math.round(offset);
            const x2 = cx - Math.round(offset);
            // Strand 1 (lavender) and strand 2 (peach)
            g.rect(x1, y, 2, stepH).fill(lavender);
            g.rect(x2, y, 2, stepH).fill(peach);
            // Green horizontal rung (base pair)
            if (i % 2 === 0) {
              const minX = Math.min(x1, x2);
              const maxX = Math.max(x1, x2);
              g.rect(minX + 1, y + Math.floor(stepH / 2), maxX - minX, 1).fill(green);
            }
          }
          // Dark pedestal at bottom
          g.rect(1, dec.height - 3, dec.width - 2, 3).fill(0x242C32);
        } else if (dec.type === 'genome-sequencer') {
          const w = dec.width;
          const h = dec.height;
          // Dark stand/pedestal at the bottom
          const standH = 5;
          const standW = 8;
          const cx = Math.floor(w / 2);
          g.rect(cx - Math.floor(standW / 2), h - standH, standW, standH).fill(0x242C32);
          // Monitor bezel (dark gray)
          const bezelY = 2;
          const bezelH = h - standH - 2;
          g.rect(0, bezelY, w, bezelH).fill(0x333344);
          // Screen area inside bezel (slightly inset)
          const screenX = 2;
          const screenY = bezelY + 2;
          const screenW = w - 4;
          const screenH = bezelH - 4;
          g.rect(screenX, screenY, screenW, screenH).fill(0x112211);
          // Store reference for animation
          this.genomeSequencer = g;
        } else if (dec.type === 'yc-logo') {
          const w = dec.width;
          const h = dec.height;
          const orange = dec.color;
          const white = 0xFFFFFF;
          // Dark pedestal/post (same style as molecule-logo)
          const postH = 4;
          const cx = Math.floor(w / 2);
          g.rect(cx - 3, h - postH, 6, postH).fill(0x242C32);
          // Orange rounded square background above the post
          const logoSize = h - postH;
          g.roundRect(0, 0, w, logoSize, 2).fill(orange);
          // "Y" on the left half — two diagonal strokes meeting at center, vertical stroke down
          const yMidX = Math.floor(w * 0.3);
          // Left arm of Y
          g.rect(yMidX - 3, 3, 2, 2).fill(white);
          g.rect(yMidX - 2, 5, 2, 2).fill(white);
          // Right arm of Y
          g.rect(yMidX + 1, 3, 2, 2).fill(white);
          g.rect(yMidX, 5, 2, 2).fill(white);
          // Vertical stem of Y
          g.rect(yMidX - 1, 7, 2, 4).fill(white);
          // "C" on the right half — vertical stroke with horizontal caps
          const cLeftX = Math.floor(w * 0.6);
          // Top horizontal bar
          g.rect(cLeftX, 3, 4, 2).fill(white);
          // Vertical left stroke
          g.rect(cLeftX, 3, 2, 8).fill(white);
          // Bottom horizontal bar
          g.rect(cLeftX, 9, 4, 2).fill(white);
        } else if (dec.type === 'planter-box') {
          const w = dec.width;
          const h = dec.height;
          // Peach-colored rounded rect planter
          g.roundRect(0, Math.floor(h * 0.3), w, Math.floor(h * 0.7), 2).fill(0xFADAB8);
          // Dark brown soil line
          g.rect(1, Math.floor(h * 0.3), w - 2, 2).fill(0x5C3A1E);
          // Three small green plant tufts with stems
          const turfY = Math.floor(h * 0.3);
          const stemH = 3;
          const positions = [3, Math.floor(w / 2), w - 3];
          for (const px of positions) {
            // Stem
            g.rect(px, turfY - stemH, 1, stemH).fill(0x228B22);
            // Leaf circle
            g.circle(px, turfY - stemH - 1, 2).fill(dec.color);
          }
        } else if (dec.type === 'lab-table') {
          const w = dec.width;
          const h = dec.height;
          // Table legs
          g.rect(2, h - 8, 2, 8).fill(0x555555);
          g.rect(w - 4, h - 8, 2, 8).fill(0x555555);
          // Table surface
          g.rect(0, h - 10, w, 3).fill(0x666666);
          // Beaker — left side
          g.rect(4, h - 18, 6, 8).fill({ color: 0x88CCFF, alpha: 0.5 });
          g.rect(3, h - 18, 8, 1).fill(0x99DDFF); // rim
          g.rect(5, h - 14, 4, 4).fill({ color: 0x66FF66, alpha: 0.6 }); // green liquid
          // Erlenmeyer flask — center
          g.moveTo(15, h - 18).lineTo(13, h - 11).lineTo(21, h - 11).lineTo(19, h - 18).closePath().fill({ color: 0x88CCFF, alpha: 0.5 });
          g.rect(15, h - 20, 4, 2).fill(0x99DDFF); // neck
          // Test tube rack — right side
          g.rect(24, h - 12, 10, 2).fill(0x8B6914); // rack bar
          // Three test tubes
          g.rect(25, h - 18, 2, 8).fill({ color: 0x88CCFF, alpha: 0.5 });
          g.rect(29, h - 18, 2, 8).fill({ color: 0x88CCFF, alpha: 0.5 });
          g.rect(33, h - 18, 2, 8).fill({ color: 0x88CCFF, alpha: 0.5 });
          // Store reference for animation
          this.labTable = g;
        } else if (dec.type === 'youtube-billboard' || dec.type === 'mantle-billboard' || dec.type === 'shepherd-billboard' || dec.type === 'stanford-billboard') {
          const w = dec.width;
          const h = dec.height;
          const boardW = w;
          const boardH = Math.floor(h * 0.55);
          const boardY = 0;
          const postTop = boardY + boardH - 2;
          const postBottom = h;
          // Two metal posts
          g.rect(6, postTop, 3, postBottom - postTop).fill(0x666666);
          g.rect(w - 9, postTop, 3, postBottom - postTop).fill(0x666666);
          // Post caps
          g.rect(5, postTop - 1, 5, 2).fill(0x777777);
          g.rect(w - 10, postTop - 1, 5, 2).fill(0x777777);
          // Billboard board
          g.rect(0, boardY, boardW, boardH).fill(dec.color);
          // Border frame
          const borderColor = dec.type === 'mantle-billboard' ? 0x1A1F26
            : dec.type === 'youtube-billboard' ? 0xCCCCCC : 0x333333;
          g.rect(0, boardY, boardW, 1).fill(borderColor);
          g.rect(0, boardY + boardH - 1, boardW, 1).fill(borderColor);
          g.rect(0, boardY, 1, boardH).fill(borderColor);
          g.rect(boardW - 1, boardY, 1, boardH).fill(borderColor);
          // Logo sprite
          const assetKey = dec.type === 'youtube-billboard' ? 'assets/other/youtube'
            : dec.type === 'mantle-billboard' ? 'assets/other/mantle-logo'
            : dec.type === 'stanford-billboard' ? 'assets/other/stanford' : 'assets/other/shepherd-logo';
          const tex = Loader.assets[assetKey] as Texture;
          if (tex) {
            if (dec.type === 'shepherd-billboard') {
              tex.source.scaleMode = 'linear';
            }
            const logo = new Sprite(tex);
            const padding = 2;
            const availW = boardW - padding * 2;
            const availH = boardH - padding * 2;
            const scale = Math.min(availW / tex.width, availH / tex.height);
            logo.width = tex.width * scale;
            logo.height = tex.height * scale;
            logo.x = padding + (availW - logo.width) / 2;
            logo.y = boardY + padding + (availH - logo.height) / 2;
            g.addChild(logo);
          }

          // Interactive cue container — white border + pixel hint text
          const cue = new Container();
          // Thin white border around the billboard board
          const border = new Graphics();
          border.rect(-1, boardY - 1, boardW + 2, 1).fill(0xFFFFFF);           // top
          border.rect(-1, boardY + boardH, boardW + 2, 1).fill(0xFFFFFF);      // bottom
          border.rect(-1, boardY - 1, 1, boardH + 2).fill(0xFFFFFF);           // left
          border.rect(boardW, boardY - 1, 1, boardH + 2).fill(0xFFFFFF);       // right
          // White highlight around posts (sides + bottom only, no top so it merges with the board)
          // Left post (post at x=6, w=3; cap at x=5, w=5)
          border.rect(4, boardY + boardH, 1, postBottom - boardH - boardY + 1).fill(0xFFFFFF);   // left side
          border.rect(10, boardY + boardH, 1, postBottom - boardH - boardY + 1).fill(0xFFFFFF);  // right side
          border.rect(4, postBottom, 7, 1).fill(0xFFFFFF);                                        // bottom
          // Right post (post at x=w-9, w=3; cap at x=w-10, w=5)
          border.rect(w - 11, boardY + boardH, 1, postBottom - boardH - boardY + 1).fill(0xFFFFFF); // left side
          border.rect(w - 5, boardY + boardH, 1, postBottom - boardH - boardY + 1).fill(0xFFFFFF);  // right side
          border.rect(w - 11, postBottom, 7, 1).fill(0xFFFFFF);                                      // bottom
          cue.addChild(border);
          // Pixel hint above billboard — "[A] VIEW" drawn with 1px rects
          const hint = new Graphics();
          const ink = 0x333333;
          const hx = Math.floor(boardW / 2) - 14;
          const hy = boardY - 7;
          // "[" — 2x5
          hint.rect(hx, hy, 1, 5).fill(ink);
          hint.rect(hx, hy, 2, 1).fill(ink);
          hint.rect(hx, hy + 4, 2, 1).fill(ink);
          // "A" — 3x5
          hint.rect(hx + 3, hy + 1, 1, 4).fill(ink);
          hint.rect(hx + 5, hy + 1, 1, 4).fill(ink);
          hint.rect(hx + 4, hy, 1, 1).fill(ink);
          hint.rect(hx + 3, hy + 2, 3, 1).fill(ink);
          // "]" — 2x5
          hint.rect(hx + 7, hy, 2, 1).fill(ink);
          hint.rect(hx + 8, hy, 1, 5).fill(ink);
          hint.rect(hx + 7, hy + 4, 2, 1).fill(ink);
          // gap
          // "V" — 3x5
          const vx = hx + 12;
          hint.rect(vx, hy, 1, 4).fill(ink);
          hint.rect(vx + 2, hy, 1, 4).fill(ink);
          hint.rect(vx + 1, hy + 4, 1, 1).fill(ink);
          // "I" — 1x5
          hint.rect(vx + 4, hy, 1, 5).fill(ink);
          // "E" — 3x5
          hint.rect(vx + 6, hy, 1, 5).fill(ink);
          hint.rect(vx + 6, hy, 3, 1).fill(ink);
          hint.rect(vx + 6, hy + 2, 3, 1).fill(ink);
          hint.rect(vx + 6, hy + 4, 3, 1).fill(ink);
          // "W" — 5x5
          hint.rect(vx + 10, hy, 1, 5).fill(ink);
          hint.rect(vx + 14, hy, 1, 5).fill(ink);
          hint.rect(vx + 12, hy + 2, 1, 3).fill(ink);
          hint.rect(vx + 11, hy + 4, 1, 1).fill(ink);
          hint.rect(vx + 13, hy + 4, 1, 1).fill(ink);
          cue.addChild(hint);
          cue.visible = false;
          g.addChild(cue);

          // Register this billboard as an interactive sign
          const container = new Container();
          container.addChild(g);
          container.x = dec.worldX;
          container.y = decY;
          this.decorationLayer.addChild(container);

          this.signSprites.push({
            container,
            data: zone.sign,
            worldX: dec.worldX + Math.floor(boardW / 2),
            indicator: cue,
          });

          // Skip the default addChild below since we handled it
          continue;
        } else if (dec.type === 'barrier') {
          const w = dec.width;
          const h = dec.height;
          // Sawhorse legs (A-frame)
          g.moveTo(0, h).lineTo(2, Math.floor(h * 0.5)).lineTo(4, h).closePath().fill(0x8B6914);
          g.moveTo(w - 4, h).lineTo(w - 2, Math.floor(h * 0.5)).lineTo(w, h).closePath().fill(0x8B6914);
          // Horizontal bar with alternating yellow/black stripes
          const barY = Math.floor(h * 0.3);
          const barH = 4;
          g.rect(0, barY, w, barH).fill(dec.color);
          for (let sx = 0; sx < w; sx += 4) {
            g.moveTo(sx, barY).lineTo(sx + 2, barY).lineTo(sx + 4, barY + barH).lineTo(sx + 2, barY + barH).closePath().fill(0x333333);
          }
        } else if (dec.type === 'safety-cone') {
          const w = dec.width;
          const h = dec.height;
          // Dark gray base
          g.rect(0, h - 2, w, 2).fill(0x555555);
          // Tapered body — 3 sections
          const bodyBottom = h - 2;
          const sec1W = w;
          const sec2W = Math.floor(w * 0.7);
          const sec3W = Math.floor(w * 0.4);
          const secH = Math.floor((bodyBottom) / 3);
          const cx = Math.floor(w / 2);
          // Bottom section
          g.rect(cx - Math.floor(sec1W / 2), bodyBottom - secH, sec1W, secH).fill(dec.color);
          // White stripe
          g.rect(cx - Math.floor(sec1W / 2), bodyBottom - secH, sec1W, 1).fill(0xFFFFFF);
          // Middle section
          g.rect(cx - Math.floor(sec2W / 2), bodyBottom - secH * 2, sec2W, secH).fill(dec.color);
          // White stripe
          g.rect(cx - Math.floor(sec2W / 2), bodyBottom - secH * 2, sec2W, 1).fill(0xFFFFFF);
          // Top section
          g.rect(cx - Math.floor(sec3W / 2), bodyBottom - secH * 3, sec3W, secH).fill(dec.color);
          // Rounded tip
          g.circle(cx, bodyBottom - secH * 3, 1.5).fill(dec.color);
        } else if (dec.type === 'material-pile') {
          const w = dec.width;
          const h = dec.height;
          // Sand mound on the left
          g.ellipse(Math.floor(w * 0.3), h - 2, Math.floor(w * 0.35), Math.floor(h * 0.5)).fill(0xDEB887);
          // Lighter highlight on mound
          g.ellipse(Math.floor(w * 0.25), h - 4, Math.floor(w * 0.2), Math.floor(h * 0.25)).fill(0xE8D4A8);
          // Shovel — diagonal handle
          g.moveTo(Math.floor(w * 0.5), h - 2).lineTo(Math.floor(w * 0.6), 0).stroke({ color: 0x8B6914, width: 1 });
          // Shovel blade
          g.rect(Math.floor(w * 0.57), 0, 3, 4).fill(0x888888);
          // Stacked yellow blocks on right (2 bottom, 1 top)
          const blockW = 5;
          const blockH = 4;
          const bx = Math.floor(w * 0.65);
          g.rect(bx, h - blockH, blockW, blockH).fill(dec.color);
          g.rect(bx + blockW + 1, h - blockH, blockW, blockH).fill(dec.color);
          g.rect(bx + Math.floor(blockW / 2), h - blockH * 2, blockW, blockH).fill(0xD4A840);
        } else if (dec.type === 'crane') {
          const w = dec.width;
          const h = dec.height;
          const cx = Math.floor(w * 0.35);
          // Base footing — wide dark gray pad
          g.rect(cx - 6, h - 4, 12, 4).fill(0x666666);
          // Lattice mast — two vertical rails with rungs
          const mastW = 6;
          const mastLeft = cx - Math.floor(mastW / 2);
          g.rect(mastLeft, 8, 2, h - 12).fill(0xD4A840);
          g.rect(mastLeft + mastW - 2, 8, 2, h - 12).fill(0xD4A840);
          // Horizontal rungs every 6px
          for (let ry = 14; ry < h - 6; ry += 6) {
            g.rect(mastLeft, ry, mastW, 1).fill(0xD4A840);
          }
          // Operator cab near top
          const cabY = 10;
          g.roundRect(mastLeft - 1, cabY, mastW + 2, 6, 1).fill(dec.color);
          // Cab window
          g.rect(mastLeft + 1, cabY + 1, 3, 3).fill(0x88CCFF);
          // Boom arm extending right from mast top
          const boomY = 8;
          g.rect(cx, boomY, 16, 2).fill(dec.color);
          // Counter-jib extending left
          g.rect(cx - 10, boomY, 10, 2).fill(dec.color);
          // Counterweight block
          g.rect(cx - 10, boomY, 4, 4).fill(0x444444);
          // Hook cable dangling from boom tip
          const hookX = cx + 15;
          g.rect(hookX, boomY + 2, 1, 10).fill(0x666666);
          // Tiny hard hat hanging from hook
          g.roundRect(hookX - 2, boomY + 12, 5, 3, 1).fill(dec.color);
          g.rect(hookX - 1, boomY + 11, 3, 2).fill(dec.color);
        } else if (dec.type === 'scaffold') {
          const w = dec.width;
          const h = dec.height;
          // Two vertical metal poles
          g.rect(0, 0, 2, h).fill(dec.color);
          g.rect(w - 2, 0, 2, h).fill(dec.color);
          // Horizontal wooden planks every ~10px
          for (let py = h - 2; py >= 0; py -= 10) {
            g.rect(0, py, w, 2).fill(0x8B6914);
          }
          // X-brace diagonals
          for (let sy = 0; sy < h - 10; sy += 10) {
            g.moveTo(2, sy).lineTo(w - 2, sy + 10).stroke({ color: dec.color, width: 1 });
            g.moveTo(w - 2, sy).lineTo(2, sy + 10).stroke({ color: dec.color, width: 1 });
          }
          // Yellow hard hat sitting on top plank
          g.roundRect(Math.floor(w / 2) - 4, -3, 8, 4, 2).fill(0xF2C94C);
          g.rect(Math.floor(w / 2) - 3, -1, 6, 2).fill(0xF2C94C);
        } else if (dec.type === 'mini-excavator') {
          const w = dec.width;
          const h = dec.height;
          // Treads — dark rounded rect base
          g.roundRect(0, h - 5, Math.floor(w * 0.65), 5, 2).fill(0x444444);
          // Tread detail lines
          g.rect(2, h - 4, Math.floor(w * 0.65) - 4, 1).fill(0x333333);
          // Cab — yellow rounded rect on treads
          const cabW = Math.floor(w * 0.4);
          const cabH = Math.floor(h * 0.45);
          const cabX = 2;
          const cabY = h - 5 - cabH;
          g.roundRect(cabX, cabY, cabW, cabH, 2).fill(dec.color);
          // Round blue window "eye"
          const eyeX = cabX + Math.floor(cabW * 0.55);
          const eyeY = cabY + Math.floor(cabH * 0.35);
          g.circle(eyeX, eyeY, 2.5).fill(0x88CCFF);
          // Highlight dot on eye
          g.circle(eyeX + 1, eyeY - 1, 0.8).fill(0xFFFFFF);
          // Exhaust pipe on top
          g.rect(cabX + 1, cabY - 2, 2, 2).fill(0x555555);
          // Arm extends right — upper segment
          const armStartX = cabX + cabW;
          const armStartY = cabY + 2;
          g.rect(armStartX, armStartY, Math.floor(w * 0.35), 2).fill(dec.color);
          // Forearm angling down
          const forearmX = armStartX + Math.floor(w * 0.35);
          g.moveTo(forearmX, armStartY).lineTo(forearmX + 3, armStartY + 6).lineTo(forearmX + 1, armStartY + 6).lineTo(forearmX - 2, armStartY).closePath().fill(dec.color);
          // Bucket at end
          g.rect(forearmX, armStartY + 6, 4, 3).fill(0x888888);
          // Bucket teeth
          g.rect(forearmX, armStartY + 9, 1, 1).fill(0x666666);
          g.rect(forearmX + 2, armStartY + 9, 1, 1).fill(0x666666);
        } else if (dec.type === 'building-wip') {
          const w = dec.width;
          const h = dec.height;
          const brickColor = 0xC4956A;
          const brickDark = 0xA07850;
          const mortar = 0xD9C4A8;
          const rebar = 0x888888;
          const scaffoldColor = 0x888888;
          const plankColor = 0x8B6914;
          // Building body width (left portion), scaffold on the right
          const buildW = Math.floor(w * 0.65);
          const scaffX = buildW + 2;
          const scaffW = w - scaffX;
          // Concrete foundation spans full width
          g.rect(0, h - 4, w, 4).fill(0x999999);
          // Completed lower half — brick wall
          const brickH = Math.floor(h * 0.55);
          const brickTop = h - 4 - brickH;
          g.rect(0, brickTop, buildW, brickH).fill(mortar);
          // Brick pattern rows
          const bw = 5;
          const bh = 3;
          for (let row = 0; row < Math.floor(brickH / bh); row++) {
            const by = brickTop + row * bh;
            const offset = row % 2 === 0 ? 0 : Math.floor(bw / 2);
            for (let bx = offset; bx < buildW; bx += bw + 1) {
              const clampedW = Math.min(bw, buildW - bx);
              if (clampedW > 1) {
                g.rect(bx, by, clampedW, bh - 1).fill(brickColor);
              }
            }
          }
          // Window openings in the brick section
          const winW = 6;
          const winH = 5;
          const winX = Math.floor(buildW / 2) - Math.floor(winW / 2);
          const winY = brickTop + 4;
          g.rect(winX, winY, winW, winH).fill(0x88CCFF);
          g.rect(winX + Math.floor(winW / 2), winY, 1, winH).fill(0x6699BB);
          g.rect(4, winY, winW, winH).fill(0x88CCFF);
          g.rect(4 + Math.floor(winW / 2), winY, 1, winH).fill(0x6699BB);
          // Upper unfinished section — exposed concrete columns + rebar
          const frameTop = 0;
          const frameH = brickTop - frameTop;
          g.rect(0, frameTop, 3, frameH).fill(0xAAAAAA);
          g.rect(buildW - 3, frameTop, 3, frameH).fill(0xAAAAAA);
          g.rect(Math.floor(buildW / 2) - 1, frameTop, 3, frameH).fill(0xAAAAAA);
          g.rect(0, frameTop, buildW, 3).fill(0xAAAAAA);
          g.rect(0, frameTop + Math.floor(frameH / 2), buildW, 2).fill(0xAAAAAA);
          // Rebar sticking up from top
          g.rect(4, frameTop - 4, 1, 6).fill(rebar);
          g.rect(10, frameTop - 6, 1, 8).fill(rebar);
          g.rect(buildW - 6, frameTop - 5, 1, 7).fill(rebar);
          g.rect(Math.floor(buildW / 2) + 2, frameTop - 5, 1, 7).fill(rebar);
          // Partial brick fill on one side of upper section (work in progress)
          const partialTop = frameTop + Math.floor(frameH / 2) + 2;
          const partialH = frameH - Math.floor(frameH / 2) - 2;
          for (let row = 0; row < Math.floor(partialH / bh); row++) {
            const by = partialTop + row * bh;
            const offset = row % 2 === 0 ? 0 : Math.floor(bw / 2);
            const fillW = Math.floor(buildW * 0.4);
            for (let bx = 3 + offset; bx < fillW; bx += bw + 1) {
              const clampedW = Math.min(bw, fillW - bx);
              if (clampedW > 1) {
                g.rect(bx, by, clampedW, bh - 1).fill(brickDark);
              }
            }
          }
          // Yellow Shepherd accent — construction tape at top
          g.rect(0, brickTop - 1, buildW, 1).fill(dec.color);
          // === Integrated scaffold on the right side ===
          // Two vertical metal poles
          g.rect(scaffX, frameTop, 2, h - 4 - frameTop).fill(scaffoldColor);
          g.rect(scaffX + scaffW - 2, frameTop, 2, h - 4 - frameTop).fill(scaffoldColor);
          // Horizontal wooden planks every ~10px
          for (let py = h - 6; py >= frameTop; py -= 10) {
            g.rect(scaffX, py, scaffW, 2).fill(plankColor);
          }
          // X-brace diagonals
          const scaffH = h - 4 - frameTop;
          for (let sy = frameTop; sy < frameTop + scaffH - 10; sy += 10) {
            g.moveTo(scaffX + 2, sy).lineTo(scaffX + scaffW - 2, sy + 10).stroke({ color: scaffoldColor, width: 1 });
            g.moveTo(scaffX + scaffW - 2, sy).lineTo(scaffX + 2, sy + 10).stroke({ color: scaffoldColor, width: 1 });
          }
          // Yellow hard hat sitting on top plank
          g.roundRect(scaffX + Math.floor(scaffW / 2) - 4, frameTop - 3, 8, 4, 2).fill(0xF2C94C);
          g.rect(scaffX + Math.floor(scaffW / 2) - 3, frameTop - 1, 6, 2).fill(0xF2C94C);
        } else if (dec.type === 'hard-hat-flag') {
          // Pole
          g.rect(0, 0, 2, dec.height).fill(0x888888);
          // Flag cloth
          g.rect(2, 2, dec.width - 2, 8).fill(dec.color);
          // Hard hat silhouette on flag — tiny darker detail
          const fx = 3;
          const fy = 4;
          g.roundRect(fx, fy, 3, 2, 1).fill(0xD4A840);
          g.rect(fx, fy + 1, 3, 1).fill(0xD4A840);
        } else if (dec.type === 'yt-screen') {
          this.drawYtScreenFrame(g);
          // Initial screen — first cat video frame
          g.rect(2, 2, 20, 11).fill(0x6699BB);
          this.drawCatVideo(g, 0, 0);
          g.rect(2, 12, 20, 1).fill(0x444444);
          this.ytScreen = g;
        } else if (dec.type === 'yt-backdrop') {
          const w = dec.width;
          const h = dec.height;
          // Left stand pole
          g.rect(0, 0, 2, h).fill(0x555555);
          // Right stand pole
          g.rect(w - 2, 0, 2, h).fill(0x555555);
          // Horizontal crossbar at top
          g.rect(0, 0, w, 2).fill(0x555555);
          // Green screen canvas
          g.rect(3, 2, 34, 34).fill(0x00CC44);
          // Subtle wrinkle lines
          g.rect(5, 14, 30, 1).fill(0x00AA33);
          g.rect(5, 26, 30, 1).fill(0x00AA33);
          // Left base foot (L-shaped)
          g.rect(0, h - 2, 4, 2).fill(0x555555);
          g.rect(0, h - 4, 2, 2).fill(0x555555);
          // Right base foot (L-shaped)
          g.rect(w - 4, h - 2, 4, 2).fill(0x555555);
          g.rect(w - 2, h - 4, 2, 2).fill(0x555555);
        } else if (dec.type === 'camera-preview') {
          // Monitor — bezel
          g.rect(0, 0, 22, 16).fill(0x333333);
          // Screen area — initially off
          g.rect(2, 1, 18, 13).fill(0x222233);
          // Stand arm
          g.rect(9, 15, 4, 2).fill(0x444444);
          g.rect(6, 16, 10, 2).fill(0x444444);
          this.cameraPreview = g;
        } else if (dec.type === 'camera-ring-light') {
          const w = dec.width;
          const h = dec.height;
          // Ring light (back layer) — circle of warm white dots
          const ringCx = Math.floor(w / 2);
          const ringCy = 6;
          const ringR = 5;
          for (let a = 0; a < 12; a++) {
            const angle = (a / 12) * Math.PI * 2;
            const rx = ringCx + Math.round(Math.cos(angle) * ringR);
            const ry = ringCy + Math.round(Math.sin(angle) * ringR);
            g.rect(rx, ry, 2, 2).fill(0xFFFFDD);
          }
          // Tripod — three legs converging at a point
          const tripodTop = 14;
          const tripodBottom = h;
          // Left leg
          g.moveTo(ringCx, tripodTop).lineTo(2, tripodBottom).lineTo(4, tripodBottom).lineTo(ringCx, tripodTop + 2).closePath().fill(0x555555);
          // Right leg
          g.moveTo(ringCx, tripodTop).lineTo(w - 4, tripodBottom).lineTo(w - 2, tripodBottom).lineTo(ringCx, tripodTop + 2).closePath().fill(0x555555);
          // Center leg
          g.moveTo(ringCx - 1, tripodTop).lineTo(ringCx - 1, tripodBottom).lineTo(ringCx + 1, tripodBottom).lineTo(ringCx + 1, tripodTop).closePath().fill(0x555555);
          // Camera body on tripod top
          g.rect(ringCx - 4, tripodTop - 4, 8, 5).fill(0x333333);
          // Lens
          g.circle(ringCx + 3, tripodTop - 2, 2).fill(0x111111);
          g.circle(ringCx + 3, tripodTop - 2, 1).fill(0x333355);
          // Red recording dot — will be animated
          const redDot = new Graphics();
          redDot.circle(ringCx - 3, tripodTop - 3, 1).fill(0xFF0000);
          g.addChild(redDot);
          this.cameraLight = redDot;
          // Camera flash — white circle over ring light area
          const flash = new Graphics();
          flash.circle(ringCx, ringCy, ringR + 3).fill({ color: 0xFFFFFF, alpha: 1 });
          flash.alpha = 0;
          g.addChild(flash);
          this.cameraFlash = flash;
        }

        g.x = dec.worldX;
        g.y = decY;
        this.decorationLayer.addChild(g);
      }
    }
  }

  private drawYtScreenFrame(g: Graphics): void {
    // Monitor bezel
    g.rect(0, 0, 24, 16).fill(0x222222);
    // Logo accent strip
    g.rect(8, 14, 8, 1).fill(0x555555);
    // Stand neck
    g.rect(10, 16, 4, 4).fill(0x444444);
    // Stand base
    g.rect(7, 20, 10, 2).fill(0x444444);
  }

  private drawCatVideo(g: Graphics, videoIndex: number, t: number): void {
    // All drawing is within the 20x11 screen area at offset (2, 2)
    const sx = 2;
    const sy = 2;
    const cat = 0xEEAA44; // orange tabby
    const dark = 0xBB7722; // darker stripes
    const white = 0xFFFFFF;
    const pink = 0xFFAAAA;

    if (videoIndex === 0) {
      // Scene: Cat knocks mug off table
      g.rect(sx, sy, 20, 11).fill(0x99BBDD); // light blue room bg
      // Table surface
      g.rect(sx, sy + 8, 20, 3).fill(0x8B6914);
      // Cat body sitting on table (right side)
      const frame = Math.floor(t * 2) % 4;
      // Cat body
      g.rect(sx + 12, sy + 4, 5, 4).fill(cat);
      // Cat head
      g.rect(sx + 13, sy + 2, 3, 3).fill(cat);
      // Ears
      g.rect(sx + 13, sy + 1, 1, 1).fill(cat);
      g.rect(sx + 15, sy + 1, 1, 1).fill(cat);
      // Eyes
      g.rect(sx + 13, sy + 3, 1, 1).fill(0x222222);
      g.rect(sx + 15, sy + 3, 1, 1).fill(0x222222);
      // Tail
      g.rect(sx + 16, sy + 4, 2, 1).fill(dark);
      g.rect(sx + 17, sy + 3, 1, 1).fill(dark);
      // Mug — cat paw pushes it further each frame
      const mugX = sx + 4 - frame * 2;
      if (frame < 3) {
        // Mug on table
        g.rect(Math.max(sx, mugX), sy + 5, 3, 3).fill(0xDD4444);
        // Cat paw extended toward mug
        g.rect(sx + 12, sy + 6, 1, 1).fill(cat);
      } else {
        // Mug falling off! — below table
        g.rect(sx + 1, sy + 9, 3, 2).fill(0xDD4444);
        // Paw hanging over edge
        g.rect(sx + 11, sy + 6, 2, 1).fill(cat);
      }
    } else if (videoIndex === 1) {
      // Scene: Cat chases laser dot
      g.rect(sx, sy, 20, 11).fill(0xCCBBAA); // beige floor bg
      // Red laser dot bouncing around
      const dotX = sx + 3 + Math.floor((Math.sin(t * 3) * 0.5 + 0.5) * 14);
      const dotY = sy + 4 + Math.floor((Math.cos(t * 2.3) * 0.5 + 0.5) * 5);
      g.circle(dotX, dotY, 1).fill(0xFF0000);
      // Cat chasing — position trails behind dot
      const catX = sx + 3 + Math.floor((Math.sin((t - 0.4) * 3) * 0.5 + 0.5) * 14) - 3;
      const catY = sy + 5;
      // Cat body (low crouch)
      g.rect(catX, catY, 5, 3).fill(cat);
      // Head
      g.rect(catX + 4, catY - 1, 3, 2).fill(cat);
      // Ears
      g.rect(catX + 5, catY - 2, 1, 1).fill(cat);
      g.rect(catX + 6, catY - 2, 1, 1).fill(cat);
      // Eyes (wide, focused)
      g.rect(catX + 5, catY - 1, 1, 1).fill(0x222222);
      g.rect(catX + 6, catY - 1, 1, 1).fill(0x222222);
      // Tail up with excitement
      g.rect(Math.max(sx, catX - 1), catY - 1, 1, 2).fill(dark);
      g.rect(Math.max(sx, catX - 2), catY - 2, 1, 1).fill(dark);
    } else {
      // Scene: Cat in a box — pops in and out
      g.rect(sx, sy, 20, 11).fill(0xAABBCC); // soft blue bg
      // Cardboard box
      g.rect(sx + 6, sy + 4, 9, 7).fill(0xC4956A);
      g.rect(sx + 6, sy + 4, 9, 1).fill(0xA07850); // top edge
      // Box flaps
      g.rect(sx + 5, sy + 3, 3, 2).fill(0xC4956A);
      g.rect(sx + 13, sy + 3, 3, 2).fill(0xC4956A);
      // Cat peeking out — bobs up and down
      const bobFrame = Math.floor(t * 1.5) % 3;
      if (bobFrame === 0) {
        // Just ears visible
        g.rect(sx + 9, sy + 2, 1, 2).fill(cat);
        g.rect(sx + 12, sy + 2, 1, 2).fill(cat);
        // Inner ear
        g.rect(sx + 9, sy + 3, 1, 1).fill(pink);
        g.rect(sx + 12, sy + 3, 1, 1).fill(pink);
      } else if (bobFrame === 1) {
        // Head poking out
        g.rect(sx + 8, sy + 1, 5, 3).fill(cat);
        // Ears
        g.rect(sx + 8, sy, 1, 1).fill(cat);
        g.rect(sx + 12, sy, 1, 1).fill(cat);
        // Eyes (curious)
        g.rect(sx + 9, sy + 2, 1, 1).fill(0x222222);
        g.rect(sx + 11, sy + 2, 1, 1).fill(0x222222);
        // Nose
        g.rect(sx + 10, sy + 3, 1, 1).fill(pink);
      } else {
        // Full pop — head plus paws on box rim
        g.rect(sx + 8, sy, 5, 4).fill(cat);
        // Ears
        g.rect(sx + 8, sy - 1, 1, 1).fill(cat);
        g.rect(sx + 12, sy - 1, 1, 1).fill(cat);
        // Eyes (big surprise)
        g.rect(sx + 9, sy + 1, 1, 1).fill(white);
        g.rect(sx + 11, sy + 1, 1, 1).fill(white);
        g.rect(sx + 9, sy + 1, 1, 1).fill(0x222222);
        g.rect(sx + 11, sy + 1, 1, 1).fill(0x222222);
        // Nose
        g.rect(sx + 10, sy + 2, 1, 1).fill(pink);
        // Paws on rim
        g.rect(sx + 7, sy + 4, 2, 1).fill(cat);
        g.rect(sx + 13, sy + 4, 2, 1).fill(cat);
      }
    }
  }

  private buildEndZone(): void {
    const groundY = PORTFOLIO_CONFIG.world.groundY;

    // Small wall indicator at the end
    const wall = new Graphics();
    wall.rect(0, 0, 4, 20).fill(0x666666);
    wall.x = PORTFOLIO_CONFIG.world.endZoneX + 10;
    wall.y = groundY - 20;
    this.decorationLayer.addChild(wall);
  }

  private getZoneAtX(x: number): ZoneData | null {
    for (const zone of ZONES) {
      if (x >= zone.startX && x < zone.endX) {
        return zone;
      }
    }
    return null;
  }
}

export type { SignSprite };
