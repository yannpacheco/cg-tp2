// Leitor simples: posições, normais e faces dos OBJ usados neste projeto.
export function parseOBJ(text) {
  const vertices = [[0, 0, 0]];
  const normals = [[0, 1, 0]];
  const position = [];
  const normal = [];
  for (const line of text.split('\n')) {
    const [type, ...values] = line.trim().split(/\s+/);
    if (type === 'v') vertices.push(values.slice(0, 3).map(Number));
    if (type === 'vn') normals.push(values.map(Number));
    if (type !== 'f') continue;
    const face = values.map(value => value.split('/').map(Number));
    // Divide polígonos em triângulos.
    for (let i = 1; i < face.length - 1; i++) {
      for (const indices of [face[0], face[i], face[i + 1]]) {
        const v = indices[0] < 0 ? vertices.length + indices[0] : indices[0];
        const n = indices[2] < 0 ? normals.length + indices[2] : indices[2];
        if (!vertices[v] || !normals[n]) throw new Error('OBJ sem posição ou normal válida.');
        position.push(...vertices[v]);
        normal.push(...normals[n]);
      }
    }
  }
  if (!position.length) throw new Error('OBJ sem faces.');
  return { position: { numComponents: 3, data: position }, normal: { numComponents: 3, data: normal } };
}

export async function loadOBJ(gl, filename) {
  const response = await fetch(new URL('../assets/models/' + filename, import.meta.url));
  if (!response.ok) throw new Error('Não foi possível carregar ' + filename);
  return window.twgl.createBufferInfoFromArrays(gl, parseOBJ(await response.text()));
}
