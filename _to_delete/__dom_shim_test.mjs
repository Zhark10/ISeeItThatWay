// Minimal DOM shim to verify modules/5 runs without errors like a browser would,
// without needing an actual browser.
globalThis.document = {
  body: { appendChild(el) { this._children = this._children || []; this._children.push(el); } },
  createElement(tag) {
    return { tag, textContent: '' };
  }
};

await import('./modules/5_StartAnIrreversibleProcess.mjs');

// give the async IIFE a tick to finish
await new Promise(r => setTimeout(r, 50));
console.log('--- shim body children ---');
console.log(document.body._children);
