import * as THREE from 'three';
import { Application, Ticker } from 'pixi.js';
import TWEEN from 'three/addons/libs/tween.module.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import SCENE_CONFIG from '../Data/Configs/Main/scene-config';
import MainScene from '../main-scene';
import LoadingOverlay from './LoadingOverlay';
import Loader from './loader';
import Scene3DDebugMenu from './helpers/gui-helper/scene-3d-debug-menu';
import DEBUG_CONFIG from '../Data/Configs/Main/debug-config';
import WebGL from 'three/addons/capabilities/WebGL.js';
import isMobile from 'ismobilejs';
import { GAME_BOY_CONFIG } from '../scene/game-boy-scene/game-boy/data/game-boy-config';
import { GLOBAL_LIGHT_CONFIG } from '../Data/Configs/Main/global-light-config';
// DAY_NIGHT_CONFIG import commented out with the toggle UI
// import { DAY_NIGHT_CONFIG, initDayNightMode } from '../Data/Configs/Main/day-night-config';
import { initDayNightMode } from '../Data/Configs/Main/day-night-config';

export default class BaseScene {
  private pixiApp: Application;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private loadingOverlay: LoadingOverlay;
  private mainScene: MainScene;
  private scene3DDebugMenu: Scene3DDebugMenu;
  private effectComposer: EffectComposer;
  private outlinePass: OutlinePass;
  private orbitControls: any;
  private audioListener: THREE.AudioListener;
  private gameBoyPixiApp: Application;
  private fxaaPass: ShaderPass;

  private windowSizes: { width: number, height: number };
  private isAssetsLoaded: boolean;

  constructor() {
    this.isAssetsLoaded = false;

    SCENE_CONFIG.isMobile = isMobile(window.navigator).any;

    this.init();
  }

  public createGameScene(): void {
    initDayNightMode();
    const data = {
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer,
      orbitControls: this.orbitControls,
      outlinePass: this.outlinePass,
      audioListener: this.audioListener,
      pixiApp: this.pixiApp,
      gameBoyPixiApp: this.gameBoyPixiApp,
    };

    this.mainScene = new MainScene(data);

    this.initMainSceneSignals();
  }

  public afterAssetsLoaded(): void {
    this.isAssetsLoaded = true;

    this.loadingOverlay.hide();
    this.scene3DDebugMenu.showAfterAssetsLoad();
    this.mainScene.afterAssetsLoad();
    this.setupBackgroundColor();

    this.showCopyrights();

    if (!SCENE_CONFIG.isMobile) {
      this.showTextToLandscape();
    }

    this.keyboardControls();
  }

  public getOutlinePass(): OutlinePass {
    return this.outlinePass;
  }

  public initMainSceneSignals(): void {
    this.mainScene.events.on('fpsMeterChanged', () => this.scene3DDebugMenu.onFpsMeterClick());
  }

  private async init(): Promise<void> {
    this.initLoader();
    await this.initPixiJS();
    await this.initGameBoyPixiJS();
    this.initThreeJS();
    this.initUpdate();
  }

  private initLoader(): void {
    new Loader();
  }

  private async initPixiJS(): Promise<void> {
    const canvas = document.querySelector('.pixi-canvas') as HTMLCanvasElement;
    const pixiApp = this.pixiApp = new Application();

    await pixiApp.init({
      canvas: canvas,
      autoDensity: true,
      width: window.innerWidth,
      height: window.innerHeight,
      resizeTo: window,
      backgroundAlpha: 0,
    });

    Ticker.shared.autoStart = false;
    Ticker.shared.stop();
  }

  private async initGameBoyPixiJS(): Promise<void> {
    const canvas: HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
    canvas.width = GAME_BOY_CONFIG.screen.width;
    canvas.height = GAME_BOY_CONFIG.screen.height;

    const gameBoyPixiApp = this.gameBoyPixiApp = new Application();

    await gameBoyPixiApp.init({
      canvas: canvas,
      autoDensity: true,
      width: GAME_BOY_CONFIG.screen.width,
      height: GAME_BOY_CONFIG.screen.height,
      background: GAME_BOY_CONFIG.screen.tint,
      backgroundAlpha: 0,
    });

    Ticker.shared.autoStart = false;
    Ticker.shared.stop();

    this.gameBoyPixiApp.renderer.background.alpha = 1;
  }

  private initThreeJS(): void {
    this.initScene();
    this.initRenderer();
    this.initCamera();
    this.initLights();
    this.initLoadingOverlay();
    this.initOnResize();
    this.initPostProcessing();
    this.initAudioListener();

    this.initScene3DDebugMenu();
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
  }

