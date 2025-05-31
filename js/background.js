class BackgroundScene {
  constructor(w, h) {
    this.width = w;
    this.height = h;

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
    this.SeaColor = "#6495ed";
    this.mountainGraphics = createGraphics(this.width, this.height);
    this.drawMountains();
    this.cloudGraphic = createGraphics(this.width, this.height);
    this.cloudOffsetX = 0;
  }

  draw() {
    background(this.BackgroundColor);
    image(this.mountainGraphics, 0, 0);
    this.perlinSky();
    this.dock();
    this.cloudAnim();
  }

  drawMountains() {
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

  //perlinSky() function from corvuscorae reflected clouds project
  perlinSky() {
    let level = 450;
    let scale = 0.09;
    noiseSeed(this.skySeed);
    strokeWeight(4);
    let drift = this.amplitude * sin(frameCount * this.freq);
    for (let y = 0; y < this.height / 2; y += 4) {
      let mod = map(y, 0, this.height / 2, 10, 1);
      let squish = scale / mod;
      let ny = squish * y + this.skySeed * 0.5;
      for (let x = 0; x < this.width; x += 4) {
        let nx = squish * (x + drift) + this.skySeed;

        let c = level * noise(nx, ny);

        let strokeColor = color(this.SeaColor);
        if (c > 200) {
          strokeColor = "skyblue";
        }
        stroke(strokeColor);
        point(x, this.height - y - 1);
      }
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

    image(player, -posX, playerY);

    pop();
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
      { scale: 0.004, alpha: 20, offsetMult: 0.5, size: 25 },
      { scale: 0.006, alpha: 50, offsetMult: 1.5, size: 18 },
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
            this.cloudGraphic.ellipse(x, y, layer.size, layer.size * 0.75);
          }
        }
      }
    }
    image(this.cloudGraphic, 0, 0);
  }
}
