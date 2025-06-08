/* exported BackgroundScene */

class BackgroundScene {
  constructor(w, h) {
    this.width = w;
    this.height = h;

    this.strokeColor;
    this.noiseMap = [];

    this.skySeed = 0;
    this.amplitude = 20;
    this.freq = 0.05;
    this.BackgroundColor = "#b0d5e6";
    //Mountain vars
    this.MountainColor = "#B29995";
    this.MountainColor1 = "#B9A19F";
    this.MountainColor2 = "#BEA19B";
    this.MountainColor3 = "#C4A9A2";
    this.MountainColor4 = "#98888B";
    this.MountainStroke = "#5C4033";
    let colors = [
      this.MountainColor,
      this.MountainColor1,
      this.MountainColor2,
      this.MountainColor3,
      this.MountainColor4,
      this.MountainStroke,
    ];
    this.SeaColor = "#6495ed";
    this.mountainGraphics = createGraphics(this.width, this.height);
    this.pixelMountainGraphics = createGraphics(this.width, this.height);
    this.drawMountains();
    pixelateBuffer(
      this.mountainGraphics,
      this.pixelMountainGraphics,
      colors,
      5
    );
    this.cloudGraphic = createGraphics(this.width, this.height);
    this.cloudOffsetX = 0;
    this.perlinNoise();
  }

  draw() {
    background(this.BackgroundColor);
    image(this.pixelMountainGraphics, 0, 0);
    this.perlinSky();
    this.dock();
    this.cloudAnim();
  }

  drawMountains() {
    randomSeed();
    this.mountainGraphics.push();
    this.mountainGraphics.stroke(this.MountainStroke);
    this.drawMountain(this.MountainColor4, 90);
    this.drawMountain(this.MountainColor, 50);
    this.drawMountain(this.MountainColor1, 60);
    this.drawMountain(this.MountainColor2, 70);
    this.drawMountain(this.MountainColor3, 80);
    this.mountainGraphics.pop();
  }

