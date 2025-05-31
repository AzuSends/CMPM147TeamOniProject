/* exported setup, draw */
const fishContainer = document.getElementById("fish-list");

const KEY = "LOCAL";
let bezx = [];
let bezy = [];
let castProgress = 0;

//vars from corvuscorae reflected clouds project
const w = 1200;
const h = 600;

let fishSeed = 0;

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

//bezier vars
let castx = w * 0.675;
let casty = h * 0.4; // Anchor point 1
let x2 = w * 0.55;
let y2 = h * 0.2; // Control point 1
let x3 = w * 0.4;
let y3 = h * 0.25; // Control point 2
let x4 = w * 0.15;
let y4 = h * 0.75; // Anchor point 2

function setup() {
  createCanvas(w, h);

  colorMode(HSB);
  backgroundScene = new BackgroundScene(w, h);
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
