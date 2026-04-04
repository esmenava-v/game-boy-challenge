import { Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import GameScreenAbstract from '../../shared/game-screen-abstract';
import { BUTTON_TYPE } from '../../../../game-boy/data/game-boy-data';
import { PORTFOLIO_CONFIG } from '../data/portfolio-config';
import { Timeout, TimeoutInstance } from '../../../../../../core/helpers/timeout';
import Loader from '../../../../../../core/loader';

enum INTRO_PHASE {
  Welcome = 'WELCOME',
  Dialogue = 'DIALOGUE',
}

const DIALOGUE_PAGES: string[] = [
  "Oh, you're actually\nhere. Good.",
  "I'm Esme.\nDesign engineer,\nStanford alumni,\nfirst-gen.",
  "I live in the gap\nbetween a Figma file\nand a pull request.",
  "I build things\nfunctional enough to\nship and strange\nenough to remember.",
  "This is my portfolio.\nWalk around and\nexplore where I've\nworked up to now...",
];

const CHAR_DELAY = 38;
const CURSOR_BLINK_TIME = 400;
const BOUNCE_SPEED = 0.004;

export default class IntroScreen extends GameScreenAbstract {
  private phase: INTRO_PHASE;
  private welcomeContainer: Container;
  private dialogueContainer: Container;

  // Welcome
  private blinkText: Text;
  private blinkTimer: TimeoutInstance;

  // Dialogue
  private currentPage: number;
  private charIndex: number;
  private typeTimer: number;
  private isTyping: boolean;
  private dialogueText: Text;
  private pageIndicator: Text;
  private cursorText: Text;
  private cursorBlinkTimer: number;
  private advanceIndicator: Text;
  private bounceTimer: number;
  private visitedPages: boolean[];

  constructor() {
    super();

    this.phase = INTRO_PHASE.Welcome;
    this.currentPage = 0;
    this.charIndex = 0;
    this.typeTimer = 0;
    this.isTyping = false;
    this.cursorBlinkTimer = 0;
    this.bounceTimer = 0;
    this.visitedPages = new Array(DIALOGUE_PAGES.length).fill(false);

    this.init();
  }

  public show(): void {
    super.show();

    this.phase = INTRO_PHASE.Welcome;
    this.welcomeContainer.visible = true;
    this.dialogueContainer.visible = false;
    this.currentPage = 0;
    this.charIndex = 0;
    this.isTyping = false;
    this.visitedPages.fill(false);
    this.blinkText.visible = true;
    this.startBlinkPrompt();
  }

  public hide(): void {
    super.hide();
    this.stopTweens();
  }

  public update(dt: number): void {
    if (this.phase !== INTRO_PHASE.Dialogue) return;

    // Typewriter
    if (this.isTyping) {
      const pageText = DIALOGUE_PAGES[this.currentPage];
      this.typeTimer += dt * 1000;

      while (this.typeTimer >= CHAR_DELAY && this.charIndex < pageText.length) {
        this.typeTimer -= CHAR_DELAY;
        this.charIndex++;
        this.dialogueText.text = pageText.substring(0, this.charIndex);
      }

      // Cursor blink
      this.cursorBlinkTimer += dt * 1000;
      if (this.cursorBlinkTimer >= CURSOR_BLINK_TIME) {
        this.cursorBlinkTimer -= CURSOR_BLINK_TIME;
        this.cursorText.visible = !this.cursorText.visible;
      }
      this.updateCursorPosition();

      if (this.charIndex >= pageText.length) {
        this.finishTyping();
      }
    }

    // Bounce advance indicator
    if (!this.isTyping && this.advanceIndicator.visible) {
      this.bounceTimer += dt * 1000;
      this.advanceIndicator.y = this.getAdvanceBaseY() + Math.sin(this.bounceTimer * BOUNCE_SPEED) * 2;
    }
  }

  public onButtonPress(buttonType: BUTTON_TYPE): void {
    if (this.phase === INTRO_PHASE.Welcome) {
      if (buttonType === BUTTON_TYPE.A || buttonType === BUTTON_TYPE.Start) {
        this.transitionToDialogue();
      }
      return;
    }

    // Dialogue phase
    if (buttonType === BUTTON_TYPE.B) {
      // Skip entire intro
      this.events.emit('onIntroComplete');
      return;
    }

    if (buttonType === BUTTON_TYPE.A || buttonType === BUTTON_TYPE.Start) {
      if (this.isTyping) {
        // Skip typewriter, show full text
        this.charIndex = DIALOGUE_PAGES[this.currentPage].length;
        this.dialogueText.text = DIALOGUE_PAGES[this.currentPage];
        this.finishTyping();
      } else {
        // Advance to next page
        if (this.currentPage < DIALOGUE_PAGES.length - 1) {
          this.currentPage++;
          this.startTyping();
        } else {
          this.events.emit('onIntroComplete');
        }
      }
      return;
    }

    if (buttonType === BUTTON_TYPE.CrossLeft) {
      if (this.isTyping) {
        // Skip typewriter first
        this.charIndex = DIALOGUE_PAGES[this.currentPage].length;
        this.dialogueText.text = DIALOGUE_PAGES[this.currentPage];
        this.finishTyping();
      } else if (this.currentPage > 0) {
        // Go back
        this.currentPage--;
        this.showPageInstant();
      }
      return;
    }
  }

  public onButtonUp(): void { }

  public stopTweens(): void {
    if (this.blinkTimer) {
      this.blinkTimer.stop();
      this.blinkTimer = null;
    }
  }

  public reset(): void {
    this.welcomeContainer.visible = false;
    this.dialogueContainer.visible = false;
  }

  // --- Welcome phase ---

  private startBlinkPrompt(): void {
    this.blinkTimer = Timeout.call(700, () => {
      this.blinkText.visible = !this.blinkText.visible;
      this.startBlinkPrompt();
    });
  }

  private transitionToDialogue(): void {
    this.stopTweens();
    this.phase = INTRO_PHASE.Dialogue;
    this.welcomeContainer.visible = false;
    this.dialogueContainer.visible = true;
    this.currentPage = 0;
    this.startTyping();
  }

  // --- Dialogue phase ---

  private startTyping(): void {
    this.charIndex = 0;
    this.typeTimer = 0;
    this.isTyping = true;
    this.cursorBlinkTimer = 0;
    this.dialogueText.text = '';
    this.cursorText.visible = true;
    this.advanceIndicator.visible = false;
    this.bounceTimer = 0;
    this.updatePageIndicator();
    this.updateCursorPosition();
  }

  private showPageInstant(): void {
    this.charIndex = DIALOGUE_PAGES[this.currentPage].length;
    this.dialogueText.text = DIALOGUE_PAGES[this.currentPage];
    this.isTyping = false;
    this.cursorText.visible = false;
    this.advanceIndicator.visible = true;
    this.bounceTimer = 0;
    this.updatePageIndicator();
  }

  private finishTyping(): void {
    this.isTyping = false;
    this.cursorText.visible = false;
    this.advanceIndicator.visible = true;
    this.bounceTimer = 0;
    this.visitedPages[this.currentPage] = true;
  }

  private updatePageIndicator(): void {
    this.pageIndicator.text = `${this.currentPage + 1}/${DIALOGUE_PAGES.length}`;
  }

  private updateCursorPosition(): void {
    // Position cursor after the last character of current text
    const bounds = this.dialogueText.getBounds();
    if (bounds.width > 0) {
      this.cursorText.x = this.dialogueText.x + bounds.width + 2;

      // Find the last line's y position
      const lines = this.dialogueText.text.split('\n');
      const lineHeight = 14;
      this.cursorText.y = this.dialogueText.y + (lines.length - 1) * lineHeight;
    } else {
      this.cursorText.x = this.dialogueText.x;
      this.cursorText.y = this.dialogueText.y;
    }
  }

  private getAdvanceBaseY(): number {
    return this.dialogueBoxY + this.dialogueBoxH - 12;
  }

  // --- Layout constants ---
  private dialogueBoxX = 6;
  private dialogueBoxY = 62;
  private dialogueBoxW = 148;
  private dialogueBoxH = 72;

  // --- Init ---

  private init(): void {
    this.initWelcome();
    this.initDialogue();
    this.visible = false;
  }

  private initWelcome(): void {
    const screenW = PORTFOLIO_CONFIG.screen.width;
    const screenH = PORTFOLIO_CONFIG.screen.height;

    const container = this.welcomeContainer = new Container();
    container.visible = false;
    this.addChild(container);

    // White background
    const bg = new Graphics();
    bg.rect(0, 0, screenW, screenH).fill(0xFFFFFF);
    container.addChild(bg);

    // "WELCOME" text
    const welcomeText = new Text({
      text: 'WELCOME',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x000000,
      },
    });
    welcomeText.anchor.set(0.5, 0);
    welcomeText.x = screenW * 0.5;
    welcomeText.y = 36;
    container.addChild(welcomeText);

    // Rose logo
    const logoTexture = Loader.assets['assets/other/rose-logo'] as Texture;
    if (logoTexture) {
      const logo = new Sprite(logoTexture);
      logo.anchor.set(0.5, 0);
      logo.x = screenW * 0.5;
      logo.y = 54;
      logo.width = 24;
      logo.height = 24;
      if (logo.texture.source) {
        logo.texture.source.scaleMode = 'nearest';
      }
      container.addChild(logo);
    }

    // "PRESS A TO START" blinking
    this.blinkText = new Text({
      text: 'PRESS A TO START',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x888888,
      },
    });
    this.blinkText.anchor.set(0.5, 0);
    this.blinkText.x = screenW * 0.5;
    this.blinkText.y = 96;
    container.addChild(this.blinkText);
  }

  private initDialogue(): void {
    const screenW = PORTFOLIO_CONFIG.screen.width;
    const screenH = PORTFOLIO_CONFIG.screen.height;

    const container = this.dialogueContainer = new Container();
    container.visible = false;
    this.addChild(container);

    // White background
    const bg = new Graphics();
    bg.rect(0, 0, screenW, screenH).fill(0xFFFFFF);
    container.addChild(bg);

    // Character sprite (3x scaled idle)
    this.drawCharacterSprite(container);

    // Dialogue box — double border Game Boy style
    const box = new Graphics();
    const bx = this.dialogueBoxX;
    const by = this.dialogueBoxY;
    const bw = this.dialogueBoxW;
    const bh = this.dialogueBoxH;

    // Outer border
    box.rect(bx, by, bw, bh).stroke({ color: 0x000000, width: 1 });
    // Inner border
    box.rect(bx + 2, by + 2, bw - 4, bh - 4).stroke({ color: 0x000000, width: 1 });
    // Fill inside
    box.rect(bx + 3, by + 3, bw - 6, bh - 6).fill(0xFFFFFF);
    container.addChild(box);

    // Page indicator (top-right inside box)
    this.pageIndicator = new Text({
      text: '1/5',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x999999,
      },
    });
    this.pageIndicator.anchor.set(1, 0);
    this.pageIndicator.x = bx + bw - 8;
    this.pageIndicator.y = by + 6;
    container.addChild(this.pageIndicator);

    // Dialogue text
    this.dialogueText = new Text({
      text: '',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x000000,
        wordWrap: false,
        lineHeight: 14,
      },
    });
    this.dialogueText.x = bx + 8;
    this.dialogueText.y = by + 8;
    container.addChild(this.dialogueText);

    // Blinking cursor
    this.cursorText = new Text({
      text: '\u25AE',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x000000,
      },
    });
    this.cursorText.visible = false;
    container.addChild(this.cursorText);

    // Advance indicator ▼
    this.advanceIndicator = new Text({
      text: '\u25BC',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x000000,
      },
    });
    this.advanceIndicator.anchor.set(1, 0);
    this.advanceIndicator.x = bx + bw - 8;
    this.advanceIndicator.y = this.getAdvanceBaseY();
    this.advanceIndicator.visible = false;
    container.addChild(this.advanceIndicator);

    // Skip hint
    const skipHint = new Text({
      text: 'B - SKIP',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0xAAAAAA,
      },
    });
    skipHint.anchor.set(1, 0);
    skipHint.x = screenW - 6;
    skipHint.y = screenH - 8;
    container.addChild(skipHint);
  }

  private drawCharacterSprite(parent: Container): void {
    const screenW = PORTFOLIO_CONFIG.screen.width;
    const g = new Graphics();
    const s = 3; // scale factor

    // Centered horizontally, positioned in upper area
    const offsetX = screenW * 0.5 - (5 * s); // center of 10px-wide char
    const offsetY = 8;

    // Hair — top
    g.rect(offsetX + 2*s, offsetY + 0, 6*s, 2*s).fill(0x1A1A1A);
    g.rect(offsetX + 3*s, offsetY - 1*s, 4*s, 1*s).fill(0x1A1A1A);
    // Bangs at front
    g.rect(offsetX + 7*s, offsetY + 2*s, 1*s, 1*s).fill(0x1A1A1A);
    // Ponytail
    g.rect(offsetX + 1*s, offsetY + 1*s, 2*s, 2*s).fill(0x1A1A1A);
    g.rect(offsetX + 0, offsetY + 3*s, 2*s, 1*s).fill(0x1A1A1A);
    g.rect(offsetX - 1*s, offsetY + 4*s, 2*s, 2*s).fill(0x1A1A1A);
    g.rect(offsetX - 1*s, offsetY + 6*s, 2*s, 1*s).fill(0x2D2D2D);
    // Hair tie
    g.rect(offsetX + 1*s, offsetY + 2*s, 1*s, 1*s).fill(0xFF4466);
    // Head
    g.rect(offsetX + 2*s, offsetY + 2*s, 6*s, 3*s).fill(0xC68642);
    // Jumpsuit body
    g.rect(offsetX + 1*s, offsetY + 5*s, 8*s, 5*s).fill(0x1C1C1C);
    // V-neck
    g.rect(offsetX + 4*s, offsetY + 5*s, 2*s, 1*s).fill(0xC68642);
    // Belt
    g.rect(offsetX + 1*s, offsetY + 9*s, 8*s, 1*s).fill(0x333333);
    // Legs
    g.rect(offsetX + 2*s, offsetY + 10*s, 3*s, 3*s).fill(0x1C1C1C);
    g.rect(offsetX + 5*s, offsetY + 10*s, 3*s, 3*s).fill(0x1C1C1C);
    // Shoes
    g.rect(offsetX + 2*s, offsetY + 13*s, 3*s, 1*s).fill(0x111111);
    g.rect(offsetX + 5*s, offsetY + 13*s, 3*s, 1*s).fill(0x111111);

    parent.addChild(g);
  }
}
