// cSpell:ignore circenterX
// cSpell:ignore circenterY
import {P5Canvas, type Sketch, type SketchProps} from '@p5-wrapper/react';
import {Column, Div} from 'trunx';
import KeyNote from './KeyNotes';

export type JamWheelProps = SketchProps & {
  canvasColor: number;
};
export type Position = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
};

const HEX_COLOR_WHEEL: string[] = [
  '#E50018',
  '#E1008E',
  '#BA00DD',
  '#4400D9',
  '#002CD5',
  '#009AD2',
  '#00CE98',
  '#00CA2A',
  '#3EC600',
  '#A3C200',
];
const sketch: Sketch<JamWheelProps> = p5 => {
  let canvasColor: number = 0;
  // center of the wheel
  let circenterX: number = 0;
  let circenterY: number = 0;

  // canvas metadata for sizing
  let sketchBorder = document.getElementById('sketch')!;
  let canvasWidth = sketchBorder?.offsetWidth || 0;
  let canvasHeight = p5.windowHeight - 300;

  // Keynote array
  let keyWheels: KeyNote[] = [];

  // adjust how many triangles are available
  const points = 10;
  const pointAngle = 360 / points;

  p5.updateWithProps = props => {
    canvasColor = props.canvasColor;
  };

  p5.setup = () => {
    canvasWidth = getAvailableWidth(sketchBorder);
    canvasHeight = p5.windowHeight - 300;
    let _canvas = p5.createCanvas(canvasWidth, canvasHeight, p5.P2D);
    circenterX = _canvas.width / 2;
    circenterY = _canvas.height / 2;
    p5.frameRate(30);
    initKeys();
  };

  p5.draw = () => {
    p5.background(canvasColor);
    // var r = 150;
    // p5.noFill();
    // p5.stroke(197, 185, 166);
    // p5.strokeWeight(5);
    // let envelope = 400;
    // for (var i = 0; i < 3; i++) {
    //   let x2 = (r + envelope * 200) * p5.tan((2 * p5.PI) / envelope);
    //   let y2 = (r + envelope * 200) * p5.tan((2 * p5.PI) / envelope);
    //   p5.ellipse(circenterX, circenterY, x2, y2);
    // }
    // //TODO: make more efficient.
    // // playIncomingNotes();

    // p5.stroke('#003680');
    // p5.strokeWeight(2);
    for (let i = 0; i < keyWheels.length; i++) {
      keyWheels[i].show();
    }
  };
  p5.windowResized = () => {
    canvasWidth = getAvailableWidth(sketchBorder);
    canvasHeight = p5.windowHeight - 300;
    circenterX = canvasWidth / 2;
    circenterY = canvasHeight / 2;
    p5.resizeCanvas(canvasWidth, canvasHeight);
    repositionKeys();
  };

  function getAvailableWidth(el: HTMLElement) {
    const style = getComputedStyle(el);
    const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    return el.clientWidth - paddingX;
  }

  function initKeys() {
    let keyPositions: Position[] = calculateKeyPositions();
    keyPositions.forEach((position, i) => {
      // these positions can be played around with for some cool logos
      const tri = new KeyNote(p5, position, HEX_COLOR_WHEEL[i]);
      keyWheels.push(tri);
    });
  }

  function repositionKeys() {
    let keyPositions: Position[] = calculateKeyPositions();
    keyPositions.forEach((position, i) => {
      keyWheels[i].resize(position);
    });
  }

  function calculateKeyPositions(): Position[] {
    const radius = canvasWidth / 6;

    const res: Position[] = [];
    //draw the triangle circle
    for (let angle = 270; angle < 630; angle = angle + pointAngle) {
      const x = p5.cos(p5.radians(angle)) * radius; //convert angle to radians for x and y coordinates
      const y = p5.sin(p5.radians(angle)) * radius;

      const temp = angle + pointAngle;
      res.push({
        x1: circenterX,
        y1: circenterY,
        x2: x + circenterX,
        y2: y + circenterY,
        x3: p5.cos(p5.radians(temp)) * radius + circenterX,
        y3: p5.sin(p5.radians(temp)) * radius + circenterY,
      });
    }
    return res;
  }
};

export function JamWheel() {
  return (
    <Column>
      <Div bulma={'box'} id="sketch">
        <P5Canvas sketch={sketch} />
      </Div>
    </Column>
  );
}
