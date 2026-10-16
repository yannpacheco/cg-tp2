import { setupWind, updateWind } from './wind.js';
import { loadOBJ } from './obj-loader.js';

export const scene = {
  backgroundColor: [0.65, 0.8, 0.9, 1],
  lightingEnabled: true,
  // Direção da superfície para a luz, em coordenadas da cena.
  light: { direction: [1, 2, 3], ambient: 0.25 },
  materials: {
    kit: { color: [1, 1, 1, 1], textured: true },
    ground: { color: [1, 1, 1, 1], textured: true, texture: 'sand', textureScale: [4, 4], tint: [1, 0.9, 0.68], tintStrength: 0.65, ambient: 0.65 },
    base: { color: [0.5, 0.35, 0.2, 1] },
    stone: { color: [0.48, 0.5, 0.55, 1] },
    stoneLight: { color: [0.58, 0.6, 0.64, 1] },
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
    // Rochas de poucas faces, apoiadas no chao e com tamanhos diferentes.
    { geometry: 'rock', material: 'stone', position: [-1.65, 0.38, 2.05], rotation: [0, 0.3, 0], scale: [0.48, 0.38, 0.4] },
    { geometry: 'rock', material: 'stoneLight', position: [-2.15, 0.22, 2.2], rotation: [0, 1.1, 0], scale: [0.3, 0.22, 0.28] },
    { geometry: 'rock', material: 'stone', position: [-1.25, 0.17, 2.4], rotation: [0, -0.5, 0], scale: [0.25, 0.17, 0.23] },
  ],
};

export async function createGeometries(gl) {
  const primitives = window.twgl.primitives;
  const models = {
    boat: 'boat-row-large', tower: 'tower-base', towerDoor: 'tower-base-door',
    towerTop: 'tower-top', palm: 'palm-bend', palmStraight: 'palm-straight',
    chest: 'chest', barrel: 'barrel', crate: 'crate',
    dock: 'structure-platform-dock-small', cannon: 'cannon',
  };
  // Mapeia X/Z em UV para evitar distorcer a areia no centro do disco.
  const ground = primitives.createDiscVertices(4, 32);
  for (let i = 0; i < ground.position.length / 3; i++) {
    ground.texcoord[i * 2] = ground.position[i * 3] / 8 + 0.5;
    ground.texcoord[i * 2 + 1] = ground.position[i * 3 + 2] / 8 + 0.5;
  }
  const imported = {};
  await Promise.all(Object.entries(models).map(async ([name, file]) => {
    imported[name] = await loadOBJ(gl, file + '.obj');
  }));
  return {
    ...imported,
    ground: window.twgl.createBufferInfoFromArrays(gl, ground),
    // Latitude de PI/2 a PI: apenas a metade abaixo de Y = 0.
    base: primitives.createSphereBufferInfo(gl, 4, 32, 16, Math.PI / 2, Math.PI),
    rock: primitives.createSphereBufferInfo(gl, 1, 7, 4),
    dust: primitives.createSphereBufferInfo(gl, 1, 5, 3),
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
  updateWind(scene, deltaTime);
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

setupWind(scene, addObject);
