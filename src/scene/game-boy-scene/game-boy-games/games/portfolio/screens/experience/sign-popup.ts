import { Container, Graphics, Text } from 'pixi.js';
import { PORTFOLIO_CONFIG } from '../../data/portfolio-config';
import { SignData } from '../../data/world-data';

export default class SignPopup extends Container {
  private background: Graphics;
  private separator: Graphics;
  private titleText: Text;
  private roleText: Text;
  private datesText: Text;
  private descText: Text;
  private hintText: Text;
  private isShowing: boolean;
  private boxX: number;
  private boxY: number;
  private boxW: number;

  constructor() {
    super();

    this.isShowing = false;

    this.init();
  }

  public show(signData: SignData): void {
    this.titleText.text = signData.title;
    this.roleText.text = signData.role;
    this.datesText.text = signData.dates;
    this.descText.text = signData.description;

    // Reflow layout based on actual text heights
    const padding = 8;
    const gap = 4;
    let y = this.boxY + padding;

    this.titleText.y = y;
    y += this.titleText.height + gap;

    // Separator
    this.separator.clear();
    this.separator.rect(this.boxX + padding, y, this.boxW - padding * 2, 1).fill(0xCCCCCC);
    y += 1 + gap;

    this.roleText.y = y;
    y += this.roleText.height + gap;

    this.datesText.y = y;
    y += this.datesText.height + gap;

    if (signData.description) {
      this.descText.visible = true;
      this.descText.y = y;
      y += this.descText.height + gap;
    } else {
      this.descText.visible = false;
    }

    y += gap;
    this.hintText.y = y;
    const boxH = y + this.hintText.height + padding - this.boxY;

    // Redraw background to fit content
    this.background.clear();
    this.background.rect(this.boxX, this.boxY, this.boxW, boxH).fill(0xFFFFFF);
    this.background.rect(this.boxX, this.boxY, this.boxW, boxH).stroke({ color: 0x000000, width: 1 });

    this.isShowing = true;
    this.visible = true;
  }

  public hide(): void {
    this.isShowing = false;
    this.visible = false;
  }

  public getIsShowing(): boolean {
    return this.isShowing;
  }

  private init(): void {
    const screenW = PORTFOLIO_CONFIG.screen.width;
    const screenH = PORTFOLIO_CONFIG.screen.height;
    this.boxW = 140;
    this.boxX = (screenW - this.boxW) / 2;
    this.boxY = (screenH - 100) / 2;

    // Semi-transparent backdrop
    const backdrop = new Graphics();
    backdrop.rect(0, 0, screenW, screenH).fill({ color: 0x000000, alpha: 0.3 });
    this.addChild(backdrop);

    // White box (redrawn dynamically in show())
    this.background = new Graphics();
    this.addChild(this.background);

    // Title
    this.titleText = new Text({
      text: '',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x000000,
      },
    });
    this.titleText.anchor.set(0.5, 0);
    this.titleText.x = screenW / 2;
    this.addChild(this.titleText);

    // Separator line (redrawn dynamically in show())
    this.separator = new Graphics();
    this.addChild(this.separator);

    // Role
    this.roleText = new Text({
      text: '',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x333333,
      },
    });
    this.roleText.anchor.set(0.5, 0);
    this.roleText.x = screenW / 2;
    this.addChild(this.roleText);

    // Dates
    this.datesText = new Text({
      text: '',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x666666,
      },
    });
    this.datesText.anchor.set(0.5, 0);
    this.datesText.x = screenW / 2;
    this.addChild(this.datesText);

    // Description
    this.descText = new Text({
      text: '',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x000000,
        wordWrap: true,
        wordWrapWidth: this.boxW - 20,
      },
    });
    this.descText.anchor.set(0.5, 0);
    this.descText.x = screenW / 2;
    this.addChild(this.descText);

    // Hint text
    this.hintText = new Text({
      text: '[B] CLOSE',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x999999,
      },
    });
    this.hintText.anchor.set(0.5, 0);
    this.hintText.x = screenW / 2;
    this.addChild(this.hintText);

    this.visible = false;
  }
}
