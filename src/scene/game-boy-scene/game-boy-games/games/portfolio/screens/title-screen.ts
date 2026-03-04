import { Text } from 'pixi.js';
import GameScreenAbstract from '../../shared/game-screen-abstract';
import { BUTTON_TYPE } from '../../../../game-boy/data/game-boy-data';
import { GAME_BOY_CONFIG } from '../../../../game-boy/data/game-boy-config';
import { Timeout, TimeoutInstance } from '../../../../../../core/helpers/timeout';

export default class TitleScreen extends GameScreenAbstract {
  private nameText: Text;
  private startText: Text;
  private blinkTimer: TimeoutInstance;
  private blinkTime: number;

  constructor() {
    super();

    this.nameText = null;
    this.startText = null;
    this.blinkTimer = null;
    this.blinkTime = 700;

    this.init();
  }

  public show(): void {
    super.show();

    this.nameText.visible = true;
    this.startText.visible = true;
    this.blinkStartText();
  }

  public hide(): void {
    super.hide();

    this.stopTweens();
    this.reset();
  }

  public onButtonPress(buttonType: BUTTON_TYPE): void {
    if (buttonType === BUTTON_TYPE.Start || buttonType === BUTTON_TYPE.A || buttonType === BUTTON_TYPE.B) {
      this.events.emit('onStartGame');
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
    this.startText.visible = false;
  }

  private blinkStartText(): void {
    this.blinkTimer = Timeout.call(this.blinkTime, () => {
      this.startText.visible = !this.startText.visible;
      this.blinkStartText();
    });
  }

  private init(): void {
    this.initNameText();
    this.initStartText();

    this.visible = false;
  }

  private initNameText(): void {
    const nameText = this.nameText = new Text({
      text: 'ESME NAVA',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x000000,
      },
    });

    this.addChild(nameText);

    nameText.anchor.set(0.5, 0);
    nameText.x = GAME_BOY_CONFIG.screen.width * 0.5;
    nameText.y = 50;
  }

  private initStartText(): void {
    const startText = this.startText = new Text({
      text: 'PRESS START',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x000000,
      },
    });

    this.addChild(startText);

    startText.anchor.set(0.5, 0);
    startText.x = GAME_BOY_CONFIG.screen.width * 0.5;
    startText.y = 100;
    startText.visible = false;
  }
}
