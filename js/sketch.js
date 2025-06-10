/* exported setup, draw */
const fishContainer = document.getElementById("fish-list");

const KEY = "LOCAL";
let bezx = [];
let bezy = [];
let castProgress = 0;

const w = 1200;
const h = 600;
const h2 = 600;

let fishSeed = 0;
let rod;

// fish vars
let fishes = [];
let fishParams;
let displayFish = true;
let casting = false;
let fishx;
let fishy;
let fishScale;
let catchSpeed = 1.5;
let currentFish = null;

//player vars
let player;
let speed = 5;
let posX = w - 320;
let posY = h / 3 + 53;

let movingLeft = false;
let movingRight = false;

//playerAnim vars
//let idle;
let pAnim1;
let pAnim2;
let pAnim3;
let pAnim4;
let animating = false;

let backgroundScene;
let aquariumScene;
let glassOverlay;
let tankBack;
let tankFilter;

let bobber;

let container;

function setup() {
  randomSeed(0);
  // const c = createCanvas(w, h + h2 + 70);
  const c = createCanvas(w, h + h2 + 70);

  // Option 1: Append to canvas's parent
  let parent = c.parent(); // Get parent container of canvas

  // Create a div element from string (safe way)
  container = document.createElement("div");
  container.innerHTML = `
    <div class="right-column">
      <div id="facts-container">
        <h3 class="fish">Fish:</h3>
        <div id="fish-list"></div>
      </div>
    </div>
  `;
  parent.appendChild(container);

  pixelDensity(1);
  colorMode(HSB);
  backgroundScene = new BackgroundScene(w, h);
  aquariumScene = new Aquarium(w, h2);

  //   createSceneObjectsTemp();
  fishParams = {
    maxWidth: w / 1.5,
    minWidth: w / 4,
    maxHeight: w / 1.5,
    minHeight: w / 6,
  };
  // https://editor.p5js.org/chanc245_chrissy/sketches/38M4tNTKd
  // https://www.dafont.com/edit-undo.font
  // https://www.dafont.com/karmatic-arcade.font
  editu = loadFont("assets/font/editundo.ttf");
  karmatic = loadFont("assets/font/ka1.ttf");
  lightpix = loadFont("assets/font/light_pixel-7.ttf");
  BPdots = loadFont("assets/font/BPdotsSquareBold.otf");

  rod = new RodCast(posX, posY, 100);
  displayfishes();

  //createButton("clear saveData").mousePressed(() => localStorage.clear());//debugging
  loadGameState();
  setFishPositions();
  console.log(fishes);
}

function draw() {
  fishSeed += 1;

  aquariumScene.addFish(fishes[floor(random(0, fishes.length))]);
  backgroundScene.draw();
  aquariumScene.draw();

  if (casting == true) {
    //doCastAnimation();
    rod.update();
  }

  if (!casting) {
    let newestFish = fishes[fishes.length - 1];
    newestFish.hovered = true;
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
    //fishx = 140;
    //fishy = 450;
    fishx = bobber.x;
    fishy = bobber.y;
    fishScale = 0.1;
  }

  //move player
  if (movingLeft) {
    posX -= speed;
    rod.updatePos(posX);
  }

  // Move right
  if (movingRight) {
    posX += speed;
    rod.updatePos(posX);
  }

  //drawAcquariumFish();
  image(glassOverlay, 0, h + 20);
  mouseHover();
  if (currentFish) {
    fishStatsDisplay();
  }
}

function makeFish() {
  let seed = random(0, 10000);
  // console.log(seed);
  let fish = new Fish(seed);
  fishes.push(fish);
  //console.log(fish);
}

function setFishPositions() {
  for (let fish of fishes) {
    let midpoint = { x: random(0, w), y: random(h, h + h2) };
    fish.position = midpoint;
  }
}

function mouseHover() {
  let f;
  for (let fish of fishes) {
    if (fish.hover()) {
      f = fish;
    }
  }
  currentFish = f;
}

function drawAcquariumFish() {
  for (let fish of fishes) {
    if (fish.position.y > h) {
      let speed = random(0, 3);
      if (fish.position.x < 0) {
        fish.direction = { x: 1, y: 0 };
        fish.speed = speed;
      } else if (fish.position.x > width) {
        fish.direction = { x: -1, y: 0 };
        fish.speed = speed;
      }
      let flipped = fish.direction.x === 1;
      fish.move();
      fish.draw(fish.position, 0.3, flipped);
    }
  }
}

function drawNewestFish(xpos = -500, ypos = -500, scale) {
  if (fishes.length == 0) {
    return;
  }
  let newestIndex = fishes.length - 1;
  let fish = fishes[newestIndex];
  fish.draw({ x: xpos, y: ypos }, scale);
}

