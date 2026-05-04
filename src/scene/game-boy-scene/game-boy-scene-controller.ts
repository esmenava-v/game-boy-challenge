import * as THREE from "three";
import { Application, EventEmitter } from "pixi.js";
import { SCENE_OBJECT_TYPE } from "./data/game-boy-scene-data";
import { GAME_BOY_CONFIG } from "./game-boy/data/game-boy-config";
import {
  CARTRIDGES_BY_TYPE_CONFIG,
  CARTRIDGE_TYPE,
} from "./cartridges/data/cartridges-config";
import { BUTTON_TYPE } from "./game-boy/data/game-boy-data";
import SCENE_CONFIG from "../../Data/Configs/Main/scene-config";
import { CARTRIDGE_STATE } from "./game-boy/data/game-boy-data";
import { TETRIS_CONFIG } from "./game-boy-games/games/tetris/data/tetris-config";
import { GAME_TYPE } from "./game-boy-games/data/games-config";
import { SPACE_INVADERS_CONFIG } from "./game-boy-games/games/space-invaders/data/space-invaders-config";
import { SOUNDS_CONFIG } from "../../Data/Configs/Main/sounds-config";
import DEBUG_CONFIG from "../../Data/Configs/Main/debug-config";
import TWEEN from "three/addons/libs/tween.module.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import RaycasterController from "../raycaster-controller";
import GameBoyDebug from "./game-boy-debug";
import CameraController from "./camera-controller/camera-controller";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import Cartridge from "./cartridges/cartridge";

export default class GameBoyController {
  public events: EventEmitter;

  private orbitControls: OrbitControls;
  private outlinePass: OutlinePass;
  private raycasterController: RaycasterController;
  private activeObjects: { [key in SCENE_OBJECT_TYPE]?: any };
  private gameBoyDebug: GameBoyDebug;
  private games: any;
  private cameraController: CameraController;
  private camera: THREE.PerspectiveCamera;
  private pixiApp: Application;

  private pointerPosition: THREE.Vector2;
  private pointerPositionOnDown: THREE.Vector2;
  private dragPointerDownPosition: THREE.Vector2;
  private draggingObject: any;
  private isIntroActive: boolean;
  private isAnimatingIntro: boolean;
  private profileIntro: HTMLElement;
  private onCartridgeTap: (e: PointerEvent) => void;
  private onCartridgeClick: (e: PointerEvent) => void;

  constructor(data: any) {
    this.events = new EventEmitter();

    this.orbitControls = data.orbitControls;
    this.outlinePass = data.outlinePass;
    this.raycasterController = data.raycasterController;
    this.activeObjects = data.activeObjects;
    this.gameBoyDebug = data.gameBoyDebug;
    this.games = data.games;
    this.cameraController = data.cameraController;
    this.camera = data.camera;
    this.pixiApp = data.pixiApp;

    this.pointerPosition = new THREE.Vector2();
    this.pointerPositionOnDown = new THREE.Vector2();
    this.dragPointerDownPosition = new THREE.Vector2();
    this.draggingObject = null;

    this.isIntroActive =
      GAME_BOY_CONFIG.intro.enabled && !DEBUG_CONFIG.startState.disableIntro;
    this.isAnimatingIntro = false;

    this.init();
  }

  public update(dt: number): void {
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].update(dt);
    this.activeObjects[SCENE_OBJECT_TYPE.Cartridges].update(dt);
    this.cameraController.update(dt);

    if (this.isAnimatingIntro) {
      return;
    }

    if (this.isIntroActive) {
      const introIntersect = this.raycasterController.checkIntersection(
        this.pointerPosition.x,
        this.pointerPosition.y,
      );
      if (introIntersect && introIntersect.object &&
          introIntersect.object.userData.sceneObjectType === SCENE_OBJECT_TYPE.Cartridges) {
        this.pixiApp.canvas.style.cursor = "pointer";
      } else {
        this.pixiApp.canvas.style.cursor = "auto";
      }
      return;
    }

