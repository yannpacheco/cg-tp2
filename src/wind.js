// Vento leve: palmeiras oscilam e pequenos graos cruzam a ilha.
export function setupWind(scene, addObject) {
  scene.wind = { enabled: true, direction: [0.96, 0, 0.28], speed: 0.55, time: 0, particles: [] };
  scene.materials.dust = { color: [0.92, 0.82, 0.6, 1], ambient: 0.8 };
  const palms = scene.objects.filter(o => o.geometry === 'palm' || o.geometry === 'palmStraight');
  palms.forEach((palm, index) => { palm.windPhase = index * 1.7; });
  scene.wind.palms = palms;

  for (let i = 0; i < 28; i++) {
    const particle = addObject({ geometry: 'dust', material: 'dust', visible: true });
    resetParticle(particle);
    particle.age = Math.random() * particle.lifetime;
    scene.wind.particles.push(particle);
  }
}

function resetParticle(particle) {
  // Nasce dentro do disco, perto do solo.
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.sqrt(Math.random()) * 3.2;
  particle.position = [Math.cos(angle) * radius, 0.08 + Math.random() * 0.35, Math.sin(angle) * radius];
  particle.age = 0;
  particle.lifetime = 3 + Math.random() * 3;
  particle.size = 0.012 + Math.random() * 0.015;
  particle.scale = [0, 0, 0];
}

export function updateWind(scene, deltaTime) {
  const wind = scene.wind;
  if (wind.enabled) wind.time += deltaTime;
  for (const palm of wind.palms) {
    const sway = wind.enabled ? 0.02 + Math.sin(wind.time * 1.6 + palm.windPhase) * 0.025 : 0;
    // Inclina na direcao do vento sem mudar a rotacao original.
    palm.sway = [sway * wind.direction[2], 0, -sway * wind.direction[0]];
  }
  for (const particle of wind.particles) {
    particle.visible = wind.enabled;
    if (!wind.enabled) continue;
    particle.age += deltaTime;
    particle.position[0] += wind.direction[0] * wind.speed * deltaTime;
    particle.position[2] += wind.direction[2] * wind.speed * deltaTime;
    if (particle.age >= particle.lifetime || Math.hypot(particle.position[0], particle.position[2]) > 3.7) {
      resetParticle(particle);
    }
    // Encolhe nas pontas da vida para surgir e desaparecer suavemente.
    const size = Math.max(0.0001, particle.size * Math.sin(Math.PI * particle.age / particle.lifetime));
    particle.scale = [size * 1.6, size * 0.55, size];
  }
}
