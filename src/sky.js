// Panorama em uma esfera centrada na camera, sem receber luz da cena.
export async function createSky(gl) {
  const twgl = window.twgl;
  const programInfo = twgl.createProgramInfo(gl, [`
    attribute vec4 position;
    attribute vec2 texcoord;
    uniform mat4 u_matrix;
    varying vec2 v_texcoord;
    void main() {
      v_texcoord = texcoord;
      gl_Position = u_matrix * position;
    }
  `, `
    precision mediump float;
    uniform sampler2D u_sky;
    varying vec2 v_texcoord;
    void main() {
      // Usa a metade do ceu; a foto inferior tem molhes de pedra.
      gl_FragColor = texture2D(u_sky, vec2(v_texcoord.x, v_texcoord.y * 0.5));
    }
  `]);
  if (!programInfo) throw new Error('Erro ao preparar o panorama.');
  const image = new Image();
  image.src = new URL('../assets/backgrounds/evening-sky.jpg', import.meta.url).href;
  await image.decode();
  const texture = twgl.createTexture(gl, {
    src: image, flipY: false,
    min: gl.LINEAR, mag: gl.LINEAR,
    wrapS: gl.REPEAT, wrapT: gl.CLAMP_TO_EDGE,
  });
  const geometry = twgl.primitives.createSphereBufferInfo(gl, 60, 48, 24);
  return { programInfo, texture, geometry };
}

export function drawSky(gl, sky, viewProjection, cameraPosition) {
  const twgl = window.twgl;
  const world = twgl.m4.translation(cameraPosition);
  // O fundo nao grava profundidade, para os objetos aparecerem na frente.
  gl.disable(gl.DEPTH_TEST);
  gl.depthMask(false);
  gl.useProgram(sky.programInfo.program);
  twgl.setBuffersAndAttributes(gl, sky.programInfo, sky.geometry);
  twgl.setUniforms(sky.programInfo, {
    u_matrix: twgl.m4.multiply(viewProjection, world),
    u_sky: sky.texture,
  });
  twgl.drawBufferInfo(gl, sky.geometry);
  gl.depthMask(true);
  gl.enable(gl.DEPTH_TEST);
}

