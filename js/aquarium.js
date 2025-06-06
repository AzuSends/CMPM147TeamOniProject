/* exported Aquarium */

class Aquarium {
  constructor(w, h) {
    this.width = w;
    this.height = h;
    this.aquariumGraphic = createGraphics(this.width, this.height);
    this.aquarium();
    this.fish = [];
    this.fishPos = [];
    this.fishVel = [];
    this.fishTarget = [];
    this.fishEaten = [];
    this.maxfish = 10;

    this.bubbles = [];
    this.bubbleLayer = createGraphics(w, h);
    this.bubbleLayer.noStroke();
  }

  draw() {
    image(this.aquariumGraphic, 0, h);
    this.updateBubbles();
    this.drawBubbles();
    this.drawFish();
    this.updateFish();
  }

  addFish(fish) {
    if (fish == null || this.fish.includes(fish)) {
      return;
    }
    if (this.fish.length < this.maxfish) {
      this.fish.push(fish);
      this.fishPos.push(createVector(0, floor(random(0, h)) + h));
      this.fishVel.push(createVector(fish.speed, 0));
      this.fishTarget.push(null);
      this.fishEaten.push(false);
    } else {
      for (let i = 0; i < this.fish.length; i++) {
        if (this.fishEaten[i] == true) {
          this.fish[i] = fish;
          let side = floor(random(0, 2));
          if (side == 0) {
            this.fishPos[i] = createVector(0, floor(random(0, h)) + h);
            this.fishVel[i] = createVector(fish.speed, 0);
          } else {
            this.fishPos[i] = createVector(w, floor(random(0, h)) + h);
            this.fishVel[i] = createVector(-fish.speed, 0);
          }

          this.fishTarget[i] = null;
          this.fishEaten[i] = false;
          break;
        }
      }
    }
  }

  drawFish() {
    for (let i = 0; i < this.fish.length; i++) {
      if (this.fishEaten[i] == true) {
        continue;
      }
      if (this.fishPos[i].x < 0 || this.fishPos[i].x > w) {
        if (this.fishTarget.includes(i)) {
          this.fishEaten[i] = true;
        } else {
          if (floor(random(0, 10)) == 9) {
            this.fishEaten[i] = true;
          }
        }
      }

      if (this.fishVel[i].x > 0) {
        this.fish[i].draw(
          { x: this.fishPos[i].x, y: this.fishPos[i].y },
          0.2,
          1
        );
      } else {
        this.fish[i].draw(
          { x: this.fishPos[i].x, y: this.fishPos[i].y },
          0.2,
          0
        );
      }
    }
  }

  updateFish() {
    for (let i = 0; i < this.fish.length; i++) {
      if (this.fishTarget[i] == null && this.fish[i].diet == 1) {
        for (let j = 0; j < this.fish.length; j++) {
          if (i != j && this.fishEaten[j] != true) {
            let predator = this.fish[i];
            let prey = this.fish[j];
            let predColor =
              red(predator.mainColor) +
              green(predator.mainColor) +
              blue(predator.mainColor);
            let preyColor =
              red(prey.mainColor) +
              green(prey.mainColor) +
              blue(prey.mainColor);
            if (Math.abs(predColor - preyColor) > predator.aggresion) {
              let direction = p5.Vector.sub(this.fishPos[j], this.fishPos[i]);
              direction.normalize();
              direction.mult(predator.speed);
              this.fishVel[i] = direction;
              this.fishTarget[i] = j;
            }
          }
        }
      } else if (this.fishTarget[i] != null) {
        let target = this.fishTarget[i];
        let direction = p5.Vector.sub(this.fishPos[target], this.fishPos[i]);
        direction.normalize();
        direction.mult(this.fish[i].speed);
        this.fishVel[i] = direction;
        if (
          p5.Vector.dist(this.fishPos[target], this.fishPos[i]) < 1 ||
          this.fishEaten[target] == true
        ) {
          this.fishTarget[i] = null;
          this.fishVel[i] = createVector(this.fish[i].speed, 0);
          this.fishEaten[target] = true;
        }
      }

      this.fishPos[i].add(this.fishVel[i]);
      if (this.fishPos[i].x > w || this.fishPos[i].x < 0) {
        this.fishVel[i].x = -this.fishVel[i].x;
      }
    }
  }
  removeFish() {}

  aquarium() {
    this.aquariumGraphic.background("#191970");
    this.aquariumGraphic.image(tankBack, 0, 0);
  }

  updateBubbles() {
  if (random() < 0.05) {
    let col = floor(random(10));
    let x = map(col, 0, 9, 50, this.width - 50);
    let r = random(10, 20);
    this.bubbles.push(new Bubble(x + random(-10, 10), this.height + r, r));
  }

  this.bubbleLayer.clear();

  for (let i = this.bubbles.length - 1; i >= 0; i--) {
    this.bubbles[i].update();
    this.bubbles[i].display(this.bubbleLayer);

      if (this.bubbles[i].offScreen()) {
        this.bubbles.splice(i, 1);
      }
    }
  }

  drawBubbles() {
    image(this.bubbleLayer, 0, h);
  }

}

//bubble class
class Bubble {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.speed = random(1, 2);
    this.floatOffset = random(TWO_PI);
  }

  update() {
    this.y -= this.speed;
    this.x += sin(frameCount * 0.05 + this.floatOffset) * 0.3;
  }

  display(pg) {
    pg.fill(200, 220, 255, 150);
    pg.ellipse(this.x, this.y, this.r * 2);
  }

  offScreen() {
    return this.y + this.r < 0;
  }
}