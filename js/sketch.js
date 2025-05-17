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

// class too big might need to split into generation of fish and drawing of fish
class Fish {
  constructor() {
    this.body = {
      width: random(fishParams.minWidth, fishParams.maxWidth),
      height: random(fishParams.minHeight, fishParams.maxHeight),
      color: color(random(255), 100, 100),
    };

    let w = this.body.width / 2;
    let h = this.body.height / 2;

    // defines area of possible fin positions
    this.fins = {
      pectoral: {
        start: createVector(-w * 0.3, h * 0.5),
        end: createVector(-w * 0.3, -h * 0.5),
      },
      pelvic: {
        start: createVector(-w * 0.4, h * 0.5),
        end: createVector(w * 0.2, h * 0.2),
        heightScale: 0.8,
      },
      tail: {
        start: createVector(w * 0.85, h * 0.5),
        end: createVector(w * 0.85, -h * 0.5),
      },
      dorsal: {
        start: createVector(w * 0.5, -h * random(0, 0.5)),
        end: createVector(-w * 0.5, -h * 0.5),
        //heightScale: 0.5,
      },
    };
    for (let fin of Object.values(this.fins)) {
      let { finType, ...finPoints } = this.generateFin(fin.start, fin.end);
      fin.points = this.localToWorldSpace(
        fin.start,
        fin.end,
        finPoints,
        fin.heightScale
      );
      fin.type = finType;
    }
    console.log(this.fins);

    this.bodyPoints = this.generateBody(this.body.width, this.body.height);
    // let pectoralFinStart = createVector(-w * 0.3, h * 0.5);
    // let pectoralFinEnd = createVector(-w * 0.3, -h * 0.5);
    // let { finType, ...pectoral } = this.generateFin(
    //   pectoralFinStart,
    //   pectoralFinEnd
    // );
  }

  generateBody(width, height) {
    let w = width / 2;
    let h = height / 2;
    let pts = {
      mouthtop: createVector(-w, -random(0, h / 2)),
      mouthbot: createVector(-w, random(0, h / 2)),
      mouthmid: createVector(
        -random(w / 2.4, w * 1.2),
        random(-h / 2.5, h / 2.5)
      ),
      tail: createVector(w, 0),

      // cubic bezier control points
      b0a: createVector(random(-w, 0), -h),
      b0b: createVector(random(0, w), -h / 2),

      b1a: createVector(random(0, w), h / 2),
      b1b: createVector(random(-w, 0), h),

      eye: createVector(-w * random(0.4, 0.6), random(-h / 4, -h / 8)),
    };
    return pts;
  }

  // no clue how the local to world space works but it works https://chatgpt.com/share/6826e1fa-1a34-8007-917b-351c0bbb8124
  localToWorldSpace(start, end, pts, heightScale = 1) {
    let dir = p5.Vector.sub(end, start);
    let length = dir.mag();
    let angle = dir.heading();
    for (let v of Object.values(pts)) {
      v = v.mult(length, length * heightScale);
      v = v.rotate(angle).add(start);
    }
    return pts;
  }

  generateArc() {
    // calculates the local points
    // local space
    let pts = {
      p0: createVector(random(-0.3, 0.3), random(0.5, 1)),
      p1: createVector(random(0.7, 1.3), random(0.5, 1)),
      b0: createVector(0.5, -1),
    };

    return pts;
  }

  generateTriangle() {
    // generates a fin shape using 3 points and 1 control point

    let pts = {
      p0: createVector(0, random(0, 0.2)),
      p1: createVector(0.5, 0),
      p2: createVector(1, random(0.8, 1)),
      b0: createVector(random(0.3, 0.7), random(0.2, 1.5)),
    };
    return pts;
  }

  generateTrapezoid() {
    // genereates a trapezoid fin shape using 4 points and 1 control point
    let pts = {
      p0: createVector(0.25, 0),
      p1: createVector(0, random(0.5, 1)),
      p2: createVector(1, random(0.5, 1)),
      p3: createVector(0.75, 0),
      b0: createVector(random(0.3, 0.7), random(0.5, 1.5)),
    };
    return pts;
  }

  generateFin() {
    // determines the fin shape given the start and end points (box's corners)
    // generates random fin shapes for each fin
    let finType = "arc";
    let finShape = random(1);
    let finPoints = {};
    if (finShape < 0.3) {
      finType = "trapezoid";
      finPoints = this.generateTrapezoid();
    } else if (finShape < 0.6) {
      finType = "triangle";
      finPoints = this.generateTriangle();
    } else {
      finType = "arc";
      finPoints = this.generateArc();
    }
    let fin = { finType, ...finPoints };
    console.log(fin);
    return fin;
  }

  draw(midpoint) {
    let pts = this.calculatePoints(this.bodyPoints, midpoint);

    // let finpts = this.calculatePoints(this.fins, midpoint);
    for (let fin of Object.values(this.fins)) {
      let finpts = this.calculatePoints(fin.points, midpoint);
      this.drawFin(fin.type, finpts);
    }

    this.drawBody(pts);
    this.drawEye(pts);
    let pectpts = this.calculatePoints(this.fins.pectoral.points, midpoint);
    this.drawFin(this.fins.pectoral.type, pectpts);

    // this.drawPoints(finpts);
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

  drawFin(finType, pts) {
    // draws the fins
    if (finType == "arc") this.drawArcFin(pts);
    else if (finType == "triangle") this.drawTriangleFin(pts);
    else if (finType == "trapezoid") this.drawTrapezoidFin(pts);
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
    vertex(pts.mouthtop.x, pts.mouthtop.y);
    // top curve to p1
    bezierVertex(
      pts.b0a.x,
      pts.b0a.y,
      pts.b0b.x,
      pts.b0b.y,
      pts.tail.x,
      pts.tail.y
    );

    // bottom curve back to mouthbot
    bezierVertex(
      pts.b1a.x,
      pts.b1a.y,
      pts.b1b.x,
      pts.b1b.y,
      pts.mouthbot.x,
      pts.mouthbot.y
    );

    // vertex(pts.mouthbot.x, pts.mouthbot.y);
    bezierVertex(
      pts.mouthmid.x,
      pts.mouthmid.y,
      pts.mouthmid.x,
      pts.mouthmid.y,
      pts.mouthtop.x,
      pts.mouthtop.y
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
