import { scene } from './scene.js';

const canvas = document.querySelector('#canvas');
const status = document.querySelector('#status');
const gl = canvas.getContext('webgl');
const twgl = window.twgl;

if (!gl) {
  status.textContent = 'WebGL indisponível. Tente outro navegador com suporte a WebGL.';
} else if (!twgl) {
  status.textContent = 'Não foi possível carregar TWGL.js. Verifique a conexão e recarregue.';
} else {
  gl.enable(gl.DEPTH_TEST);
  status.textContent = 'WebGL pronto. A cena ainda contém apenas a cor de fundo.';
  requestAnimationFrame(render);
}

function render() {
  // Ajusta a resolução ao tamanho exibido do canvas.
  twgl.resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(...scene.backgroundColor);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  requestAnimationFrame(render);
}

