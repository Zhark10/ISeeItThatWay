// ISOLATED RENDERER PIECE: a single shared requestAnimationFrame loop that
// ticks every registered OrganismField, so a tree full of cards animates
// without spawning one rAF loop per card.

const fields = new Set();
let running = false;

const loop = () => {
  fields.forEach(field => {
    field.tick();
    field.draw();
  });
  requestAnimationFrame(loop);
};

export const registerField = field => fields.add(field);
export const unregisterField = field => fields.delete(field);

export const ensureLoopStarted = () => {
  if (running) return;
  running = true;
  requestAnimationFrame(loop);
};
