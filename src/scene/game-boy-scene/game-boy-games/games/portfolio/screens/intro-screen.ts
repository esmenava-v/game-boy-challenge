import { Container, Graphics, Text } from 'pixi.js';
import GameScreenAbstract from '../../shared/game-screen-abstract';
import { BUTTON_TYPE } from '../../../../game-boy/data/game-boy-data';
import { PORTFOLIO_CONFIG } from '../data/portfolio-config';
import { Timeout, TimeoutInstance } from '../../../../../../core/helpers/timeout';

export default class IntroScreen extends GameScreenAbstract {
  private pages: Container[];
  private currentPage: number;
  private blinkTimer: TimeoutInstance;
  private blinkTime: number;
  private blinkTexts: Text[];

  constructor() {
    super();

    this.pages = [];
    this.blinkTexts = [];
    this.currentPage = 0;
    this.blinkTimer = null;
    this.blinkTime = 700;

    this.init();
  }

  public show(): void {
    super.show();

    this.currentPage = 0;
    this.showPage(0);
  }

  public hide(): void {
    super.hide();

    this.stopTweens();
    this.reset();
  }

  public onButtonPress(buttonType: BUTTON_TYPE): void {
    if (buttonType === BUTTON_TYPE.A || buttonType === BUTTON_TYPE.B || buttonType === BUTTON_TYPE.Start) {
      if (this.currentPage < this.pages.length - 1) {
        this.pages[this.currentPage].visible = false;
        this.currentPage++;
        this.showPage(this.currentPage);
      } else {
        this.events.emit('onIntroComplete');
      }
    }
  }

  public onButtonUp(): void { }

  public update(): void { }

  public stopTweens(): void {
    if (this.blinkTimer) {
      this.blinkTimer.stop();
    }
  }

  public reset(): void {
    for (const page of this.pages) {
      page.visible = false;
    }
  }

  private showPage(index: number): void {
    this.stopTweens();
    this.pages[index].visible = true;
    this.blinkTexts[index].visible = true;
    this.blinkPrompt(index);
  }

  private blinkPrompt(pageIndex: number): void {
    this.blinkTimer = Timeout.call(this.blinkTime, () => {
      this.blinkTexts[pageIndex].visible = !this.blinkTexts[pageIndex].visible;
      this.blinkPrompt(pageIndex);
    });
  }

  private init(): void {
    this.initWelcomePage();
    this.initNamePage();
    this.initHowToPlayPage();

    this.visible = false;
  }

  private createText(text: string, fill: number, y: number, parent: Container): Text {
    const t = new Text({
      text,
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill,
      },
    });

    t.anchor.set(0.5, 0);
    t.x = PORTFOLIO_CONFIG.screen.width * 0.5;
    t.y = y;
    parent.addChild(t);

    return t;
  }

  private createBackdrop(parent: Container): void {
    const backdrop = new Graphics();
    backdrop.rect(0, 0, PORTFOLIO_CONFIG.screen.width, PORTFOLIO_CONFIG.screen.height).fill({ color: 0x000000, alpha: 0.3 });
    parent.addChild(backdrop);
  }

  private createPanel(boxX: number, boxY: number, boxW: number, boxH: number, parent: Container): void {
    const panel = new Graphics();
    panel.rect(boxX, boxY, boxW, boxH).fill(0xFFFFFF);
    panel.rect(boxX, boxY, boxW, boxH).stroke({ color: 0x000000, width: 1 });
    parent.addChild(panel);
  }

  private createSeparator(boxX: number, boxW: number, y: number, parent: Container): void {
    const sep = new Graphics();
    sep.rect(boxX + 8, y, boxW - 16, 1).fill(0xCCCCCC);
    parent.addChild(sep);
  }

  private initWelcomePage(): void {
    const screenW = PORTFOLIO_CONFIG.screen.width;
    const screenH = PORTFOLIO_CONFIG.screen.height;
    const boxW = 140;
    const boxH = 100;
    const boxX = (screenW - boxW) / 2;
    const boxY = (screenH - boxH) / 2;

    const page = new Container();
    page.visible = false;
    this.addChild(page);
    this.pages.push(page);

    this.createBackdrop(page);
    this.createPanel(boxX, boxY, boxW, boxH, page);
    this.createText('ESME NAVA', 0x000000, boxY + 12, page);
    this.createSeparator(boxX, boxW, boxY + 28, page);
    this.createText('WELCOME TO MY', 0x333333, boxY + 36, page);
    this.createText('PORTFOLIO', 0x333333, boxY + 48, page);
    this.createText('GAME BOY EDITION', 0x666666, boxY + 62, page);

    const blink = this.createText('[A] NEXT', 0x999999, boxY + boxH - 14, page);
    this.blinkTexts.push(blink);
  }

  private initNamePage(): void {
    const screenW = PORTFOLIO_CONFIG.screen.width;
    const screenH = PORTFOLIO_CONFIG.screen.height;
    const boxW = 140;
    const boxH = 100;
    const boxX = (screenW - boxW) / 2;
    const boxY = (screenH - boxH) / 2;

    const page = new Container();
    page.visible = false;
    this.addChild(page);
    this.pages.push(page);

    this.createBackdrop(page);
    this.createPanel(boxX, boxY, boxW, boxH, page);
    this.createText('I\'M A', 0x000000, boxY + 8, page);
    this.createText('DESIGN ENGINEER', 0x000000, boxY + 20, page);
    this.createSeparator(boxX, boxW, boxY + 36, page);
    this.createText('I LIKE TO USE', 0x333333, boxY + 44, page);
    this.createText('CODE AS ART', 0x333333, boxY + 56, page);

    const blink = this.createText('[A] NEXT', 0x999999, boxY + boxH - 14, page);
    this.blinkTexts.push(blink);
  }

  private initHowToPlayPage(): void {
    const screenW = PORTFOLIO_CONFIG.screen.width;
    const screenH = PORTFOLIO_CONFIG.screen.height;
    const boxW = 140;
    const boxH = 100;
    const boxX = (screenW - boxW) / 2;
    const boxY = (screenH - boxH) / 2;

    const page = new Container();
    page.visible = false;
    this.addChild(page);
    this.pages.push(page);

    this.createBackdrop(page);
    this.createPanel(boxX, boxY, boxW, boxH, page);
    this.createText('HOW TO PLAY', 0x000000, boxY + 8, page);
    this.createSeparator(boxX, boxW, boxY + 20, page);
    this.createText('USE ARROWS TO', 0x333333, boxY + 28, page);
    this.createText('WALK & JUMP', 0x333333, boxY + 40, page);

    this.createText('PRESS [A] NEAR', 0x333333, boxY + 56, page);
    this.createText('SIGNS TO READ', 0x333333, boxY + 68, page);

    const blink = this.createText('[A] START', 0x999999, boxY + boxH - 14, page);
    this.blinkTexts.push(blink);
  }
}
