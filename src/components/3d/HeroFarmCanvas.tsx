import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HeroFarmCanvasProps {
  scrollProgress?: number;
}

export const HeroFarmCanvas: React.FC<HeroFarmCanvasProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check if WebGL is supported
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f2d1f, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 7);

    // Warm Ambient and Directional Sun Light
    const ambientLight = new THREE.AmbientLight(0xd4a373, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffe5b4, 2.2);
    sunLight.position.set(5, 8, 3);
    scene.add(sunLight);

    const groundLight = new THREE.DirectionalLight(0x2d6a4f, 1.0);
    groundLight.position.set(-5, -2, -3);
    scene.add(groundLight);

    // Golden Sun Disc in Background
    const sunGeo = new THREE.SphereGeometry(1.8, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.85
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(4, 3.5, -12);
    scene.add(sunMesh);

    // Halo ring around sun
    const haloGeo = new THREE.RingGeometry(1.9, 3.2, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffb703,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.copy(sunMesh.position);
    haloMesh.position.z += 0.1;
    scene.add(haloMesh);

    // Floating Golden Dust & Pollen Particles
    const particleCount = 160;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);
    const particleSpeeds = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 16;
      particlePositions[i * 3 + 1] = (Math.random() - 0.3) * 10;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 14;

      particleScales[i] = Math.random() * 0.08 + 0.03;
      particleSpeeds[i * 3] = (Math.random() - 0.5) * 0.005; // x
      particleSpeeds[i * 3 + 1] = Math.random() * 0.004 + 0.002; // y (drift up)
      particleSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 0.005; // z
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Canvas texture for glowing round particles
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 230, 160, 1)');
      gradient.addColorStop(0.4, 'rgba(230, 190, 100, 0.6)');
      gradient.addColorStop(1, 'rgba(230, 190, 100, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      map: particleTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 3D Floating Organic Farm Leaves / Petals
    const leafCount = 18;
    const leafMeshes: THREE.Mesh[] = [];
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.bezierCurveTo(0.15, 0.25, 0.25, 0.5, 0, 0.9);
    leafShape.bezierCurveTo(-0.25, 0.5, -0.15, 0.25, 0, 0);

    const leafGeo = new THREE.ShapeGeometry(leafShape);
    const leafColors = [0x52b788, 0x74c69d, 0xd4a373, 0x40916c];

    for (let i = 0; i < leafCount; i++) {
      const leafColor = leafColors[i % leafColors.length];
      const leafMaterial = new THREE.MeshStandardMaterial({
        color: leafColor,
        roughness: 0.6,
        metalness: 0.1,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const leaf = new THREE.Mesh(leafGeo, leafMaterial);
      const scale = Math.random() * 0.4 + 0.3;
      leaf.scale.set(scale, scale, scale);
      leaf.position.set(
        (Math.random() - 0.5) * 12,
        Math.random() * 6 - 1,
        (Math.random() - 0.5) * 8
      );
      leaf.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      (leaf as any).speedX = (Math.random() - 0.5) * 0.006;
      (leaf as any).speedY = -(Math.random() * 0.005 + 0.003);
      (leaf as any).rotSpeedX = (Math.random() - 0.5) * 0.02;
      (leaf as any).rotSpeedY = (Math.random() - 0.5) * 0.02;
      (leaf as any).rotSpeedZ = (Math.random() - 0.5) * 0.02;

      scene.add(leaf);
      leafMeshes.push(leaf);
    }

    // Subtle 3D Rolling Farmland Horizon Silhouettes
    const hillGeo = new THREE.ConeGeometry(8, 2.5, 32);
    const hillMat = new THREE.MeshStandardMaterial({
      color: 0x0f2d1f,
      roughness: 0.9,
      metalness: 0.0
    });

    const hill1 = new THREE.Mesh(hillGeo, hillMat);
    hill1.position.set(-5, -2, -6);
    hill1.rotation.z = 0.15;
    scene.add(hill1);

    const hill2 = new THREE.Mesh(hillGeo, hillMat);
    hill2.position.set(6, -2.2, -7);
    hill2.scale.set(1.2, 1.2, 1.2);
    scene.add(hill2);

    // Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 1.5;

    const handleMouseMove = (e: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (e.clientX - windowHalfX) * 0.001;
      mouseY = (e.clientY - windowHalfY) * 0.001;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera follow mouse
      targetCameraX = mouseX * 1.5;
      targetCameraY = 1.5 - mouseY * 0.8;
      camera.position.x += (targetCameraX - camera.position.x) * 0.05;
      camera.position.y += (targetCameraY - camera.position.y) * 0.05;
      camera.lookAt(0, 0.8, -2);

      // Animate Sun Glow
      sunMesh.position.y = 3.5 + Math.sin(elapsedTime * 0.5) * 0.1;
      haloMesh.rotation.z += 0.002;
      haloMesh.position.y = sunMesh.position.y;

      // Animate Particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particleSpeeds[i * 3] + Math.sin(elapsedTime + i) * 0.001;
        positions[i * 3 + 1] += particleSpeeds[i * 3 + 1];
        positions[i * 3 + 2] += particleSpeeds[i * 3 + 2];

        // Loop boundaries
        if (positions[i * 3 + 1] > 6) {
          positions[i * 3 + 1] = -3;
        }
        if (positions[i * 3] > 8) positions[i * 3] = -8;
        if (positions[i * 3] < -8) positions[i * 3] = 8;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Animate Floating Leaves
      leafMeshes.forEach((leaf) => {
        const l = leaf as any;
        leaf.position.x += l.speedX + Math.sin(elapsedTime + leaf.id) * 0.002;
        leaf.position.y += l.speedY;
        leaf.rotation.x += l.rotSpeedX;
        leaf.rotation.y += l.rotSpeedY;
        leaf.rotation.z += l.rotSpeedZ;

        if (leaf.position.y < -3) {
          leaf.position.y = 5;
          leaf.position.x = (Math.random() - 0.5) * 12;
        }
      });

      renderer?.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer && container) {
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-10 overflow-hidden w-full h-full"
      aria-hidden="true"
    />
  );
};
