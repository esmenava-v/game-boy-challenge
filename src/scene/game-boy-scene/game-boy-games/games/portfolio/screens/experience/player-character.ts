import { Container, Graphics } from 'pixi.js';
import { PORTFOLIO_CONFIG } from '../../data/portfolio-config';

enum PLAYER_STATE {
  Idle = 'IDLE',
  WalkLeft = 'WALK_LEFT',
  WalkRight = 'WALK_RIGHT',
}

export default class PlayerCharacter extends Container {
  private bodyGfx: Graphics;
  private walkFrame: number;
  private walkTimer: number;
  private velocityY: number;
  private isGrounded: boolean;
  private state: PLAYER_STATE;
  public worldX: number;
  public worldY: number;

  constructor() {
    super();

    this.worldX = 30;
    this.worldY = PORTFOLIO_CONFIG.world.groundY;
    this.velocityY = 0;
    this.isGrounded = true;
    this.state = PLAYER_STATE.Idle;
    this.walkFrame = 0;
    this.walkTimer = 0;

    this.init();
  }

  public update(dt: number): void {
    if (this.state === PLAYER_STATE.WalkRight) {
      const offset = Math.round(PORTFOLIO_CONFIG.player.speed * dt * 60);
      this.worldX += offset;
      this.scale.x = 1;
    } else if (this.state === PLAYER_STATE.WalkLeft) {
      const offset = Math.round(PORTFOLIO_CONFIG.player.speed * dt * 60);
      this.worldX -= offset;
      this.scale.x = -1;
    }

    if (this.worldX < 0) {
      this.worldX = 0;
    }

    if (this.worldX > PORTFOLIO_CONFIG.world.endZoneX) {
      this.worldX = PORTFOLIO_CONFIG.world.endZoneX;
    }

    if (!this.isGrounded) {
      this.velocityY += PORTFOLIO_CONFIG.player.gravity * dt * 60;
      this.worldY += Math.round(this.velocityY * dt * 60);

      if (this.worldY >= PORTFOLIO_CONFIG.world.groundY) {
        this.worldY = PORTFOLIO_CONFIG.world.groundY;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    }

    if (this.isGrounded && (this.state === PLAYER_STATE.WalkLeft || this.state === PLAYER_STATE.WalkRight)) {
      this.walkTimer += dt * 1000;

      if (this.walkTimer >= 150) {
        this.walkTimer = 0;
        this.walkFrame = (this.walkFrame + 1) % 2;
      }

      if (this.walkFrame === 0) {
        this.drawWalk1();
      } else {
        this.drawWalk2();
      }
    } else if (!this.isGrounded) {
      this.drawJump();
    } else {
      this.drawIdle();
      this.walkFrame = 0;
      this.walkTimer = 0;
    }

    this.updatePosition();
  }

  public jump(): void {
    if (this.isGrounded) {
      this.isGrounded = false;
      this.velocityY = PORTFOLIO_CONFIG.player.jumpVelocity;
    }
  }

  public setMovementState(state: PLAYER_STATE): void {
    this.state = state;
  }

  public getMovementState(): PLAYER_STATE {
    return this.state;
  }

  public getIsGrounded(): boolean {
    return this.isGrounded;
  }

  private init(): void {
    this.bodyGfx = new Graphics();
    this.addChild(this.bodyGfx);
    this.drawIdle();
    this.updatePosition();
  }

  private drawIdle(): void {
    const g = this.bodyGfx;
    g.clear();
    // Hair
    g.rect(2, 0, 6, 2).fill(0x4A2700);
    // Head
    g.rect(2, 2, 6, 3).fill(0xF5CBA7);
    // Body
    g.rect(1, 5, 8, 5).fill(0x2980B9);
    // Legs
    g.rect(2, 10, 3, 4).fill(0x2C3E50);
    g.rect(5, 10, 3, 4).fill(0x2C3E50);
  }

  private drawWalk1(): void {
    const g = this.bodyGfx;
    g.clear();
    g.rect(2, 0, 6, 2).fill(0x4A2700);
    g.rect(2, 2, 6, 3).fill(0xF5CBA7);
    g.rect(1, 5, 8, 5).fill(0x2980B9);
    // Legs spread
    g.rect(1, 10, 3, 4).fill(0x2C3E50);
    g.rect(6, 10, 3, 4).fill(0x2C3E50);
  }

  private drawWalk2(): void {
    const g = this.bodyGfx;
    g.clear();
    g.rect(2, 0, 6, 2).fill(0x4A2700);
    g.rect(2, 2, 6, 3).fill(0xF5CBA7);
    g.rect(1, 5, 8, 5).fill(0x2980B9);
    // Legs together
    g.rect(3, 10, 3, 4).fill(0x2C3E50);
    g.rect(4, 10, 3, 4).fill(0x2C3E50);
  }

  private drawJump(): void {
    const g = this.bodyGfx;
    g.clear();
    g.rect(2, 0, 6, 2).fill(0x4A2700);
    g.rect(2, 2, 6, 3).fill(0xF5CBA7);
    g.rect(1, 5, 8, 5).fill(0x2980B9);
    // Legs tucked
    g.rect(2, 10, 3, 3).fill(0x2C3E50);
    g.rect(5, 10, 3, 3).fill(0x2C3E50);
  }

  private updatePosition(): void {
    const w = PORTFOLIO_CONFIG.player.width;

    if (this.scale.x === -1) {
      this.x = this.worldX + w;
    } else {
      this.x = this.worldX;
    }

    this.y = this.worldY - PORTFOLIO_CONFIG.player.height;
  }
}

export { PLAYER_STATE };
