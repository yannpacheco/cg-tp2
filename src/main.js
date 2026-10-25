import { createShadows, getLightMatrix } from './shadows.js';
import { setupSound, syncSound, toggleSound, unlockSound, playPirateGrunt } from './sound.js';
import { waterVertexShader, waterFragmentShader } from './water.js';
import { setupSeagullAudio, startSeagulls, stopSeagulls } from './seagulls.js';
import { createSky, drawSky } from './sky.js';
import { loadSand, loadPirateAtlas, loadSeagullTexture } from './textures.js';
import { loadPalette } from './obj-loader.js';
import { scene, captain, createGeometries, updateScene, nextCharacterPose } from './scene.js';
import { camera, getCameraPosition, getViewProjection, setupCameraControls, updateCamera } from './camera.js';
import { vertexShader, fragmentShader } from './shaders/basic.js';

const canvas = document.querySelector('#canvas');
const status = document.querySelector('#status');
const lightButton = document.querySelector('#toggle-light');
const windButton = document.querySelector('#toggle-wind');
const poseButton = document.querySelector('#next-pose');
const seagullButton = document.querySelector('#fly-seagulls');
const seagullStatus = document.querySelector('#seagull-status');
const cameraStatus = document.querySelector('#camera-status');
const soundButton = document.querySelector('#toggle-sound');
const soundStatus = document.querySelector('#sound-status');
if (window.matchMedia('(max-width: 768px)').matches) document.querySelector('#control-panel').open = false;
const gl = canvas.getContext('webgl');
const twgl = window.twgl;
let programInfo;
let waterProgram;
let shadows;
let lightMatrix;
let geometries;
let palette;
let sand;
let pirateAtlas;
let sky;
let seagullTexture;
let previousTime = null;

if (!gl) {
  status.textContent = 'WebGL indisponível. Tente outro navegador com suporte a WebGL.';
} else if (!twgl) {
  status.textContent = 'Não foi possível carregar TWGL.js. Verifique a conexão e recarregue.';
} else {
  programInfo = twgl.createProgramInfo(gl, [vertexShader, fragmentShader]);
  if (!programInfo) {
    status.textContent = 'Erro ao compilar os shaders. Confira o console.';
  } else {
    try {
      status.textContent = 'Carregando modelos...';
      waterProgram = twgl.createProgramInfo(gl, [waterVertexShader, waterFragmentShader]);
      if (!waterProgram) throw new Error('Erro ao preparar as ondas do mar.');
      shadows = createShadows(gl);
      geometries = await createGeometries(gl);
      palette = await loadPalette(gl);
      sand = await loadSand(gl);
      pirateAtlas = await loadPirateAtlas(gl);
      sky = await createSky(gl);
      seagullTexture = await loadSeagullTexture(gl);
    } catch (error) {
      status.textContent = error.message;
      throw error;
    }
    gl.enable(gl.DEPTH_TEST);
    setupCameraControls(canvas);
    setupEffectControls();
    setupSeagullAudio(scene);
    setupSound(scene);
    canvas.addEventListener('click', event => {
      if (isCaptainClicked(event)) playPirateGrunt(scene);
    });
    soundButton.disabled = false;
    soundButton.addEventListener('click', () => toggleSound(scene));
    document.addEventListener('pointerdown', event => {
      if (!event.target.closest('#toggle-sound')) unlockSound(scene);
    });
    document.querySelector('#camera-auto').addEventListener('click', () => { camera.mode = 1; });
    document.querySelector('#camera-orbit').addEventListener('click', () => { camera.mode = 2; });
    seagullButton.disabled = false;
    seagullButton.addEventListener('click', () => startSeagulls(scene));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopSeagulls(scene);
      syncSound(scene);
    });
    const dayButton = document.querySelector('#toggle-day');
    dayButton.disabled = false;
    dayButton.addEventListener('click', toggleDay);
    lightButton.disabled = false;
    windButton.disabled = false;
    poseButton.disabled = false;
    poseButton.addEventListener('click', nextCharacterPose);
    windButton.addEventListener('click', toggleWind);
    lightButton.addEventListener('click', toggleLighting);
    window.addEventListener('keydown', (event) => {
      // Ignora repetição ao segurar a tecla.
      const key = event.key.toLowerCase();
      if (!event.repeat && key === 's') toggleSound(scene);
      else if (!event.repeat && ['1', '2', 'g', 'p', 'v', 'l', 'n'].includes(key)) unlockSound(scene);
      if (key === 'n' && !event.repeat) toggleDay();
      if (event.key.toLowerCase() === 'g' && !event.repeat) startSeagulls(scene);
      if (event.key.toLowerCase() === 'p' && !event.repeat) nextCharacterPose();
      if (event.key.toLowerCase() === 'v' && !event.repeat) toggleWind();
      if (event.key.toLowerCase() === 'l' && !event.repeat) {
        toggleLighting();
      }
    });
    requestAnimationFrame(render);
  }
}

