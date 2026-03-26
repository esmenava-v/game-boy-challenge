import * as THREE from 'three';
import Loader from '../../../core/loader';
import { CARTRIDGES_BY_TYPE_CONFIG } from './data/cartridges-config';
import { SCENE_OBJECT_TYPE } from '../data/game-boy-scene-data';
import { CARTRIDGE_TYPE } from './data/cartridges-config';
import { GLTF } from 'three/examples/jsm/Addons.js';
import { DAY_NIGHT_CONFIG } from '../../../Data/Configs/Main/day-night-config';

export default class Cartridge extends THREE.Group {
  private cartridgeType: CARTRIDGE_TYPE;
  private config: any;
  private sceneObjectType: SCENE_OBJECT_TYPE;
  private isCartridgeInserted: boolean;
  private mesh: THREE.Mesh;
  private standardTexture: THREE.Texture;
  private inPocketTexture: THREE.Texture;

  private dayStandardTexture: THREE.Texture;
  private dayInPocketTexture: THREE.Texture;
  private nightStandardTexture: THREE.Texture;
  private nightInPocketTexture: THREE.Texture;
  private hasDayNight: boolean;

  public startPosition: THREE.Vector3 = new THREE.Vector3();
  public lastRotation: THREE.Euler = new THREE.Euler();

  constructor(type: CARTRIDGE_TYPE) {
    super();

    this.cartridgeType = type;
    this.config = CARTRIDGES_BY_TYPE_CONFIG[type];
    this.sceneObjectType = SCENE_OBJECT_TYPE.Cartridges;
    this.isCartridgeInserted = false;

    this.init();
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public getType(): CARTRIDGE_TYPE {
    return this.cartridgeType;
  }

  public disableActivity(): void {
    this.mesh.userData['isActive'] = false;
  }

  public enableActivity(): void {
    this.mesh.userData['isActive'] = true;
  }

  public setInserted(): void {
    this.isCartridgeInserted = true;
  }

  public setNotInserted(): void {
    this.isCartridgeInserted = false;
  }

  public isInserted(): boolean {
    return this.isCartridgeInserted;
  }

  public setStandardTexture(): void {
    (this.mesh.material as THREE.MeshBasicMaterial).map = this.standardTexture;
  }

  public setInPocketTexture(): void {
    (this.mesh.material as THREE.MeshBasicMaterial).map = this.inPocketTexture;
  }

  public setDayNightMode(mode: 'day' | 'night'): void {
    if (!this.hasDayNight) {
      return;
    }

    if (mode === 'day') {
      this.standardTexture = this.dayStandardTexture;
      this.inPocketTexture = this.dayInPocketTexture;
    } else {
      this.standardTexture = this.nightStandardTexture;
      this.inPocketTexture = this.nightInPocketTexture;
    }

    if (this.isCartridgeInserted) {
      this.setInPocketTexture();
    } else {
      this.setStandardTexture();
    }
  }

  private init(): void {
    const gltfModel: GLTF = Loader.assets['game-boy-cartridge'] as GLTF;
    const model: THREE.Group = gltfModel.scene.clone();
    this.add(model);

    this.hasDayNight = !!this.config.textures;

    if (this.hasDayNight) {
      this.dayStandardTexture = Loader.assets[this.config.textures.day.texture] as THREE.Texture;
      this.dayStandardTexture.flipY = false;
      this.dayInPocketTexture = Loader.assets[this.config.textures.day.textureInPocket] as THREE.Texture;
      this.dayInPocketTexture.flipY = false;
      this.nightStandardTexture = Loader.assets[this.config.textures.night.texture] as THREE.Texture;
      this.nightStandardTexture.flipY = false;
      this.nightInPocketTexture = Loader.assets[this.config.textures.night.textureInPocket] as THREE.Texture;
      this.nightInPocketTexture.flipY = false;

      if (DAY_NIGHT_CONFIG.mode === 'day') {
        this.standardTexture = this.dayStandardTexture;
        this.inPocketTexture = this.dayInPocketTexture;
      } else {
        this.standardTexture = this.nightStandardTexture;
        this.inPocketTexture = this.nightInPocketTexture;
      }
    } else {
      const standardTexture = this.standardTexture = Loader.assets[this.config.texture] as THREE.Texture;
      standardTexture.flipY = false;
      const inPocketTexture = this.inPocketTexture = Loader.assets[this.config.textureInPocket] as THREE.Texture;
      inPocketTexture.flipY = false;
    }

    const material = new THREE.MeshBasicMaterial({
      map: this.standardTexture,
    });

    const mesh = this.mesh = model.children[0] as THREE.Mesh;
    mesh.material = material;

    mesh.userData['isActive'] = true;
    mesh.userData['sceneObjectType'] = this.sceneObjectType;
    mesh.userData['partType'] = this.cartridgeType;
    mesh.userData['showOutline'] = true;
  }
}
