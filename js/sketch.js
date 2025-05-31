/* exported setup, draw */
const fishContainer = document.getElementById("fish-list");

const KEY = "LOCAL";
let bezx = [];
let bezy = [];
let castProgress = 0;

//vars from corvuscorae reflected clouds project
const w = 1200;
const h = 600;

let skySeed = 0;

let fishSeed = 0;

let amplitude = 20;
let freq = 0.05;

// fish vars
let fishes = [];
let fishSeeds = [];
let fishParams;
let displayFish = true;
let casting = false;
let fishx;
let fishy;
let fishScale;
let catchSpeed = 1.5;

//player vars
let player;
let speed = 5;
let posX = w - 320;

let movingLeft = false;
let movingRight = false;

let backgroundScene;

// //cloud vars
// let cloudGraphic;
// let cloudOffsetX = 0;

//bezier vars
let castx = w * 0.675;
let casty = h * 0.4; // Anchor point 1
let x2 = w * 0.55;
let y2 = h * 0.2; // Control point 1
let x3 = w * 0.4;
let y3 = h * 0.25; // Control point 2
let x4 = w * 0.15;
let y4 = h * 0.75; // Anchor point 2

class BackgroundScene {
  constructor() {
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
    this.mountainGraphics = createGraphics(w, h);
    this.drawMountains();
    this.cloudGraphic = createGraphics(w, h);
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
    this.mountainGraphics.vertex(0, height / 2);
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      let x = (width * i) / steps;
      let y =
        height / 2 -
        (random() * random() * random() * height) / 2 -
        height / heightM;
      this.mountainGraphics.vertex(x, y);
    }
    this.mountainGraphics.vertex(width, height / 2);
    this.mountainGraphics.endShape(CLOSE);
    this.mountainGraphics.pop();
  }

  // perlinSky() {
  //   let level = 450;
  //   let scale = 0.09;
  //   strokeWeight(2);
  //   let drift = this.amplitude * sin(frameCount * this.freq);
  //   for (let y = 0; y < h / 2; y += 2) {
  //     let mod = map(y, 0, h / 2, 10, 1);
  //     let squish = scale / mod;
  //     let ny = squish * y + this.skySeed * 0.5;
  //     for (let x = 0; x < w; x += 2) {
  //       let nx = squish * (x + drift) + this.skySeed;
  //       let c = level * noise(nx, ny);

  //       let strokeColor = color(this.SeaColor);
  //       if (c > 200) {
  //         strokeColor = "skyblue";
  //       }
  //       stroke(strokeColor);
  //       point(x, h - y - 1);
  //     }
  //   }
  // }

  //perlinSky() function from corvuscorae reflected clouds project
  perlinSky() {
    let level = 450;
    let scale = 0.09;
    noiseSeed(skySeed);
    strokeWeight(4);
    let drift = this.amplitude * sin(frameCount * freq);
    for (let y = 0; y < h / 2; y += 4) {
      // shifted up to reflect at horizon
      // modify scale along y-axis, squishing it as y gets larger
      let mod = map(y, 0, h / 2, 10, 1);
      let squish = scale / mod;
      let ny = squish * y + this.skySeed * 0.5;
      for (let x = 0; x < w; x += 4) {
        let nx = squish * (x + drift) + this.skySeed;

        let c = level * noise(nx, ny);

        let strokeColor = color(this.SeaColor);
        if (c > 200) {
          strokeColor = "skyblue";
        }
        stroke(strokeColor);
        point(x, h - y - 1);
      }
    }
  }

  dock() {
    //place dock tiles
    push();
    scale(-1, 1);
    image(dockMidLeg, -w, h - 240);
    image(dockMid, -w + 80, h - 240);
    image(dockMid, -w + 160, h - 240);
    image(dockMidLeg, -w + 240, h - 240);
    image(dockMid, -w + 320, h - 240);
    image(dockMid, -w + 400, h - 240);
    image(dockEnd, -w + 480, h - 240);

    image(dockLeg, -w, h - 160);
    image(dockLeg, -w + 240, h - 160);
    image(dockLeg, -w + 480, h - 160);

    //place player sprite
    image(player, -posX, h - 350);
    pop();
  }

  //draw clouds func
  cloudAnim() {
    this.cloudOffsetX += 0.2; // Speed of cloud drift

    this.cloudGraphic.clear(); // Clear the buffer
    this.cloudGraphic.noStroke();
    this.cloudGraphic.fill(255, 255, 255, 50); // soft white

    // Layered cloud passes
    const layers = [
      { scale: 0.004, alpha: 20, offsetMult: 0.5, size: 25 },
      { scale: 0.006, alpha: 50, offsetMult: 1.5, size: 18 },
    ];

    for (let layer of layers) {
      for (let y = 0; y < height / 3; y += 10) {
        for (let x = 0; x < width; x += 10) {
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

function setup() {
  createCanvas(w, h);

  colorMode(HSB);
  backgroundScene = new BackgroundScene();
  //   createSceneObjectsTemp();
  fishParams = {
    maxWidth: w / 1.5,
    minWidth: w / 6,
    maxHeight: h / 1.5,
    minHeight: h / 6,
  };
  makeFish();

  genBezierPoints();
  if (bezx.length != bezy.length) {
    console.log("Issues defining fishing arc, expect undefined behavior");
  }

  //createButton("clear saveData").mousePressed(() => localStorage.clear());//debugging
  loadGameState();
}

function makeFish() {
  randomSeed(fishSeed);
  let seed = random(0, 10000);
  console.log(seed);
  let fish = new Fish(seed);
  fishes.push(fish);
  fishSeeds.push(fish.seed);
  //console.log(fish);
}

function drawAllFish() {
  for (let fish of fishes) {
    let midpoint = { x: random(0, w), y: random(0, h) };
    fish.draw(midpoint, 0.5);
  }
}

function drawNewestFish(xpos = -500, ypos = -500, scale) {
  let newestIndex = fishes.length - 1;
  let fish = fishes[newestIndex];
  fish.draw({ x: xpos, y: ypos }, scale);
}

function preload() {
  dockEnd = loadImage("./assets/dockEnd_x5.png");
  dockMid = loadImage("./assets/dockMid_x5.png");
  dockMidLeg = loadImage("./assets/dockMidLeg_x5.png");
  dockLeg = loadImage("./assets/dockLeg_x5.png");

  //player img
  player = loadImage("./assets/fish_x5.png");
}

function draw() {
  fishSeed += 1;
  genBezierPoints();
  backgroundScene.draw();

  if (castProgress <= bezx.length && casting == true) {
    doCastAnimation();
  }

  if (!casting) {
    drawNewestFish(fishx, fishy, fishScale);
    if (fishx < 500) {
      fishx += 5 * catchSpeed;
    }
    if (fishy > 200) {
      fishy -= 3.5 * catchSpeed;
    }
    if (fishScale < 0.5) {
      fishScale += 0.0055 * catchSpeed;
    }
  } else {
    fishx = 140;
    fishy = 450;
    fishScale = 0.1;
  }

  //move player
  if (movingLeft) {
    posX -= speed;
    castx -= speed;
    x2 -= speed;
    x3 -= speed;
  }

  // Move right
  if (movingRight) {
    posX += speed;
    castx += speed;
    x2 += speed;
    x3 += speed;
  }
  displayfishes();
}

function mouseClicked() {
  if (castProgress >= bezx.length) {
    makeFish();
    castProgress = 0;
    casting = false;
  } else if (casting == false) {
    casting = true;
  }
  saveGameState();
}

//movement
function keyPressed() {
  if (key === "a" || key === "A") {
    movingLeft = true;
  }
  if (key === "d" || key === "D") {
    movingRight = true;
  }
}

function keyReleased() {
  if (key === "a" || key === "A") {
    movingLeft = false;
  }
  if (key === "d" || key === "D") {
    movingRight = false;
  }
}

function genBezierPoints() {
  bezx = [];
  bezy = [];
  noFill();
  strokeWeight(1);
  stroke(0);

  for (let t = 0; t < 1; t += 0.01 * Math.abs(t - 0.3) * 4 + 0.005) {
    bezx.push(bezierPoint(castx, x2, x3, x4, t));
    bezy.push(bezierPoint(casty, y2, y3, y4, t));
  }
  strokeWeight(4);
}

function doCastAnimation() {
  stroke(0);
  noFill();
  if (castProgress < bezx.length) {
    castProgress += 1;
  }
  beginShape();
  for (let i = 0; i < castProgress; i++) {
    vertex(bezx[i], bezy[i]);
  }
  endShape();
}

function displayfishes() {
  //just to show off the fish stuff, remove this and the div in index when aquarium implemented?
  fishContainer.innerHTML = "";
  fishes.forEach((fish) => {
    const messageDiv = document.createElement("div");
    messageDiv.style.border = "solid #000000";
    messageDiv.style.fontWeight = "bold";
    messageDiv.textContent = `${fish.name}`;
    const descDiv = document.createElement("div");
    descDiv.textContent = `${fish.description}`;
    descDiv.style.fontWeight = "normal";
    messageDiv.appendChild(descDiv);
    fishContainer.appendChild(messageDiv);
  });
}

function saveGameState() {
  var fishNames = [];
  var fishDescs = [];
  var fishSeeds = [];
  var fishAmount = 0;
  fishes.forEach((fish) => {
    //console.log(`fish in fishes: ${fish.name}`);
    fishNames.push(fish.name);
    fishDescs.push(fish.description);
    fishSeeds.push(fish.seed);
    fishAmount++;
  });
  console.log(`amount of fish saved: ${fishAmount}`);
  const fishData = {
    fishNames,
    fishDescs,
    fishSeeds,
    fishAmount,
  };
  localStorage.setItem(KEY, JSON.stringify(fishData));
}
function loadGameState() {
  const gameState = localStorage.getItem(KEY);
  if (gameState) {
    var fishData = JSON.parse(gameState);
    console.log(`amount of fish loaded: ${fishData.fishAmount}`);
    for (x = 0; x < fishData.fishAmount; x++) {
      //console.log(`loading fish: ${fishData.fishNames[x]}`);
      fishes.push(
        new Fish(
          fishData.fishSeeds[x],
          fishData.fishNames[x],
          fishData.fishDescs[x]
        )
      );
    }
  } else {
    return;
  }
}
