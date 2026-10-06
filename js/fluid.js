import * as TweakpaneModule from 'https://unpkg.com/tweakpane@4.0.1/dist/tweakpane.js';
import WebGLFluid from 'https://esm.sh/webgl-fluid-enhanced';

const canvas = document.getElementById('fluidCanvas');

// 1. CONFIGURAÇÕES BASE
const params = {
  simResolution: 128,
  dyeResolution: 512,
  densityDissipation: 0.98,
  velocityDissipation: 0.99,
  pressure: 0.8,
  curl: 30,
  splatRadius: 0.35,
  splatForce: 6000,
  shading: true,
  colorful: true,
  color: '#c77dff',
  bloom: true,
  bloomIntensity: 0.8,
  bloomThreshold: 0.6,
  sunrays: true,
  sunraysWeight: 1.0,
  backgroundColor: '#0c0410',
  hover: true // Fundamental manter ativado para a biblioteca funcionar
};

// 2. INICIA O MOTOR
const simulation = new WebGLFluid(canvas);
simulation.setConfig(params);
simulation.start();

// ===== MODO CLIQUE E ARRASTE (NOVA LÓGICA) =====
let isDragging = false;

window.addEventListener('pointerdown', () => {
  isDragging = true;
});

window.addEventListener('pointerup', () => {
  isDragging = false;
});

// Esta função interceta os movimentos do rato. 
// Se o botão não estiver pressionado, ela impede que o movimento chegue à simulação.
const blockHoverEvents = (e) => {
  if (!isDragging && e.target === canvas) {
    e.stopPropagation();
  }
};

// Aplica o bloqueio usando a fase de captura (o 'true' no final)
window.addEventListener('pointermove', blockHoverEvents, true);
window.addEventListener('mousemove', blockHoverEvents, true);
window.addEventListener('touchmove', blockHoverEvents, true);
// ===============================================

// 3. PAINEL TWEAKPANE
const pane = new TweakpaneModule.Pane({
  container: document.getElementById('fluidPanel'),
  title: 'Controles do Fluido'
});

const applyChanges = () => {
  simulation.setConfig(params);
};

// --- PASTA: FÍSICA E QUALIDADE ---
const fQualidade = pane.addFolder({ title: 'Física e Qualidade' });
fQualidade.addBinding(params, 'simResolution', { label: 'Res. Simulação', options: { Baixa: 64, Média: 128, Alta: 256, Ultra: 512 } }).on('change', applyChanges);
fQualidade.addBinding(params, 'dyeResolution', { label: 'Res. Textura', options: { Baixa: 256, Média: 512, Alta: 1024 } }).on('change', applyChanges);
fQualidade.addBinding(params, 'densityDissipation', { label: 'Fade da Cor', min: 0.9, max: 1.0, step: 0.001 }).on('change', applyChanges);
fQualidade.addBinding(params, 'velocityDissipation', { label: 'Fade Movimento', min: 0.9, max: 1.0, step: 0.001 }).on('change', applyChanges);
fQualidade.addBinding(params, 'pressure', { label: 'Pressão', min: 0.0, max: 1.0 }).on('change', applyChanges);
fQualidade.addBinding(params, 'curl', { label: 'Redemoinhos', min: 0, max: 50 }).on('change', applyChanges);

// --- PASTA: COMPORTAMENTO DO TRAÇO ---
const fTraco = pane.addFolder({ title: 'Comportamento' });
fTraco.addBinding(params, 'splatRadius', { label: 'Tamanho', min: 0.01, max: 1.0 }).on('change', applyChanges);
fTraco.addBinding(params, 'splatForce', { label: 'Força', min: 1000, max: 10000 }).on('change', applyChanges);
fTraco.addBinding(params, 'colorful', { label: 'Multicolorido' }).on('change', applyChanges);
fTraco.addBinding(params, 'color', { label: 'Cor Fixa' }).on('change', applyChanges);

// --- PASTA: EFEITOS VISUAIS ---
const fVisual = pane.addFolder({ title: 'Efeitos Visuais' });
fVisual.addBinding(params, 'shading', { label: 'Sombreamento 3D' }).on('change', applyChanges);
fVisual.addBinding(params, 'bloom', { label: 'Brilho Neon' }).on('change', applyChanges);
fVisual.addBinding(params, 'bloomIntensity', { label: 'Intensidade Neon', min: 0.1, max: 2.0 }).on('change', applyChanges);
fVisual.addBinding(params, 'bloomThreshold', { label: 'Limite Neon', min: 0.0, max: 1.0 }).on('change', applyChanges);
fVisual.addBinding(params, 'sunrays', { label: 'Raios de Luz' }).on('change', applyChanges);
fVisual.addBinding(params, 'sunraysWeight', { label: 'Força da Luz', min: 0.1, max: 2.0 }).on('change', applyChanges);
