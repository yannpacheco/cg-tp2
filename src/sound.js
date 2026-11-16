// Controle unico para o mar de fundo e os efeitos das gaivotas.
export function setupSound(scene) {
  const ambient = new Audio(new URL('../assets/audio/beach.mp3', import.meta.url).href);
  const music = new Audio(new URL('../assets/audio/musica.mp3', import.meta.url).href);
  const grunt = new Audio(new URL('../assets/audio/grunt.mp3', import.meta.url).href);
  ambient.loop = true;
  ambient.preload = 'auto';
  ambient.volume = 0.05;
  music.loop = true;
  music.preload = 'auto';
  music.volume = 0.2;
  grunt.preload = 'auto';
  scene.sound = { enabled: false, started: false, error: false, ambient, music, grunt };
  ambient.addEventListener('error', () => { scene.sound.error = true; });
  music.addEventListener('error', () => { scene.sound.error = true; });
  scene.seagulls.audio.muted = true;
}

export function playPirateGrunt(scene) {
  scene.sound.grunt.currentTime = 0;
  scene.sound.grunt.play().catch(error => {
    if (error.name !== 'AbortError') console.error('Não foi possível reproduzir o grunhido do pirata.', error);
  });
}

export function syncSound(scene) {
  const sound = scene.sound;
  scene.seagulls.audio.muted = !sound.enabled;
  if (!sound.enabled || document.hidden) {
    sound.ambient.pause();
    sound.music.pause();
    return;
  }
  sound.ambient.play().catch(error => {
    if (error.name === 'AbortError') return;
    sound.error = true;
    sound.enabled = false;
    sound.music.pause();
    scene.seagulls.audio.muted = true;
  });
  sound.music.play().catch(error => {
    if (error.name === 'AbortError') return;
    sound.error = true;
    sound.music.pause();
    console.error('Não foi possível reproduzir a música de fundo.', error);
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
