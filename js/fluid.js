import * as TweakpaneModule from 'https://unpkg.com/tweakpane@4.0.1/dist/tweakpane.js';
import GPU from 'https://esm.sh/gpu.js';

// ===== CONFIGURAÇÃO BÁSICA =====
const GRID = 96; // resolução interna da simulação (não é o tamanho da tela)
const canvas = document.getElementById('fluidCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = true;

const offCanvas = document.createElement('canvas');
offCanvas.width = GRID;
offCanvas.height = GRID;
const offCtx = offCanvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ===== PARÂMETROS AJUSTÁVEIS (pelo Tweakpane) =====
const params = {
  velocityDissipation: 0.992,
  dyeDissipation: 0.985,
  splatRadius: 6,
  force: 1400,
  colorMode: 'rainbow',
  fixedColor: '#c77dff',
  speed: 1,
};

// ===== CRIA OS GRIDS (campos de velocidade e de "tinta") =====
function makeGrid(n) {
  const g = [];
  for (let y = 0; y < n; y++) g.push(new Array(n).fill(0));
  return g;
}

let velX = makeGrid(GRID);
let velY = makeGrid(GRID);
let dyeR = makeGrid(GRID);
let dyeG = makeGrid(GRID);
let dyeB = makeGrid(GRID);

// ===== GPU.js: os cálculos pesados (por célula, em paralelo) =====
const gpu = new GPU();

// Espalha uma quantidade (velocidade ou cor) num raio ao redor de
// um ponto — usado toda vez que você clica/arrasta na tela.
const splatKernel = gpu.createKernel(function (field, px, py, radius, amount) {
  const dx = this.thread.x - px;
  const dy = this.thread.y - py;
  const dist2 = dx * dx + dy * dy;
  const falloff = Math.exp(-dist2 / (radius * radius));
  return field[this.thread.y][this.thread.x] + amount * falloff;
}).setOutput([GRID, GRID]);

// Advecção semi-Lagrangiana: pra cada célula, "olha pra trás" ao
// longo do campo de velocidade e pega o valor de lá (com
// interpolação bilinear) — é isso que cria o movimento de fluido.
const advectKernel = gpu.createKernel(function (field, velocityX, velocityY, dt, dissipation, gridSize) {
  const x = this.thread.x;
  const y = this.thread.y;

  let srcX = x - velocityX[y][x] * dt;
  let srcY = y - velocityY[y][x] * dt;

  if (srcX < 0.5) srcX = 0.5;
  if (srcX > gridSize - 1.5) srcX = gridSize - 1.5;
  if (srcY < 0.5) srcY = 0.5;
  if (srcY > gridSize - 1.5) srcY = gridSize - 1.5;

  const x0 = Math.floor(srcX);
  const y0 = Math.floor(srcY);
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const sx = srcX - x0;
  const sy = srcY - y0;

  const v00 = field[y0][x0];
  const v10 = field[y0][x1];
  const v01 = field[y1][x0];
  const v11 = field[y1][x1];

  const top = v00 * (1 - sx) + v10 * sx;
  const bottom = v01 * (1 - sx) + v11 * sx;

  return (top * (1 - sy) + bottom * sy) * dissipation;
}).setOutput([GRID, GRID]);

// ===== INTERAÇÃO COM O MOUSE/TOQUE =====
let pointerActive = false;
let lastGX = 0;
let lastGY = 0;
let hue = 0;

function toGrid(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * GRID,
    y: ((clientY - rect.top) / rect.height) * GRID,
  };
}

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp >= 0 && hp < 1) { r = c; g = x; }
  else if (hp < 2) { r = x; g = c; }
  else if (hp < 3) { g = c; b = x; }
  else if (hp < 4) { g = x; b = c; }
  else if (hp < 5) { r = x; b = c; }
  else { r = c; b = x; }
  const m = l - c / 2;
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function currentSplatColor() {
  if (params.colorMode === 'fixed') return hexToRgb(params.fixedColor);
  hue = (hue + 2.2) % 360;
  return hslToRgb(hue, 0.85, 0.6);
}

