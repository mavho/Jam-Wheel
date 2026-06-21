import type {P5CanvasInstance} from '@p5-wrapper/react';
import type {JamWheelProps, Position} from './JamWheel';

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
  origColor: string;
  currColor: string;

  constructor(
    p5: P5CanvasInstance<JamWheelProps>,
    position: Position,
    inColor: string = '#E1008E'
  ) {
    this.p5 = p5;
    this.resize(position);
    this.origColor = inColor;
    this.currColor = inColor;
    this.click = false;
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
