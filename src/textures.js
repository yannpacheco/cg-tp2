// A areia usa repetição e filtro suave; a paleta Kenney permanece separada.
export async function loadSand(gl) {
  const image = new Image();
  image.src = new URL('../assets/textures/sand.jpg', import.meta.url).href;
  await image.decode();
  return window.twgl.createTexture(gl, {
    src: image, flipY: true,
    min: gl.LINEAR_MIPMAP_LINEAR, mag: gl.LINEAR,
    wrap: gl.REPEAT,
  });
}

// Atlas separado para os modelos Quaternius.
export async function loadPirateAtlas(gl) {
  const image = new Image();
  image.src = new URL('../assets/models/quaternius/Atlas_Pirate.png', import.meta.url).href;
  await image.decode();
  return window.twgl.createTexture(gl, {
    src: image, flipY: true,
    min: gl.LINEAR_MIPMAP_LINEAR, mag: gl.LINEAR,
    wrap: gl.CLAMP_TO_EDGE,
  });
}
