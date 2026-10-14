import { scene, createGeometries } from './scene.js';
import { getViewProjection } from './camera.js';
import { vertexShader, fragmentShader } from './shaders/basic.js';

const canvas = document.querySelector('#canvas');
const status = document.querySelector('#status');
const gl = canvas.getContext('webgl');
const twgl = window.twgl;
let programInfo;
let geometries;

if (!gl) {
  status.textContent = 'WebGL indisponível. Tente outro navegador com suporte a WebGL.';
} else if (!twgl) {
  status.textContent = 'Não foi possível carregar TWGL.js. Verifique a conexão e recarregue.';
} else {
  programInfo = twgl.createProgramInfo(gl, [vertexShader, fragmentShader]);
  if (!programInfo) {
    status.textContent = 'Erro ao compilar os shaders. Confira o console.';
  } else {
    geometries = createGeometries(gl);
    gl.enable(gl.DEPTH_TEST);
    status.textContent = 'Base do diorama com cubo, esfera e cilindro de teste.';
    requestAnimationFrame(render);
  }
}

function render() {
  // Ajusta a resolução ao tamanho exibido do canvas.
  twgl.resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(...scene.backgroundColor);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(programInfo.program);

  const m4 = twgl.m4;
  const viewProjection = getViewProjection(gl);

  for (const object of scene.objects) {
    // Escala e rotação locais, seguidas pela posição na cena.
    let world = m4.translation(object.position);
    world = m4.rotateX(world, object.rotation[0]);
    world = m4.rotateY(world, object.rotation[1]);
    world = m4.rotateZ(world, object.rotation[2]);
    world = m4.scale(world, object.scale);

    const geometry = geometries[object.geometry];
    twgl.setBuffersAndAttributes(gl, programInfo, geometry);
    twgl.setUniforms(programInfo, {
      u_matrix: m4.multiply(viewProjection, world),
      u_color: object.color,
    });
    twgl.drawBufferInfo(gl, geometry);
  }
  requestAnimationFrame(render);
}
