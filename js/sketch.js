/* exported setup, draw */
//vars from corvuscorae reflected clouds project
const w = 800;
const h = 400;

let skySeed = 0;

let amplitude = 20;
let freq = 0.05;


function setup() {
    noSmooth();
    //createCanvas(800,400)

    //setup() from corvuscorae reflected clouds project
    createCanvas(w, h);
  
    createButton("reimagine").mousePressed(() => regenerate());
    regenerate();
}

function preload() {
    /*dock1 = loadImage('../assets/dockSplit 147_1.png');
    dock2 = loadImage('../assets/dockSplit 147_2.png');
    dock3 = loadImage('../assets/dockSplit 147_3.png');
    dock = loadImage('../assets/dock 147.png');*/
    dockEnd = loadImage('../assets/dockEnd_x5.png');
    dockMid = loadImage('../assets/dockMid_x5.png');
    dockMidLeg = loadImage('../assets/dockMidLeg_x5.png');
    dockLeg = loadImage('../assets/dockLeg_x5.png');
}

function draw() {
    clear();
    perlinSky();
    /*dock.resize(240, 160);
    image(dock, 0, h / 3 + 10);*/
    //place dock tiles
    image(dockMidLeg, 0, h - 160);
    image(dockMid, 80, h - 160);
    image(dockMid, 160, h - 160);
    image(dockMidLeg, 240, h - 160);
    image(dockMid, 320, h - 160);
    image(dockMid, 400, h - 160);
    image(dockEnd, 480, h - 160);

    image(dockLeg, 0, h - 80);
    image(dockLeg, 240, h - 80);
    image(dockLeg, 480, h - 80);

}

//perlinSky() and regenerate() functions from corvuscorae reflected clouds project
// TODO: make clouds fluffier/more natty
function perlinSky() {
    let level = 450;
    let scale = 0.09;
    noiseSeed(skySeed);
  
    let drift = amplitude * sin(frameCount * freq);
    for (let y = 0; y < h / 2; y++) {  // shifted up to reflect at horizon
        for (let x = 0; x < w; x++) {
            // modify scale along y-axis, squishing it as y gets larger
            let mod = map(y, 0, h / 2, 10, 1);
            let squish = scale / mod;    
            
            let nx = squish * (x + drift) + skySeed;
            let ny = squish * y + skySeed * 0.5;
            
            let c = level * noise(nx, ny);
            
            let strokeColor = color(100, 149, 237);
            if(c > 200){ strokeColor = "skyblue"; }
            stroke(strokeColor);
            point(x, h - y - 1);
        }
    }
}
  
function regenerate() {
    // random seeds
    skySeed = random(0, 2556);
}