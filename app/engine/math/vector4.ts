export class Vector4 {
  constructor(public x: number, public y: number, public w: number, public z: number) {
  }

  set(x: number, y: number, w: number, z: number): void {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  asArray(): number[] {
    return [this.x, this.y, this.z, this.w];
  }
}