import { scene, createGeometries, updateScene } from './scene.js';
import { camera, getViewProjection, setupCameraControls, updateCamera } from './camera.js';
import { vertexShader, fragmentShader } from './shaders/basic.js';

const canvas = document.querySelector('#canvas');
const status = document.querySelector('#status');
const lightButton = document.querySelector('#toggle-light');
const cameraStatus = document.querySelector('#camera-status');
const gl = canvas.getContext('webgl');
const twgl = window.twgl;
let programInfo;
let geometries;
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
      geometries = await createGeometries(gl);
    } catch (error) {
      status.textContent = error.message;
      throw error;
    }
    gl.enable(gl.DEPTH_TEST);
    setupCameraControls(canvas);
    lightButton.disabled = false;
    lightButton.addEventListener('click', toggleLighting);
    window.addEventListener('keydown', (event) => {
      // Ignora repetição ao segurar a tecla.
      if (event.key.toLowerCase() === 'l' && !event.repeat) {
        toggleLighting();
      }
    });
    requestAnimationFrame(render);
  }
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
  const cameraText = camera.mode === 1 ? 'Câmera 1: giro automático' : 'Câmera 2: orbital';
  if (cameraStatus.textContent !== cameraText) cameraStatus.textContent = cameraText;
  // Atualiza o menu apenas quando o estado muda.
  const pressed = String(scene.lightingEnabled);
  if (lightButton.getAttribute('aria-pressed') !== pressed || status.textContent === 'Carregando modelos...') {
    lightButton.setAttribute('aria-pressed', pressed);
    lightButton.textContent = scene.lightingEnabled ? 'Desligar iluminação' : 'Ligar iluminação';
    status.textContent = 'Iluminação ' + (scene.lightingEnabled ? 'ligada' : 'desligada') + '.';
  }
}

function draw() {
  // Ajusta a resolução ao tamanho exibido do canvas.
  twgl.resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(...scene.backgroundColor);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(programInfo.program);

  const m4 = twgl.m4;
  const viewProjection = getViewProjection(gl);

  for (const object of scene.objects) {
    drawObject(object, m4.identity(), viewProjection);
  }
}

function drawObject(object, parentWorld, viewProjection) {
  const m4 = twgl.m4;
  let local = m4.translation(object.position);
  local = m4.rotateX(local, object.rotation[0]);
  local = m4.rotateY(local, object.rotation[1]);
  local = m4.rotateZ(local, object.rotation[2]);
  local = m4.scale(local, object.scale);
  // A matriz do pai posiciona o objeto inteiro na cena.
  const world = m4.multiply(parentWorld, local);

  // Grupos podem ter filhos sem possuir geometria própria.
  if (object.geometry) {
    const geometry = geometries[object.geometry];
    twgl.setBuffersAndAttributes(gl, programInfo, geometry);
    twgl.setUniforms(programInfo, {
      u_matrix: m4.multiply(viewProjection, world),
      u_normalMatrix: m4.transpose(m4.inverse(world)),
      u_color: scene.materials[object.material].color,
      u_lightDirection: scene.light.direction,
      u_ambient: scene.light.ambient,
      u_lightingEnabled: scene.lightingEnabled,
    });
    twgl.drawBufferInfo(gl, geometry);
  }
  for (const child of object.children || []) {
    drawObject(child, world, viewProjection);
  }
}

