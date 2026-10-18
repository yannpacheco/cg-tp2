// Uma passagem curta, sem acumular bandos ao apertar a tecla varias vezes.
export function setupSeagulls(scene, addObject) {
  scene.materials.seagull = { color: [1, 1, 1, 1], textured: true, texture: 'seagull', ambient: 0.65 };
  scene.seagulls = { active: false, time: 0, duration: 10, birds: [], audio: null, audioError: false };
  for (let i = 0; i < 3; i++) {
    scene.seagulls.birds.push(addObject({ geometry: 'seagull', material: 'seagull', visible: false }));
  }
}

export function setupSeagullAudio(scene) {
  const audio = new Audio(new URL('../assets/audio/seagull.wav', import.meta.url).href);
  audio.preload = 'auto';
  audio.loop = true;
  audio.addEventListener('error', () => { scene.seagulls.audioError = true; });
  scene.seagulls.audio = audio;
}

export function startSeagulls(scene) {
  const flock = scene.seagulls;
  if (flock.active) return;
  flock.active = true;
  flock.time = 0;
  updateSeagulls(scene, 0);
  if (flock.audio) {
    flock.audio.currentTime = 0;
    flock.audio.volume = 0;
    // play ocorre na tecla/clique, respeitando o bloqueio de autoplay.
    flock.audio.play().catch(() => { flock.audioError = true; });
  }
}

export function stopSeagulls(scene) {
  const flock = scene.seagulls;
  flock.active = false;
  for (const bird of flock.birds) bird.visible = false;
  if (flock.audio) {
    flock.audio.pause();
    flock.audio.currentTime = 0;
  }
}

export function updateSeagulls(scene, deltaTime) {
  const flock = scene.seagulls;
  if (!flock.active) return;
  flock.time += deltaTime;
  if (flock.time >= flock.duration) {
    stopSeagulls(scene);
    return;
  }
  const progress = flock.time / flock.duration;
  flock.birds.forEach((bird, i) => {
    bird.visible = true;
    bird.position = [-12 + progress * 24 - i * 0.9, 4.7 + i * 0.2 + Math.sin(flock.time * 1.4 + i) * 0.15, -2.5 + progress * 5 + (i === 1 ? -0.9 : i === 2 ? 0.9 : 0)];
    // O bico deste OBJ aponta para +X, entao o rumo precisa de menos 90 graus.
    bird.rotation = [0, -Math.atan2(5, 24), Math.sin(flock.time + i) * 0.04];
  });
  // Aproximacao e afastamento sonoros durante a passagem.
  if (flock.audio) flock.audio.volume = 0.35 * Math.sin(Math.PI * progress);
}
