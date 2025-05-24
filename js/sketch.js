/* exported setup, draw */

let bezx = [];
let bezy = [];
let castProgress = 0;

//vars from corvuscorae reflected clouds project
const w = 1200;
const h = 600;

let skySeed = 0;

let amplitude = 20;
let freq = 0.05;

// fish vars
let fishes = [];
let fishSeeds = [];
let fishParams;

//player vars
let player;
let speed = 5;
let posX = w - 320;

let movingLeft = false;
let movingRight = false;
//Mountain vars
const MountainColor = "#B29995";
const MountainColor1 = "#B9A19F";
const MountainColor2 = "#BEA19B";
const MountainColor3 = "#C4A9A2";
const MountainColor4 = "#98888B";
const MountainStroke = "#5C4033";

const BackgroundColor = "#b0d5e6";
const SeaColor = "#6495ed";

//cloud vars
let cloudGraphic;
let cloudOffsetX = 0;

function setup() {
  createCanvas(w, h);
  cloudGraphic = createGraphics(w, h);

  colorMode(HSB);
  background(BackgroundColor);
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

  createButton("reimagine").mousePressed(() => regenerate());
  regenerate();
}

function makeFish() {
  let seed = random(0, 10000);
  let fish = new Fish(seed);
  fishes.push(fish);
  fishSeeds.push(fish.seed);
  console.log(fish);
  return fish;
}

function drawAllFish() {
  for (let fish of fishes) {
    let midpoint = { x: random(0, w), y: random(0, h) };
    fish.draw(midpoint, 0.5);
  }
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
  randomSeed(skySeed);

  background(BackgroundColor);
  //------Call the mountain drawing---------
  drawMountain(MountainColor4, 90);
  drawMountain(MountainColor, 50);
  drawMountain(MountainColor1, 60);
  drawMountain(MountainColor2, 70);
  drawMountain(MountainColor3, 80);
  //----
  createSceneObjectsTemp();
  if (castProgress <= bezx.length) {
    doCastAnimation();
  }

  drawAllFish();

  perlinSky();
  cloudAnim();
  /*dock.resize(240, 160);
      image(dock, 0, h / 3 + 10);*/
  //place dock tiles
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
  //move player
  if (movingLeft) {
    posX -= speed;
  }

  // Move right
  if (movingRight) {
    posX += speed;
  }
}

function createSceneObjectsTemp() {
  //Just some basic visuals for the time being
  fill("blue");
  noStroke();
  rect(0, height * 0.75, width, height * 0.25);
  fill("brown");
  rect(width * 0.5625, height * 0.625, width * 0.4375, height * 0.0375);
  rect(width * 0.625, height * 0.625, width * 0.01875, height * 0.125);
  fill("orange");
  rect(width * 0.675, height * 0.5, width * 0.025, height * 0.125);
}

function mouseClicked() {
  castProgress = 0;
  makeFish();
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
  noFill();
  strokeWeight(1);
  stroke(0);
  let x1 = width * 0.675;
  let y1 = height * 0.5; // Anchor point 1
  let x2 = width * 0.5;
  let y2 = height * 0.2; // Control point 1
  let x3 = width * 0.3;
  let y3 = height * 0.75; // Control point 2
  let x4 = width * 0.3;
  let y4 = height * 0.75; // Anchor point 2
  //bezier(x1, y1, x2, y2, x3, y3, x4, y4);
  for (let t = 0; t < 1; t += 0.01) {
    bezx.push(bezierPoint(x1, x2, x3, x4, t));
    bezy.push(bezierPoint(y1, y2, y3, y4, t));
  }
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

//perlinSky() and regenerate() functions from corvuscorae reflected clouds project
function perlinSky() {
  let level = 450;
  let scale = 0.09;
  noiseSeed(skySeed);
  strokeWeight(2);
  let drift = amplitude * sin(frameCount * freq);
  for (let y = 0; y < h / 2; y += 2) {
    // shifted up to reflect at horizon
    // modify scale along y-axis, squishing it as y gets larger
    let mod = map(y, 0, h / 2, 10, 1);
    let squish = scale / mod;
    let ny = squish * y + skySeed * 0.5;
    for (let x = 0; x < w; x += 2) {
      let nx = squish * (x + drift) + skySeed;

      let c = level * noise(nx, ny);

      let strokeColor = color(SeaColor);
      if (c > 200) {
        strokeColor = "skyblue";
      }
      stroke(strokeColor);
      point(x, h - y - 1);
    }
  }
}
//--------------------Draw mountain func----
function drawMountain(color, heightM) {
  fill(color);
  stroke(MountainStroke);
  beginShape();
  vertex(0, height / 2);
  const steps = 10;
  for (let i = 0; i < steps + 1; i++) {
    let x = (width * i) / steps;
    let y =
      height / 2 -
      (random() * random() * random() * height) / 2 -
      height / heightM;
    vertex(x, y);
  }
  vertex(width, height / 2);
  endShape(CLOSE);
}
//----------------------------------

//draw clouds func
function cloudAnim() {
    cloudOffsetX += 0.2; // Speed of cloud drift

    cloudGraphic.clear(); // Clear the buffer
    cloudGraphic.noStroke();
    cloudGraphic.fill(255, 255, 255, 50); // soft white

    // Layered cloud passes
    const layers = [
        { scale: 0.004, alpha: 20, offsetMult: 0.5, size: 25 },
        { scale: 0.006, alpha: 50, offsetMult: 1.5, size: 18 }
    ];

    for (let layer of layers) {
        for (let y = 0; y < height/2; y += 10) {
            for (let x = 0; x < width; x += 10) {
                let n = noise(
                (x + cloudOffsetX * layer.offsetMult) * layer.scale,
                y * layer.scale
                );
                if (n > 0.5) {
                    cloudGraphic.fill(255, 255, 255, layer.alpha);
                    cloudGraphic.ellipse(x, y, layer.size, layer.size * 0.75);
                }
            }
        }
    }
    image(cloudGraphic, 0, 0);
}

function regenerate() {
  // random seeds
  skySeed = random(0, 2556);
}
