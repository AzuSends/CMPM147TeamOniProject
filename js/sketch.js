/* exported setup, draw */

let bezx = []
let bezy = []
let castProgress = 0;

function setup() {
    createCanvas(1200, 600)
    background(173, 216, 230)
    createSceneObjectsTemp()

    genBezierPoints()
    if (bezx.length != bezy.length) {
        console.log("Issues defining fishing arc, expect undefined behavior")
    }

}

function draw() {
    background(173, 216, 230)
    createSceneObjectsTemp()
    if (castProgress <= bezx.length) {
        doCastAnimation()
    }


}

function createSceneObjectsTemp() { //Just some basic visuals for the time being
    fill("blue")
    noStroke()
    rect(0, height * 0.75, width, height * 0.25)
    fill("brown")
    rect(width * 0.5625, height * 0.625, width * 0.4375, height * 0.0375)
    rect(width * 0.625, height * 0.625, width * 0.01875, height * 0.125)
    fill("orange")
    rect(width * 0.675, height * 0.5, width * 0.025, height * 0.125)
}

function mouseClicked() {
    castProgress = 0;
}
function genBezierPoints() {
    noFill()
    strokeWeight(1);
    stroke(0);
    let x1 = width * 0.675;
    let y1 = height * 0.5;// Anchor point 1
    let x2 = width * 0.5;
    let y2 = height * 0.2;// Control point 1
    let x3 = width * 0.3;
    let y3 = height * 0.75;// Control point 2
    let x4 = width * 0.3;
    let y4 = height * 0.75;// Anchor point 2
    //bezier(x1, y1, x2, y2, x3, y3, x4, y4);
    for (let t = 0; t < 1; t += .01) {
        bezx.push(bezierPoint(x1, x2, x3, x4, t))
        bezy.push(bezierPoint(y1, y2, y3, y4, t))
    }
}
function doCastAnimation() {
    stroke(0)
    noFill();
    if (castProgress < bezx.length) {
        castProgress += 1
    }
    beginShape();
    for (let i = 0; i < castProgress; i++) {
        vertex(bezx[i], bezy[i]);
    }
    endShape();
}