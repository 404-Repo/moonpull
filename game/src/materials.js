// Ground and sea. Both are MeshStandardMaterial patched with onBeforeCompile, so the render rig's
// lighting, shadows and aerial haze still reach them (rig.js chains existing hooks).
import * as THREE from 'three';

export const SEA = {
  uSea: { value: 0 },          // current sea level, metres
  uWet: { value: 0 },          // the highest the sea has been lately: sand below it is still wet
  uTime: { value: 0 },
  uHeight: { value: null },    // half-float heightfield
  uWorld: { value: new THREE.Vector4() }, // x0, z0, 1/width, 1/depth
};

const COMMON = /* glsl */`
uniform float uSea; uniform float uWet; uniform float uTime;
uniform sampler2D uHeight; uniform vec4 uWorld;
varying vec3 vWPos;
float hAt(vec2 xz){ return texture2D(uHeight, (xz - uWorld.xy) * uWorld.zw).r; }
float pathAt(vec2 xz){ return texture2D(uHeight, (xz - uWorld.xy) * uWorld.zw).g; }
vec2 h22(vec2 p){ return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }
float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), u.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), u.x), u.y); }
float fb(vec2 p){ float a = 0.0, s = 0.5; for (int i = 0; i < 4; i++){ a += s * vn(p); p *= 2.03; s *= 0.5; } return a; }
`;

function patchVertexWorldPos(shader) {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
    .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
}

export function groundMaterial() {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0 });
  m.name = 'ground';
  m.userData.noSurfaces = true;
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, SEA);
    patchVertexWorldPos(shader);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + COMMON)
      .replace('#include <color_fragment>', /* glsl */`
        #include <color_fragment>
        {
          vec3 wn = normalize(vec3(0.0, 1.0, 0.0));
          float y = vWPos.y;
          vec2 p = vWPos.xz;
          // slope from the heightfield itself, so tiles agree at their seams
          float e = 1.0;
          vec3 gn = normalize(vec3(hAt(p - vec2(e, 0.0)) - hAt(p + vec2(e, 0.0)), 2.0 * e, hAt(p - vec2(0.0, e)) - hAt(p + vec2(0.0, e))));
          float slope = 1.0 - gn.y;
          float n1 = fb(p * 0.08), n2 = fb(p * 0.6), n3 = vn(p * 3.1);
          vec3 sand = mix(vec3(0.78, 0.66, 0.49), vec3(0.86, 0.76, 0.58), n1);
          sand *= 0.92 + 0.12 * n2;
          // ripples on the low sand
          float rip = sin(dot(p, vec2(0.9, 0.35)) * 3.2 + n2 * 4.0) * 0.5 + 0.5;
          vec3 wetSand = mix(vec3(0.42, 0.36, 0.28), vec3(0.50, 0.43, 0.33), rip * 0.6 + n3 * 0.3);
          vec3 grass = mix(vec3(0.30, 0.40, 0.17), vec3(0.50, 0.53, 0.24), n1) * (0.82 + 0.3 * n2);
          grass = mix(grass, vec3(0.62, 0.56, 0.34), smoothstep(0.55, 0.8, n2) * 0.5);   // dry tufts
          vec3 rock = mix(vec3(0.44, 0.38, 0.33), vec3(0.66, 0.56, 0.44), n1);
          vec3 an = abs(gn); vec3 tw = an / (an.x + an.y + an.z);
          vec3 wp = vWPos;
          float tri = fb(vec2(wp.z, wp.y * 2.4) * 0.3) * tw.x + fb(wp.xz * 0.3) * tw.y + fb(vec2(wp.x, wp.y * 2.4) * 0.3) * tw.z;
          float trf = vn(vec2(wp.z, wp.y * 3.0) * 1.6) * tw.x + vn(wp.xz * 1.6) * tw.y + vn(vec2(wp.x, wp.y * 3.0) * 1.6) * tw.z;
          float band = smoothstep(0.35, 0.9, sin(wp.y * (1.4 + 0.8 * vn(wp.xz * 0.05)) + tri * 7.0 + vn(wp.xz * 0.12) * 4.0) * 0.5 + 0.5);
          rock *= 0.72 + 0.32 * tri + 0.14 * trf;
          rock = mix(rock, rock * vec3(0.74, 0.66, 0.6), band * 0.55);
          rock = mix(rock, vec3(0.36, 0.40, 0.22), smoothstep(0.6, 0.85, tri) * smoothstep(0.75, 0.95, gn.y + 0.35) * 0.6);
          vec3 weed = mix(vec3(0.25, 0.29, 0.13), vec3(0.33, 0.33, 0.16), n2);
          vec3 c = sand;
          c = mix(c, grass, smoothstep(2.4, 3.6, y + n1 * 1.5) * (1.0 - smoothstep(0.35, 0.6, slope)));
          c = mix(c, rock, smoothstep(0.32, 0.55, slope + n2 * 0.15));
          // cobbles where the paths run: a jittered cell pattern, each stone its own tone
          float pth = pathAt(p);
          if (pth > 0.01) {
            vec2 q = p * 2.3; vec2 iq = floor(q), fq = fract(q); float d1 = 9.0, d2 = 9.0; vec2 cid = vec2(0.0);
            for (int yy = -1; yy <= 1; yy++) for (int xx = -1; xx <= 1; xx++) {
              vec2 o = vec2(float(xx), float(yy)); vec2 r = o + h22(iq + o) * 0.85 - fq; float dd = dot(r, r);
              if (dd < d1) { d2 = d1; d1 = dd; cid = iq + o; } else if (dd < d2) d2 = dd; }
            float edge = smoothstep(0.02, 0.16, sqrt(d2) - sqrt(d1));
            vec3 stone = mix(vec3(0.46, 0.45, 0.42), vec3(0.62, 0.58, 0.50), h22(cid).x) * (0.85 + 0.2 * h22(cid).y) * (0.9 + 0.2 * n1);
            vec3 cob = mix(mix(vec3(0.22, 0.24, 0.16), vec3(0.24, 0.22, 0.19), n3), stone, edge);
            c = mix(c, cob, smoothstep(0.2, 0.6, pth));
          }
          // below the last high water: wet, darker, weed on the low stones
          float wet = 1.0 - smoothstep(uWet - 0.05, uWet + 0.35, y + n3 * 0.15);
          c = mix(c, wetSand * mix(vec3(1.0), rock / max(sand, vec3(0.1)), smoothstep(0.32, 0.55, slope) * 0.6), wet * 0.85);
          c = mix(c, weed, wet * smoothstep(0.55, 0.75, n2 + slope * 0.6) * (1.0 - smoothstep(uSea - 2.5, uSea - 0.2, y) * 0.0));
          // deep sea floor: cooler, darker
          c = mix(c, vec3(0.30, 0.33, 0.30), smoothstep(-1.5, -6.0, y) * 0.7);
          diffuseColor.rgb = pow(c, vec3(2.2));
        }`)
      .replace('#include <roughnessmap_fragment>', /* glsl */`
        #include <roughnessmap_fragment>
        { float wetR = 1.0 - smoothstep(uWet - 0.05, uWet + 0.3, vWPos.y);
          roughnessFactor = mix(roughnessFactor, 0.32, wetR * 0.85); }`);
  };
  m.customProgramCacheKey = () => 'moonpull-ground';
  return m;
}

