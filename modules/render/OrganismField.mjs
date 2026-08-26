// ISOLATED RENDERER PIECE: turns one Population entity into a small flock of
// organisms on a canvas. Organisms interact with each other (cohesion +
// separation, boids-lite) so the population's traits become something you
// can watch move instead of a number:
//   - population.size          -> how many organisms are drawn (log scale)
//   - population.cohesion      -> how tightly they cluster / how visible
//                                  the connecting lines between them are
//   - population.technologyLevel -> organism size, speed, hue (green->cyan)
//   - population.resourceStability -> how calm vs. jittery the movement is
//   - population.growthRate    -> organisms are slowly born/die over time
//   - populationIsBroken       -> the flock scatters, turns red/gray and
//                                  fades away instead of clustering

const WIDTH = 220;
const HEIGHT = 120;
const MAX_ORGANISMS = 32;
const MIN_ORGANISMS = 3;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const countFromSize = size => {
  const logSize = Math.log10(Math.max(size, 1));
  return Math.round(clamp((logSize - 2) * 5, 5, 26));
};

class Organism {
  constructor(radius) {
    this.x = Math.random() * WIDTH;
    this.y = Math.random() * HEIGHT;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.radius = radius;
    this.alpha = 1;
  }
}

export class OrganismField {
  constructor(population, isBroken) {
    this.population = population;
    this.isBroken = isBroken;
    this.frame = 0;

    this.baseRadius = 2.2 + population.technologyLevel * 2.4;
    this.cohesionForce = isBroken ? 0.0003 : 0.0025 + population.cohesion * 0.012;
    this.separationForce = 0.02;
    this.chaos = isBroken ? 0.4 : 0.04 + (1 - population.resourceStability) * 0.14;
    this.maxSpeed = isBroken ? 0.9 : 0.3 + population.technologyLevel * 0.35;
    this.hue = isBroken ? 0 : 150 + population.technologyLevel * 60;
    this.growthRate = population.growthRate;

    const n = countFromSize(population.size);
    this.organisms = Array.from({ length: n }, () => new Organism(this.baseRadius));

    this.canvas = document.createElement("canvas");
    this.canvas.width = WIDTH;
    this.canvas.height = HEIGHT;
    this.canvas.className = "organism-field";
    this.ctx = this.canvas.getContext("2d");
  }

  applyGrowth() {
    if (this.isBroken) return;
    const chance = Math.abs(this.growthRate) * 6;
    if (Math.random() >= chance) return;
    if (this.growthRate > 0 && this.organisms.length < MAX_ORGANISMS) {
      this.organisms.push(new Organism(this.baseRadius));
    } else if (this.growthRate < 0 && this.organisms.length > MIN_ORGANISMS) {
      this.organisms.pop();
    }
  }

  tick() {
    this.frame++;
    if (this.frame % 90 === 0) this.applyGrowth();

    const { organisms } = this;
    let cx = 0;
    let cy = 0;
    organisms.forEach(o => { cx += o.x; cy += o.y; });
    cx /= organisms.length || 1;
    cy /= organisms.length || 1;

    organisms.forEach((o, i) => {
      o.vx += (cx - o.x) * this.cohesionForce;
      o.vy += (cy - o.y) * this.cohesionForce;

      for (let j = 0; j < organisms.length; j++) {
        if (i === j) continue;
        const other = organisms[j];
        const dx = o.x - other.x;
        const dy = o.y - other.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 400 && dist2 > 0) {
          o.vx += (dx / dist2) * this.separationForce;
          o.vy += (dy / dist2) * this.separationForce;
        }
      }

      o.vx += (Math.random() - 0.5) * this.chaos;
      o.vy += (Math.random() - 0.5) * this.chaos;

      const speed = Math.hypot(o.vx, o.vy);
      if (speed > this.maxSpeed) {
        o.vx = (o.vx / speed) * this.maxSpeed;
        o.vy = (o.vy / speed) * this.maxSpeed;
      }

      o.x += o.vx;
      o.y += o.vy;

      if (o.x < o.radius || o.x > WIDTH - o.radius) o.vx *= -1;
      if (o.y < o.radius || o.y > HEIGHT - o.radius) o.vy *= -1;
      o.x = clamp(o.x, o.radius, WIDTH - o.radius);
      o.y = clamp(o.y, o.radius, HEIGHT - o.radius);

      if (this.isBroken) o.alpha = Math.max(0.12, o.alpha - 0.0006);
    });
  }

  draw() {
    const { ctx, organisms } = this;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.lineWidth = 1;
    for (let i = 0; i < organisms.length; i++) {
      for (let j = i + 1; j < organisms.length; j++) {
        const a = organisms[i];
        const b = organisms[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 38) {
          ctx.strokeStyle = `hsla(${this.hue}, 70%, 65%, ${(1 - dist / 38) * 0.35})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    organisms.forEach(o => {
      ctx.beginPath();
      ctx.fillStyle = `hsla(${this.hue}, 75%, 60%, ${o.alpha})`;
      ctx.shadowColor = `hsla(${this.hue}, 90%, 65%, ${o.alpha * 0.8})`;
      ctx.shadowBlur = 6;
      ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }
}
