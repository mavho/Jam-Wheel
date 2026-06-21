import type {P5CanvasInstance} from '@p5-wrapper/react';
import type {JamWheelProps, Position} from './JamWheel';
// type namespace won't conflict with the value namespace of keynote
// specifically the Keynote p5 instance
import type p5 from 'p5';

/**
 * Deals with rendering the keynote.
 */
class KeyNote {
  p5: P5CanvasInstance<JamWheelProps>;
  position!: Position;
  x1!: number;
  y1!: number;
  x2!: number;
  y2!: number;
  x3!: number;
  y3!: number;
  click: boolean;
  origColor: p5.Color;
  currColor: p5.Color;
  shadeColor!: p5.Color;

  constructor(
    p5: P5CanvasInstance<JamWheelProps>,
    position: Position,
    inColor: p5.Color = p5.color('#E1008E')
  ) {
    this.p5 = p5;
    this.resize(position);
    this.origColor = inColor;
    this.currColor = inColor;
    this.click = false;
    this.shadeColor = this.p5.color(72, 61, 139);
  }

  /**
   * Checks if coordinate is within this keynote.
   */
  inTriangle(mouX: number, mouY: number): boolean {
    const A =
      (1 / 2) *
      (-this.y2 * this.x3 +
        this.y1 * (-this.x2 + this.x3) +
        this.x1 * (this.y2 - this.y3) +
        this.x2 * this.y3);
    const sign = A < 0 ? -1 : 1;

    const s =
      (this.y1 * this.x3 -
        this.x1 * this.y3 +
        (this.y3 - this.y1) * mouX +
        (this.x1 - this.x3) * mouY) *
      sign;
    const t =
      (this.x1 * this.y2 -
        this.y1 * this.x2 +
        (this.y1 - this.y2) * mouX +
        (this.x2 - this.x1) * mouY) *
      sign;

    return s > 0 && t > 0 && s + t < 2 * A * sign;
  }

  /**
   * Callback dealing with a clicked keynote.
   */
  clicked() {
    //change to color to a darker shade
    let colorShade = this.p5.lerpColor(this.p5.color(this.origColor), this.shadeColor, 0.35);
    this.currColor = colorShade;
    //set click as true
    this.click = true;
  }

  /**
   * Callback for dealing with a dragged Keynote.
   * Dragged is handled differently than clicked
   */
  dragged() {
    //change to color to a darker shade
    let colorShade = this.p5.lerpColor(this.p5.color(this.origColor), this.shadeColor, 0.35);
    this.currColor = colorShade;
  }
  /**
   * Callback for a released key
   */
  released() {
    this.click = false;
    this.currColor = this.origColor;
  }

  /**
   * Render the key.
   */
  show() {
    this.p5.fill(this.p5.color(this.currColor));
    this.p5.triangle(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3);
  }

  resize(position: Position) {
    this.position = position;
    this.x1 = position.x1;
    this.y1 = position.y1;
    this.x2 = position.x2;
    this.y2 = position.y2;
    this.x3 = position.x3;
    this.y3 = position.y3;
  }
}

export default KeyNote;
