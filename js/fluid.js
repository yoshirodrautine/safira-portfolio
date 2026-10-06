import * as TweakpaneModule from 'https://unpkg.com/tweakpane@4.0.1/dist/tweakpane.js';
import fluid from 'https://esm.sh/webgl-fluid';

// ===== INICIALIZAÇÃO DO FLUIDO WEBGL =====
// O motor cria o canvas automaticamente e o anexa ao document.body
const fluidSimulation = fluid(document.body, {
  IMMEDIATE: true,
  TRIGGER: 'hover', // Reage tanto ao clique quanto ao passar do mouse
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 512, // Alta qualidade visual
  DENSITY_DISSIPATION: 0.98,
  VELOCITY_DISSIPATION: 0.99,
  PRESSURE: 0.8,
  PRESSURE_ITERATIONS: 20,
  CURL: 30, // Intensidade dos redemoinhos
  SPLAT_RADIUS: 0.35, // Tamanho do traço
  COLOR_UPDATE_SPEED: 10,
  BACK_COLOR: { r: 12, g: 4, b: 16 }, // Cor de fundo (combina com o #0c0410 do CSS)
  TRANSPARENT: false,
  BLOOM: true, // Efeito de brilho neon
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
