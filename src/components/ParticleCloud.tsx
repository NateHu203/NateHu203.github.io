import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const PARTICLE_COUNT = 80000;
const IMAGE_URL = '/contents/particle-source.png';

const vertexShader = `
  uniform float uTime;
  uniform float uMorph;
  uniform float uPointSize;
  attribute vec3 targetPosition;
  attribute vec3 aColor;
  attribute vec3 targetColor;
  attribute vec3 aRandomOffset;
  varying vec3 vColor;
  varying float vDistance;

  void main() {
    vColor = mix(aColor, targetColor, uMorph);
    vec3 pos = mix(position, targetPosition, uMorph);

    // Gentle noise movement
    float noise = sin(uTime * 0.8 + pos.x * 0.3) * cos(uTime * 0.8 + pos.y * 0.3);
    pos += normalize(pos + vec3(0.001)) * noise * 0.15;
    pos.x += sin(uTime * 0.2 + pos.z) * 0.08;
    pos.y += cos(uTime * 0.2 + pos.x) * 0.08;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float dist = length(pos);
    vDistance = dist;

    gl_PointSize = (uPointSize / -mvPosition.z) * (1.0 + sin(uTime * 1.5 + dist * 0.15) * 0.15);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec3 vColor;
  varying float vDistance;

  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;

    float strength = pow(1.0 - dist * 2.0, 1.6);
    vec3 finalColor = vColor * 2.0;
    float alpha = strength * (0.8 + sin(vDistance * 0.3 + uTime) * 0.2);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

function loadImageData(url: string): Promise<{ validPoints: { pos: number[]; col: number[] }[] }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const resolution = 200;
      const aspect = img.width / img.height;
      const drawWidth = aspect > 1 ? resolution : resolution * aspect;
      const drawHeight = aspect > 1 ? resolution / aspect : resolution;
      canvas.width = resolution;
      canvas.height = resolution;
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, resolution, resolution);
      ctx.drawImage(
        img,
        (resolution - drawWidth) / 2,
        (resolution - drawHeight) / 2,
        drawWidth,
        drawHeight
      );
      const imgData = ctx.getImageData(0, 0, resolution, resolution).data;
      const validPoints: { pos: number[]; col: number[] }[] = [];
      for (let y = 0; y < resolution; y++) {
        for (let x = 0; x < resolution; x++) {
          const idx = (y * resolution + x) * 4;
          const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2];
          if ((r + g + b) / 3 > 15) {
            validPoints.push({
              pos: [
                (x / resolution - 0.5) * 38,
                (0.5 - y / resolution) * 38,
                ((r + g + b) / 765 - 0.5) * 12,
              ],
              col: [r / 255, g / 255, b / 255],
            });
          }
        }
      }
      resolve({ validPoints });
    };
  });
}

export default function ParticleCloud() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.z = 65;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Initial random cloud positions + warm colors
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
    const targetColors = new Float32Array(PARTICLE_COUNT * 3);
    const randomOffsets = new Float32Array(PARTICLE_COUNT * 3);

    const warmWhite = new THREE.Color('#d4cfc7');
    const softGold = new THREE.Color('#b89d6a');
    const accentColor = new THREE.Color('#C2542D');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      // Start as scattered cloud
      const t = (Math.random() - 0.5) * 5.0;
      const angle = Math.random() * Math.PI * 2;
      const radiusBase = 0.4 + Math.pow(Math.abs(t), 2.4);
      const radius = radiusBase * (0.75 + Math.random() * 0.55);

      positions[i3] = radius * Math.cos(angle) * 2.9;
      positions[i3 + 1] = t * 7.5;
      positions[i3 + 2] = radius * Math.sin(angle) * 2.9;

      // Default target = same as start
      targetPositions[i3] = positions[i3];
      targetPositions[i3 + 1] = positions[i3 + 1];
      targetPositions[i3 + 2] = positions[i3 + 2];

      randomOffsets[i3] = (Math.random() - 0.5) * 2;
      randomOffsets[i3 + 1] = (Math.random() - 0.5) * 2;
      randomOffsets[i3 + 2] = (Math.random() - 0.5) * 2;

      const roll = Math.random();
      const color = roll > 0.85 ? accentColor : roll > 0.5 ? softGold : warmWhite;
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      targetColors[i3] = color.r;
      targetColors[i3 + 1] = color.g;
      targetColors[i3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('targetColor', new THREE.BufferAttribute(targetColors, 3));
    geometry.setAttribute('aRandomOffset', new THREE.BufferAttribute(randomOffsets, 3));

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uPointSize: { value: 120 },
      },
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Load image and set target positions
    loadImageData(IMAGE_URL).then(({ validPoints }) => {
      if (validPoints.length === 0) return;
      const tpAttr = geometry.attributes.targetPosition as THREE.BufferAttribute;
      const tcAttr = geometry.attributes.targetColor as THREE.BufferAttribute;
      const tp = tpAttr.array as Float32Array;
      const tc = tcAttr.array as Float32Array;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const point = validPoints[i % validPoints.length];
        tp[i3] = point.pos[0] + (Math.random() - 0.5) * 0.4;
        tp[i3 + 1] = point.pos[1] + (Math.random() - 0.5) * 0.4;
        tp[i3 + 2] = point.pos[2] + (Math.random() - 0.5) * 1.5;
        tc[i3] = point.col[0];
        tc[i3 + 1] = point.col[1];
        tc[i3 + 2] = point.col[2];
      }
      tpAttr.needsUpdate = true;
      tcAttr.needsUpdate = true;
    });

    // Animation
    let time = 0;
    let morphFactor = 0;
    let animId = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.006;

      // Slow vertical axis rotation
      points.rotation.y += 0.002;

      // Morph toward image shape
      morphFactor += (1.0 - morphFactor) * 0.03;
      material.uniforms.uMorph.value = morphFactor;
      material.uniforms.uTime.value = time;

      renderer.render(scene, camera);
    }

    animate();

    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    window.addEventListener('resize', onResize);

    cleanupRef.current = () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };

    return () => cleanupRef.current?.();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-visible"
      style={{ minHeight: 300, overflow: 'visible' }}
    />
  );
}
