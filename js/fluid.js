import * as TweakpaneModule from 'https://unpkg.com/tweakpane@4.0.1/dist/tweakpane.js';
import webGLFluidEnhanced from 'https://esm.run/webgl-fluid-enhanced';

const canvas = document.getElementById('fluidCanvas');
const loading = document.getElementById('fluidLoading');
const hint = document.getElementById('fluidHint');

// ===== CONFIGURAÇÃO INICIAL =====
// Chaves confirmadas na documentação oficial da biblioteca — duas
// coisas que corrigi aqui: IMMEDIATE/TRIGGER não existem nessa API
// (virou INITIAL + HOVER), e BACK_COLOR espera uma cor em hexadecimal
// (texto), não um objeto {r,g,b}.
const initialConfig = {
  INITIAL: true,
  SPLAT_AMOUNT: 5,
  HOVER: false, // false = reage a clique/arrasto, não só passar o mouse
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 512,
  DENSITY_DISSIPATION: 0.98,
  VELOCITY_DISSIPATION: 0.99,
  PRESSURE: 0.8,
  PRESSURE_ITERATIONS: 20,
  CURL: 30,
  SPLAT_RADIUS: 0.35,
  COLOR_UPDATE_SPEED: 10,
  BACK_COLOR: '#0c0410',
  TRANSPARENT: false,
  BLOOM: true,
  BLOOM_ITERATIONS: 8,
  BLOOM_RESOLUTION: 256,
  BLOOM_INTENSITY: 0.8,
  BLOOM_THRESHOLD: 0.6,
  BLOOM_SOFT_KNEE: 0.7,
};

webGLFluidEnhanced.simulation(canvas, initialConfig);

// ===== PAINEL TWEAKPANE =====
// A versão "enhanced" expõe .config() pra atualizar a simulação já
// rodando — é isso que faltava antes (a versão sem "enhanced" só
// lê a configuração uma vez, na inicialização, e ignora qualquer
// mudança depois disso).
const params = {
  radius: initialConfig.SPLAT_RADIUS,
  curl: initialConfig.CURL,
  bloom: initialConfig.BLOOM,
  dissipation: initialConfig.DENSITY_DISSIPATION,
  velocity: initialConfig.VELOCITY_DISSIPATION,
};

const pane = new TweakpaneModule.Pane({
  container: document.getElementById('fluidPanel'),
  title: 'Controles do fluido',
});

pane.addBinding(params, 'radius', { label: 'Tamanho', min: 0.1, max: 1.0, step: 0.01 }).on('change', (ev) => {
  webGLFluidEnhanced.config({ SPLAT_RADIUS: ev.value });
});

pane.addBinding(params, 'curl', { label: 'Redemoinhos', min: 0, max: 50, step: 1 }).on('change', (ev) => {
  webGLFluidEnhanced.config({ CURL: ev.value });
});

pane.addBinding(params, 'dissipation', { label: 'Fade da Cor', min: 0.9, max: 1.0, step: 0.001 }).on('change', (ev) => {
  webGLFluidEnhanced.config({ DENSITY_DISSIPATION: ev.value });
});

pane.addBinding(params, 'velocity', { label: 'Fade do Movimento', min: 0.9, max: 1.0, step: 0.001 }).on('change', (ev) => {
  webGLFluidEnhanced.config({ VELOCITY_DISSIPATION: ev.value });
});

pane.addBinding(params, 'bloom', { label: 'Brilho Neon' }).on('change', (ev) => {
  webGLFluidEnhanced.config({ BLOOM: ev.value });
});

// EDITAR: não existe um método de "limpar tela" nessa biblioteca —
// trocado por um método que realmente existe: dispara uma nova
// leva de respingos na tela.
pane.addButton({ title: '✨ Novos respingos' }).on('click', () => {
  webGLFluidEnhanced.splats();
});

// ===== ESCONDE O LOADING =====
loading.classList.add('hidden');
hint.classList.add('visible');
