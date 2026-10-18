import { shadowShader } from './shadows.js';
// Ondas baixas; a borda fica fixa para fechar com o hemisferio.
export function getWaterOffset(x, z, time, radius, intensity = 1, islandRadius = 5.5) {
  const t = Math.max(0, Math.min(1, (Math.hypot(x, z) - (radius - 0.5)) / 0.5));
  const edge = 1 - t * t * (3 - 2 * t);
  const coastT = Math.max(0, Math.min(1, (Math.hypot(x, z) - islandRadius) / 0.9));
  const coast = coastT * coastT * (3 - 2 * coastT);
  return intensity * coast * (0.05 * Math.sin(x * 1.5 + z * 0.7 - time * 1.4)
    + 0.03 * Math.sin(z * 2.2 - x * 0.6 + time * 0.9)) * edge;
}

export const waterVertexShader = `
precision mediump float;
attribute vec4 position;
uniform mat4 u_matrix;
uniform mat4 u_world;
uniform mat4 u_lightMatrix;
varying vec4 v_shadowPosition;
uniform float u_time;
uniform float u_seaRadius;
uniform float u_waveIntensity;
uniform float u_islandRadius;
varying vec3 v_worldPosition;
varying vec3 v_normal;

float wave(vec2 p) {
  float edge = 1.0 - smoothstep(u_seaRadius - 0.5, u_seaRadius, length(p));
  float coast = smoothstep(u_islandRadius, u_islandRadius + 0.9, length(p));
  return u_waveIntensity * coast * (0.05 * sin(p.x * 1.5 + p.y * 0.7 - u_time * 1.4)
    + 0.03 * sin(p.y * 2.2 - p.x * 0.6 + u_time * 0.9)) * edge;
}
void main() {
  vec4 p = position;
  p.y += wave(p.xz);
  float dx = (wave(p.xz + vec2(0.02, 0.0)) - wave(p.xz - vec2(0.02, 0.0))) / 0.04;
  float dz = (wave(p.xz + vec2(0.0, 0.02)) - wave(p.xz - vec2(0.0, 0.02))) / 0.04;
  v_normal = normalize(vec3(-dx, 1.0, -dz));
  v_worldPosition = (u_world * p).xyz;
  v_shadowPosition = u_lightMatrix * vec4(v_worldPosition, 1.0);
  gl_Position = u_matrix * p;
}
`;

export const waterFragmentShader = `
precision mediump float;
${shadowShader}
uniform float u_night;
uniform float u_time;
uniform float u_islandRadius;
uniform vec3 u_cameraPosition;
uniform vec3 u_lightDirection;
uniform bool u_lightingEnabled;
varying vec3 v_worldPosition;
varying vec3 v_normal;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(cell), hash(cell + vec2(1.0, 0.0)), f.x),
    mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), f.x), f.y);
}
void main() {
  vec2 p = v_worldPosition.xz;
  float radius = length(p);
  // Dois padroes em movimento quebram a aparencia de cor chapada.
  float detail = noise(p * 3.0 + vec2(u_time * 0.15, -u_time * 0.08));
  detail = detail * 0.65 + noise(p * 6.0 - u_time * 0.12) * 0.35;
  float shallow = 1.0 - smoothstep(u_islandRadius, u_islandRadius + 2.6, radius);
  vec3 color = mix(vec3(0.025, 0.28, 0.43), vec3(0.12, 0.62, 0.64), shallow);
  color *= 0.88 + detail * 0.24;
  // Filetes suaves de espuma junto a areia, sem formar uma faixa solida.
  float shore = abs(radius - u_islandRadius - 0.06 - sin(atan(p.y, p.x) * 9.0 + u_time) * 0.04);
  float foam = (1.0 - smoothstep(0.02, 0.17, shore)) * smoothstep(0.3, 0.7, detail);
  color = mix(color, vec3(0.76, 0.9, 0.85), foam * 0.5);
  if (u_lightingEnabled) {
    vec3 normal = normalize(v_normal);
    vec3 light = normalize(u_lightDirection);
    vec3 view = normalize(u_cameraPosition - v_worldPosition);
    float diffuse = max(dot(normal, light), 0.0);
    float highlight = pow(max(dot(normal, normalize(light + view)), 0.0), 64.0);
    float fresnel = pow(1.0 - max(dot(normal, view), 0.0), 3.0);
    float visibility = shadowVisibility(diffuse);
    highlight *= visibility;
    color = color * (0.45 + diffuse * 0.55 * visibility) + vec3(0.85, 0.93, 1.0) * highlight * 0.3;
    color = mix(color, vec3(0.4, 0.65, 0.74), fresnel * 0.2);
  }
  if (u_lightingEnabled) color *= mix(vec3(1.0), vec3(0.22, 0.32, 0.52), u_night);
  gl_FragColor = vec4(color, 1.0);
}
`;
