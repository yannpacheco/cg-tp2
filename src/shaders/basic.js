// Transforma posições e normais para desenhar a cena.
export const vertexShader = `
attribute vec4 position;
attribute vec3 normal;
uniform mat4 u_matrix;
uniform mat4 u_normalMatrix;
varying vec3 v_normal;

void main() {
  gl_Position = u_matrix * position;
  v_normal = mat3(u_normalMatrix) * normal;
}
`;

// Luz ambiente + difusa (Lambert), sem brilho especular.
export const fragmentShader = `
precision mediump float;
uniform vec4 u_color;
uniform vec3 u_lightDirection;
uniform float u_ambient;
uniform bool u_lightingEnabled;
varying vec3 v_normal;

void main() {
  float brightness = 1.0;
  if (u_lightingEnabled) {
    vec3 normal = normalize(v_normal);
    float diffuse = max(dot(normal, normalize(u_lightDirection)), 0.0);
    brightness = u_ambient + (1.0 - u_ambient) * diffuse;
  }
  gl_FragColor = vec4(u_color.rgb * brightness, u_color.a);
}
`;
