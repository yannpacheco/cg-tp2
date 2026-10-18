import { getWaterOffset } from './water.js';
import { setupSeagulls, updateSeagulls } from './seagulls.js';
import { createSandVertices, getSandHeight } from './terrain.js';
import { setupWind, updateWind } from './wind.js';
import { loadOBJ } from './obj-loader.js';

export const scene = {
  time: 0,
  waveIntensity: 1,
  islandRadius: 5.5,
  seaRadius: 8.5,
  backgroundColor: [0.65, 0.8, 0.9, 1],
  lightingEnabled: true,
  night: false,
  nightAmount: 0,
  // Direção da superfície para a luz, em coordenadas da cena.
  light: { direction: [1, 2, 3], ambient: 0.25 },
  materials: {
    pirate: { color: [1, 1, 1, 1], textured: true, texture: 'pirate' },
    water: { color: [0.16, 0.57, 0.72, 1], ambient: 0.7, water: true },
    oceanBase: { color: [0.08, 0.4, 0.53, 1], ambient: 0.7 },
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
    { geometry: 'water', material: 'water', position: [0, -0.2, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    { geometry: 'ground', material: 'ground', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    // O hemisferio acompanha a borda do mar, formando uma base unica.
    { geometry: 'base', material: 'oceanBase', position: [0, -0.2, 0], rotation: [0, 0, 0], scale: [1, 0.85, 1] },
    { geometry: 'islandEdge', material: 'base', position: [0, -0.1, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    // Casa e tesouro a esquerda; o porto ocupa a borda direita.
    { geometry: 'house', material: 'pirate', position: [-1.2, 0.014, -2.2], rotation: [0, 0, 0], scale: [0.38, 0.38, 0.38] },
    { geometry: 'dock', material: 'pirate', position: [4.65, -0.1, 0], rotation: [0, 0, 0], scale: [0.85, 0.6, 0.65] },
    { geometry: 'ship', material: 'pirate', position: [6.8, 0.2, 0], rotation: [0, Math.PI / 2, 0], scale: [0.36, 0.36, 0.36], orbit: { radius: 6.8, angle: 0, speed: 0.12 } },
    { geometry: 'palm', material: 'kit', position: [-3.7, 0, 0.2], rotation: [0, 2.4, 0], scale: [0.65, 0.65, 0.65] },
    { geometry: 'palmStraight', material: 'kit', position: [0.8, 0, -3.8], rotation: [0, 0.5, 0], scale: [0.75, 0.75, 0.75] },
    { geometry: 'chest', material: 'pirate', position: [-1.1, 0.012, 0.9], rotation: [0, 0.3, 0], scale: [0.55, 0.55, 0.55] },
    { geometry: 'barrel', material: 'pirate', position: [-2.8, 0, -0.9], rotation: [0, 0, 0], scale: [0.9, 0.9, 0.9] },
    { geometry: 'barrel', material: 'pirate', position: [-2.3, 0, -0.75], rotation: [0, 0, 0], scale: [0.65, 0.65, 0.65] },
    { geometry: 'crate', material: 'kit', position: [-0.1, 0, -1.25], rotation: [0, 0.2, 0], scale: [0.4, 0.4, 0.4] },
    { geometry: 'goldBag', material: 'pirate', position: [-1.9, 0.025, 1.1], rotation: [0, 0.4, 0], scale: [0.6, 0.6, 0.6] },
    { geometry: 'coins', material: 'pirate', position: [-0.8, 0.001, 1.65], rotation: [0, 0, 0], scale: [0.8, 0.8, 0.8] },
    { geometry: 'anchor', material: 'pirate', position: [3.7, 0.005, 1.3], rotation: [0, -0.5, 0], scale: [1.2, 1.2, 1.2] },
    // Rochas TWGL preservadas para o requisito de primitivas.
    { geometry: 'rock', material: 'stone', position: [-2.9, 0.38, 2.5], rotation: [0, 0.3, 0], scale: [0.48, 0.38, 0.4] },
    { geometry: 'rock', material: 'stoneLight', position: [-3.4, 0.22, 2.65], rotation: [0, 1.1, 0], scale: [0.3, 0.22, 0.28] },
    { geometry: 'rock', material: 'stone', position: [-2.5, 0.17, 2.85], rotation: [0, -0.5, 0], scale: [0.25, 0.17, 0.23] },
  ],
};

export async function createGeometries(gl) {
  const primitives = window.twgl.primitives;
  const models = {
    seagull: 'seagull/Flying gull Texture 2',
    palm: 'palm-bend', palmStraight: 'palm-straight', crate: 'crate', cannon: 'cannon',
    ship: 'quaternius/Ship_Large', captain: 'quaternius/Characters_Captain_Barbarossa',
    house: 'quaternius/Environment_House1', dock: 'quaternius/Environment_Dock',
    chest: 'quaternius/Prop_Chest_Gold', barrel: 'quaternius/Prop_Barrel',
    anchor: 'quaternius/Prop_Anchor', goldBag: 'quaternius/Prop_GoldBag', coins: 'quaternius/Prop_Coins',
  };
  const ground = createSandVertices(window.twgl, scene.islandRadius);
  const imported = {};
  await Promise.all(Object.entries(models).map(async ([name, file]) => {
    imported[name] = await loadOBJ(gl, file + '.obj', name === 'seagull' ? 1.2 : null);
  }));
  return {
    ...imported,
    water: primitives.createDiscBufferInfo(gl, scene.seaRadius, 128, 56),
    ground: window.twgl.createBufferInfoFromArrays(gl, ground),
    // Latitude de PI/2 a PI: apenas a metade abaixo de Y = 0.
    base: primitives.createSphereBufferInfo(gl, scene.seaRadius, 64, 24, Math.PI / 2, Math.PI),
    // Fecha a pequena altura entre a areia e a superficie do mar.
    islandEdge: primitives.createCylinderBufferInfo(gl, scene.islandRadius, 0.2, 48, 1, false, false),
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
  scene.time += deltaTime;
  updateWind(scene, deltaTime);
  updateSeagulls(scene, deltaTime);
  function updateObject(object) {
    if (object.orbit) {
      const orbit = object.orbit;
      orbit.angle = (orbit.angle + orbit.speed * deltaTime) % (Math.PI * 2);
      object.position[0] = Math.cos(orbit.angle) * orbit.radius;
      object.position[2] = Math.sin(orbit.angle) * orbit.radius;
      // A proa do modelo aponta para -X; acompanha a tangente da volta.
      object.rotation[1] = Math.PI / 2 - orbit.angle;
      object.position[1] = 0.2 + getWaterOffset(object.position[0], object.position[2], scene.time, scene.seaRadius, scene.waveIntensity, scene.islandRadius);
      object.rotation[0] = Math.sin(scene.time * 1.1) * 0.015 * Math.min(scene.waveIntensity, 8);
      object.rotation[2] = Math.sin(scene.time * 0.9) * 0.02 * Math.min(scene.waveIntensity, 8);
    }
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
  position: [2.3, 0, -2.3],
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

// Tres locais livres sobre a ilha; P muda apenas posicao e orientacao.
export const characterPoses = [
  { position: [0.3, 0.006, 1.1], rotation: [0, 0, 0] },
  { position: [3.1, 0.006, 0.2], rotation: [0, Math.PI / 2, 0] },
  { position: [1.3, 0.006, -0.3], rotation: [0, -Math.PI / 3, 0] },
];
scene.characterPose = 0;
export const captain = addObject({ geometry: 'captain', material: 'pirate', scale: [0.9, 0.9, 0.9] });

function applyCharacterPose() {
  const pose = characterPoses[scene.characterPose];
  captain.position = [...pose.position];
  captain.position[1] += getSandHeight(pose.position[0], pose.position[2]);
  captain.rotation = [...pose.rotation];
}
export function nextCharacterPose() {
  scene.characterPose = (scene.characterPose + 1) % characterPoses.length;
  applyCharacterPose();
}
// Apoia os objetos existentes na nova altura da areia.
for (const object of scene.objects) {
  if (object === captain || ['water', 'ground', 'base', 'islandEdge', 'ship'].includes(object.geometry)) continue;
  const [x, , z] = object.position;
  object.position[1] += getSandHeight(x, z);
}
applyCharacterPose();
setupWind(scene, addObject);

setupSeagulls(scene, addObject);
