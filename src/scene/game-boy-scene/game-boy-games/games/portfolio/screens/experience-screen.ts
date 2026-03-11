import { Container, Text } from 'pixi.js';
import GameScreenAbstract from '../../shared/game-screen-abstract';
import { BUTTON_TYPE } from '../../../../game-boy/data/game-boy-data';
import { PORTFOLIO_CONFIG } from '../data/portfolio-config';
import { ZONES, ZoneData } from '../data/world-data';
import { Timeout, TimeoutInstance } from '../../../../../../core/helpers/timeout';
import PlayerCharacter, { PLAYER_STATE } from './experience/player-character';
import Camera from './experience/camera';
import WorldBuilder, { SignSprite } from './experience/world-builder';
import ZoneManager from './experience/zone-manager';
import UIOverlay from './experience/ui-overlay';
import SignPopup from './experience/sign-popup';

export default class ExperienceScreen extends GameScreenAbstract {
  private worldContainer: Container;
  private backgroundContainer: Container;
  private groundLayer: Container;
  private decorationLayer: Container;
  private entityLayer: Container;
  private player: PlayerCharacter;
  private camera: Camera;
  private worldBuilder: WorldBuilder;
  private zoneManager: ZoneManager;
  private uiOverlay: UIOverlay;
  private signPopup: SignPopup;

  private isAtEnd: boolean;
  private endingText: Text;
  private blinkTimer: TimeoutInstance;
  private blinkTime: number;

  constructor() {
    super();

    this.worldContainer = null;
    this.backgroundContainer = null;
    this.groundLayer = null;
    this.decorationLayer = null;
    this.entityLayer = null;
    this.player = null;
    this.camera = null;
    this.worldBuilder = null;
    this.zoneManager = null;
    this.uiOverlay = null;
    this.signPopup = null;

    this.isAtEnd = false;
    this.endingText = null;
    this.blinkTimer = null;
    this.blinkTime = 700;

    this.init();
  }

  public show(): void {
    super.show();
    this.isAtEnd = false;

    if (this.endingText) {
      this.endingText.visible = false;
    }
  }

  public hide(): void {
    super.hide();
    this.stopTweens();
    this.reset();
  }

  public update(dt: number): void {
    if (this.signPopup.getIsShowing()) {
      return;
    }

    if (this.isAtEnd) {
      return;
    }

    this.player.update(dt);

    this.camera.update(this.player.worldX);
    this.zoneManager.update(this.player.worldX, dt);
    this.uiOverlay.update(dt);

    this.worldBuilder.cullTiles(
      this.camera.getVisibleLeft(),
      this.camera.getVisibleRight()
    );

    // Check if player reached the end
    if (this.player.worldX >= PORTFOLIO_CONFIG.world.endZoneX) {
      this.showEnding();
    }
  }

  public onButtonPress(buttonType: BUTTON_TYPE): void {
    // Sign popup is showing — only B dismisses it
    if (this.signPopup.getIsShowing()) {
      if (buttonType === BUTTON_TYPE.B) {
        this.signPopup.hide();
      }
      return;
    }

    // At the ending — Start or B returns to title
    if (this.isAtEnd) {
      if (buttonType === BUTTON_TYPE.Start || buttonType === BUTTON_TYPE.B) {
        this.events.emit('onReturnToTitle');
      }
      return;
    }

    if (buttonType === BUTTON_TYPE.CrossLeft) {
      this.player.setMovementState(PLAYER_STATE.WalkLeft);
    }

    if (buttonType === BUTTON_TYPE.CrossRight) {
      this.player.setMovementState(PLAYER_STATE.WalkRight);
    }

    if (buttonType === BUTTON_TYPE.A || buttonType === BUTTON_TYPE.CrossUp) {
      // Try to read a nearby sign first
      if (buttonType === BUTTON_TYPE.A) {
        const nearbySign = this.getNearbySign();

        if (nearbySign) {
          this.signPopup.show(nearbySign.data);
          this.player.setMovementState(PLAYER_STATE.Idle);
          return;
        }
      }

      this.player.jump();
    }
  }

