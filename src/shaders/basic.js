// Posição de cada vértice na tela.
export const vertexShader = `
attribute vec4 position;
uniform mat4 u_matrix;

void main() {
  gl_Position = u_matrix * position;
}
`;

// Cor única por objeto, ainda sem iluminação.
export const fragmentShader = `
precision mediump float;
uniform vec4 u_color;

void main() {
  gl_FragColor = u_color;
}
`;
