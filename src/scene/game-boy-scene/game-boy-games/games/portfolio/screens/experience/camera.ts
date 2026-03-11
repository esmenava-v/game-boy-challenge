import { Container } from 'pixi.js';
import { PORTFOLIO_CONFIG } from '../../data/portfolio-config';

export default class Camera {
  private worldContainer: Container;
  private backgroundContainer: Container;
  private cameraX: number;

  constructor(worldContainer: Container, backgroundContainer: Container) {
    this.worldContainer = worldContainer;
    this.backgroundContainer = backgroundContainer;
    this.cameraX = 0;
  }

  public update(playerWorldX: number): void {
    const targetX = -Math.round(playerWorldX - PORTFOLIO_CONFIG.camera.playerOffset);
    const minX = -(PORTFOLIO_CONFIG.world.width - PORTFOLIO_CONFIG.screen.width);
    const clampedTarget = Math.max(Math.min(targetX, 0), minX);

    this.cameraX = clampedTarget;

    this.worldContainer.x = this.cameraX;
    this.backgroundContainer.x = Math.round(this.cameraX * 0.5);
  }

  public getCameraX(): number {
    return this.cameraX;
  }

  public getVisibleLeft(): number {
    return -this.cameraX;
  }

  public getVisibleRight(): number {
    return -this.cameraX + PORTFOLIO_CONFIG.screen.width;
  }

  public reset(): void {
    this.cameraX = 0;
    this.worldContainer.x = 0;
    this.backgroundContainer.x = 0;
  }
}
