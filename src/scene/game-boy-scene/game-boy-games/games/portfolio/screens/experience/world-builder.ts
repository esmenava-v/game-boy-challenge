import { Container, Graphics } from 'pixi.js';
import { PORTFOLIO_CONFIG } from '../../data/portfolio-config';
import { ZONES, CLOUDS, ZoneData, SignData } from '../../data/world-data';

interface SignSprite {
  container: Container;
  data: SignData;
  worldX: number;
}

export default class WorldBuilder {
  private groundLayer: Container;
  private decorationLayer: Container;
  private backgroundLayer: Container;
  private signSprites: SignSprite[];
  private groundTiles: Graphics[];

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
    this.buildGround();
    this.buildDecorations();
    this.buildSigns();
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

    // Distant hills
    const hills = new Graphics();
    hills.rect(0, 60, PORTFOLIO_CONFIG.world.width, 30).fill(0xBBCCBB);
    for (let hx = 0; hx < PORTFOLIO_CONFIG.world.width; hx += 80) {
      const hillH = 15 + Math.sin(hx * 0.03) * 10;
      hills.ellipse(hx + 40, 60, 50, hillH).fill(0xAABBAA);
    }
    this.backgroundLayer.addChild(hills);
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
        }

        g.x = dec.worldX;
        g.y = decY;
        this.decorationLayer.addChild(g);
      }
    }
  }

  private buildSigns(): void {
    for (const zone of ZONES) {
      const sign = zone.sign;
      const container = new Container();

      // Sign post
      const post = new Graphics();
      post.rect(5, 8, 2, 12).fill(0x8B4513);
      container.addChild(post);

      // Sign board
      const board = new Graphics();
      board.rect(0, 0, 12, 10).fill(0xFFF8DC);
      board.rect(0, 0, 12, 10).stroke({ color: 0x8B4513, width: 1 });
      container.addChild(board);

      // Exclamation mark indicator
      const indicator = new Graphics();
      indicator.rect(5, 2, 2, 4).fill(0x333333);
      indicator.rect(5, 7, 2, 2).fill(0x333333);
      container.addChild(indicator);

      container.x = sign.worldX;
      container.y = PORTFOLIO_CONFIG.world.groundY - 20;
      this.decorationLayer.addChild(container);

      this.signSprites.push({
        container,
        data: sign,
        worldX: sign.worldX,
      });
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
