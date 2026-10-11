/**
 * Lights the paint. The colour canvas holds pigment, the height canvas holds
 * how thick it was laid; this shader turns the height into surface normals
 * and lights them, so ridges and bristle grooves catch a moving light the way
 * a real oil painting does under a gallery lamp.
 */

const VS = `
attribute vec2 p;
varying vec2 v;
void main() {
  v = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uColor;
uniform sampler2D uHeight;
uniform vec2 uTexel;
uniform vec2 uSize;
uniform vec2 uLight;
uniform float uRelief;
uniform float uWeave;
// the camera gliding into the painting
uniform float uZoom;
uniform vec2 uCenter;
varying vec2 v;

vec2 src;
float H(vec2 o) { return texture2D(uHeight, src + o * uTexel).r; }

void main() {
  src = clamp(uCenter + (v - uCenter) / uZoom, uTexel, 1.0 - uTexel);

  float tl = H(vec2(-1.0, -1.0)), tc = H(vec2(0.0, -1.0)), tr = H(vec2(1.0, -1.0));
  float ml = H(vec2(-1.0, 0.0)),                          mr = H(vec2(1.0, 0.0));
  float bl = H(vec2(-1.0, 1.0)),  bc = H(vec2(0.0, 1.0)),  br = H(vec2(1.0, 1.0));
  float dx = (tr + 2.0 * mr + br) - (tl + 2.0 * ml + bl);
  float dy = (bl + 2.0 * bc + br) - (tl + 2.0 * tc + tr);

  // the canvas weave under the paint (in screen space, so it stays fine as we zoom)
  vec2 px = v * uSize;
  dx += cos(px.x * 1.7) * uWeave;
  dy += cos(px.y * 1.7) * uWeave;

  vec3 n = normalize(vec3(-dx * uRelief, -dy * uRelief, 1.0));
  float aspect = uSize.x / uSize.y;
  vec3 L = normalize(vec3((uLight - v) * vec2(aspect, 1.0), 0.62));
  float diff = dot(n, L);
  vec3 Hv = normalize(L + vec3(0.0, 0.0, 1.0));
  float slope = clamp(length(vec2(dx, dy)) * uRelief * 1.4, 0.0, 1.0);
  float spec = pow(max(dot(n, Hv), 0.0), 28.0) * slope * slope;

  vec3 col = texture2D(uColor, src).rgb;
  // only a breath of shading: the brushwork reads as colour, not relief
  col *= 1.0 + (diff - L.z) * 0.3;
  col += vec3(1.0, 0.98, 0.94) * spec * 0.04;
  gl_FragColor = vec4(col, 1.0);
}`;

/** Where the viewer looks: zoom about a point in 0..1 canvas space. */
export interface Camera {
  zoom: number;
  center: { x: number; y: number };
}

export const STILL: Camera = { zoom: 1, center: { x: 0.5, y: 0.5 } };

export class Impasto {
  private gl: WebGLRenderingContext;
  private tex: WebGLTexture[];
  private u: Record<string, WebGLUniformLocation | null> = {};
  private w = 1;
  private h = 1;

  constructor(public canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
    if (!gl) throw new Error('WebGL unavailable');
    this.gl = gl;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link');
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    for (const name of ['uColor', 'uHeight', 'uTexel', 'uSize', 'uLight', 'uRelief', 'uWeave', 'uZoom', 'uCenter']) {
      this.u[name] = gl.getUniformLocation(prog, name);
    }
    this.tex = [0, 1].map((i) => {
      const t = gl.createTexture()!;
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    });
    gl.uniform1i(this.u.uColor, 0);
    gl.uniform1i(this.u.uHeight, 1);
  }

  get lost() {
    return this.gl.isContextLost();
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.canvas.width = w;
    this.canvas.height = h;
    this.gl.viewport(0, 0, w, h);
  }

  upload(color: HTMLCanvasElement, height: HTMLCanvasElement) {
    const gl = this.gl;
    [color, height].forEach((src, i) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, this.tex[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    });
  }

  /** light: position in 0..1 canvas space (may sit outside the canvas) */
  render(light: { x: number; y: number }, relief: number, cam: Camera = STILL) {
    const gl = this.gl;
    gl.uniform1f(this.u.uZoom, cam.zoom);
    gl.uniform2f(this.u.uCenter, cam.center.x, cam.center.y);
    gl.uniform2f(this.u.uTexel, 1 / this.w, 1 / this.h);
    gl.uniform2f(this.u.uSize, this.w, this.h);
    gl.uniform2f(this.u.uLight, light.x, light.y);
    gl.uniform1f(this.u.uRelief, relief);
    gl.uniform1f(this.u.uWeave, 0.01);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

/** Same lighting on the CPU, once, for small static paintings. */
export function shadeOnce(color: HTMLCanvasElement, height: HTMLCanvasElement, relief = 2, strength = 0.85) {
  const w = color.width;
  const h = color.height;
  const cctx = color.getContext('2d', { willReadFrequently: true })!;
  const img = cctx.getImageData(0, 0, w, h);
  const hd = height.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, w, h).data;
  const c = img.data;
  const at = (x: number, y: number) => {
    x = x < 0 ? 0 : x >= w ? w - 1 : x;
    y = y < 0 ? 0 : y >= h ? h - 1 : y;
    return hd[(y * w + x) * 4] / 255;
  };
  // gallery light from the upper left
  let lx = -0.55;
  let ly = -0.65;
  let lz = 0.62;
  const ln = Math.hypot(lx, ly, lz);
  lx /= ln;
  ly /= ln;
  lz /= ln;
  const hx = lx;
  const hy = ly;
  const hz = lz + 1;
  const hn = Math.hypot(hx, hy, hz);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1);
      const dy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1);
      let nx = -dx * relief;
      let ny = -dy * relief;
      let nz = 1;
      const nn = Math.hypot(nx, ny, nz);
      nx /= nn;
      ny /= nn;
      nz /= nn;
      const diff = nx * lx + ny * ly + nz * lz;
      const slope = Math.min(1, Math.hypot(dx, dy) * relief * 1.4);
      const sp = Math.pow(Math.max(0, (nx * hx + ny * hy + nz * hz) / hn), 28) * slope * slope * 0.22 * strength * 255;
      const k = 1 + (diff - lz) * strength;
      const i = (y * w + x) * 4;
      c[i] = c[i] * k + sp;
      c[i + 1] = c[i + 1] * k + sp * 0.97;
      c[i + 2] = c[i + 2] * k + sp * 0.9;
    }
  }
  cctx.putImageData(img, 0, 0);
}