function pointerMove(clientX, clientY) {
  const { x, y } = toGrid(clientX, clientY);
  if (!pointerActive) { lastGX = x; lastGY = y; return; }

  const dx = (x - lastGX) * params.force;
  const dy = (y - lastGY) * params.force;
  const color = currentSplatColor();

  velX = splatKernel(velX, x, y, params.splatRadius, dx);
  velY = splatKernel(velY, x, y, params.splatRadius, dy);
  dyeR = splatKernel(dyeR, x, y, params.splatRadius, color.r);
  dyeG = splatKernel(dyeG, x, y, params.splatRadius, color.g);
  dyeB = splatKernel(dyeB, x, y, params.splatRadius, color.b);

  lastGX = x;
  lastGY = y;
}

canvas.addEventListener('pointerdown', (e) => {
  pointerActive = true;
  const { x, y } = toGrid(e.clientX, e.clientY);
  lastGX = x;
  lastGY = y;
  document.getElementById('fluidHint').classList.remove('visible');
});
canvas.addEventListener('pointermove', (e) => pointerMove(e.clientX, e.clientY));
window.addEventListener('pointerup', () => { pointerActive = false; });

// ===== LOOP PRINCIPAL =====
let lastTime = performance.now();

function step(dt) {
  const newVelX = advectKernel(velX, velX, velY, dt, params.velocityDissipation, GRID);
  const newVelY = advectKernel(velY, velX, velY, dt, params.velocityDissipation, GRID);
  velX = newVelX;
  velY = newVelY;

  dyeR = advectKernel(dyeR, velX, velY, dt, params.dyeDissipation, GRID);
  dyeG = advectKernel(dyeG, velX, velY, dt, params.dyeDissipation, GRID);
  dyeB = advectKernel(dyeB, velX, velY, dt, params.dyeDissipation, GRID);
}

function clampColor(v) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function render() {
  const imgData = offCtx.createImageData(GRID, GRID);
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const i = (y * GRID + x) * 4;
      imgData.data[i] = clampColor(dyeR[y][x]);
      imgData.data[i + 1] = clampColor(dyeG[y][x]);
      imgData.data[i + 2] = clampColor(dyeB[y][x]);
      imgData.data[i + 3] = 255;
    }
  }
  offCtx.putImageData(imgData, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(offCanvas, 0, 0, GRID, GRID, 0, 0, canvas.width, canvas.height);
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 1 / 30) * 60 * params.speed * 0.05;
  lastTime = now;
  step(dt);
  render();
  requestAnimationFrame(loop);
}

// ===== PAINEL TWEAKPANE =====
function setupPanel() {
  const pane = new TweakpaneModule.Pane({ container: document.getElementById('fluidPanel'), title: 'Controles do fluido' });

  pane.addBinding(params, 'colorMode', {
    label: 'Cor',
    options: { 'Arco-íris': 'rainbow', 'Fixa': 'fixed' },
  });
  pane.addBinding(params, 'fixedColor', { label: 'Cor fixa' });
  pane.addBinding(params, 'splatRadius', { label: 'Raio do traço', min: 1, max: 15, step: 0.5 });
  pane.addBinding(params, 'force', { label: 'Força', min: 200, max: 4000, step: 50 });
  pane.addBinding(params, 'speed', { label: 'Velocidade', min: 0.2, max: 3, step: 0.1 });
  pane.addBinding(params, 'velocityDissipation', { label: 'Persistência do movimento', min: 0.9, max: 1, step: 0.001 });
  pane.addBinding(params, 'dyeDissipation', { label: 'Persistência da cor', min: 0.9, max: 1, step: 0.001 });

  pane.addButton({ title: 'Limpar tela' }).on('click', () => {
    velX = makeGrid(GRID);
    velY = makeGrid(GRID);
    dyeR = makeGrid(GRID);
    dyeG = makeGrid(GRID);
    dyeB = makeGrid(GRID);
  });
}

// ===== INÍCIO =====
setupPanel();
document.getElementById('fluidLoading').classList.add('hidden');
document.getElementById('fluidHint').classList.add('visible');
requestAnimationFrame(loop);