  public onButtonUp(buttonType: BUTTON_TYPE): void {
    if (buttonType === BUTTON_TYPE.CrossLeft && this.player.getMovementState() === PLAYER_STATE.WalkLeft) {
      this.player.setMovementState(PLAYER_STATE.Idle);
    }

    if (buttonType === BUTTON_TYPE.CrossRight && this.player.getMovementState() === PLAYER_STATE.WalkRight) {
      this.player.setMovementState(PLAYER_STATE.Idle);
    }
  }

  public stopTweens(): void {
    if (this.blinkTimer) {
      this.blinkTimer.stop();
    }
  }

  public reset(): void {
    this.isAtEnd = false;
    this.player.worldX = 30;
    this.player.worldY = PORTFOLIO_CONFIG.world.groundY;
    this.player.setMovementState(PLAYER_STATE.Idle);
    this.camera.reset();

    if (this.endingText) {
      this.endingText.visible = false;
    }
  }

  private init(): void {
    this.initContainers();
    this.initWorld();
    this.initPlayer();
    this.initCamera();
    this.initZoneManager();
    this.initUI();
    this.initSignPopup();
    this.initEndingText();

    this.visible = false;
  }

  private initContainers(): void {
    this.backgroundContainer = new Container();
    this.addChild(this.backgroundContainer);

    this.worldContainer = new Container();
    this.addChild(this.worldContainer);

    this.groundLayer = new Container();
    this.worldContainer.addChild(this.groundLayer);

    this.decorationLayer = new Container();
    this.worldContainer.addChild(this.decorationLayer);

    this.entityLayer = new Container();
    this.worldContainer.addChild(this.entityLayer);
  }

  private initWorld(): void {
    this.worldBuilder = new WorldBuilder(
      this.groundLayer,
      this.decorationLayer,
      this.backgroundContainer
    );
  }

  private initPlayer(): void {
    this.player = new PlayerCharacter();
    this.entityLayer.addChild(this.player);
  }

  private initCamera(): void {
    this.camera = new Camera(this.worldContainer, this.backgroundContainer);
  }

  private initZoneManager(): void {
    this.zoneManager = new ZoneManager();

    this.zoneManager.events.on('onZoneChange', (zone: ZoneData) => {
      if (zone) {
        this.uiOverlay.showZoneLabel(zone);
        this.uiOverlay.updateProgressDots(ZONES.indexOf(zone));
      }
    });
  }

  private initUI(): void {
    this.uiOverlay = new UIOverlay();
    this.addChild(this.uiOverlay);
  }

  private initSignPopup(): void {
    this.signPopup = new SignPopup();
    this.addChild(this.signPopup);
  }

  private initEndingText(): void {
    this.endingText = new Text({
      text: 'THE REST IS\nCOMING SOON...',
      style: {
        fontFamily: 'dogicapixel',
        fontSize: 8,
        fill: 0x000000,
        align: 'center',
      },
    });

    this.addChild(this.endingText);
    this.endingText.anchor.set(0.5, 0.5);
    this.endingText.x = PORTFOLIO_CONFIG.screen.width * 0.5;
    this.endingText.y = PORTFOLIO_CONFIG.screen.height * 0.4;
    this.endingText.visible = false;
  }

  private showEnding(): void {
    if (this.isAtEnd) return;

    this.isAtEnd = true;
    this.player.setMovementState(PLAYER_STATE.Idle);
    this.endingText.visible = true;
    this.blinkEndingText();
  }

  private blinkEndingText(): void {
    this.blinkTimer = Timeout.call(this.blinkTime, () => {
      this.endingText.visible = !this.endingText.visible;
      this.blinkEndingText();
    });
  }

  private getNearbySign(): SignSprite | null {
    const signs = this.worldBuilder.getSignSprites();
    const playerX = this.player.worldX;
    const signRange = 16;

    for (const sign of signs) {
      if (Math.abs(playerX - sign.worldX) <= signRange) {
        return sign;
      }
    }

    return null;
  }
}
