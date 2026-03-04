import { EventEmitter } from 'pixi.js';
import GameAbstract from '../game-abstract';
import { PORTFOLIO_SCREEN_TYPE } from './data/portfolio-data';
import TitleScreen from './screens/title-screen';
import ExperienceScreen from './screens/experience-screen';

export default class Portfolio extends GameAbstract {
  public events: EventEmitter;

  private screens: { [key in PORTFOLIO_SCREEN_TYPE]?: any };
  private currentScreenType: PORTFOLIO_SCREEN_TYPE;

  constructor() {
    super();

    this.events = new EventEmitter();

    this.screens = {};
    this.currentScreenType = null;

    this.init();
  }

  public update(dt: number): void {
    if (this.currentScreenType) {
      this.screens[this.currentScreenType].update(dt);
    }
  }

  public show(): void {
    super.show();

    this.showScreen(PORTFOLIO_SCREEN_TYPE.Title);
  }

  public hide(): void {
    super.hide();

    for (let screenType in this.screens) {
      this.screens[screenType].hide();
    }
  }

  public onButtonPress(buttonType: string): void {
    if (!this.currentScreenType) {
      return;
    }

    this.screens[this.currentScreenType].onButtonPress(buttonType);
  }

  public onButtonUp(buttonType: string): void {
    if (!this.currentScreenType) {
      return;
    }

    this.screens[this.currentScreenType].onButtonUp(buttonType);
  }

  public stopTweens(): void {
    for (let screenType in this.screens) {
      this.screens[screenType].stopTweens();
    }
  }

  private showScreen(screenType: PORTFOLIO_SCREEN_TYPE): void {
    this.currentScreenType = screenType;
    this.screens[screenType].show();
  }

  private init(): void {
    this.initScreens();
    this.initSignals();
  }

  private initScreens(): void {
    const titleScreen = new TitleScreen();
    this.addChild(titleScreen);
    this.screens[PORTFOLIO_SCREEN_TYPE.Title] = titleScreen;

    const experienceScreen = new ExperienceScreen();
    this.addChild(experienceScreen);
    this.screens[PORTFOLIO_SCREEN_TYPE.Experience] = experienceScreen;
  }

  private initSignals(): void {
    this.screens[PORTFOLIO_SCREEN_TYPE.Title].events.on('onStartGame', () => this.onStartGame());
    this.screens[PORTFOLIO_SCREEN_TYPE.Experience].events.on('onReturnToTitle', () => this.onReturnToTitle());
  }

  private onStartGame(): void {
    this.screens[PORTFOLIO_SCREEN_TYPE.Title].hide();
    this.showScreen(PORTFOLIO_SCREEN_TYPE.Experience);
  }

  private onReturnToTitle(): void {
    this.screens[PORTFOLIO_SCREEN_TYPE.Experience].hide();
    this.showScreen(PORTFOLIO_SCREEN_TYPE.Title);
  }
}
