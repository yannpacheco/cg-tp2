export const camera = {
  mode: 1,
  target: [1, -0.5, 0],
  up: [0, 1, 0],
  automatic: { angle: Math.PI / 4, elevation: Math.PI / 4, distance: 26 },
  orbital: { angle: Math.PI / 4, elevation: Math.PI / 4, distance: 26 },
  free: { position: [13, 18.38, 13], yaw: -Math.PI / 4, pitch: -Math.PI / 4, speed: 10 },
};

const pressedKeys = new Set();

export function setupCameraControls(canvas) {
  let pointer = null;
  let lastX = 0;
  let lastY = 0;

  window.addEventListener('keydown', (event) => {
    if (['1', '2', '3'].includes(event.key)) {
      camera.mode = Number(event.key);
      pressedKeys.clear();
      pointer = null;
      return;
    }
    if (camera.mode !== 3 || event.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
    const key = event.key.toLowerCase();
    if (['w', 'a', 's', 'd'].includes(key)) {
      event.preventDefault();
      pressedKeys.add(key);
    }
  });
  window.addEventListener('keyup', (event) => pressedKeys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => pressedKeys.clear());

  canvas.addEventListener('wheel', (event) => {
    if (camera.mode !== 1) return;
    event.preventDefault();
    // Limita o zoom para não entrar na base nem afastar demais.
    const distance = camera.automatic.distance * (event.deltaY > 0 ? 1.1 : event.deltaY < 0 ? 0.9 : 1);
    camera.automatic.distance = Math.max(16, Math.min(40, distance));
  }, { passive: false });

  canvas.addEventListener('pointerdown', (event) => {
    if (![2, 3].includes(camera.mode) || event.button !== 0) return;
    pointer = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    // Continua recebendo movimentos ao sair do canvas durante o arraste.
    canvas.setPointerCapture(pointer);
  });

  canvas.addEventListener('pointermove', (event) => {
    if (pointer !== event.pointerId) return;
    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;
    if (camera.mode === 2) {
      camera.orbital.angle -= deltaX * 0.01;
      const elevation = camera.orbital.elevation + deltaY * 0.01;
      // Evita alinhar a câmera ao eixo vertical.
      camera.orbital.elevation = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, elevation));
    } else if (camera.mode === 3) {
      camera.free.yaw -= deltaX * 0.01;
      camera.free.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, camera.free.pitch - deltaY * 0.01));
    } else {
      return;
    }
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
  if (camera.mode !== 3) return;

  const forward = getFreeCameraForward();
  const right = [Math.cos(camera.free.yaw), 0, Math.sin(camera.free.yaw)];
  const movement = [0, 0, 0];
  if (pressedKeys.has('w')) addScaled(movement, forward, 1);
  if (pressedKeys.has('s')) addScaled(movement, forward, -1);
  if (pressedKeys.has('d')) addScaled(movement, right, 1);
  if (pressedKeys.has('a')) addScaled(movement, right, -1);
  const length = Math.hypot(...movement);
  if (length === 0) return;
  const distance = camera.free.speed * deltaTime / length;
  addScaled(camera.free.position, movement, distance);
}

export function getCameraPosition() {
  if (camera.mode === 3) return camera.free.position;
  const active = camera.mode === 1 ? camera.automatic : camera.orbital;
  // Coordenadas esféricas mantêm a câmera ao redor da origem.
  const horizontal = active.distance * Math.cos(active.elevation);
  return [
    horizontal * Math.sin(active.angle),
    active.distance * Math.sin(active.elevation),
    horizontal * Math.cos(active.angle),
  ];
}

export function getViewProjection(gl) {
  const m4 = window.twgl.m4;
  const position = getCameraPosition();
  const aspect = gl.canvas.width / gl.canvas.height;
  const projection = m4.perspective(Math.PI / 4, aspect, 0.1, 100);
  const target = camera.mode === 3
    ? position.map((value, axis) => value + getFreeCameraForward()[axis])
    : camera.target;
  const view = m4.inverse(m4.lookAt(position, target, camera.up));
  return m4.multiply(projection, view);
}

function getFreeCameraForward() {
  const horizontal = Math.cos(camera.free.pitch);
  return [
    Math.sin(camera.free.yaw) * horizontal,
    Math.sin(camera.free.pitch),
    -Math.cos(camera.free.yaw) * horizontal,
  ];
}

function addScaled(destination, direction, scale) {
  for (let axis = 0; axis < destination.length; axis++) {
    destination[axis] += direction[axis] * scale;
  }
}
