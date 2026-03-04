import { Container, Graphics, Text } from 'pixi.js';
import { PORTFOLIO_CONFIG } from '../../data/portfolio-config';
import { ZONES, ZoneData } from '../../data/world-data';

enum LABEL_STATE {
  Hidden = 'HIDDEN',
  FadingIn = 'FADING_IN',
  Showing = 'SHOWING',
  FadingOut = 'FADING_OUT',
}

export default class UIOverlay extends Container {
  private zoneLabelText: Text;
  private labelState: LABEL_STATE;
  private labelTimer: number;
  private progressDots: Graphics[];
  private dotsContainer: Container;

  constructor() {
    super();

    this.labelState = LABEL_STATE.Hidden;
    this.labelTimer = 0;
    this.progressDots = [];

    this.init();
  }

  public update(dt: number): void {
    this.updateLabel(dt);
  }

  public showZoneLabel(zone: ZoneData): void {
    this.zoneLabelText.text = zone.label;
    this.zoneLabelText.alpha = 0;
    this.zoneLabelText.visible = true;
    this.labelState = LABEL_STATE.FadingIn;
    this.labelTimer = 0;
  }

  public updateProgressDots(zoneIndex: number): void {
    for (let i = 0; i < this.progressDots.length; i++) {
      const dot = this.progressDots[i];
      dot.clear();

      if (i === zoneIndex) {
        dot.rect(0, 0, 3, 3).fill(0x000000);
      } else {
        dot.rect(0, 0, 3, 3).stroke({ color: 0x000000, width: 1 });
      }
    }
  }

  private init(): void {
    this.initZoneLabel();
    this.initProgressDots();
  }

  private initZoneLabel(): void {
    this.zoneLabelText = new Text({
      text: '',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x000000,
      },
    });

    this.addChild(this.zoneLabelText);
    this.zoneLabelText.anchor.set(0.5, 0);
    this.zoneLabelText.x = PORTFOLIO_CONFIG.screen.width * 0.5;
    this.zoneLabelText.y = 4;
    this.zoneLabelText.visible = false;
  }

  private initProgressDots(): void {
    this.dotsContainer = new Container();
    this.addChild(this.dotsContainer);

    const dotSize = 3;
    const gap = 2;
    const totalWidth = ZONES.length * dotSize + (ZONES.length - 1) * gap;
    const startX = PORTFOLIO_CONFIG.screen.width - totalWidth - 4;

    for (let i = 0; i < ZONES.length; i++) {
      const dot = new Graphics();
      dot.rect(0, 0, dotSize, dotSize).stroke({ color: 0x000000, width: 1 });
      dot.x = startX + i * (dotSize + gap);
      dot.y = 4;
      this.dotsContainer.addChild(dot);
      this.progressDots.push(dot);
    }
  }

  private updateLabel(dt: number): void {
    const fadeInTime = 500;
    const showTime = 2000;
    const fadeOutTime = 500;

    if (this.labelState === LABEL_STATE.FadingIn) {
      this.labelTimer += dt * 1000;
      this.zoneLabelText.alpha = Math.min(1, this.labelTimer / fadeInTime);

      if (this.labelTimer >= fadeInTime) {
        this.labelState = LABEL_STATE.Showing;
        this.labelTimer = 0;
      }
    } else if (this.labelState === LABEL_STATE.Showing) {
      this.labelTimer += dt * 1000;

      if (this.labelTimer >= showTime) {
        this.labelState = LABEL_STATE.FadingOut;
        this.labelTimer = 0;
      }
    } else if (this.labelState === LABEL_STATE.FadingOut) {
      this.labelTimer += dt * 1000;
      this.zoneLabelText.alpha = Math.max(0, 1 - this.labelTimer / fadeOutTime);

      if (this.labelTimer >= fadeOutTime) {
        this.labelState = LABEL_STATE.Hidden;
        this.zoneLabelText.visible = false;
      }
    }
  }
}
