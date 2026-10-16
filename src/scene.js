import { loadOBJ } from './obj-loader.js';

export const scene = {
  backgroundColor: [0.65, 0.8, 0.9, 1],
  lightingEnabled: true,
  // Direção da superfície para a luz, em coordenadas da cena.
  light: { direction: [1, 2, 3], ambient: 0.25 },
  materials: {
    kit: { color: [1, 1, 1, 1], textured: true },
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
    // Fortim ao fundo; centro livre para os personagens.
    { geometry: 'towerDoor', material: 'kit', position: [-1.4, 0, -1.4], rotation: [0, 0, 0], scale: [0.55, 0.55, 0.55] },
    { geometry: 'towerTop', material: 'kit', position: [-1.4, 1.1, -1.4], rotation: [0, 0, 0], scale: [0.55, 0.55, 0.55] },
    { geometry: 'dock', material: 'kit', position: [2.1, -0.42, 0.35], rotation: [0, 0, 0], scale: [0.6, 0.6, 0.6] },
    { geometry: 'boat', material: 'kit', position: [2.1, 0, 1.9], rotation: [0, 0, 0], scale: [0.48, 0.48, 0.48] },
    { geometry: 'palm', material: 'kit', position: [-2.5, 0, 0.5], rotation: [0, 2.4, 0], scale: [0.55, 0.55, 0.55] },
    { geometry: 'palmStraight', material: 'kit', position: [0.6, 0, -2.65], rotation: [0, 0.5, 0], scale: [0.65, 0.65, 0.65] },
    { geometry: 'chest', material: 'kit', position: [-0.9, 0, 0.2], rotation: [0, 0.3, 0], scale: [0.45, 0.45, 0.45] },
    { geometry: 'barrel', material: 'kit', position: [-2.3, 0, -0.65], rotation: [0, 0, 0], scale: [0.35, 0.35, 0.35] },
    { geometry: 'crate', material: 'kit', position: [-0.1, 0, -1.25], rotation: [0, 0.2, 0], scale: [0.4, 0.4, 0.4] },
    { geometry: 'rocks', material: 'kit', position: [-1.6, 0, 2.1], rotation: [0, 0, 0], scale: [0.23, 0.23, 0.23] },
  ],
};

export async function createGeometries(gl) {
  const primitives = window.twgl.primitives;
  const models = {
    boat: 'boat-row-large', tower: 'tower-base', towerDoor: 'tower-base-door',
    towerTop: 'tower-top', palm: 'palm-bend', palmStraight: 'palm-straight',
    chest: 'chest', barrel: 'barrel', crate: 'crate',
    dock: 'structure-platform-dock-small', cannon: 'cannon', rocks: 'rocks-a',
  };
  const imported = {};
  await Promise.all(Object.entries(models).map(async ([name, file]) => {
    imported[name] = await loadOBJ(gl, file + '.obj');
  }));
  return {
    ...imported,
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

// Bateria costeira: pedestal fixo e canhao girando no eixo Y.
addObject({
  position: [1.85, 0, -1.65],
  children: [
    { geometry: 'cylinder', material: 'stone', position: [0, 0.15, 0], scale: [0.95, 0.25, 0.95] },
    {
      position: [0, 0.3, 0],
      spin: [0, 0.35, 0],
      children: [
        { geometry: 'cannon', material: 'kit', scale: [0.55, 0.55, 0.55] },
      ],
    },
  ],
});