  //--------------------Draw mountain func----
  drawMountain(color, heightM) {
    this.mountainGraphics.push();
    this.mountainGraphics.fill(color);
    this.mountainGraphics.strokeWeight(5);
    this.mountainGraphics.beginShape();
    this.mountainGraphics.vertex(0, this.height / 2);
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      let x = (this.width * i) / steps;
      let y =
        this.height / 2 -
        (random() * random() * random() * this.height) / 2 -
        this.height / heightM;
      this.mountainGraphics.vertex(x, y);
    }
    this.mountainGraphics.vertex(this.width, this.height / 2);
    this.mountainGraphics.endShape(CLOSE);
    this.mountainGraphics.pop();
  }

  //Generates the noise values for all points in the perlinSky function
  perlinNoise() {
    noiseSeed(this.skySeed);
    let level = 450;
    let scale = 0.09;
    let drift = this.amplitude * sin(frameCount * this.freq);
    for (let y = 0; y < this.height / 2; y += 1) {
      let rowTemp = [];
      let mod = map(y, 0, this.height / 2, 10, 1);
      let squish = scale / mod;
      let ny = squish * y + this.skySeed * 0.5;
      for (let x = 0; x < this.width * 2; x += 1) {
        let nx = squish * (x + drift) + this.skySeed;
        rowTemp.push(level * noise(nx, ny));
      }
      this.noiseMap.push(rowTemp);
    }
  }

  //perlinSky() function from corvuscorae reflected clouds project
  perlinSky() {
    strokeWeight(5);
    let lightBlue = [];
    let darkBlue = [];
    let c = 0;
    let drift = this.amplitude * sin(frameCount * this.freq);
    drift += 20;
    for (let y = 0; y < this.height / 2; y += 4) {
      for (let x = 0; x < this.width; x += 4) {
        if (this.noiseMap[y] != null) {
          c = this.noiseMap[y][x + Math.floor(drift)];
        } else {
          c = 0;
        }

        if (c > 200) {
          lightBlue.push([x, this.height - y - 1]);
        } else {
          darkBlue.push([x, this.height - y - 1]);
        }
      }
    }
    noStroke();
    fill("skyblue");
    // rectMode(CENTER);
    for (let i = 0; i < lightBlue.length; i++) {
      square(lightBlue[i][0], lightBlue[i][1], 4);
    }
    fill(this.SeaColor);
    for (let i = 0; i < darkBlue.length; i++) {
      square(darkBlue[i][0], darkBlue[i][1], 4);
    }
  }

  // scaled to base width and height proportionally, help from chatgpt https://chatgpt.com/share/683ab31b-e418-8007-87ff-7c767026879b
  dock() {
    push();
    scale(-1, 1);

    // Define ratios based on assumed original canvas size (1200x600)
    const baseW = 1200;
    const baseH = 600;

    const scaleW = this.width / baseW;
    const scaleH = this.height / baseH;

    const baseX = -this.width;
    const baseY = this.height;

    // Adjusted Y positions
    const legY = baseY - 160 * scaleH;
    const midY = baseY - 240 * scaleH;
    const playerY = baseY - 350 * scaleH;

    // X offsets scaled
    const dx = [0, 80, 160, 240, 320, 400, 480].map((x) => x * scaleW);
    const legDx = [0, 240, 480].map((x) => x * scaleW);

    // Draw dock mid and legs
    image(dockMidLeg, baseX + dx[0], midY);
    image(dockMid, baseX + dx[1], midY);
    image(dockMid, baseX + dx[2], midY);
    image(dockMidLeg, baseX + dx[3], midY);
    image(dockMid, baseX + dx[4], midY);
    image(dockMid, baseX + dx[5], midY);
    image(dockEnd, baseX + dx[6], midY);

    image(dockLeg, baseX + legDx[0], legY);
    image(dockLeg, baseX + legDx[1], legY);
    image(dockLeg, baseX + legDx[2], legY);

    pop();
    image(player, posX, playerY);
  }

  // dock() {
  //   push();
  //   scale(-1, 1);
  //   image(dockMidLeg, -1200, 600 - 240);
  //   image(dockMid, -1200 + 80, 600 - 240);
  //   image(dockMid, -1200 + 160, 600 - 240);
  //   image(dockMidLeg, -1200 + 240, 600 - 240);
  //   image(dockMid, -1200 + 320, 600 - 240);
  //   image(dockMid, -1200 + 400, 600 - 240);
  //   image(dockEnd, -1200 + 480, 600 - 240);

  //   image(dockLeg, -1200, 600 - 160);
  //   image(dockLeg, -1200 + 240, 600 - 160);
  //   image(dockLeg, -1200 + 480, 600 - 160);

  //   image(player, -posX, 600 - 350);
  //   pop();
  // }

  //draw clouds func
  cloudAnim() {
    this.cloudOffsetX += 0.2;

    this.cloudGraphic.clear();
    this.cloudGraphic.noStroke();
    this.cloudGraphic.fill(255, 255, 255, 50);

    const layers = [
      { scale: 0.004, alpha: 50, offsetMult: 0.5, size: 25 },
      { scale: 0.006, alpha: 100, offsetMult: 1.5, size: 18 },
    ];

    for (let layer of layers) {
      for (let y = 0; y < this.height / 3; y += 10) {
        for (let x = 0; x < this.width; x += 10) {
          let n = noise(
            (x + this.cloudOffsetX * layer.offsetMult) * layer.scale,
            (y + random()) * layer.scale
          );
          if (n > 0.5) {
            this.cloudGraphic.fill(255, 255, 255, layer.alpha);
            // this.cloudGraphic.rect(x, y, layer.size, layer.size);
            this.cloudGraphic.ellipse(x, y, layer.size, layer.size * 0.75);
          }
        }
      }
    }
    image(this.cloudGraphic, 0, 0);
  }
}

function pixelateBuffer(buffer, pixelbuffer, colors, level) {
  let imgbuffer = createGraphics(pixelbuffer.width, pixelbuffer.height);
  imgbuffer.noSmooth();
  pixelbuffer.pixelDensity(1);
  pixelbuffer.noSmooth();
  imgbuffer.pixelDensity(1);

  imgbuffer.image(buffer, 0, 0, imgbuffer.width, imgbuffer.height);
  imgbuffer.loadPixels();

  pixelbuffer.clear(); // Optional: clear from last frame
  pixelbuffer.noStroke();

  colorMode(RGB, 255);

  for (let x = 0; x < floor(imgbuffer.width); x += level) {
    for (let y = 0; y < floor(imgbuffer.height); y += level) {
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

      if (closest == colors[3] || closest == colors[2]) {
        let gradienthres;
        let t;
        t = map(y, 0, pixelbuffer.height, 0, 1);
        gradienthres = random(0.3, 0.6);
        if (t > gradienthres) {
          closest = colors[0];
        } else if (t > gradienthres && random() > 0.3) {
          closest = colors[colors.length - 1];
        }
      }

      pixelbuffer.fill(closest);
      pixelbuffer.square(floor(x), floor(y), floor(level));
    }
  }
}

function updateColor(closest, x, y) {
  let threshold;
  let t;
  t = map(y, 0, this.pixelbuffer.width, 0, 1);
  threshold = random(0.4, 0.6);
  if (t < threshold) {
    closest = this.patternColorA;
  } else if (t < threshold && random() < 0.5) {
    closest = this.patternColorA;
  }
  return closest;
}
