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
    // Hair — top
    g.rect(2, 0, 6, 2).fill(0x1A1A1A);
    g.rect(3, -1, 4, 1).fill(0x1A1A1A);
    // Bangs at front
    g.rect(7, 2, 1, 1).fill(0x1A1A1A);
    // Ponytail — extends from back of head, down
    g.rect(1, 1, 2, 2).fill(0x1A1A1A);
    g.rect(0, 3, 2, 1).fill(0x1A1A1A);
    g.rect(-1, 4, 2, 2).fill(0x1A1A1A);
    g.rect(-1, 6, 2, 1).fill(0x2D2D2D);
    // Hair tie
    g.rect(1, 2, 1, 1).fill(0xFF4466);
    // Head — light brown skin
    g.rect(2, 2, 6, 3).fill(0xC68642);
    // Jumpsuit body
    g.rect(1, 5, 8, 5).fill(0x1C1C1C);
    // V-neck
    g.rect(4, 5, 2, 1).fill(0xC68642);
    // Belt detail
    g.rect(1, 9, 8, 1).fill(0x333333);
    // Legs
    g.rect(2, 10, 3, 3).fill(0x1C1C1C);
    g.rect(5, 10, 3, 3).fill(0x1C1C1C);
    // Shoes
    g.rect(2, 13, 3, 1).fill(0x111111);
    g.rect(5, 13, 3, 1).fill(0x111111);
  }

  private drawWalk1(): void {
    const g = this.bodyGfx;
    g.clear();
    // Hair — top
    g.rect(2, 0, 6, 2).fill(0x1A1A1A);
    g.rect(3, -1, 4, 1).fill(0x1A1A1A);
    // Bangs at front
    g.rect(7, 2, 1, 1).fill(0x1A1A1A);
    // Ponytail — bounces slightly back while walking
    g.rect(1, 1, 2, 2).fill(0x1A1A1A);
    g.rect(-1, 3, 2, 1).fill(0x1A1A1A);
    g.rect(-2, 4, 2, 2).fill(0x1A1A1A);
    g.rect(-2, 6, 2, 1).fill(0x2D2D2D);
    // Hair tie
    g.rect(1, 2, 1, 1).fill(0xFF4466);
    // Head — light brown skin
    g.rect(2, 2, 6, 3).fill(0xC68642);
    // Jumpsuit body
    g.rect(1, 5, 8, 5).fill(0x1C1C1C);
    // V-neck
    g.rect(4, 5, 2, 1).fill(0xC68642);
    // Belt detail
    g.rect(1, 9, 8, 1).fill(0x333333);
    // Legs spread
    g.rect(1, 10, 3, 3).fill(0x1C1C1C);
    g.rect(6, 10, 3, 3).fill(0x1C1C1C);
    // Shoes
    g.rect(1, 13, 3, 1).fill(0x111111);
    g.rect(6, 13, 3, 1).fill(0x111111);
  }

  private drawWalk2(): void {
    const g = this.bodyGfx;
    g.clear();
    // Hair — top
    g.rect(2, 0, 6, 2).fill(0x1A1A1A);
    g.rect(3, -1, 4, 1).fill(0x1A1A1A);
    // Bangs at front
    g.rect(7, 2, 1, 1).fill(0x1A1A1A);
    // Ponytail — swings forward on this frame
    g.rect(1, 1, 2, 2).fill(0x1A1A1A);
    g.rect(0, 3, 2, 1).fill(0x1A1A1A);
    g.rect(0, 4, 2, 2).fill(0x1A1A1A);
    g.rect(0, 6, 2, 1).fill(0x2D2D2D);
    // Hair tie
    g.rect(1, 2, 1, 1).fill(0xFF4466);
    // Head — light brown skin
    g.rect(2, 2, 6, 3).fill(0xC68642);
    // Jumpsuit body
    g.rect(1, 5, 8, 5).fill(0x1C1C1C);
    // V-neck
    g.rect(4, 5, 2, 1).fill(0xC68642);
    // Belt detail
    g.rect(1, 9, 8, 1).fill(0x333333);
    // Legs together
    g.rect(3, 10, 3, 3).fill(0x1C1C1C);
    g.rect(4, 10, 3, 3).fill(0x1C1C1C);
    // Shoes
    g.rect(3, 13, 3, 1).fill(0x111111);
    g.rect(4, 13, 3, 1).fill(0x111111);
  }

  private drawJump(): void {
    const g = this.bodyGfx;
    g.clear();
    // Hair — top
    g.rect(2, 0, 6, 2).fill(0x1A1A1A);
    g.rect(3, -1, 4, 1).fill(0x1A1A1A);
    // Bangs at front
    g.rect(7, 2, 1, 1).fill(0x1A1A1A);
    // Ponytail — flips up during jump
    g.rect(1, 1, 2, 2).fill(0x1A1A1A);
    g.rect(-1, 1, 2, 1).fill(0x1A1A1A);
    g.rect(-2, 2, 2, 2).fill(0x1A1A1A);
    g.rect(-3, 2, 1, 1).fill(0x2D2D2D);
    // Hair tie
    g.rect(1, 2, 1, 1).fill(0xFF4466);
    // Head — light brown skin
    g.rect(2, 2, 6, 3).fill(0xC68642);
    // Jumpsuit body
    g.rect(1, 5, 8, 5).fill(0x1C1C1C);
    // V-neck
    g.rect(4, 5, 2, 1).fill(0xC68642);
    // Belt detail
    g.rect(1, 9, 8, 1).fill(0x333333);
    // Legs tucked
    g.rect(2, 10, 3, 2).fill(0x1C1C1C);
    g.rect(5, 10, 3, 2).fill(0x1C1C1C);
    // Shoes
    g.rect(2, 12, 3, 1).fill(0x111111);
    g.rect(5, 12, 3, 1).fill(0x111111);
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
