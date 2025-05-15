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
      phmid: createVector(-random(w / 2, w / 5), 0),
      p1: createVector(w, 0),

      // cubic bezier control points
      b0a: createVector(random(-w, 0), -h),
      b0b: createVector(random(0, w), -h / 2),

      b1a: createVector(random(0, w), h / 2),
      b1b: createVector(random(-w, 0), h),

      // // curve for head
      // h0a: createVector(-w * 1.1, h / 2),
      // h0b: createVector(-w * 1.1, -h / 2),

      lipTop1: createVector(-w * random(1, 1.3), -h / 2), // first control for top lip
      lipTop2: createVector(-w * random(0.8, 0.9), -h / 4), // second control for top lip

      lipBot1: createVector(-w * random(0.8, 0.9), h / 4), // first control for bottom lip
      lipBot2: createVector(-w * random(1, 1.3), h / 2), // second control for bottom lip
    };
  }
  draw() {
    let pts = this.calculatePoints(canvas.midPoint);
    this.drawBody(pts);
    this.drawPoints(pts);
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
  }

  drawPoints(pts) {
    stroke(255, 100, 100);
    fill(100, 100, 100);
    strokeWeight(2);
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
    // top curve to p1
    bezierVertex(
      pts.b0a.x,
      pts.b0a.y,
      pts.b0b.x,
      pts.b0b.y,
      pts.p1.x,
      pts.p1.y
    );

    // bottom curve back to phbot
    bezierVertex(
      pts.b1a.x,
      pts.b1a.y,
      pts.b1b.x,
      pts.b1b.y,
      pts.phbot.x,
      pts.phbot.y
    );

    // two lips
    // upper lip
    bezierVertex(
      pts.lipTop1.x,
      pts.lipTop1.y,
      pts.lipTop2.x,
      pts.lipTop2.y,
      pts.phmid.x,
      pts.phmid.y
    );
    // lower lip
    bezierVertex(
      pts.lipBot1.x,
      pts.lipBot1.y,
      pts.lipBot2.x,
      pts.lipBot2.y,
      pts.phtop.x,
      pts.phtop.y
    );

    // front curve (lips) back to phtop
    // bezierVertex(
    //   pts.h0a.x,
    //   pts.h0a.y,
    //   pts.h0b.x,
    //   pts.h0b.y,
    //   pts.phtop.x,
    //   pts.phtop.y
    // );

    // bezierVertex(
    //   pts.phmid.x,
    //   pts.phmid.y,
    //   pts.phmid.x,
    //   pts.phmid.y,
    //   pts.phtop.x,
    //   pts.phtop.y
    // );

    // vertex(pts.phtop.x, pts.phtop.y);
    endShape();
  }
}
