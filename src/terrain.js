// Ondulacoes largas com pequenas irregularidades, sem montes separados.
function smoothstep(a, b, value) {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function naturalHeight(x, z) {
  return 0.18
    + 0.09 * Math.sin(x * 0.85 + z * 0.4)
    + 0.055 * Math.sin(z * 1.2 - x * 0.3 + 1.4)
    + 0.025 * Math.sin(x * 2.1 - z * 0.8 + Math.sin(z * 0.7));
}

export function getSandHeight(x, z) {
  let height = naturalHeight(x, z);
  // Uma base nivelada sob a casa evita cantos flutuando.
  const houseDistance = Math.hypot((x + 1.5) / 2.9, (z + 2.2) / 1.05);
  const transition = smoothstep(0.8, 1.8, houseDistance);
  height = naturalHeight(-1.5, -2.2) * (1 - transition) + height * transition;
  // O relevo encontra a borda da praia sem degraus.
  return height * (1 - smoothstep(4.7, 5.5, Math.hypot(x, z)));
}

export function createSandVertices(twgl, radius) {
  const ground = twgl.primitives.createDiscVertices(radius, 128, 56);
  const step = 0.02;
  for (let i = 0; i < ground.position.length / 3; i++) {
    const x = ground.position[i * 3];
    const z = ground.position[i * 3 + 2];
    ground.position[i * 3 + 1] = getSandHeight(x, z);
    // Diferencas de altura fornecem a inclinacao para a iluminacao.
    const slopeX = (getSandHeight(x + step, z) - getSandHeight(x - step, z)) / (2 * step);
    const slopeZ = (getSandHeight(x, z + step) - getSandHeight(x, z - step)) / (2 * step);
    const length = Math.hypot(slopeX, 1, slopeZ);
    ground.normal.set([-slopeX / length, 1 / length, -slopeZ / length], i * 3);
    ground.texcoord[i * 2] = x / (radius * 2) + 0.5;
    ground.texcoord[i * 2 + 1] = z / (radius * 2) + 0.5;
  }
  return ground;
}
