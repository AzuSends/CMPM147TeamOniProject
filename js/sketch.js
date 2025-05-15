/* exported setup, draw */
//vars from corvuscorae reflected clouds project
const w = 800;
const h = 400;

let skySeed = 0;

let field;
let fieldScroll = w;
let speed = 1;  // not very tunable atm


function setup() {
    //createCanvas(800,400)

    //setup() from corvuscorae reflected clouds project
    createCanvas(w, h);
  
    perlinSky();
    noLoop();  // <-- since this demo doesn't need draw()
    
    createButton("reimagine").mousePressed(() => regenerate());
}

function draw() {
    
}

//perlinSky() and regenerate() functions from corvuscorae reflected clouds project
// TODO: make clouds fluffier/more natty
function perlinSky() {
    let level = 450;
    let scale = 0.09;
    noiseSeed(skySeed);
  
    for (let y = h; y < h * 1.5; y++) {  // shifted up to reflect at horizon
        for (let x = 0; x < w; x++) {
            // modify scale along y-axis, squishing it as y gets larger
            let mod = map(y, 0, h, 10, 1);
            let squish = scale / mod;    
            
            let nx = squish * x;
            let ny = squish * y;
            
            let c = level * noise(nx, ny);
            
            let strokeColor = color(100, 149, 237);
            if(c > 200){ strokeColor = "skyblue"; }
            stroke(strokeColor);
            point(x, y - h/2);
        }
    }
}
  
function regenerate() {
    clear();

    // random seeds
    skySeed = random(0, 2556);

    // generate
    perlinSky();
}