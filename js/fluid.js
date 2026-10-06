import * as TweakpaneModule from 'https://unpkg.com/tweakpane@4.0.1/dist/tweakpane.js';
import WebGLFluid from 'https://esm.sh/webgl-fluid-enhanced';

const canvas = document.getElementById('fluidCanvas');

// 1. Objeto com TODAS as configurações do site original
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
  bloom: true,
  bloomIntensity: 0.8,
  bloomThreshold: 0.6,
  sunrays: true,
  sunraysWeight: 1.0,
  hover: false, // false = o fluido só sai quando clica e arrasta
  backgroundColor: '#0c0410' // Combina com o fundo do seu CSS
};

// 2. Inicia o motor WebGL Enhanced
const simulation = new WebGLFluid(canvas);
simulation.setConfig(params);
simulation.start();

// 3. Painel Tweakpane (Visual completo)
const pane = new TweakpaneModule.Pane({
  container: document.getElementById('fluidPanel'),
  title: 'Controles do Fluido'
});

// Função universal para injetar qualquer mudança instantaneamente no WebGL
const applyChanges = () => {
  simulation.setConfig(params);
};

// --- PASTA: QUALIDADE E FÍSICA ---
const fQualidade = pane.addFolder({ title: 'Física e Qualidade' });

fQualidade.addBinding(params, 'simResolution', {
  label: 'Res. Simulação',
  options: { Baixa: 64, Média: 128, Alta: 256, Ultra: 512 }
}).on('change', applyChanges);

fQualidade.addBinding(params, 'dyeResolution', {
  label: 'Res. Textura',
  options: { Baixa: 256, Média: 512, Alta: 1024 }
}).on('change', applyChanges);

fQualidade.addBinding(params, 'densityDissipation', { label: 'Fade da Cor', min: 0.9, max: 1.0, step: 0.001 }).on('change', applyChanges);
fQualidade.addBinding(params, 'velocityDissipation', { label: 'Fade Movimento', min: 0.9, max: 1.0, step: 0.001 }).on('change', applyChanges);
fQualidade.addBinding(params, 'pressure', { label: 'Pressão', min: 0.0, max: 1.0 }).on('change', applyChanges);
fQualidade.addBinding(params, 'curl', { label: 'Redemoinhos', min: 0, max: 50 }).on('change', applyChanges);

// --- PASTA: COMPORTAMENTO DO TRAÇO ---
const fTraco = pane.addFolder({ title: 'Comportamento' });
fTraco.addBinding(params, 'splatRadius', { label: 'Tamanho', min: 0.01, max: 1.0 }).on('change', applyChanges);
fTraco.addBinding(params, 'splatForce', { label: 'Força', min: 1000, max: 10000 }).on('change', applyChanges);
fTraco.addBinding(params, 'hover', { label: 'Reagir sem clicar' }).on('change', applyChanges);
fTraco.addBinding(params, 'colorful', { label: 'Multicolorido' }).on('change', applyChanges);

// --- PASTA: EFEITOS VISUAIS ---
const fVisual = pane.addFolder({ title: 'Efeitos Visuais' });
fVisual.addBinding(params, 'shading', { label: 'Sombreamento 3D' }).on('change', applyChanges);

fVisual.addBinding(params, 'bloom', { label: 'Brilho Neon' }).on('change', applyChanges);
fVisual.addBinding(params, 'bloomIntensity', { label: 'Intensidade Neon', min: 0.1, max: 2.0 }).on('change', applyChanges);
fVisual.addBinding(params, 'bloomThreshold', { label: 'Limite Neon', min: 0.0, max: 1.0 }).on('change', applyChanges);

fVisual.addBinding(params, 'sunrays', { label: 'Raios de Luz' }).on('change', applyChanges);
fVisual.addBinding(params, 'sunraysWeight', { label: 'Força da Luz', min: 0.1, max: 2.0 }).on('change', applyChanges);
