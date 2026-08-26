// ISOLATED RENDERER PIECE: turns one Population entity into a small flock of
// organisms on a canvas. Organisms interact with each other, and *how* they
// interact depends on population.species — every simulation gets its own
// kind of organism and its own behavior, not just a recolored copy of one
// generic flocking rule:
//   - "clusterers" flock tightly together (classic boids: cohesion + separation)
//   - "orbiters"   circle around a shared center, each at its own radius/speed
//   - "wanderers"  roam independently toward their own drifting target
//   - "pulsers"    stay loosely together while breathing (pulsing radius)
//
// On top of the species, the population's numeric traits still shape the
// details:
//   - population.size              -> how many organisms are drawn (log scale)
//   - population.technologyLevel   -> organism size, speed, hue (green->cyan)
//   - population.cohesion          -> clustering strength / connecting lines
//   - population.resourceStability -> how calm vs. jittery the movement is
//   - population.growthRate        -> organisms are slowly born/die over time
//   - populationIsBroken           -> the flock scatters, turns red/gray and
//                                      fades away regardless of species

const DEFAULT_WIDTH = 220;
const DEFAULT_HEIGHT = 120;
const MAX_ORGANISMS = 40;
const MIN_ORGANISMS = 3;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const countFromSize = size => {
  const logSize = Math.log10(Math.max(size, 1));
  return Math.round(clamp((logSize - 2) * 5, 5, 26));
};

class Organism {
  constructor(width, height, radius) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.radius = radius;
    this.alpha = 1;
    this.orbitAngle = Math.random() * Math.PI * 2;
    this.orbitRadius = 15 + Math.random() * (Math.min(width, height) / 2 - 20);
    this.orbitSpeed = (Math.random() < 0.5 ? -1 : 1) * (0.005 + Math.random() * 0.01);
    this.wanderTargetX = this.x;
    this.wanderTargetY = this.y;
    this.wanderTimer = 0;
    this.pulsePhase = Math.random() * Math.PI * 2;
  }
}

export class OrganismField {
  constructor(population, isBroken, { width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT } = {}) {
    this.population = population;
    this.isBroken = isBroken;
    this.species = population.species || "clusterers";
    this.width = width;
    this.height = height;
    this.frame = 0;

    this.baseRadius = 2.4 + population.technologyLevel * 2.6;
    this.cohesionForce = isBroken ? 0.0003 : 0.0025 + population.cohesion * 0.012;
    this.separationForce = 0.02;
    this.chaos = isBroken ? 0.4 : 0.04 + (1 - population.resourceStability) * 0.14;
    this.maxSpeed = isBroken ? 0.9 : 0.3 + population.technologyLevel * 0.35;
    this.hue = isBroken ? 0 : 150 + population.technologyLevel * 60;
    this.growthRate = population.growthRate;

    if (!isBroken) {
      if (this.species === "orbiters") {
        this.cohesionForce *= 0.15;
      } else if (this.species === "wanderers") {
        this.cohesionForce *= 0.1;
        this.chaos *= 0.5;
      }
    }

    const n = countFromSize(population.size);
    this.organisms = Array.from({ length: n }, () => new Organism(width, height, this.baseRadius));

    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.className = "organism-field";
    this.ctx = this.canvas.getContext("2d");
  }

  applyGrowth() {
    if (this.isBroken) return;
    const chance = Math.abs(this.growthRate) * 6;
    if (Math.random() >= chance) return;
    if (this.growthRate > 0 && this.organisms.length < MAX_ORGANISMS) {
      this.organisms.push(new Organism(this.width, this.height, this.baseRadius));
    } else if (this.growthRate < 0 && this.organisms.length > MIN_ORGANISMS) {
      this.organisms.pop();
    }
  }

  tick() {
    this.frame++;
    if (this.frame % 90 === 0) this.applyGrowth();

    if (!this.isBroken && this.species === "orbiters") return this.tickOrbiters();
    if (!this.isBroken && this.species === "wanderers") return this.tickWanderers();
    return this.tickFlock();
  }

