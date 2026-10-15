export const camera = {
  mode: 1,
  target: [0, 0, 0],
  up: [0, 1, 0],
  automatic: { angle: Math.PI / 4, elevation: Math.PI / 4, distance: 14 },
  orbital: { angle: Math.PI / 4, elevation: Math.PI / 4, distance: 14 },
};

export function setupCameraControls(canvas) {
  let pointer = null;
  let lastX = 0;
  let lastY = 0;

  window.addEventListener('keydown', (event) => {
    if (event.key === '1' || event.key === '2') {
      camera.mode = Number(event.key);
      pointer = null;
    }
  });

  canvas.addEventListener('wheel', (event) => {
    if (camera.mode !== 1) return;
    event.preventDefault();
    // Limita o zoom para não entrar na base nem afastar demais.
    const distance = camera.automatic.distance * (event.deltaY > 0 ? 1.1 : event.deltaY < 0 ? 0.9 : 1);
    camera.automatic.distance = Math.max(8, Math.min(30, distance));
  }, { passive: false });

  canvas.addEventListener('pointerdown', (event) => {
    if (camera.mode !== 2 || event.button !== 0) return;
    pointer = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    // Continua recebendo movimentos ao sair do canvas durante o arraste.
    canvas.setPointerCapture(pointer);
  });

  canvas.addEventListener('pointermove', (event) => {
    if (camera.mode !== 2 || pointer !== event.pointerId) return;
    camera.orbital.angle -= (event.clientX - lastX) * 0.01;
    const elevation = camera.orbital.elevation + (event.clientY - lastY) * 0.01;
    // Evita alinhar a câmera ao eixo vertical.
    camera.orbital.elevation = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, elevation));
    lastX = event.clientX;
    lastY = event.clientY;
  });

  function stopDragging(event) {
    if (pointer !== event.pointerId) return;
    pointer = null;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  }
  canvas.addEventListener('pointerup', stopDragging);
  canvas.addEventListener('pointercancel', stopDragging);
  canvas.addEventListener('lostpointercapture', stopDragging);
}

export function updateCamera(deltaTime) {
  if (camera.mode === 1) camera.automatic.angle += deltaTime * 0.3;
}

export function getViewProjection(gl) {
  const m4 = window.twgl.m4;
  const active = camera.mode === 1 ? camera.automatic : camera.orbital;
  // Coordenadas esféricas mantêm a câmera ao redor da origem.
  const horizontal = active.distance * Math.cos(active.elevation);
  const position = [
    horizontal * Math.sin(active.angle),
    active.distance * Math.sin(active.elevation),
    horizontal * Math.cos(active.angle),
  ];
  const aspect = gl.canvas.width / gl.canvas.height;
  const projection = m4.perspective(Math.PI / 4, aspect, 0.1, 100);
  const view = m4.inverse(m4.lookAt(position, camera.target, camera.up));
  return m4.multiply(projection, view);
}
