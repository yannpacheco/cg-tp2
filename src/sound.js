// Controle unico para o mar de fundo e os efeitos das gaivotas.
export function setupSound(scene) {
  const ambient = new Audio(new URL('../assets/audio/beach.mp3', import.meta.url).href);
  ambient.loop = true;
  ambient.preload = 'auto';
  ambient.volume = 0.05;
  scene.sound = { enabled: false, started: false, error: false, ambient };
  ambient.addEventListener('error', () => { scene.sound.error = true; });
  scene.seagulls.audio.muted = true;
}

export function syncSound(scene) {
  const sound = scene.sound;
  scene.seagulls.audio.muted = !sound.enabled;
  if (!sound.enabled || document.hidden) {
    sound.ambient.pause();
    return;
  }
  sound.ambient.play().catch(error => {
    if (error.name === 'AbortError') return;
    sound.error = true;
    sound.enabled = false;
    scene.seagulls.audio.muted = true;
  });
}

export function toggleSound(scene) {
  scene.sound.started = true;
  scene.sound.enabled = !scene.sound.enabled;
  scene.sound.error = false;
  syncSound(scene);
}

export function unlockSound(scene) {
  // A primeira interacao libera audio; desligar depois continua sendo respeitado.
  if (!scene.sound.started) toggleSound(scene);
}
