export const scene = {
  backgroundColor: [0.65, 0.8, 0.9, 1],
  lightingEnabled: true,
  // Direção da superfície para a luz, em coordenadas da cena.
  light: { direction: [1, 2, 3], ambient: 0.25 },
  materials: {
    ground: { color: [0.45, 0.7, 0.4, 1] },
    base: { color: [0.5, 0.35, 0.2, 1] },
    red: { color: [0.8, 0.3, 0.3, 1] },
    blue: { color: [0.3, 0.4, 0.8, 1] },
    yellow: { color: [0.85, 0.7, 0.2, 1] },
  },
  objects: [
    { geometry: 'ground', material: 'ground', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    { geometry: 'base', material: 'base', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    // Testes temporários: remova estas linhas para deixar a base vazia.
    { geometry: 'cube', material: 'red', position: [-1.7, 0.5, 0], rotation: [0, 0.3, 0], scale: [1, 1, 1] },
    { geometry: 'sphere', material: 'blue', position: [0, 0.6, 2], rotation: [0, 0, 0], scale: [1, 1, 1] },
    { geometry: 'cylinder', material: 'yellow', position: [1.7, 0.6, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
  ],
};

export function createGeometries(gl) {
  const primitives = window.twgl.primitives;
  return {
    ground: primitives.createDiscBufferInfo(gl, 4, 32),
    // Latitude de PI/2 a PI: apenas a metade abaixo de Y = 0.
    base: primitives.createSphereBufferInfo(gl, 4, 32, 16, Math.PI / 2, Math.PI),
    cube: primitives.createCubeBufferInfo(gl, 1),
    sphere: primitives.createSphereBufferInfo(gl, 0.6, 24, 12),
    cylinder: primitives.createCylinderBufferInfo(gl, 0.5, 1.2, 24, 1),
  };
}

