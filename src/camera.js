export const camera = {
  position: [7, 7, 9],
  target: [0, 0, 0],
  up: [0, 1, 0],
};

export function getViewProjection(gl) {
  const m4 = window.twgl.m4;
  const aspect = gl.canvas.width / gl.canvas.height;
  const projection = m4.perspective(Math.PI / 4, aspect, 0.1, 100);
  // lookAt retorna a matriz da câmera; a vista é sua inversa.
  const view = m4.inverse(m4.lookAt(camera.position, camera.target, camera.up));
  return m4.multiply(projection, view);
}
