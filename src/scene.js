import { loadOBJ } from './obj-loader.js';

export const scene = {
  backgroundColor: [0.65, 0.8, 0.9, 1],
  lightingEnabled: true,
  // Direção da superfície para a luz, em coordenadas da cena.
  light: { direction: [1, 2, 3], ambient: 0.25 },
  materials: {
    ground: { color: [0.88, 0.76, 0.5, 1] },
    base: { color: [0.5, 0.35, 0.2, 1] },
    stone: { color: [0.48, 0.5, 0.55, 1] },
    wood: { color: [0.48, 0.25, 0.12, 1] },
    red: { color: [0.8, 0.3, 0.3, 1] },
    blue: { color: [0.3, 0.4, 0.8, 1] },
    yellow: { color: [0.85, 0.7, 0.2, 1] },
  },
  objects: [
    { geometry: 'ground', material: 'ground', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    { geometry: 'base', material: 'base', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    // Primeiros modelos da ilha: fortim ao fundo e barco na praia.
    { geometry: 'towerDoor', material: 'stone', position: [-1.3, 0, -0.8], rotation: [0, 0, 0], scale: [0.65, 0.65, 0.65] },
    { geometry: 'tower', material: 'stone', position: [-1.3, 1.3, -0.8], rotation: [0, 0, 0], scale: [0.65, 0.65, 0.65] },
    { geometry: 'boat', material: 'wood', position: [1.5, 0, 1.6], rotation: [0, -0.5, 0], scale: [0.8, 0.8, 0.8] },
  ],
};

export async function createGeometries(gl) {
  const primitives = window.twgl.primitives;
  const [boat, tower, towerDoor] = await Promise.all([
    loadOBJ(gl, 'boat-row-large.obj'),
    loadOBJ(gl, 'tower-base.obj'),
    loadOBJ(gl, 'tower-base-door.obj'),
  ]);
  return {
    boat, tower, towerDoor,
    ground: primitives.createDiscBufferInfo(gl, 4, 32),
    // Latitude de PI/2 a PI: apenas a metade abaixo de Y = 0.
    base: primitives.createSphereBufferInfo(gl, 4, 32, 16, Math.PI / 2, Math.PI),
    cube: primitives.createCubeBufferInfo(gl, 1),
    sphere: primitives.createSphereBufferInfo(gl, 0.6, 24, 12),
    cylinder: primitives.createCylinderBufferInfo(gl, 0.5, 1.2, 24, 1),
  };
}


// Valores locais: os filhos acompanham a transformação do pai.
export function addObject(config, parent = null) {
  const object = {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    ...config,
    children: [],
  };
  if (parent) parent.children.push(object);
  else scene.objects.push(object);
  for (const child of config.children || []) addObject(child, object);
  return object;
}

export function updateScene(deltaTime) {
  function updateObject(object) {
    if (object.spin) {
      for (let axis = 0; axis < 3; axis++) {
        object.rotation[axis] = (object.rotation[axis] + object.spin[axis] * deltaTime) % (Math.PI * 2);
      }
    }
    for (const child of object.children || []) updateObject(child);
  }
  for (const object of scene.objects) updateObject(object);
}

// Teste removível de hierarquia: suporte fixo e hélice móvel.
addObject({
  position: [1.2, 0, -1.5],
  scale: [0.65, 0.65, 0.65],
  children: [
    { geometry: 'cylinder', material: 'base', position: [0, 1, 0], scale: [0.3, 2 / 1.2, 0.3] },
    {
      position: [0, 2, 0.2],
      spin: [0, 0, 2], // Velocidade em radianos por segundo.
      children: [
        { geometry: 'cube', material: 'yellow', scale: [2, 0.15, 0.15] },
        { geometry: 'cube', material: 'yellow', scale: [0.15, 2, 0.15] },
        { geometry: 'sphere', material: 'red', scale: [0.3, 0.3, 0.3] },
      ],
    },
  ],
});

