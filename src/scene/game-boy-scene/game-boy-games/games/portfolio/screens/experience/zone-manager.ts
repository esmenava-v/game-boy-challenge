import { EventEmitter } from 'pixi.js';
import { ZONES, ZoneData } from '../../data/world-data';

export default class ZoneManager {
  public events: EventEmitter;
  private currentZone: ZoneData | null;
  private pendingZone: ZoneData | null;
  private debounceTimer: number;
  private debounceTime: number;

  constructor() {
    this.events = new EventEmitter();
    this.currentZone = null;
    this.pendingZone = null;
    this.debounceTimer = 0;
    this.debounceTime = 500;
  }

  public update(playerWorldX: number, dt: number): void {
    const zone = this.getZoneAtX(playerWorldX);

    if (zone !== this.currentZone) {
      if (zone === this.pendingZone) {
        this.debounceTimer += dt * 1000;

        if (this.debounceTimer >= this.debounceTime) {
          this.currentZone = zone;
          this.pendingZone = null;
          this.debounceTimer = 0;
          this.events.emit('onZoneChange', zone);
        }
      } else {
        this.pendingZone = zone;
        this.debounceTimer = 0;
      }
    } else {
      this.pendingZone = null;
      this.debounceTimer = 0;
    }
  }

  public getCurrentZone(): ZoneData | null {
    return this.currentZone;
  }

  public getCurrentZoneIndex(): number {
    if (!this.currentZone) return -1;
    return ZONES.indexOf(this.currentZone);
  }

  public isInEndZone(playerWorldX: number): boolean {
    const lastZone = ZONES[ZONES.length - 1];
    return playerWorldX >= lastZone.endX;
  }

  private getZoneAtX(x: number): ZoneData | null {
    for (const zone of ZONES) {
      if (x >= zone.startX && x < zone.endX) {
        return zone;
      }
    }
    return null;
  }
}