function setupEffectControls() {
  const controls = [
    { id: 'wave-intensity', get: () => scene.waveIntensity, set: value => { scene.waveIntensity = value; } },
    { id: 'wind-intensity', get: () => scene.wind.intensity, set: value => { scene.wind.intensity = value; } },
    { id: 'dust-intensity', get: () => scene.wind.dustIntensity, set: value => { scene.wind.dustIntensity = value; } },
  ];
  document.querySelector('#effect-controls').disabled = false;
  for (const control of controls) {
    const input = document.querySelector('#' + control.id);
    const output = document.querySelector('#' + control.id + '-value');
    input.value = control.get();
    function change() {
      const value = Number(input.value);
      control.set(value);
      output.textContent = value.toFixed(1) + 'x';
    }
    input.addEventListener('input', change);
    change();
  }
}

function isCaptainClicked(event) {
  const rect = canvas.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return false;

  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = 1 - ((event.clientY - rect.top) / rect.height) * 2;
  const inverseViewProjection = twgl.m4.inverse(getViewProjection(gl));
  const nearPoint = twgl.m4.transformPoint(inverseViewProjection, [x, y, -1]);
  const origin = getCameraPosition();
  const direction = nearPoint.map((value, axis) => value - origin[axis]);
  const length = Math.hypot(...direction);
  for (let axis = 0; axis < direction.length; axis++) direction[axis] /= length;

  const center = [captain.position[0], captain.position[1] + 0.85, captain.position[2]];
  const offset = origin.map((value, axis) => value - center[axis]);
  const projection = offset.reduce((sum, value, axis) => sum + value * direction[axis], 0);
  const radius = 1;
  const discriminant = projection * projection - (offset.reduce((sum, value) => sum + value * value, 0) - radius * radius);
  return discriminant >= 0 && -projection + Math.sqrt(discriminant) >= 0;
}

function toggleDay() {
  scene.night = !scene.night;
  const button = document.querySelector('#toggle-day');
  button.textContent = scene.night ? 'Noite · N (mudar para dia)' : 'Dia · N (mudar para noite)';
  button.setAttribute('aria-pressed', String(scene.night));
}

function toggleWind() {
  scene.wind.enabled = !scene.wind.enabled;
}

function toggleLighting() {
  scene.lightingEnabled = !scene.lightingEnabled;
}

function render(time) {
  // Limita o salto ao voltar de uma aba inativa.
  const deltaTime = previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.1);
  previousTime = time;
  update(deltaTime);
  draw();
  requestAnimationFrame(render);
}

function update(deltaTime) {
  updateCamera(deltaTime);
  updateScene(deltaTime);
  // Transicao de dois segundos, independente da taxa de quadros.
  const target = scene.night ? 1 : 0;
  scene.nightAmount += Math.sign(target - scene.nightAmount) * Math.min(Math.abs(target - scene.nightAmount), deltaTime / 2);
  const night = scene.nightAmount;
  scene.light.direction = [1 - 3 * night, 2 + night, 3 - 4 * night];
  const soundText = scene.sound.enabled ? 'Desligar som' : 'Ativar som';
  if (soundButton.textContent !== soundText) soundButton.textContent = soundText;
  soundButton.setAttribute('aria-pressed', String(scene.sound.enabled));
  const soundHint = scene.sound.error ? 'Áudio indisponível. Tente ativar novamente.' : scene.sound.enabled ? 'Praia e gaivotas com som' : scene.sound.started ? 'Todos os sons silenciados' : 'Toque na cena para ouvir a praia';
  if (soundStatus.textContent !== soundHint) soundStatus.textContent = soundHint;
  for (const [id, mode] of [['camera-auto', 1], ['camera-orbit', 2]]) {
    document.querySelector('#' + id).setAttribute('aria-pressed', String(camera.mode === mode));
  }
  seagullButton.disabled = scene.seagulls.active;
  const gullText = scene.seagulls.audioError ? 'Som indisponível; voo funcionando.' : scene.seagulls.active ? 'Gaivotas passando...' : 'Gaivotas prontas para passar.';
  if (seagullStatus.textContent !== gullText) seagullStatus.textContent = gullText;
  const poseText = 'Capitão · ' + (scene.characterPose + 1) + '/3';
  if (poseButton.textContent !== poseText) poseButton.textContent = poseText;
  const windPressed = String(scene.wind.enabled);
  if (windButton.getAttribute('aria-pressed') !== windPressed || windButton.textContent === 'Carregando vento...') {
    windButton.setAttribute('aria-pressed', windPressed);
    windButton.textContent = scene.wind.enabled ? 'Vento ligado ? V' : 'Vento desligado ? V';
  }
  const cameraText = camera.mode === 1 ? 'Use o scroll para aproximar ou afastar.' : 'Arraste a cena para explorar a ilha.';
  if (cameraStatus.textContent !== cameraText) cameraStatus.textContent = cameraText;
  // Atualiza o menu apenas quando o estado muda.
  const pressed = String(scene.lightingEnabled);
  if (lightButton.getAttribute('aria-pressed') !== pressed || status.textContent === 'Carregando modelos...') {
    lightButton.setAttribute('aria-pressed', pressed);
    lightButton.textContent = scene.lightingEnabled ? 'Luz ligada · L' : 'Luz desligada · L';
    status.textContent = 'Iluminação ' + (scene.lightingEnabled ? 'ligada' : 'desligada') + '.';
  }
}

