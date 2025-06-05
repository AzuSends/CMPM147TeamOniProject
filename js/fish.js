/* exported Fish, ColorSchemes */

// inspired by https://editor.p5js.org/simontiger/sketches/MVVT1T01n
const ColorSchemes = {
  getComplementary(baseColor) {
    return color(
      (hue(baseColor) + 180) % 360,
      saturation(baseColor),
      brightness(baseColor)
    );
  },
  getAnalogous(baseColor) {
    return [
      color(
        (hue(baseColor) + 330) % 360,
        saturation(baseColor),
        brightness(baseColor)
      ), // -30 deg
      baseColor,
      color(
        (hue(baseColor) + 30) % 360,
        saturation(baseColor),
        brightness(baseColor)
      ), // +30 deg
    ];
  },
  getSplitComplementary(baseColor) {
    return [
      baseColor,
      color(
        (hue(baseColor) + 150) % 360,
        saturation(baseColor),
        brightness(baseColor)
      ),
      color(
        (hue(baseColor) + 210) % 360,
        saturation(baseColor),
        brightness(baseColor)
      ),
    ];
  },
  getTriadic(baseColor) {
    return [
      baseColor,
      color(
        (hue(baseColor) + 120) % 360,
        saturation(baseColor),
        brightness(baseColor)
      ),
      color(
        (hue(baseColor) + 240) % 360,
        saturation(baseColor),
        brightness(baseColor)
      ),
    ];
  },
  getShadow(baseColor, amount = 0.5) {
    let b = brightness(baseColor) * amount;
    return color(hue(baseColor), saturation(baseColor), b);
  },
};

class Fish {
  constructor(seed, name, desc) {
    if (seed) randomSeed(seed);
    if (name && desc) {
      this.name = name;
      this.description = desc;
    } else {
      let fishtext = new FishText();
      this.name = fishtext.getname();
      //console.log(this.name);
      this.description = fishtext.getdesc();
      //console.log(this.description);
    }
    this.rarity = ceil(random(0, 5));
    this.seed = seed;
    this.width = random(fishParams.minWidth, fishParams.maxWidth);
    this.height = random(fishParams.minHeight, fishParams.maxHeight);
    this.position;
    this.scale;
    this.direction = { x: 1, y: 0 }; // 1 == right/up, -1 == left/down
    this.speed = random(0.5, 3); // how fast the fish moves

    let w = this.width / 2;
    let h = this.height / 2;

    this.mainColor = color(random(255), 100, 100);
    this.secondaryColor = ColorSchemes.getComplementary(this.mainColor);
    this.strokeColor = "#000000";
    this.strokeWeight = 10;
    //ColorSchemes.getShadow(this.mainColor);

    this.body = {
      points: {
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
      },
    };

    // defines area of possible fin positions
    this.fins = {
      pectoral: {
        midpoint: createVector(-w * 0.3, 0),
        width: randomGaussian(h * 0.5, h * 0.1),
        height: randomGaussian(h, h * 0.2),
        rotation: randomGaussian(-PI / 2, PI / 12),
      },
      pelvic: {
        midpoint: createVector(-w * 0.2, this.body.points.mouthbot.y),
        width: random(w * 0.6, w * 0.15),
        height: randomGaussian(h * 0.85, h * 0.1),
        rotation: -PI / 20,
      },
      tail: {
        midpoint: createVector(w * 0.8, 0),
        width: randomGaussian(h * 0.6, h * 0.2),
        height: randomGaussian(h * 1.2, h * 0.2),
        rotation: -PI / 2,
      },
      dorsal: {
        midpoint: createVector(-w * 0.2, this.body.points.mouthtop.y),
        width: random(w * 0.9, w * 0.3),
        height: randomGaussian(h, h * 0.25),
        rotation: randomGaussian(PI, PI / 24),
      },
    };

    // generate the fins based on the fin's parameters
    for (let fin of Object.values(this.fins)) {
      let { finType, ...finPoints } = this.generateFin(
        fin.width,
        fin.height,
        fin.rotation,
        fin.midpoint
      );
      // adds fin.type and fin.points to fin object
      fin.points = finPoints;
      fin.type = finType;
    }
  }

  hover() {
    let topleft = {
      x: this.position.x - (this.width * this.scale) / 2,
      y: this.position.y - (this.height * 0.7 * this.scale) / 2,
    };
    let mouseclick =
      mouseX > topleft.x &&
      mouseX < topleft.x + this.width * this.scale &&
      mouseY > topleft.y &&
      mouseY < topleft.y + this.height * 0.7 * this.scale;
    if (mouseclick) {
      console.log("hovering over" + this.name);
      this.strokeWeight = 15;
      this.strokeColor = "#FFFF00";
    } else {
      this.strokeWeight = 10;
      this.strokeColor = "#000000";
    }
    return mouseclick;
  }

  move() {
    this.position.x += this.direction.x * this.speed;
    this.position.y += this.direction.y * this.speed;
  }

