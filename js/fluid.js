import * as TweakpaneModule from 'https://unpkg.com/tweakpane@4.0.1/dist/tweakpane.js';
import fluid from 'https://esm.sh/webgl-fluid';

// Busca o canvas que acabamos de adicionar no HTML
const canvas = document.getElementById('fluidCanvas');

// Inicia o motor de fluido passando o canvas correto
const fluidSimulation = fluid(canvas, {
  IMMEDIATE: true,
  TRIGGER: 'click',
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 512,
  DENSITY_DISSIPATION: 0.98,
  VELOCITY_DISSIPATION: 0.99,
  PRESSURE: 0.8,
  PRESSURE_ITERATIONS: 20,
  CURL: 30,
  SPLAT_RADIUS: 0.35,
  COLOR_UPDATE_SPEED: 10,
  BACK_COLOR: { r: 12, g: 4, b: 16 },
  TRANSPARENT: false,
  BLOOM: true,
  BLOOM_ITERATIONS: 8,
  BLOOM_RESOLUTION: 256,
  BLOOM_INTENSITY: 0.8,
  BLOOM_THRESHOLD: 0.6,
  BLOOM_SOFT_KNEE: 0.7
});

// ===== PAINEL TWEAKPANE =====
// Objeto que guarda os valores atuais do painel
const params = {
  radius: 0.35,
  curl: 30,
  bloom: true,
  dissipation: 0.98,
  velocity: 0.99
};

const pane = new TweakpaneModule.Pane({ 
  container: document.getElementById('fluidPanel'), 
  title: 'Controles do fluido' 
});

pane.addBinding(params, 'radius', { label: 'Tamanho', min: 0.1, max: 1.0, step: 0.01 }).on('change', (ev) => {
  fluidSimulation.splatRadius = ev.value;
});

pane.addBinding(params, 'curl', { label: 'Redemoinhos', min: 0, max: 50, step: 1 }).on('change', (ev) => {
  fluidSimulation.curl = ev.value;
});

pane.addBinding(params, 'dissipation', { label: 'Fade da Cor', min: 0.9, max: 1.0, step: 0.001 }).on('change', (ev) => {
  fluidSimulation.densityDissipation = ev.value;
});

pane.addBinding(params, 'velocity', { label: 'Fade do Movimento', min: 0.9, max: 1.0, step: 0.001 }).on('change', (ev) => {
  fluidSimulation.velocityDissipation = ev.value;
});

pane.addBinding(params, 'bloom', { label: 'Brilho Neon' }).on('change', (ev) => {
  fluidSimulation.bloom = ev.value;
});
