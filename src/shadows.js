// Mapa de profundidade visto pela luz; funciona sem extensoes WebGL.
export function createShadows(gl) {
  const twgl = window.twgl;
  const program = twgl.createProgramInfo(gl, [`
    attribute vec4 position;
    uniform mat4 u_matrix;
    void main() { gl_Position = u_matrix * position; }
  `, `
    precision mediump float;
    void main() {
      float depth = gl_FragCoord.z * 255.0;
      gl_FragColor = vec4(floor(depth) / 255.0, fract(depth), 0.0, 1.0);
    }
  `]);
  if (!program) throw new Error('Erro ao preparar sombras.');
  const size = Math.min(2048, gl.getParameter(gl.MAX_TEXTURE_SIZE), gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
  const buffer = twgl.createFramebufferInfo(gl, [
    { format: gl.RGBA, min: gl.NEAREST, mag: gl.NEAREST, wrap: gl.CLAMP_TO_EDGE },
    { format: gl.DEPTH_COMPONENT16 },
  ], size, size);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('Mapa de sombras indisponÃ­vel.');
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { program, buffer, size };
}

export function getLightMatrix(direction) {
  const m4 = window.twgl.m4;
  const length = Math.hypot(...direction);
  const eye = direction.map(value => value / length * 24);
  return m4.multiply(m4.ortho(-12, 12, -12, 12, 1, 48), m4.inverse(m4.lookAt(eye, [0, 0, 0], [0, 1, 0])));
}

// Quatro amostras suavizam a borda; bias evita manchas na propria superficie.
export const shadowShader = `
uniform sampler2D u_shadowMap;
uniform float u_shadowSize;
varying vec4 v_shadowPosition;
float shadowVisibility(float diffuse) {
  vec3 p = v_shadowPosition.xyz / v_shadowPosition.w * 0.5 + 0.5;
  if (p.x <= 0.0 || p.x >= 1.0 || p.y <= 0.0 || p.y >= 1.0 || p.z <= 0.0 || p.z >= 1.0) return 1.0;
  float bias = max(0.0018 * (1.0 - diffuse), 0.0007);
  float visible = 0.0;
  for (int x = 0; x < 2; x++) {
    for (int y = 0; y < 2; y++) {
      vec2 offset = (vec2(float(x), float(y)) - 0.5) / u_shadowSize;
      vec2 stored = texture2D(u_shadowMap, p.xy + offset).rg;
      float depth = stored.r + stored.g / 255.0;
      visible += step(p.z - bias, depth);
    }
  }
  return visible * 0.25;
}
`;