    const intersect = this.raycasterController.checkIntersection(
      this.pointerPosition.x,
      this.pointerPosition.y,
    );

    if (intersect === null) {
      this.pixiApp.canvas.style.cursor = "auto";
      this.resetGlow();
    }

    if (intersect && intersect.object && !this.draggingObject) {
      this.checkToGlow(intersect);
    }

    if (intersect && intersect.object) {
      const object = intersect.object;
      const sceneObjectType = object.userData.sceneObjectType;
      this.activeObjects[sceneObjectType].onPointerOver(object);
    }
  }

  public onPointerMove(x: number, y: number): void {
    this.pointerPosition.set(x, y);
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].onPointerMove(x, y);

    if (this.draggingObject) {
      const deltaX = this.dragPointerDownPosition.x - x;
      const deltaY = this.dragPointerDownPosition.y - y;
      this.draggingObject.onPointerDragMove(deltaX, deltaY);
    }
  }

  public onPointerDown(x: number, y: number): void {
    if (this.isAnimatingIntro) {
      return;
    }

    this.pointerPositionOnDown.set(x, y);

    const intersect = this.raycasterController.checkIntersection(x, y);

    if (!intersect) {
      return;
    }

    const intersectObject = intersect.object;

    if (intersectObject) {
      const sceneObjectType = intersectObject.userData.sceneObjectType;
      const activeObject = this.activeObjects[sceneObjectType];

      if (intersectObject.userData.isActive) {
        activeObject.onPointerDown(intersectObject);
      }

      if (intersectObject.userData.isDraggable) {
        this.dragPointerDownPosition.set(x, y);
        this.draggingObject = activeObject;
        this.draggingObject.onPointerDragDown(intersectObject);
      }
    }
  }

  public onPointerUp(): void {
    if (this.draggingObject) {
      this.draggingObject.onDragPointerUp();
      this.draggingObject = null;
    }

    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].onPointerUp();
  }

  public onWheelScroll(delta: number): void {
    this.cameraController.onWheelScroll(delta);
  }

  public onUISoundIconChanged(): void {
    this.onSoundsEnabledChanged();
    this.gameBoyDebug.updateSoundsEnabledController();
  }

  private checkToGlow(intersect: THREE.Intersection | null): void {
    const object = intersect?.object;

    if (
      object === null ||
      !object.userData.isActive ||
      !object.userData.showOutline
    ) {
      this.pixiApp.canvas.style.cursor = "auto";
      this.resetGlow();

      this.activeObjects[SCENE_OBJECT_TYPE.Cartridges].onPointerOut();

      return;
    }

    if (object.userData.isActive && object.userData.showOutline) {
      this.pixiApp.canvas.style.cursor = "pointer";

      const sceneObjectType = object.userData.sceneObjectType;
      const meshes =
        this.activeObjects[sceneObjectType].getOutlineMeshes(object);

      this.setGlow(meshes);
    }
  }

  private resetGlow(): void {
    if (this.outlinePass) {
      this.outlinePass.selectedObjects = [];
    }
  }

  private setGlow(meshes: THREE.Object3D[]): void {
    if (this.outlinePass) {
      this.outlinePass.selectedObjects = meshes;
    }
  }

  private powerOn(): void {
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].powerOn();
  }

  private init(): void {
    this.initSignals();
    this.initStartPowerState();
  }

  private initStartPowerState(): void {
    if (GAME_BOY_CONFIG.powerOn) {
      this.powerOn();
    }
  }

  private initSignals(): void {
    this.initIntroSignal();
    this.initActiveObjectsSignals();
    this.initCameraControllerSignals();
    this.initGamesSignals();
    this.initDebugSignals();
  }

  private initIntroSignal(): void {
    const introText = document.querySelector(".intro-text") as HTMLElement;

    if (
      GAME_BOY_CONFIG.intro.enabled &&
      !DEBUG_CONFIG.startState.disableIntro
    ) {
      introText.innerHTML = "Click to start";

      if (SCENE_CONFIG.isMobile) {
        // Mobile: show profile intro with name, title, and CTA
        introText.classList.add("fastHide");

        this.profileIntro = document.querySelector(
          ".profile-intro",
        ) as HTMLElement;
        this.profileIntro.innerHTML = `
          <div class="profile-name">esmé nava</div>
          <div class="profile-title">Design Engineer</div>
          <div class="profile-cta profile-cta--blink">Tap Game to Start</div>
          <div class="profile-socials" style="justify-content: center;">
            <a href="https://x.com/esmenavav" target="_blank" rel="noopener noreferrer" class="profile-social-link">
              <img src="assets/other/x-logo-black.png" alt="X" class="profile-social-icon" />
            </a>
            <a href="https://www.linkedin.com/in/esmeralda-nava/" target="_blank" rel="noopener noreferrer" class="profile-social-link">
              <img src="assets/other/linkedin-logo.png" alt="LinkedIn" class="profile-social-icon" />
            </a>
          </div>
        `;
        this.profileIntro.classList.add("show");
        this.profileIntro.style.left = "50%";
        this.profileIntro.style.transform = "translateX(-50%)";
        this.profileIntro.style.textAlign = "center";
        this.profileIntro.style.top = "15%";

        // Start only when cartridge is tapped
        this.onCartridgeTap = (e: PointerEvent) => {
          if (!this.isIntroActive) return;

          const intersect = this.raycasterController.checkIntersection(e.clientX, e.clientY);

          if (
            intersect &&
            intersect.object &&
            intersect.object.userData.sceneObjectType === SCENE_OBJECT_TYPE.Cartridges
          ) {
            this.isIntroActive = false;
            this.profileIntro.classList.add("hide");
            this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].disableIntro();

            // Animate Game Boy sliding up into view
            this.isAnimatingIntro = true;
            const gameBoy = this.activeObjects[SCENE_OBJECT_TYPE.GameBoy];
            new TWEEN.Tween(gameBoy.position)
              .to({ y: 0 }, 800)
              .easing(TWEEN.Easing.Quadratic.Out)
              .start()
              .onComplete(() => {
                this.isAnimatingIntro = false;
              });

            // Simultaneously insert the cartridge
            this.activeObjects[SCENE_OBJECT_TYPE.Cartridges].insertCartridge(
              CARTRIDGE_TYPE.Portfolio,
            );

            window.removeEventListener("pointerdown", this.onCartridgeTap);
          }
        };

        window.addEventListener("pointerdown", this.onCartridgeTap);
      } else {
        // Desktop: show profile intro instead of plain "Click to start"
        introText.classList.add("fastHide");

        this.profileIntro = document.querySelector(
          ".profile-intro",
        ) as HTMLElement;
        this.profileIntro.innerHTML = `
          <div class="profile-name">esmé nava</div>
          <div class="profile-title">Design Engineer</div>
          <div class="profile-cta profile-cta--blink">Click game</div>
          <div class="profile-socials">
            <a href="https://x.com/esmenavav" target="_blank" rel="noopener noreferrer" class="profile-social-link">
              <img src="assets/other/x-logo-black.png" alt="X" class="profile-social-icon" />
            </a>
            <a href="https://www.linkedin.com/in/esmeralda-nava/" target="_blank" rel="noopener noreferrer" class="profile-social-link">
              <img src="assets/other/linkedin-logo.png" alt="LinkedIn" class="profile-social-icon" />
            </a>
          </div>
        `;
        this.profileIntro.classList.add("show");

        // Position text above the cartridge by projecting its 3D position to screen
        const cartridge =
          this.activeObjects[SCENE_OBJECT_TYPE.Cartridges].getAllMeshes()[0];
        const positionProfileText = () => {
          const worldPos = cartridge.position.clone();
          worldPos.project(this.camera);
          const screenX = (worldPos.x * 0.5 + 0.2) * window.innerWidth;
          const screenY = (-worldPos.y * 0.5 + 0.4) * window.innerHeight;
          const textHeight = this.profileIntro.getBoundingClientRect().height;
          this.profileIntro.style.bottom = `${
            window.innerHeight - screenY + textHeight + 24
          }px`;
          this.profileIntro.style.right = `${window.innerWidth - screenX}px`;
          this.profileIntro.style.left = "";
          this.profileIntro.style.transform = "none";
        };

        positionProfileText();
        window.addEventListener("resize", () => {
          if (this.isIntroActive) positionProfileText();
        });

        this.onCartridgeClick = (e: PointerEvent) => {
          if (!this.isIntroActive) return;

          const intersect = this.raycasterController.checkIntersection(e.clientX, e.clientY);

          if (
            intersect &&
            intersect.object &&
            intersect.object.userData.sceneObjectType === SCENE_OBJECT_TYPE.Cartridges
          ) {
            this.isIntroActive = false;
            this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].disableIntro();
            this.profileIntro.classList.add("hide");
            window.removeEventListener("pointerdown", this.onCartridgeClick);
          }
        };

        window.addEventListener("pointerdown", this.onCartridgeClick);
      }
    }
  }

  private initActiveObjectsSignals(): void {
    const gameBoy = this.activeObjects[SCENE_OBJECT_TYPE.GameBoy];
    const cartridges = this.activeObjects[SCENE_OBJECT_TYPE.Cartridges];
    const background = this.activeObjects[SCENE_OBJECT_TYPE.Background];

    gameBoy.events.on("onButtonPress", (buttonType: string) => {
      if (buttonType === BUTTON_TYPE.Start && !this.games.hasGame()) {
        this.activeObjects[SCENE_OBJECT_TYPE.Cartridges].insertCartridge(
          CARTRIDGE_TYPE.Portfolio,
        );
        return;
      }
      this.games.onButtonPress(buttonType);
    });
    gameBoy.events.on("onButtonUp", (buttonType: string) =>
      this.games.onButtonUp(buttonType),
    );
    gameBoy.events.on("onPowerOn", () => this.onPowerOn());
    gameBoy.events.on("onPowerOff", () => this.onPowerOff());
    gameBoy.events.on("onGameBoyVolumeChanged", () =>
      this.onGameBoyVolumeChanged(),
    );
    gameBoy.events.on("onZoomIn", () => this.cameraController.zoomIn());
    gameBoy.events.on("onZoomOut", () => this.cameraController.zoomOut());
    cartridges.events.on("onCartridgeInserting", () =>
      this.onCartridgeInserting(),
    );
    cartridges.events.on("onCartridgeInserted", (cartridge: Cartridge) =>
      this.onCartridgeInserted(cartridge),
    );
    cartridges.events.on("onCartridgeEjecting", () =>
      this.onCartridgeEjecting(),
    );
    cartridges.events.on("onCartridgeEjected", () => this.onCartridgeEjected());
    cartridges.events.on("cartridgeTypeChanged", () =>
      this.onCartridgeTypeChanged(),
    );
    cartridges.events.on("cartridgeInsertSound", () =>
      gameBoy.playCartridgeInsertSound(),
    );
    cartridges.events.on("cartridgeEjectSound", () =>
      gameBoy.playCartridgeEjectSound(),
    );
    cartridges.events.on("cartridgeStartEjecting", () =>
      gameBoy.setCartridgePocketStandardTexture(),
    );
    background.events.on("onClick", () => gameBoy.onBackgroundClick());
  }

  private initCameraControllerSignals(): void {
    const cartridges = this.activeObjects[SCENE_OBJECT_TYPE.Cartridges];

    this.cameraController.events.on("onRotationDragDisabled", () =>
      this.onRotationDragDisabled(),
    );
    this.cameraController.events.on("onZoom", (zoomPercent: number) =>
      cartridges.onZoomChanged(zoomPercent),
    );
  }

  private initGamesSignals(): void {
    this.games.events.on("onTetrisBestScoreChange", () =>
      this.onTetrisBestScoreChange(),
    );
    this.games.events.on("onSpaceInvadersBestScoreChange", () =>
      this.onSpaceInvadersBestScoreChange(),
    );
    this.games.events.on("gameStarted", (gameType: GAME_TYPE) =>
      this.onGameStarted(gameType),
    );
    this.games.events.on("gameStopped", (gameType: GAME_TYPE) =>
      this.onGameStopped(gameType),
    );
  }

  private initDebugSignals(): void {
    const gameBoy = this.activeObjects[SCENE_OBJECT_TYPE.GameBoy];

    this.gameBoyDebug.events.on("rotationCursorChanged", () =>
      gameBoy.onDebugRotationChanged(),
    );
    this.gameBoyDebug.events.on("rotationDragChanged", () =>
      gameBoy.onDebugRotationChanged(),
    );
    this.gameBoyDebug.events.on("fpsMeterChanged", () =>
      this.events.emit("fpsMeterChanged"),
    );
    this.gameBoyDebug.events.on("orbitControlsChanged", () =>
      this.onOrbitControlsChanged(),
    );
    this.gameBoyDebug.events.on("turnOnButtonClicked", () =>
      gameBoy.powerButtonSwitch(),
    );
    this.gameBoyDebug.events.on("ejectCartridgeButtonClicked", () =>
      this.onEjectCartridgeButtonClicked(),
    );
    this.gameBoyDebug.events.on(
      "insertCartridgeButtonClicked",
      (cartridgeType: CARTRIDGE_TYPE) =>
        this.onInsertCartridgeButtonClicked(cartridgeType),
    );
    this.gameBoyDebug.events.on("audioEnabledChanged", () =>
      this.onDebugSoundsEnabledChanged(),
    );
    this.gameBoyDebug.events.on("masterVolumeChanged", () =>
      this.onMasterVolumeChanged(),
    );
    this.gameBoyDebug.events.on("gameBoyVolumeChanged", () =>
      this.onDebugGameBoyVolumeChanged(),
    );
    this.gameBoyDebug.events.on("restartTetrisButtonClicked", (level: number) =>
      this.restartTetrisButtonClicked(level),
    );
    this.gameBoyDebug.events.on("tetrisDisableFalling", () =>
      this.onTetrisDisableFalling(),
    );
    this.gameBoyDebug.events.on("tetrisClearBottomLine", () =>
      this.onTetrisClearBottomLine(),
    );
  }

  private onPowerOn(): void {
    this.gameBoyDebug.updateGameBoyPowerState();
    this.gameBoyDebug.updateGameBoyTurnOnButton();
    this.games.onPowerOn();
  }

  private onPowerOff(): void {
    this.gameBoyDebug.updateGameBoyPowerState();
    this.gameBoyDebug.updateGameBoyTurnOnButton();
    this.games.onPowerOff();
  }

  private onGameBoyVolumeChanged(): void {
    this.games.onVolumeChanged();
    this.gameBoyDebug.updateGameBoyVolume();
  }

  private onCartridgeInserting(): void {
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].disableRotation();
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].resetRotationFast();
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].powerOff();
  }

  private onCartridgeEjecting(): void {
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].disableRotation();
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].resetRotationFast();
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].powerOff();
  }

  private onCartridgeInserted(cartridge: Cartridge): void {
    const cartridgeType: CARTRIDGE_TYPE = cartridge.getType();
    const gameType: GAME_TYPE = CARTRIDGES_BY_TYPE_CONFIG[cartridgeType].game;
    this.games.setGame(gameType);

    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].addCartridge(cartridge);
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].enableRotation();
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].powerOn();
    this.activeObjects[
      SCENE_OBJECT_TYPE.GameBoy
    ].setCartridgePocketStandardTexture();

    if (gameType === GAME_TYPE.Portfolio) {
      this.cameraController.zoomToScreen();
    }

    this.gameBoyDebug.enableEjectCartridgeButton();

    if (cartridgeType === CARTRIDGE_TYPE.Tetris) {
      TETRIS_CONFIG.cartridgeState = CARTRIDGE_STATE.Inserted;
      this.gameBoyDebug.updateTetrisCartridgeState();
    }
  }

  private onCartridgeEjected(): void {
    this.games.setNoGame();
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].enableRotation();
    this.gameBoyDebug.disableEjectCartridgeButton();

    TETRIS_CONFIG.cartridgeState = CARTRIDGE_STATE.NotInserted;
    this.gameBoyDebug.updateTetrisCartridgeState();

    if (SCENE_CONFIG.isMobile) {
      this.returnToLandingPage();
    } else {
      this.returnToLandingPageDesktop();
    }
  }

  private returnToLandingPage(): void {
    this.isAnimatingIntro = true;

    // Zoom camera back out
    this.cameraController.zoomToDefault();

    // Slide Game Boy back down off-screen
    const gameBoy = this.activeObjects[SCENE_OBJECT_TYPE.GameBoy];
    new TWEEN.Tween(gameBoy.position)
      .to({ y: -10 }, 800)
      .easing(TWEEN.Easing.Quadratic.In)
      .start()
      .onComplete(() => {
        this.isAnimatingIntro = false;
        this.isIntroActive = true;

        // Re-show profile intro
        this.profileIntro.classList.remove("hide");

        // Re-register cartridge tap listener
        window.addEventListener("pointerdown", this.onCartridgeTap);
      });
  }

  private returnToLandingPageDesktop(): void {
    this.isIntroActive = true;

    // Re-show profile intro
    this.profileIntro.classList.remove("hide");

    // Re-register cartridge click listener
    window.addEventListener("pointerdown", this.onCartridgeClick);
  }

  private onCartridgeTypeChanged(): void {
    this.gameBoyDebug.updateCartridgeType();
  }

  private onRotationDragDisabled(): void {
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].resetRotation();
  }

  private onOrbitControlsChanged(): void {
    this.orbitControls.enabled = DEBUG_CONFIG.orbitControls;
  }

  private onEjectCartridgeButtonClicked(): void {
    this.activeObjects[SCENE_OBJECT_TYPE.Cartridges].ejectCartridge();
  }

  private onInsertCartridgeButtonClicked(cartridgeType: CARTRIDGE_TYPE): void {
    this.activeObjects[SCENE_OBJECT_TYPE.Cartridges].insertCartridge(
      cartridgeType,
    );
  }

  private onSoundsEnabledChanged(): void {
    if (SOUNDS_CONFIG.enabled) {
      this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].enableSound();
    } else {
      this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].disableSound();
    }
  }

  private onDebugSoundsEnabledChanged(): void {
    this.onSoundsEnabledChanged();
    this.events.emit("onSoundsEnabledChanged");
  }

  private onMasterVolumeChanged(): void {
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].onVolumeChanged(
      SOUNDS_CONFIG.masterVolume,
    );
  }

  private onDebugGameBoyVolumeChanged(): void {
    this.games.onVolumeChanged();
    this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].updateVolumeControlRotation();
  }

  private onTetrisBestScoreChange(): void {
    this.gameBoyDebug.updateTetrisBestScore(TETRIS_CONFIG.bestScore);
  }

  private onSpaceInvadersBestScoreChange(): void {
    this.gameBoyDebug.updateSpaceInvadersBestScore(
      SPACE_INVADERS_CONFIG.bestScore,
    );
  }

  private onGameStarted(gameType: GAME_TYPE): void {
    if (gameType === GAME_TYPE.Zelda) {
      this.activeObjects[SCENE_OBJECT_TYPE.GameBoy].showZeldaIntro();
    }

    if (gameType === GAME_TYPE.Tetris) {
      this.gameBoyDebug.enableTetrisButtons();
    }
  }

  private onGameStopped(gameType: GAME_TYPE): void {
    if (gameType === GAME_TYPE.Tetris) {
      this.gameBoyDebug.disableTetrisButtons();
    }
  }

  private restartTetrisButtonClicked(level: number): void {
    this.games.restartTetris(level);
  }

  private onTetrisDisableFalling(): void {
    this.games.disableTetrisFalling();
  }

  private onTetrisClearBottomLine(): void {
    this.games.clearTetrisBottomLine();
  }
}
