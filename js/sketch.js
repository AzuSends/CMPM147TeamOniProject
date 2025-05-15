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
      phtop: createVector(-w, -random(0, h / 2)),
      phbot: createVector(-w, random(0, h / 2)),
      phmid: createVector(random(-w / 1.1, -w / 2), 0), // mouth
      b0: createVector(random(-w, w), -h),
      p1: createVector(w, 0),
      b1: createVector(random(-w, w), h),
    };
  }
  draw() {
    let pts = this.calculatePoints(canvas.midPoint);
    this.drawBody(pts);
    // this.drawPoints(pts);
  }

  calculatePoints(midPoint) {
    let addMidPoint = (point) => {
      return createVector(midPoint.x + point.x, midPoint.y + point.y);
    };
    let pts = {};
    for (let [k, v] of Object.entries(this.offsets)) {
      pts[k] = addMidPoint(this.offsets[k]);
    }
    // calculate the points of the fish body in the canvas
    return pts;

    /*
    b0           b4           p9        p8        b3
    +------------+------------*--------*---------+              
    |            |            f  i  n            |
    *p7   t      |                               |
    |            ----------------+b0--------------
    |            |                               |
    |     a phtop*                               |
    *p12         |         b   o   d   y         * p1 
    |       phbot*                               |
    |     i      |                               |
    |            ----------------+b1--------------
    *p6          |                               |
    |     l      |            f  i  n            |
    +------------+------------*--------*---------+
    b1          b7            p11      p10        b2
    */
  }

  drawPoints(pts) {
    stroke(255, 100, 100);
    fill(100, 100, 100);
    strokeWeight(5);
    for (let [k, v] of Object.entries(pts)) {
      point(v.x, v.y);
      text(k, v.x + 5, v.y - 5);
    }
    strokeWeight(1);
  }

  // draws fish body
  drawBody(pts) {
    // strokeWeight(1);
    noStroke();
    fill(this.body.color);
    beginShape();
    // body
    vertex(pts.phtop.x, pts.phtop.y);
    quadraticVertex(pts.b0.x, pts.b0.y, pts.p1.x, pts.p1.y);
    quadraticVertex(pts.b1.x, pts.b1.y, pts.phbot.x, pts.phbot.y);

    vertex(pts.phbot.x, pts.phbot.y);
    quadraticVertex(pts.phmid.x, pts.phmid.y, pts.phtop.x, pts.phtop.y);

    // vertex(pts.phtop.x, pts.phtop.y);
    endShape();
  }
}