function draw() {
  // Ajusta a resolução ao tamanho exibido do canvas.
  twgl.resizeCanvasToDisplaySize(canvas);
  lightMatrix = getLightMatrix(scene.light.direction);
  if (scene.lightingEnabled) {
    twgl.bindFramebufferInfo(gl, shadows.buffer);
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.DITHER);
    for (const object of scene.objects) drawObject(object, twgl.m4.identity(), lightMatrix, true);
    gl.enable(gl.DITHER);
    twgl.bindFramebufferInfo(gl, null);
  }
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(...scene.backgroundColor);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const m4 = twgl.m4;
  const viewProjection = getViewProjection(gl);
  drawSky(gl, sky, viewProjection, getCameraPosition(), scene.nightAmount);
  gl.useProgram(programInfo.program);

  for (const object of scene.objects) {
    drawObject(object, m4.identity(), viewProjection);
  }
}

function drawObject(object, parentWorld, viewProjection, shadowPass = false) {
  if (object.visible === false) return;
  const m4 = twgl.m4;
  let local = m4.translation(object.position);
  // Balanco no pe da palmeira, antes da orientacao do modelo.
  if (object.sway) {
    local = m4.rotateX(local, object.sway[0]);
    local = m4.rotateZ(local, object.sway[2]);
  }
  local = m4.rotateX(local, object.rotation[0]);
  local = m4.rotateY(local, object.rotation[1]);
  local = m4.rotateZ(local, object.rotation[2]);
  local = m4.scale(local, object.scale);
  // A matriz do pai posiciona o objeto inteiro na cena.
  const world = m4.multiply(parentWorld, local);

  // Grupos podem ter filhos sem possuir geometria própria.
  if (object.geometry && !(shadowPass && ['water', 'dust'].includes(object.geometry))) {
    const geometry = geometries[object.geometry];
    const material = scene.materials[object.material];
    const program = shadowPass ? shadows.program : material.water ? waterProgram : programInfo;
    gl.useProgram(program.program);
    twgl.setBuffersAndAttributes(gl, program, geometry);
    twgl.setUniforms(program, {
      u_world: world,
      u_lightMatrix: lightMatrix,
      u_shadowMap: shadows.buffer.attachments[0],
      u_shadowSize: shadows.size,
      u_night: scene.nightAmount,
      u_lightColor: [1 - 0.45 * scene.nightAmount, 1 - 0.35 * scene.nightAmount, 1 - 0.1 * scene.nightAmount],
      u_time: scene.time,
      u_waveIntensity: scene.waveIntensity,
      u_islandRadius: scene.islandRadius,
      u_seaRadius: scene.seaRadius,
      u_cameraPosition: getCameraPosition(),
      u_matrix: m4.multiply(viewProjection, world),
      u_normalMatrix: m4.transpose(m4.inverse(world)),
      u_color: material.color,
      u_texture: material.texture === 'seagull' ? seagullTexture : material.texture === 'sand' ? sand : material.texture === 'pirate' ? pirateAtlas : palette,
      u_textureScale: material.textureScale || [1, 1],
      u_tint: material.tint || [1, 1, 1],
      u_tintStrength: material.tintStrength || 0,
      u_useTexture: Boolean(material.textured),
      u_lightDirection: scene.light.direction,
      u_ambient: (material.ambient ?? scene.light.ambient) * (1 - scene.nightAmount) + 0.3 * scene.nightAmount,
      u_lightingEnabled: scene.lightingEnabled,
    });
    twgl.drawBufferInfo(gl, geometry);
  }
  for (const child of object.children || []) {
    drawObject(child, world, viewProjection, shadowPass);
  }
}
