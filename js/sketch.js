/* exported setup, draw */

let canvas = {
  width: 800,
  height: 400,
  midPoint: {
    x: 400,
    y: 200,
  },
};
let fishes = [];
let fishParams;

function setup() {
  createCanvas(canvas.width, canvas.height);
  colorMode(HSB);
  fishParams = {
    maxWidth: canvas.width / 1.5,
    minWidth: canvas.width / 6,
    maxHeight: canvas.height / 1.5,
    minHeight: canvas.height / 6,
  };

  let fish = new Fish();
  fishes.push(fish);
}

function draw() {
  background(0, 0, 0);
  for (let fish of fishes) {
    fish.draw();
  }
}

class Fish {
  constructor() {
    this.body = {
      width: random(fishParams.minWidth, fishParams.maxWidth),
      height: random(fishParams.minHeight, fishParams.maxHeight),
      color: color(random(255), 100, 100),
    };
    let w = this.body.width / 2;
    let h = this.body.height / 2;
    this.offsets = {
      p0: createVector(-w, 0),
      b0: createVector(random(-w, w), -h),
      p1: createVector(w, 0),
      b1: createVector(random(-w, w), h),
    };
  }
  draw() {
    let pts = this.calculatePoints(canvas.midPoint);
    this.drawBody(pts);
  }

  calculatePoints(midPoint) {
    let addMidPoint = (point) => {
      return createVector(midPoint.x + point.x, midPoint.y + point.y);
    };
    // calculate the points of the fish body in the canvas
    return {
      p0: addMidPoint(this.offsets.p0),
      b0: addMidPoint(this.offsets.b0),
      p1: addMidPoint(this.offsets.p1),
      b1: addMidPoint(this.offsets.b1),
    };

    /*
    b0           b4           p9        p8        b3
    +------------+------------*--------*---------+              
    |            |            f  i  n            |
    *p7   t      |                               |
    |            ----------------+b0--------------
    |            |                               |
    |     a      |                               |
    *p12       p0*       b   o   d   y           * p1 
    |            |                               |
    |     i      |                               |
    |            ----------------+b1--------------
    *p6          |                               |
    |     l      |            f  i  n            |
    +------------+------------*--------*---------+
    b1          b7            p11      p10        b2
    */
  }

  // draws fish body
  drawBody(pts) {
    strokeWeight(1);
    fill(this.body.color);
    beginShape();
    vertex(pts.p0.x, pts.p0.y);
    quadraticVertex(pts.b0.x, pts.b0.y, pts.p1.x, pts.p1.y);
    quadraticVertex(pts.b1.x, pts.b1.y, pts.p0.x, pts.p0.y);

    endShape();
  }
}
