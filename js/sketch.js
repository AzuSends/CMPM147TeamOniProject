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
  // move the fish along the x-axis
  background(0, 0, 0);
  for (let fish of fishes) {
    fish.draw(canvas.midPoint);
  }
  // canvas.midPoint.x -= 1;
  if (canvas.midPoint.x < 0) {
    canvas.midPoint.x = canvas.width;
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
      phmid: createVector(-random(w / 2.4, w * 1.2), random(-h / 2.5, h / 2.5)),
      p1: createVector(w, 0),

      // // cubic bezier control points
      b0a: createVector(random(-w, 0), -h),
      b0b: createVector(random(0, w), -h / 2),

      b1a: createVector(random(0, w), h / 2),
      b1b: createVector(random(-w, 0), h),

      eye: createVector(-w * random(0.4, 0.6), random(-h / 4, -h / 8)),
      // pectoralFin0: createVector(-w * 0.3, random(-h / 2, -h / 8)),
      // pectoralFin1: createVector(-w * 0.3, random(h / 2, h / 8)),
      pectoralFin2: createVector(-w * random(-0.7, 0), random(-h / 2, h / 2)),
      pectoralFinStart: createVector(-w * 0.3, h * 0.5),
      pectoralFinEnd: createVector(-w * 0.3, -h * 0.5),
    };
    let pectoralFinStart = createVector(-w * 0.3, h * 0.5);
    let pectoralFinEnd = createVector(-w * 0.3, -h * 0.5);
    let { finType, ...pectoral } = this.generateFin(
      pectoralFinStart,
      pectoralFinEnd
    );
    this.finType = finType;
    this.pectoral = pectoral;
  }

  // no clue how the local to world space works but it works https://chatgpt.com/share/6826e1fa-1a34-8007-917b-351c0bbb8124
  generateArcFin(start, end) {
    // calculates points based on the start and end vectors
    // generates a fin shape using 2 points and 1 control point
    let dir = p5.Vector.sub(end, start);
    let angle = dir.heading();
    let length = dir.mag();

    // local space
    let p0 = createVector(0, 0);
    let p1 = createVector(length, 0);
    let b0 = createVector(length / 2, length); // control point

    let fin = {
      p0: p0.rotate(angle).add(start),
      p1: p1.rotate(angle).add(start),
      b0: b0.rotate(angle).add(start),
    };

    return fin;
  }

  generateTriangleFin(start, end) {
    // calculates points based on the start and end vectors
    // generates a fin shape using 3 points and 1 control point
    let dir = p5.Vector.sub(end, start);
    let angle = dir.heading();
    let length = dir.mag();

    let p0 = createVector(0, length / 2);
    let p1 = createVector(length / 2, 0);
    let p2 = createVector(length, length / 2);
    let b0 = createVector(length / 2, length);

    let fin = {
      p0: p0.rotate(angle).add(start),
      p1: p1.rotate(angle).add(start),
      p2: p2.rotate(angle).add(start),
      b0: b0.rotate(angle).add(start),
    };
    return fin;
  }

  generateTrapezoidFin(start, end) {
    // genereates a trapezoid fin shape using 4 points and 1 control point
    let dir = p5.Vector.sub(end, start);
    let angle = dir.heading();
    let length = dir.mag();

    let p0 = createVector((length * 1) / 4, 0);
    let p1 = createVector(0, length);
    let p2 = createVector(length, length);
    let p3 = createVector((length * 3) / 4, 0);
    let b0 = createVector(length / 2, length / 2);

    let fin = {
      p0: p0.rotate(angle).add(start),
      p1: p1.rotate(angle).add(start),
      p2: p2.rotate(angle).add(start),
      p3: p3.rotate(angle).add(start),
      b0: b0.rotate(angle).add(start),
    };
    return fin;
  }

  generateFin(start, end) {
    // determines the fin shape given the start and end points (box's corners)
    // generates random fin shapes for each fin
    let finType = "arc";
    let finShape = random(1);
    let finPoints = {};
    if (finShape < 0.3) {
      finType = "trapezoid";
      finPoints = this.generateTrapezoidFin(start, end);
    } else if (finShape < 0.6) {
      finType = "triangle";
      finPoints = this.generateTriangleFin(start, end);
    } else {
      finType = "arc";
      finPoints = this.generateArcFin(start, end);
    }
    let fin = { finType, ...finPoints };
    console.log(fin);
    return fin;
  }

  draw(midpoint) {
    let pts = this.calculatePoints(this.offsets, midpoint);
    let finpts = this.calculatePoints(this.pectoral, midpoint);
    this.drawBody(pts);
    this.drawEye(pts);
    this.drawFin(finpts);

    // this.drawPoints(pts);
    this.drawPoints(finpts);
  }

  calculatePoints(obj, midPoint) {
    let addMidPoint = (point) => {
      return createVector(midPoint.x + point.x, midPoint.y + point.y);
    };
    let pts = {};
    for (let [k, v] of Object.entries(obj)) {
      pts[k] = addMidPoint(obj[k]);
    }
    // calculate the points of the fish body in the canvas
    return pts;
  }

  drawFin(pts) {
    // draws the fins
    if (this.finType == "arc") this.drawArcFin(pts);
    else if (this.finType == "triangle") this.drawTriangleFin(pts);
    else if (this.finType == "trapezoid") this.drawTrapezoidFin(pts);
    // else console.log("fin type not found");
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

  drawArcFin(pts) {
    // draws using 2 points and 1 control point
    fill(255, 100, 100);
    beginShape();
    vertex(pts.p0.x, pts.p0.y);
    quadraticVertex(pts.b0.x, pts.b0.y, pts.p1.x, pts.p1.y);
    // quadraticVertex(pts.b1.x, pts.b1.y, pts.p0.x, pts.p0.y);
    endShape(CLOSE);
  }

  drawTriangleFin(pts) {
    // draws using 3 points and 1 control point
    fill(255, 100, 100);
    beginShape();
    vertex(pts.p0.x, pts.p0.y);
    vertex(pts.p1.x, pts.p1.y);
    vertex(pts.p2.x, pts.p2.y);
    quadraticVertex(pts.b0.x, pts.b0.y, pts.p0.x, pts.p0.y);
    endShape(CLOSE);
  }

  drawTrapezoidFin(pts) {
    // draws using 4 point and 1 control point
    fill(255, 100, 100);
    beginShape();
    vertex(pts.p0.x, pts.p0.y);
    vertex(pts.p1.x, pts.p1.y);
    quadraticVertex(pts.b0.x, pts.b0.y, pts.p2.x, pts.p2.y);
    vertex(pts.p3.x, pts.p3.y);
    endShape(CLOSE);
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

    // vertex(pts.phbot.x, pts.phbot.y);
    bezierVertex(
      pts.phmid.x,
      pts.phmid.y,
      pts.phmid.x,
      pts.phmid.y,
      pts.phtop.x,
      pts.phtop.y
    );

    endShape();
  }

  drawEye(pts) {
    stroke(this.body.color);
    strokeWeight(1);
    fill("white");
    ellipse(pts.eye.x, pts.eye.y, this.body.height / 7);
    fill("black");
    ellipse(pts.eye.x, pts.eye.y, this.body.height / 12);
  }
}
