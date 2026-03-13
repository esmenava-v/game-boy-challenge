import { Container, Graphics, Text } from 'pixi.js';
import GameScreenAbstract from '../../shared/game-screen-abstract';
import { BUTTON_TYPE } from '../../../../game-boy/data/game-boy-data';
import { GAME_BOY_CONFIG } from '../../../../game-boy/data/game-boy-config';
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
    t.x = GAME_BOY_CONFIG.screen.width * 0.5;
    t.y = y;
    parent.addChild(t);

    return t;
  }

  private createPanel(x: number, y: number, w: number, h: number, parent: Container): void {
    const panel = new Graphics();
    panel.rect(x, y, w, h).fill(0xFFFFFF);
    panel.rect(x, y, w, h).stroke({ color: 0x000000, width: 1 });
    parent.addChild(panel);
  }

  private createSeparator(y: number, parent: Container): void {
    const sep = new Graphics();
    const w = 60;
    const x = (GAME_BOY_CONFIG.screen.width - w) / 2;
    sep.rect(x, y, w, 1).fill(0xCCCCCC);
    parent.addChild(sep);
  }

  private initWelcomePage(): void {
    const page = new Container();
    page.visible = false;
    this.addChild(page);
    this.pages.push(page);

    this.createPanel(15, 18, 130, 72, page);
    this.createText('WELCOME TO', 0x000000, 28, page);
    this.createSeparator(46, page);
    this.createText('MY PORTFOLIO', 0x000000, 56, page);
    this.createText('GAME BOY', 0x333333, 71, page);

    const blink = this.createText('[A] NEXT', 0x999999, 120, page);
    this.blinkTexts.push(blink);
  }

  private initNamePage(): void {
    const page = new Container();
    page.visible = false;
    this.addChild(page);
    this.pages.push(page);

    this.createPanel(15, 10, 130, 108, page);
    this.createText('ESME NAVA', 0x000000, 20, page);
    this.createSeparator(37, page);
    this.createText('DESIGN', 0x333333, 45, page);
    this.createText('ENGINEER', 0x333333, 57, page);

    this.createText('BUILDING AT THE', 0x666666, 78, page);
    this.createText('INTERSECTION OF', 0x666666, 90, page);
    this.createText('CODE & DESIGN', 0x666666, 102, page);

    const blink = this.createText('[A] NEXT', 0x999999, 130, page);
    this.blinkTexts.push(blink);
  }

  private initHowToPlayPage(): void {
    const page = new Container();
    page.visible = false;
    this.addChild(page);
    this.pages.push(page);

    this.createPanel(15, 6, 130, 108, page);
    this.createText('HOW TO PLAY', 0x000000, 15, page);
    this.createSeparator(30, page);
    this.createText('USE ARROWS TO', 0x333333, 38, page);
    this.createText('WALK & JUMP', 0x333333, 50, page);

    this.createText('PRESS [A] NEAR', 0x333333, 68, page);
    this.createText('SIGNS TO READ', 0x333333, 80, page);

    this.createText('EXPLORE MY WORK', 0x666666, 97, page);

    const blink = this.createText('[A] START', 0x999999, 128, page);
    this.blinkTexts.push(blink);
  }
}
