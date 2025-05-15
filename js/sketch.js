/* exported setup, draw */
//vars from corvuscorae reflected clouds project
const w = 800;
const h = 400;

let skySeed = 0;

let amplitude = 20;
let freq = 0.05;


function setup() {
    //createCanvas(800,400)

    //setup() from corvuscorae reflected clouds project
    createCanvas(w, h);
  
    createButton("reimagine").mousePressed(() => regenerate());
    regenerate();
}

function draw() {
    clear();
    perlinSky();
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