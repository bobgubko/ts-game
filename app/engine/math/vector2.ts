import { isEqual, MathBase } from './math-base';
import { Vector3 } from './vector3';

export class Vector2 {

  static fromVector3(vector: Vector3): Vector2 {
    return new Vector2(vector.x, vector.y);
  }

  constructor(public x: number, public y: number) { }

  set(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  equalTo(other: Vector2): boolean {
    return isEqual(this.x, other.x) && isEqual(this.y, other.y);
  }

  toAngle(): number {
    return Math.atan2(this.y, this.x) * MathBase.rad2deg;
  }

  lengthQ(): number {
    return Math.pow(this.x, 2) + Math.pow(this.y, 2);
  }

  length(): number {
    return Math.sqrt(this.lengthQ());
  }

  add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  addToSelf(other: Vector2): Vector2 {
    this.x += other.x;
    this.y += other.y;

    return this;
  }

  subtract(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  subtractFromSelf(other: Vector2): Vector2 {
    this.x -= other.x;
    this.y -= other.y;

    return this;
  }

  multiply(value: number) {
    return new Vector2(this.x * value, this.y * value);
  }

  normal(): Vector2 {
    const len = this.length();

    if (len < MathBase.eps)
      return new Vector2(0, 0);

    return this.multiply(1 / len);
  }

  toString(): string {
    return `x: ${this.x}, y:${this.y}`;
  }
}