export function seaMaterial() {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.08, metalness: 0.0, transparent: true, depthWrite: false });
  m.name = 'sea';
  m.userData.noSurfaces = true;
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, SEA);
    patchVertexWorldPos(shader);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + COMMON)
      .replace('#include <color_fragment>', /* glsl */`
        #include <color_fragment>
        float ground = hAt(vWPos.xz);
        float depth = uSea - ground;
        if (depth < -0.02) discard;
        float t = uTime;
        vec2 p = vWPos.xz;
        float sw = fb(p * 0.18 + vec2(t * 0.05, t * 0.03));
        vec3 shallow = vec3(0.36, 0.70, 0.66), mid = vec3(0.10, 0.42, 0.45), deep = vec3(0.04, 0.20, 0.25);
        vec3 wc = mix(shallow, mid, smoothstep(0.0, 1.6, depth));
        wc = mix(wc, deep, smoothstep(1.6, 6.0, depth));
        // foam: a band at the waterline that breathes, and streaks on the surface
        float edge = 1.0 - smoothstep(0.0, 0.35 + 0.15 * sw, depth);
        float lace = smoothstep(0.45, 0.75, fb(p * 1.6 + vec2(t * 0.25, -t * 0.18)));
        float foam = clamp(edge * (0.55 + 0.6 * lace), 0.0, 1.0);
        foam += smoothstep(0.78, 0.92, fb(p * 0.5 + vec2(-t * 0.04, t * 0.06))) * 0.18 * smoothstep(0.5, 3.0, depth);
        wc = mix(wc, vec3(0.93, 0.95, 0.92), clamp(foam, 0.0, 1.0));
        diffuseColor.rgb = pow(wc, vec3(2.2));
        diffuseColor.a = clamp(mix(0.42, 0.97, smoothstep(0.0, 2.2, depth)) + foam * 0.5, 0.0, 1.0);
        diffuseColor.a *= smoothstep(-0.02, 0.06, depth);
      `)
      .replace('#include <normal_fragment_maps>', /* glsl */`
        #include <normal_fragment_maps>
        {
          vec2 q = vWPos.xz; float t = uTime;
          float e = 0.35;
          float a0 = fb(q * 0.55 + vec2(t * 0.35, t * 0.22)) + 0.5 * fb(q * 1.7 - vec2(t * 0.5, -t * 0.3));
          float ax = fb((q + vec2(e, 0.0)) * 0.55 + vec2(t * 0.35, t * 0.22)) + 0.5 * fb((q + vec2(e, 0.0)) * 1.7 - vec2(t * 0.5, -t * 0.3));
          float az = fb((q + vec2(0.0, e)) * 0.55 + vec2(t * 0.35, t * 0.22)) + 0.5 * fb((q + vec2(0.0, e)) * 1.7 - vec2(t * 0.5, -t * 0.3));
          vec3 wn = normalize(vec3(-(ax - a0) * 0.55, 1.0, -(az - a0) * 0.55));
          normal = normalize((viewMatrix * vec4(wn, 0.0)).xyz);
        }`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = mix(0.06, 0.6, clamp(1.0 - smoothstep(0.0, 0.3, uSea - hAt(vWPos.xz)), 0.0, 1.0));`);
  };
  m.customProgramCacheKey = () => 'moonpull-sea';
  return m;
}
