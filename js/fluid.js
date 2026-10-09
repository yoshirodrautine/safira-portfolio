const canvas = document.getElementById('fluidCanvas');
const loading = document.getElementById('fluidLoading');
const hint = document.getElementById('fluidHint');

// Em vez de deixar o spinner girando pra sempre quando algo falha,
// troca o texto da tela de carregamento por uma mensagem de erro.
function showError(message, detail) {
  const spinner = loading.querySelector('.fluid-spinner');
  const text = loading.querySelector('span');
  if (spinner) spinner.style.display = 'none';
  text.textContent = message;

  if (detail) {
    const small = document.createElement('small');
    small.style.cssText = 'display:block;margin-top:6px;opacity:0.7;font-size:0.75rem;max-width:80vw;text-align:center;';
    small.textContent = detail;
    text.appendChild(small);
  }

  const back = document.createElement('a');
  back.href = 'index.html';
  back.textContent = '← Voltar ao site';
  back.style.cssText = 'color:#c77dff;font-size:0.85rem;margin-top:8px;';
  loading.appendChild(back);
}

// Dependendo de como o CDN (esm.run) empacota o pacote, o objeto da
// biblioteca pode chegar direto, dentro de ".default", ou até dentro
// de ".default.default". Procura em todos os lugares possíveis.
function resolveFluidLib(mod) {
  const candidates = [mod, mod && mod.default, mod && mod.default && mod.default.default];
  return candidates.find((c) => c && typeof c.simulation === 'function') || null;
}

const initialConfig = {
  INITIAL: true,
  SPLAT_AMOUNT: 5,
  HOVER: false,
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

async function setupPanel(lib) {
  let TweakpaneModule;
  try {
    TweakpaneModule = await import('https://unpkg.com/tweakpane@4.0.1/dist/tweakpane.js');
  } catch (err) {
    console.warn('Tweakpane não carregou — o fluido segue funcionando sem o painel.', err);
    return;
  }

  const update = (partial) => {
    if (typeof lib.config === 'function') lib.config(partial);
  };

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

  pane.addBinding(params, 'radius', { label: 'Tamanho', min: 0.1, max: 1.0, step: 0.01 })
    .on('change', (ev) => update({ SPLAT_RADIUS: ev.value }));
  pane.addBinding(params, 'curl', { label: 'Redemoinhos', min: 0, max: 50, step: 1 })
    .on('change', (ev) => update({ CURL: ev.value }));
  pane.addBinding(params, 'dissipation', { label: 'Fade da Cor', min: 0.9, max: 1.0, step: 0.001 })
    .on('change', (ev) => update({ DENSITY_DISSIPATION: ev.value }));
  pane.addBinding(params, 'velocity', { label: 'Fade do Movimento', min: 0.9, max: 1.0, step: 0.001 })
    .on('change', (ev) => update({ VELOCITY_DISSIPATION: ev.value }));
  pane.addBinding(params, 'bloom', { label: 'Brilho Neon' })
    .on('change', (ev) => update({ BLOOM: ev.value }));

  pane.addButton({ title: '✨ Novos respingos' }).on('click', () => {
    if (typeof lib.splats === 'function') lib.splats();
  });
}

async function start() {
  let mod;
  try {
    mod = await import('https://esm.run/webgl-fluid-enhanced');
  } catch (err) {
    console.error(err);
    showError('Não foi possível baixar a biblioteca de fluido.', 'Verifique a conexão e recarregue a página.');
    return;
  }

  const lib = resolveFluidLib(mod);
  if (!lib) {
    const keys = Object.keys(mod).join(', ') || '(vazio)';
    const defKeys = mod.default ? Object.keys(mod.default).join(', ') || '(vazio)' : '(sem default)';
    console.error('Formato inesperado da biblioteca:', mod);
    showError('A biblioteca carregou, mas num formato inesperado.', `exports: ${keys} | default: ${defKeys}`);
    return;
  }

  try {
    lib.simulation(canvas, initialConfig);
  } catch (err) {
    console.error(err);
    showError('Não foi possível iniciar a simulação.', 'O WebGL pode estar desativado neste navegador.');
    return;
  }

  loading.classList.add('hidden');
  hint.classList.add('visible');
  setupPanel(lib);
}

start();
