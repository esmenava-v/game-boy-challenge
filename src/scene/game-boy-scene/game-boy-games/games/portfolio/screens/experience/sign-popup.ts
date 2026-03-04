import { Container, Graphics, Text } from 'pixi.js';
import { PORTFOLIO_CONFIG } from '../../data/portfolio-config';
import { SignData } from '../../data/world-data';

export default class SignPopup extends Container {
  private background: Graphics;
  private titleText: Text;
  private roleText: Text;
  private datesText: Text;
  private descText: Text;
  private hintText: Text;
  private isShowing: boolean;

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
    const boxW = 140;
    const boxH = 100;
    const boxX = (screenW - boxW) / 2;
    const boxY = (screenH - boxH) / 2;

    // Semi-transparent backdrop
    const backdrop = new Graphics();
    backdrop.rect(0, 0, screenW, screenH).fill({ color: 0x000000, alpha: 0.3 });
    this.addChild(backdrop);

    // White box
    this.background = new Graphics();
    this.background.rect(boxX, boxY, boxW, boxH).fill(0xFFFFFF);
    this.background.rect(boxX, boxY, boxW, boxH).stroke({ color: 0x000000, width: 1 });
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
    this.titleText.y = boxY + 8;
    this.addChild(this.titleText);

    // Separator line
    const sep = new Graphics();
    sep.rect(boxX + 8, boxY + 20, boxW - 16, 1).fill(0xCCCCCC);
    this.addChild(sep);

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
    this.roleText.y = boxY + 26;
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
    this.datesText.y = boxY + 38;
    this.addChild(this.datesText);

    // Description
    this.descText = new Text({
      text: '',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x000000,
        wordWrap: true,
        wordWrapWidth: boxW - 20,
      },
    });
    this.descText.anchor.set(0.5, 0);
    this.descText.x = screenW / 2;
    this.descText.y = boxY + 52;
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
    this.hintText.y = boxY + boxH - 14;
    this.addChild(this.hintText);

    this.visible = false;
  }
}
