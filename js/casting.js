/* exported RodCast */


class RodCast {
  constructor(posx, posy, numPoints) {
    this.posx = posx || 550
    this.posy = posy || 100
    this.arr = []
    this.jitter = 0;
    this.doGrav = false;
    this.diff = 0
    this.numPoints = numPoints || 51
    this.canReset = false;

    this.pos;
    this.vel = createVector(-12, -30);
    this.grav = createVector(0, 1);
    this.boy = createVector(0, -4);
    this.res = createVector(.16, 0);


  }
  startCast() {
    this.pos = createVector(this.posx, this.posy);

    for (let i = 0; i < this.numPoints + 1; i++) {
      this.arr.push(createVector(this.posx, this.posy))
    }
  }
  update() {
    this.arr[0].x = this.posx
    this.pos.add(this.vel);
    if (this.vel.x < 0) {
      this.vel.add(this.res);
    } else {
      this.vel.x = 0;
    }
    if (this.vel.y < 0) {
      this.vel.add(this.grav);
    }
    this.vel.add(this.grav);
    if (this.pos.y > 450) {
      this.vel.add(this.boy);
    }
    this.arr[this.numPoints].set(this.pos.x, this.pos.y);
    let xDifTotal = (this.arr[this.numPoints].x - this.arr[0].x);
    let yDifTotal = (this.arr[this.numPoints].y - this.arr[0].y);

    for (let i = 1; i < this.numPoints; i++) {
      let fraction = i / this.numPoints;
      let currentPointBaseX = this.arr[0].x + fraction * xDifTotal;
      let currentPointBaseY = this.arr[0].y + fraction * yDifTotal;

      let u = i / this.numPoints;
      let arcMagnitude = -this.diff * 6 * u * (1 - u);

      this.arr[i].set(currentPointBaseX, currentPointBaseY - arcMagnitude);
    }


    this.diff += (this.vel.y * .1);

    this.smoothJitter();

    strokeWeight(5);
    stroke("black")
    point(this.pos);

    for (let i = 0; i < this.numPoints; i++) {
      line(this.arr[i].x, this.arr[i].y, this.arr[i + 1].x, this.arr[i + 1].y)
    }
    strokeWeight(10)
    stroke("red")
    point(this.arr[this.numPoints].x, this.arr[this.numPoints].y)
  }
  reset() {
    if (!this.canReset) {
      return;
    }
    this.canReset = false;
    this.arr = []
    this.jitter = 0;
    this.doGrav = false;
    this.diff = 0

    this.pos = createVector(this.posx, this.posy);
    this.vel = createVector(-12, -30);
    this.grav = createVector(0, 1);
    this.boy = createVector(0, -4);
    this.res = createVector(.16, 0);
    for (let i = 0; i < this.numPoints + 1; i++) {
      this.arr.push(createVector(this.posx, this.posy))
    }
  }

  checkIfCast() {
    return !this.canReset;
  }
  updatePos(posX) {
    this.posx = posX
  }

  smoothJitter() {
    this.jitter += 1;
    if (this.pos.y < 460 && this.pos.y > 440 && this.jitter >= 20) {
      this.grav.y = 0;
      this.boy.y = 0;
      this.vel.y = 0;
      this.doGrav = true;
      this.canReset = true;
    } else if (this.pos.y > 460 || this.pos.y < 440) {
      this.jitter = 0;
    }
  }

}
