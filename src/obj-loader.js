// Leitor simples: posições, normais e faces dos OBJ usados neste projeto.
export function parseOBJ(text) {
  const vertices = [[0, 0, 0]];
  const normals = [[0, 1, 0]];
  const texcoords = [[0, 0]];
  const texcoord = [];
  const position = [];
  const normal = [];
  for (const line of text.split('\n')) {
    const [type, ...values] = line.trim().split(/\s+/);
    if (type === 'v') vertices.push(values.slice(0, 3).map(Number));
    if (type === 'vt') texcoords.push(values.slice(0, 2).map(Number));
    if (type === 'vn') normals.push(values.map(Number));
    if (type !== 'f') continue;
    const face = values.map(value => value.split('/').map(Number));
    // Divide polígonos em triângulos.
    for (let i = 1; i < face.length - 1; i++) {
      for (const indices of [face[0], face[i], face[i + 1]]) {
        const v = indices[0] < 0 ? vertices.length + indices[0] : indices[0];
        const n = indices[2] < 0 ? normals.length + indices[2] : indices[2];
        if (!vertices[v] || !normals[n]) throw new Error('OBJ sem posição ou normal válida.');
        const t = indices[1] < 0 ? texcoords.length + indices[1] : indices[1];
        texcoord.push(...(texcoords[t] || [0, 0]));
        position.push(...vertices[v]);
        normal.push(...normals[n]);
      }
    }
  }
  if (!position.length) throw new Error('OBJ sem faces.');
  return { texcoord: { numComponents: 2, data: texcoord }, position: { numComponents: 3, data: position }, normal: { numComponents: 3, data: normal } };
}

export async function loadOBJ(gl, filename, size = null) {
  const response = await fetch(new URL('../assets/models/' + filename, import.meta.url));
  if (!response.ok) throw new Error('Não foi possível carregar ' + filename);
  const arrays = parseOBJ(await response.text());
  if (size !== null) {
    // Centraliza modelos de outra escala antes de coloca-los na cena.
    const data = arrays.position.data;
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < data.length; i++) {
      const axis = i % 3;
      min[axis] = Math.min(min[axis], data[i]);
      max[axis] = Math.max(max[axis], data[i]);
    }
    const scale = size / Math.max(...max.map((value, axis) => value - min[axis]));
    for (let i = 0; i < data.length; i++) {
      const axis = i % 3;
      data[i] = (data[i] - (min[axis] + max[axis]) / 2) * scale;
    }
  }
  return window.twgl.createBufferInfoFromArrays(gl, arrays);
}

// Uma imagem de paleta atende a todos os modelos do kit.
export async function loadPalette(gl) {
  const image = new Image();
  image.src = new URL('../assets/models/Textures/colormap.png', import.meta.url).href;
  await image.decode();
  return window.twgl.createTexture(gl, {
    src: image, flipY: true,
    min: gl.NEAREST, mag: gl.NEAREST,
    wrap: gl.CLAMP_TO_EDGE,
  });
}