  tickFlock() {
    const { organisms, width, height } = this;
    let cx = 0;
    let cy = 0;
    organisms.forEach(o => { cx += o.x; cy += o.y; });
    cx /= organisms.length || 1;
    cy /= organisms.length || 1;

    organisms.forEach((o, i) => {
      o.vx += (cx - o.x) * this.cohesionForce;
      o.vy += (cy - o.y) * this.cohesionForce;
      this.applySeparation(o, i);
      this.applyJitter(o);
      this.applySpeedLimit(o);
      this.moveAndBounce(o, width, height);
      this.applyDecay(o);
    });
  }

  tickOrbiters() {
    const { organisms, width, height } = this;
    const cx = width / 2;
    const cy = height / 2;

    organisms.forEach((o, i) => {
      o.orbitAngle += o.orbitSpeed * (0.6 + this.maxSpeed);
      const targetX = cx + Math.cos(o.orbitAngle) * o.orbitRadius;
      const targetY = cy + Math.sin(o.orbitAngle) * o.orbitRadius;
      o.vx += (targetX - o.x) * 0.02;
      o.vy += (targetY - o.y) * 0.02;
      this.applySeparation(o, i);
      this.applyJitter(o);
      this.applySpeedLimit(o);
      o.x += o.vx;
      o.y += o.vy;
      this.applyDecay(o);
    });
  }

  tickWanderers() {
    const { organisms, width, height } = this;

    organisms.forEach((o, i) => {
      o.wanderTimer--;
      if (o.wanderTimer <= 0) {
        o.wanderTargetX = Math.random() * width;
        o.wanderTargetY = Math.random() * height;
        o.wanderTimer = 90 + Math.random() * 120;
      }
      o.vx += (o.wanderTargetX - o.x) * 0.0015;
      o.vy += (o.wanderTargetY - o.y) * 0.0015;
      this.applySeparation(o, i);
      this.applyJitter(o);
      this.applySpeedLimit(o);
      this.moveAndBounce(o, width, height);
      this.applyDecay(o);
    });
  }

  applySeparation(o, i) {
    const { organisms } = this;
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
  }

  applyJitter(o) {
    o.vx += (Math.random() - 0.5) * this.chaos;
    o.vy += (Math.random() - 0.5) * this.chaos;
  }

  applySpeedLimit(o) {
    const speed = Math.hypot(o.vx, o.vy);
    if (speed > this.maxSpeed) {
      o.vx = (o.vx / speed) * this.maxSpeed;
      o.vy = (o.vy / speed) * this.maxSpeed;
    }
  }

  moveAndBounce(o, width, height) {
    o.x += o.vx;
    o.y += o.vy;
    if (o.x < o.radius || o.x > width - o.radius) o.vx *= -1;
    if (o.y < o.radius || o.y > height - o.radius) o.vy *= -1;
    o.x = clamp(o.x, o.radius, width - o.radius);
    o.y = clamp(o.y, o.radius, height - o.radius);
  }

  applyDecay(o) {
    if (this.isBroken) o.alpha = Math.max(0.12, o.alpha - 0.0006);
  }

  currentRadius(o) {
    if (!this.isBroken && this.species === "pulsers") {
      const pulse = Math.sin(this.frame * 0.05 + o.pulsePhase) * 0.4 + 1;
      return o.radius * pulse;
    }
    return o.radius;
  }

  draw() {
    const { ctx, organisms, width, height } = this;
    ctx.clearRect(0, 0, width, height);

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
      const r = this.currentRadius(o);
      ctx.fillStyle = `hsla(${this.hue}, 75%, 60%, ${o.alpha})`;
      ctx.shadowColor = `hsla(${this.hue}, 90%, 65%, ${o.alpha * 0.8})`;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      if (this.species === "wanderers") {
        // diamond
        ctx.moveTo(o.x, o.y - r);
        ctx.lineTo(o.x + r, o.y);
        ctx.lineTo(o.x, o.y + r);
        ctx.lineTo(o.x - r, o.y);
        ctx.closePath();
      } else if (this.species === "orbiters") {
        // triangle
        ctx.moveTo(o.x, o.y - r);
        ctx.lineTo(o.x + r * 0.87, o.y + r * 0.5);
        ctx.lineTo(o.x - r * 0.87, o.y + r * 0.5);
        ctx.closePath();
      } else {
        ctx.arc(o.x, o.y, r, 0, Math.PI * 2);
      }
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }
}