function preload() {
  dockEnd = loadImage("./assets/dockEnd_x5.png");
  dockMid = loadImage("./assets/dockMid_x5.png");
  dockMidLeg = loadImage("./assets/dockMidLeg_x5.png");
  dockLeg = loadImage("./assets/dockLeg_x5.png");
  glassOverlay = loadImage("./assets/largerOverlay.png");

  //player img
  //idle = loadImage("./assets/fish_x5.png");
  //player = idle;
  //load player anim
  pAnim1 = loadImage("./assets/fish anim1.png");
  pAnim2 = loadImage("./assets/fish anim2.png");
  pAnim3 = loadImage("./assets/fish anim3.png");
  pAnim4 = loadImage("./assets/fish anim4.png");
  player = pAnim1;

  tankBack = loadImage("./assets/background.png");
  tankFilter = loadImage("./assets/filter.png");
}

function mouseClicked() {
  if (rod.checkIfCast() == false) {
    makeFish();
    rod.reset();
    castProgress = 0;
    casting = false;
  } else if (casting == false && animating == false) {
    rodAnim(200);
  }
  saveGameState();
}

// animate later with scale for entire box and stars
function fishStatsDisplay() {
  let rectWidth = w - 20;
  let rectHeight = h + 400 + 50;
  const textpadding = {
    minw: 40,
    maxw: rectWidth - 40,
    minh: rectHeight + 30,
    maxh: rectHeight - 20,
  };
  push();
  stroke("#6495ed");
  fill("white");
  rect(10, rectHeight, rectWidth, 190, 20);
  pop();
  fill("black");
  textAlign(LEFT, TOP);
  noStroke();
  textSize(36);
  textFont(editu);
  text(
    currentFish.name,
    textpadding.minw,
    textpadding.minh,
    textpadding.maxw,
    textpadding.maxh
  );
  textSize(26);
  textFont(BPdots);
  text(
    currentFish.description,
    textpadding.minw,
    textpadding.minh + 50,
    textpadding.maxw,
    textpadding.maxh
  );

  let numStars = currentFish.rarity;
  for (let i = 0; i < numStars; i++) {
    push();
    translate(textpadding.maxw - i * 100, textpadding.minh);
    stroke("orange");
    strokeWeight(10);
    fill("yellow");
    rotate(frameCount / -100.0 + i * 5);
    scale(1 - i * 0.06);
    star(0, 0, 30, 70, 5);
    pop();
  }
}

// https://archive.p5js.org/examples/form-star.html
function star(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
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

function rodAnim(waitTime) {
  animating = true;
  setTimeout(() => {
    console.log("frame1");
    player = pAnim1;
  }, waitTime);
  setTimeout(() => {
    console.log("frame2");
    player = pAnim2;
  }, waitTime + 200);
  setTimeout(() => {
    console.log("frame3");
    player = pAnim3;
  }, waitTime + 400);
  setTimeout(() => {
    console.log("frame4");
    player = pAnim4;
  }, waitTime + 800);
  setTimeout(() => {
    console.log("idle");
    player = pAnim1;
    animating = false;
    casting = true;
    rod.startCast();
  }, waitTime + 1000);
}

function displayfishes() {
  //just to show off the fish stuff, remove this and the div in index when aquarium implemented?
  let fishlist = container.querySelector("#fish-list");
  fishlist.innerHTML = "";
  fishes.forEach((fish) => {
    const messageDiv = document.createElement("div");
    messageDiv.className = "fish-display";
    const textDiv = document.createElement("div");
    textDiv.className = "fish-text";
    const nameDiv = document.createElement("div");
    const rarity = "⭐".repeat(fish.rarity);
    nameDiv.innerHTML = `${fish.name} <br/> ${rarity}`;
    textDiv.appendChild(nameDiv);
    const descDiv = document.createElement("div");
    descDiv.className = "fish-desc";
    descDiv.innerHTML = `${fish.description}`;
    textDiv.appendChild(descDiv);
    messageDiv.appendChild(textDiv);
    if (fish.pixelbuffer) {
      const img = document.createElement("img");
      img.src = fish.pixelbuffer.canvas.toDataURL(); // Get base64 data URL from buffer
      img.className = "fish-img";
      messageDiv.appendChild(img);
    }

    fishlist.appendChild(messageDiv);
  });
}

function saveGameState() {
  const fishArray = fishes.map((fish) => ({
    name: fish.name,
    description: fish.description,
    seed: fish.seed,
  }));
  console.log(fishArray);
  displayfishes();

  localStorage.setItem(KEY, JSON.stringify(fishArray));
}
function loadGameState() {
  const savedData = localStorage.getItem(KEY);
  if (savedData) {
    const fishArray = JSON.parse(savedData);
    console.log(`Loaded ${fishArray.length} fish`);
    try {
      fishArray.forEach((fishData) => {
        fishes.push(
          new Fish(fishData.seed, fishData.name, fishData.description)
        );
      });
    } catch (error) {
      fishmagendom();
    }
    console.log(fishes);
    displayfishes();
  }
}

function fishmagendom() {
  localStorage.clear();
}
