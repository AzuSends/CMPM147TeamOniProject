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
      color(
        (hue(baseColor) + 30) % 360,
        saturation(baseColor),
        brightness(baseColor)
      ), // +30 deg
    ];
  },
  getSplitComplementary(baseColor) {
    return [
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

const TextureWeights = {
  noise: {
    analoghorror: 1,
    cow: 4,
    freckle: 2,
    rainbow: 4,
  },
  random: {
    rainbow: 1,
    dots: 5,
    freckle: 5,
  },
  stripe: {
    horizontal: 4,
    vertical: 3,
    grid: 2,
    checkerboard: 1,
  },
  none: {
    none: 0,
  }, // no textures
  gradient: {
    horizontal: 1,
    vertical: 1,
  },
};

const PatternWeights = {
  noise: 3,
  random: 1,
  stripe: 2,
  none: 3,
  gradient: 2,
};

function weightedRandom(options) {
  let totalWeight = 0;
  for (let key in options) {
    totalWeight += options[key];
  }

  let rand = random(totalWeight);
  for (let key in options) {
    rand -= options[key];
    if (rand <= 0) {
      return key;
    }
  }
}

function calculateRarity(fish) {
  let patternRarity =
    (1 / PatternWeights[fish.bodypattern] +
      1 / PatternWeights[fish.finpattern]) /
    2;
  let textureRarity =
    (1 / TextureWeights[fish.bodypattern][fish.bodytexture] +
      1 / TextureWeights[fish.finpattern][fish.fintexture]) /
    2;
  if (textureRarity == Infinity) textureRarity = 0;
  let combscore = (patternRarity + textureRarity) / 2;
  let rarity = ceil(map(combscore * 1.5, 0, 1, 0, 6));

  console.log(combscore, rarity, patternRarity, textureRarity);
  return rarity;
}

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
    this.aggresion = floor(random(0, 765));
    this.diet = floor(random(0, 2));
    this.hunger = random();
    this.feeding = 0;
    this.seed = seed;
    this.width = random(fishParams.minWidth, fishParams.maxWidth);
    this.height = random(fishParams.minHeight, fishParams.maxHeight);
    this.position;
    this.scale;
    this.direction = { x: 1, y: 0 }; // 1 == right/up, -1 == left/down
    this.speed = random(0.5, 3); // how fast the fish moves

    let w = this.width / 2;
    let h = this.height / 2;

    this.mainColor = color(random(255), random(255), random(255));

    this.colorScheme = random([
      "Split",
      "Complementary",
      "Analogous",
      "Triadic",
    ]);

    colorMode(HSB);
    if (this.colorScheme == "Split") {
      let colors = ColorSchemes.getSplitComplementary(this.mainColor);
      this.secondaryColor = colors[0];
      this.patternColorA = colors[1];
    } else if (this.colorScheme == "Analogous") {
      let colors = ColorSchemes.getAnalogous(this.mainColor);
      this.secondaryColor = colors[0];
      this.patternColorA = colors[1];
    } else if (this.colorScheme == "Triadic") {
      let colors = ColorSchemes.getTriadic(this.mainColor);
      this.secondaryColor = colors[0];
      this.patternColorA = colors[1];
    } else {
      this.secondaryColor = ColorSchemes.getComplementary(this.mainColor);
      this.patternColorA = ColorSchemes.getShadow(this.mainColor, 0.3);
    }
    this.patternColorB = random([
      ColorSchemes.getAnalogous(this.patternColorA)[1],
      ColorSchemes.getShadow(this.patternColorA),
    ]);

    this.strokeColor = "#000000";
    this.strokeWeight = 10;
    this.bufferw = this.width * 4;
    this.bufferh = this.height * 3;
    this.buffer = createGraphics(this.bufferw, this.bufferh);
    this.pixelbuffer = createGraphics(this.bufferw, this.bufferh);
    this.hovered = false;
    this.level = 10; // pixelation level

    this.bodypattern = weightedRandom(PatternWeights);
    this.bodytexture = weightedRandom(TextureWeights[this.bodypattern]);

    this.stripeX = floor(random(2, 9));
    this.stripeY = floor(random(2, 9));

    this.finpattern = weightedRandom(PatternWeights);
    this.fintexture = weightedRandom(TextureWeights[this.finpattern]);

    this.rarity = calculateRarity(this);

    console.log(
      this.bodypattern,
      this.bodytexture,
      this.finpattern,
      this.fintexture,
      this.colorScheme,
      this.rarity
    );

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

        eye: createVector(-w * random(0.5, 0.7), random(-h / 4, -h / 8)),
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
    // console.log(this.width, this.height);
    this.drawToBuffer();
    this.pixelateBuffer();
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
      console.log(
        "Fish hovered: " + this.name + this.bodytexture + this.colorScheme
      );
      this.hovered = true;
    } else {
      this.hovered = false;
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

    push();
    translate(this.position.x, this.position.y);
    let flipFactor = flip ? -1 : 1;
    if (this.hovered) {
      stroke(this.mainColor);
      strokeWeight(3);
      fill(this.secondaryColor);
      star(
        0,
        0,
        this.width * 0.8 * this.scale,
        this.height * 0.8 * this.scale,
        10
      );
    }
    scale(flipFactor * this.scale, this.scale);
    // this.debugbox();
    imageMode(CENTER);
    image(this.pixelbuffer, 0, 0);
    pop();
  }

  drawToBuffer() {
    this.buffer.colorMode(HSB);
    // this.buffer.noSmooth();
    this.buffer.pixelDensity(2);
    this.buffer.push();
    this.buffer.translate(this.bufferw / 2, this.bufferh / 2);
    this.buffer.strokeWeight(2);
    // this.debugbox();
    this.buffer.stroke(this.strokeColor);
    this.buffer.strokeWeight(this.strokeWeight);
    for (let fin of Object.values(this.fins)) {
      this.drawFin(fin.type, fin.points);
      // this.drawPoints(fin.points);
    }
    this.drawBody(this.body.points);
    this.drawEye(this.body.points.eye);
    this.drawFin(this.fins.pectoral.type, this.fins.pectoral.points);

    this.buffer.pop();
  }

  pixelateBuffer() {
    let imgbuffer = createGraphics(
      this.pixelbuffer.width,
      this.pixelbuffer.height
    );
    imgbuffer.noSmooth();
    this.pixelbuffer.pixelDensity(1);
    this.pixelbuffer.noSmooth();
    imgbuffer.pixelDensity(1);

    imgbuffer.image(this.buffer, 0, 0, imgbuffer.width, imgbuffer.height);
    imgbuffer.loadPixels();

    this.pixelbuffer.clear(); // Optional: clear from last frame
    this.pixelbuffer.noStroke();

    colorMode(RGB, 255);

    const colors = [
      this.mainColor,
      this.secondaryColor,
      color(255, 255, 255), // white
      color(0, 0, 0), // black
    ];

    for (let x = 0; x < floor(imgbuffer.width); x += this.level) {
      for (let y = 0; y < floor(imgbuffer.height); y += this.level) {
        let i = 4 * (x + y * floor(imgbuffer.width));

        let r = imgbuffer.pixels[i];
        let g = imgbuffer.pixels[i + 1];
        let b = imgbuffer.pixels[i + 2];
        let a = imgbuffer.pixels[i + 3];

        let threshold = 20;
        a = a > threshold ? 255 : 0;
        if (a === 0) continue;

        // Find closest color
        let minDist = Infinity;
        let closest = color(0);
        for (let c of colors) {
          let cr = red(c);
          let cg = green(c);
          let cb = blue(c);
          let dist = sq(r - cr) + sq(g - cg) + sq(b - cb); // No sqrt needed
          if (dist < minDist) {
            minDist = dist;
            closest = c;
          }
        }
        if (color(closest) == this.mainColor) {
          closest = this.updateColor(
            closest,
            this.bodypattern,
            this.bodytexture,
            x,
            y
          );
        } else if (color(closest) == this.secondaryColor) {
          closest = this.updateColor(
            closest,
            this.finpattern,
            this.fintexture,
            x,
            y
          );
        }

        this.pixelbuffer.fill(closest);
        this.pixelbuffer.square(floor(x), floor(y), floor(this.level));
      }
    }
  }

  updateColor(closest, pattern, texture, x, y) {
    // pattern for body

    if (pattern == "noise") {
      let c = noise(x * 0.01, y * 0.01);

      if (c < 0.5) {
        if (texture == "analoghorror") {
          closest = [
            this.patternColorA,
            this.patternColorB,
            this.patternColorA,
          ];
        } else if (texture == "cow") {
          closest = this.patternColorA;
        } else if (texture == "freckle") {
          closest =
            floor(random(0, 2)) == 0 ? this.patternColorA : this.patternColorB;
        }
      }
      if (texture == "rainbow") {
        if (c < 0.3) {
          closest = this.patternColorA;
        } else if (c < 0.5) {
          closest = this.patternColorB;
        }
      }
    } else if (pattern == "random") {
      if (texture == "rainbow") {
        let c = random(1);
        if (c < 0.5) {
          closest = color(random(255), random(255), random(255)); // random rainbow color
        }
      } else if (texture == "dots") {
        let c = random(1);
        if (c < 0.1) {
          closest = this.patternColorA;
        }
      } else if (texture == "freckle") {
        let c = random(1);
        if (c < 0.5) {
          closest =
            floor(random(0, 2)) == 0 ? this.patternColorA : this.patternColorB;
        }
      }
    } else if (pattern == "stripe") {
      if (texture == "horizontal") {
        if (floor(y / this.level) % this.stripeY == 0) {
          closest = this.patternColorA; // horizontal stripes
        }
      } else if (texture == "vertical") {
        if (floor(x / this.level) % this.stripeX == 0) {
          closest = this.patternColorA; // vertical stripes
        }
      } else if (texture == "grid") {
        if (
          floor(x / this.level) % this.stripeX == 0 &&
          floor(y / this.level) % this.stripeY == 0
        ) {
          closest = this.patternColorA; // grid pattern
        }
      } else if (texture == "checkerboard") {
        if (
          floor(x / this.level) % this.stripeX == 0 ||
          floor(y / this.level) % this.stripeY == 0
        ) {
          closest = this.patternColorA; // checkerboard pattern
        }
      }
    } else if (pattern == "gradient") {
      let threshold;
      let t;
      if (texture == "horizontal") {
        t = map(x, 0, this.pixelbuffer.width, 0, 1);
        threshold = random(0.4, 0.6);
      } else if (texture == "vertical") {
        t = map(y, 0, this.pixelbuffer.height, 0, 1);
        threshold = random(0.4, 0.6);
      }

      if (t < threshold) {
        closest = this.patternColorA;
      } else if (t < threshold && random() < 0.5) {
        closest = this.patternColorA;
      }
    }

    return closest;
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
    this.buffer.fill(100, 100, 100);
    for (let [k, v] of Object.entries(pts)) {
      this.buffer.point(v.x, v.y);
      this.buffer.text(k, v.x + 5, v.y - 5);
    }
  }

  drawArc(pts) {
    // draws using 2 points and 1 control point
    this.buffer.fill(this.secondaryColor);
    this.buffer.beginShape();
    this.buffer.vertex(pts.p0.x, pts.p0.y);
    this.buffer.quadraticVertex(pts.b0.x, pts.b0.y, pts.p1.x, pts.p1.y);
    this.buffer.endShape(CLOSE);
  }

  drawTriangle(pts) {
    // draws using 3 points and 1 control point
    this.buffer.fill(this.secondaryColor);
    this.buffer.beginShape();
    this.buffer.vertex(pts.p0.x, pts.p0.y);
    this.buffer.vertex(pts.p1.x, pts.p1.y);
    this.buffer.vertex(pts.p2.x, pts.p2.y);
    this.buffer.quadraticVertex(pts.b0.x, pts.b0.y, pts.p0.x, pts.p0.y);
    this.buffer.endShape(CLOSE);
  }

  drawTrapezoid(pts) {
    // draws using 4 point and 1 control point
    this.buffer.fill(this.secondaryColor);
    this.buffer.beginShape();
    this.buffer.vertex(pts.p0.x, pts.p0.y);
    this.buffer.vertex(pts.p1.x, pts.p1.y);
    this.buffer.quadraticVertex(pts.b0.x, pts.b0.y, pts.p2.x, pts.p2.y);
    this.buffer.vertex(pts.p3.x, pts.p3.y);
    this.buffer.endShape(CLOSE);
  }

  // draws fish body
  drawBody(pts) {
    this.buffer.fill(this.mainColor);
    this.buffer.beginShape();
    // body
    this.buffer.vertex(pts.mouthtop.x, pts.mouthtop.y);
    // top curve to p1
    this.buffer.bezierVertex(
      pts.b0a.x,
      pts.b0a.y,
      pts.b0b.x,
      pts.b0b.y,
      pts.tail.x,
      pts.tail.y
    );

    // bottom curve back to mouthbot
    this.buffer.bezierVertex(
      pts.b1a.x,
      pts.b1a.y,
      pts.b1b.x,
      pts.b1b.y,
      pts.mouthbot.x,
      pts.mouthbot.y
    );

    this.buffer.bezierVertex(
      pts.mouthmid.x,
      pts.mouthmid.y,
      pts.mouthmid.x,
      pts.mouthmid.y,
      pts.mouthtop.x,
      pts.mouthtop.y
    );

    this.buffer.endShape();
  }

  drawEye(pt) {
    this.buffer.push();
    this.buffer.noStroke();
    this.buffer.fill("white");
    this.buffer.rectMode(CENTER);
    this.buffer.circle(pt.x, pt.y, this.height / 6);
    this.buffer.fill("black");
    this.buffer.square(pt.x, pt.y, this.height / 15);
    this.buffer.pop();
  }
}