  private initRenderer(): void {
    this.windowSizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const canvas: HTMLCanvasElement = document.querySelector('.threejs-canvas') as HTMLCanvasElement;

    const renderer = this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: SCENE_CONFIG.antialias,
    });

    renderer.setSize(this.windowSizes.width, this.windowSizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, SCENE_CONFIG.maxPixelRatio));

    // renderer.useLegacyLights = false;
    // renderer.outputEncoding = THREE.sRGBEncoding;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // renderer.toneMappingExposure = 1;

    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  private initCamera(): void {
    const camera = this.camera = new THREE.PerspectiveCamera(50, this.windowSizes.width / this.windowSizes.height, 0.5, 70);
    this.scene.add(camera);

    camera.position.set(0, 0, 6);
  }

  private initLights(): void {
    if (GLOBAL_LIGHT_CONFIG.ambient.enabled) {
      const ambientLight = new THREE.AmbientLight(GLOBAL_LIGHT_CONFIG.ambient.color, GLOBAL_LIGHT_CONFIG.ambient.intensity);
      this.scene.add(ambientLight);
    }
  }

  private initLoadingOverlay(): void {
    const loadingOverlay = this.loadingOverlay = new LoadingOverlay();
    this.scene.add(loadingOverlay);
  }

  private initOnResize(): void {
    window.addEventListener('resize', () => this.onResize());
  }

  private onResize(): void {
    this.windowSizes.width = window.innerWidth;
    this.windowSizes.height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio, SCENE_CONFIG.maxPixelRatio);

    this.camera.aspect = this.windowSizes.width / this.windowSizes.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.windowSizes.width, this.windowSizes.height);
    this.renderer.setPixelRatio(pixelRatio);

    if (this.effectComposer) {
      this.effectComposer.setSize(this.windowSizes.width, this.windowSizes.height);
      this.effectComposer.setPixelRatio(pixelRatio);
    }

    if (SCENE_CONFIG.fxaaPass) {
      this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (this.windowSizes.width * pixelRatio);
      this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (this.windowSizes.height * pixelRatio);
    }

    if (this.mainScene) {
      this.mainScene.onResize();
    }
  }

  private setupBackgroundColor(): void {
    this.scene.background = new THREE.Color(SCENE_CONFIG.backgroundColor);
  }

  private initPostProcessing(): void {
    if (SCENE_CONFIG.isMobile) {
      return;
    }

    this.initEffectsComposer();
    this.initOutlinePass();
    this.initAntiAliasingPass();
  }

  private initEffectsComposer(): void {
    const pixelRatio: number = Math.min(window.devicePixelRatio, SCENE_CONFIG.maxPixelRatio);

    if (WebGL.isWebGL2Available() && pixelRatio === 1) {
      const size: THREE.Vector2 = this.renderer.getDrawingBufferSize(new THREE.Vector2());
      const target: THREE.WebGLRenderTarget = new THREE.WebGLRenderTarget(size.width, size.height, { samples: 3 });
      this.effectComposer = new EffectComposer(this.renderer, target);
    } else {
      SCENE_CONFIG.fxaaPass = true;
      this.effectComposer = new EffectComposer(this.renderer);
    }

    const renderPass: RenderPass = new RenderPass(this.scene, this.camera);
    this.effectComposer.addPass(renderPass);
  }

  private initOutlinePass(): void {
    const outlinePass = this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
    this.effectComposer.addPass(outlinePass);

    const outlinePassConfig = SCENE_CONFIG.outlinePass;

    outlinePass.visibleEdgeColor.set(outlinePassConfig.color);
    outlinePass.edgeGlow = outlinePassConfig.edgeGlow;
    outlinePass.edgeStrength = outlinePassConfig.edgeStrength;
    outlinePass.edgeThickness = outlinePassConfig.edgeThickness;
    outlinePass.pulsePeriod = outlinePassConfig.pulsePeriod;
  }

  private initAntiAliasingPass(): void {
    if (SCENE_CONFIG.fxaaPass) {
      const fxaaPass = this.fxaaPass = new ShaderPass(FXAAShader);
      this.effectComposer.addPass(fxaaPass);

      const pixelRatio: number = Math.min(window.devicePixelRatio, SCENE_CONFIG.maxPixelRatio);
      fxaaPass.material.uniforms['resolution'].value.x = 1 / (this.windowSizes.width * pixelRatio);
      fxaaPass.material.uniforms['resolution'].value.y = 1 / (this.windowSizes.height * pixelRatio);
    }
  }

  private initAudioListener(): void {
    const audioListener = this.audioListener = new THREE.AudioListener();
    this.camera.add(audioListener);
  }

  private initScene3DDebugMenu(): void {
    this.scene3DDebugMenu = new Scene3DDebugMenu(this.camera, this.renderer, this.pixiApp);
    this.orbitControls = this.scene3DDebugMenu.getOrbitControls();
  }

  private showCopyrights(): void {
    const copyrights: HTMLElement = document.querySelector('.copyrights');
    copyrights.innerHTML = `
    Nintendo and Game Boy are trademarks of Nintendo. Game Boy animated by <a href="https://github.com/Snokke/game-boy-challenge" target="_blank" style="color: inherit;">ANDRII BABINTSEV</a>.`;

    if (SCENE_CONFIG.isMobile) {
      copyrights.style['font-size']  = '5px';
      copyrights.style['width'] = '350px';
      copyrights.style['bottom'] = '5px';
    }

    copyrights.classList.add('show');
  }

  private showTextToLandscape(): void {
    if (SCENE_CONFIG.isMobile && window.innerWidth < window.innerHeight) {
      const introText: Element = document.querySelector('.rotate-to-landscape');
      introText.innerHTML = 'To use cartridges rotate to landscape';

      introText.classList.add('show');

      window.addEventListener('resize', () => {
        if (window.innerWidth > window.innerHeight) {
          introText.classList.add('hide');
        }
      });

      introText.addEventListener('click', () => {
        introText.classList.add('hide');
      });
    }
  }

  private keyboardControls(): void {
    const legend: Element = document.querySelector('.controls-legend');

    if (SCENE_CONFIG.isMobile) {
      legend.classList.add('hide');
      return;
    }

    // Build always-visible controls legend
    const groups: { keys: string[][]; label: string }[] = [
      { keys: [['', '  W', ''], ['A', 'S', 'D']], label: 'move' },
      { keys: [['X']], label: 'A' },
      { keys: [['Z']], label: 'B' },
      { keys: [['Enter']], label: 'start' },
      { keys: [['Scroll']], label: 'zoom' },
    ];

    groups.forEach((group, gi) => {
      if (gi > 0) {
        const sep = document.createElement('div');
        sep.className = 'ctrl-sep';
        legend.appendChild(sep);
      }

      const groupEl = document.createElement('div');
      groupEl.className = 'ctrl-group';

      group.keys.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'ctrl-row';
        row.forEach(key => {
          if (key === '') {
            const spacer = document.createElement('div');
            spacer.style.width = '22px';
            spacer.style.height = '22px';
            rowEl.appendChild(spacer);
          } else {
            const keyEl = document.createElement('div');
            keyEl.className = 'ctrl-key' + (key.length > 2 ? ' wide' : '');
            keyEl.textContent = key.trim();
            rowEl.appendChild(keyEl);
          }
        });
        groupEl.appendChild(rowEl);
      });

      const label = document.createElement('div');
      label.className = 'ctrl-label';
      label.textContent = group.label;
      groupEl.appendChild(label);

      legend.appendChild(groupEl);
    });

    // Start with controls hidden
    legend.classList.add('collapsed');

    // Toggle button to show/hide controls
    const toggleBtn = document.createElement('div');
    toggleBtn.className = 'ctrl-toggle';
    toggleBtn.textContent = '?';
    toggleBtn.addEventListener('click', () => {
      legend.classList.toggle('collapsed');
    });
    document.body.appendChild(toggleBtn);

    // Day/night toggle — commented out, forcing night mode for now
    // const sep = document.createElement('div');
    // sep.className = 'ctrl-sep';
    // legend.appendChild(sep);
    //
    // const toggleGroup = document.createElement('div');
    // toggleGroup.className = 'ctrl-group';
    //
    // const toggleBtn = document.createElement('div');
    // toggleBtn.className = 'ctrl-key wide day-night-toggle';
    // toggleBtn.textContent = DAY_NIGHT_CONFIG.mode === 'day' ? '☀' : '☾';
    // toggleBtn.style.cursor = 'pointer';
    // toggleBtn.style.pointerEvents = 'auto';
    // toggleBtn.style.fontSize = '14px';
    // toggleBtn.style.minWidth = '28px';
    // toggleBtn.style.height = '28px';
    //
    // toggleBtn.addEventListener('click', () => {
    //   DAY_NIGHT_CONFIG.mode = DAY_NIGHT_CONFIG.mode === 'day' ? 'night' : 'day';
    //   toggleBtn.textContent = DAY_NIGHT_CONFIG.mode === 'day' ? '☀' : '☾';
    //   if (this.mainScene) {
    //     this.mainScene.onDayNightChanged();
    //   }
    // });
    //
    // toggleGroup.appendChild(toggleBtn);
    //
    // const toggleLabel = document.createElement('div');
    // toggleLabel.className = 'ctrl-label';
    // toggleLabel.textContent = DAY_NIGHT_CONFIG.mode === 'day' ? 'day' : 'night';
    // toggleGroup.appendChild(toggleLabel);
    //
    // toggleBtn.addEventListener('click', () => {
    //   toggleLabel.textContent = DAY_NIGHT_CONFIG.mode === 'day' ? 'day' : 'night';
    // });
    //
    // legend.appendChild(toggleGroup);
  }

  private initUpdate(): void {
    const clock = new THREE.Clock(true);

    const update = () => {
      this.scene3DDebugMenu.preUpdate();

      const deltaTime = clock.getDelta();

      if (this.isAssetsLoaded) {
        TWEEN.update();
        this.scene3DDebugMenu.update();

        if (this.mainScene) {
          this.mainScene.update(deltaTime);
        }

        if (SCENE_CONFIG.isMobile || DEBUG_CONFIG.rendererStats) {
          this.renderer.render(this.scene, this.camera);
        } else {
          this.effectComposer.render();
        }
      }

      this.scene3DDebugMenu.postUpdate();
      window.requestAnimationFrame(update);
    }

    update();
  }
}