  finArc() {
    let leftY = random(0.3, 1);
    let rightY = random(0.3, 1);
    // calculates the local points
    let localpts = {
      p0: createVector(-1, leftY),
      p1: createVector(1, rightY),
      b0: createVector(0, -1),
    };

    return localpts;
  }

  finTriangle() {
    let curveTilt = random(-0.3, 0.3);
    let curveHeight = random(0.2, 2); // controls curve
    let leftY = random(0.2, 1);
    let rightY = random(0.2, 1);
    // generates a fin shape using 3 points and 1 control point
    let localpts = {
      p0: createVector(-1, leftY),
      p1: createVector(0, 0),
      p2: createVector(1, rightY),
      b0: createVector(curveTilt, curveHeight),
    };
    return localpts;
  }

  finTrapezoid() {
    let curveHeight = random(0.5, 1.5);
    let curveTilt = random(-0.3, 0.3);
    let leftY = random(0.5, 1);
    let rightY = random(0.5, 1);
    // genereates a trapezoid fin shape using 4 points and 1 control point
    let localpts = {
      p0: createVector(-0.5, 0),
      p1: createVector(-1, leftY),
      p2: createVector(1, rightY),
      p3: createVector(0.5, 0),
      b0: createVector(curveTilt, curveHeight),
    };
    return localpts;
  }

  generateFin(width, height, rotation, midpoint) {
    // generates random fin shapes for each fin
    let finType = "arc";
    let finShape = random(1);
    let finPoints = {};
    if (finShape < 0.3) {
      finType = "trapezoid";
      finPoints = this.finTrapezoid();
    } else if (finShape < 0.6) {
      finType = "triangle";
      finPoints = this.finTriangle();
    } else {
      finType = "arc";
      finPoints = this.finArc();
    }

    // transforms points to world coordinates
    for (let [k, v] of Object.entries(finPoints)) {
      // scale the points to the width and height of the fish
      v.x *= width;
      v.y *= height;
      v.rotate(rotation);
      v.add(midpoint);
    }

    let fin = { finType, ...finPoints };
    return fin;
  }

  debugbox() {
    rect(
      -this.width / 2,
      -(this.height * 0.7) / 2,
      this.width,
      this.height * 0.7
    );
  }

  draw(midpoint, scaleRatio = 1, flip = false) {
    if (midpoint) this.position = midpoint;
    this.scale = scaleRatio;

    colorMode(HSB);
    push();
    translate(this.position.x, this.position.y);
    if (flip) {
      scale(-scaleRatio, scaleRatio);
    } else {
      scale(scaleRatio);
    }
    strokeWeight(2);
    // this.debugbox();
    stroke(this.strokeColor);
    strokeWeight(this.strokeWeight);
    for (let fin of Object.values(this.fins)) {
      this.drawFin(fin.type, fin.points);
      // this.drawPoints(fin.points);
    }
    this.drawBody(this.body.points);
    this.drawEye(this.body.points.eye);
    this.drawFin(this.fins.pectoral.type, this.fins.pectoral.points);

    pop();
  }

  drawFin(finType, pts) {
    // draws the fins
    if (finType == "arc") this.drawArc(pts);
    else if (finType == "triangle") this.drawTriangle(pts);
    else if (finType == "trapezoid") this.drawTrapezoid(pts);
    else console.log("fin type not found");
  }

  drawPoints(pts) {
    // stroke(255, 100, 100);
    fill(100, 100, 100);
    for (let [k, v] of Object.entries(pts)) {
      point(v.x, v.y);
      text(k, v.x + 5, v.y - 5);
    }
  }

  drawArc(pts) {
    // draws using 2 points and 1 control point
    fill(this.secondaryColor);
    beginShape();
    vertex(pts.p0.x, pts.p0.y);
    quadraticVertex(pts.b0.x, pts.b0.y, pts.p1.x, pts.p1.y);
    endShape(CLOSE);
  }

  drawTriangle(pts) {
    // draws using 3 points and 1 control point
    fill(this.secondaryColor);
    beginShape();
    vertex(pts.p0.x, pts.p0.y);
    vertex(pts.p1.x, pts.p1.y);
    vertex(pts.p2.x, pts.p2.y);
    quadraticVertex(pts.b0.x, pts.b0.y, pts.p0.x, pts.p0.y);
    endShape(CLOSE);
  }

  drawTrapezoid(pts) {
    // draws using 4 point and 1 control point
    fill(this.secondaryColor);
    beginShape();
    vertex(pts.p0.x, pts.p0.y);
    vertex(pts.p1.x, pts.p1.y);
    quadraticVertex(pts.b0.x, pts.b0.y, pts.p2.x, pts.p2.y);
    vertex(pts.p3.x, pts.p3.y);
    endShape(CLOSE);
  }

  // draws fish body
  drawBody(pts) {
    fill(this.mainColor);
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

  drawEye(pt) {
    push();
    noStroke();
    fill("white");
    ellipse(pt.x, pt.y, this.height / 7);
    fill("black");
    ellipse(pt.x, pt.y, this.height / 12);
    pop();
  }
}
