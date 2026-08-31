import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const EggSpotlightCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    // Warm Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffd166, 2.5);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x52b788, 1.8);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xd4a373, 1.0);
    fillLight.position.set(-3, 3, 2);
    scene.add(fillLight);

    // Procedural 3D Egg Shape using LatheGeometry
    const points: THREE.Vector2[] = [];
    const segments = 40;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI;
      const y = -Math.cos(theta); // from -1 to 1
      // Egg equation: wider near bottom, narrower near top
      const factor = 1.0 - 0.25 * y;
      const r = Math.sin(theta) * factor * 0.72;
      points.push(new THREE.Vector2(Math.max(0, r), y * 1.05));
    }

    const eggGeo = new THREE.LatheGeometry(points, 64);
    eggGeo.computeVertexNormals();

    // Natural egg texture canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Base organic warm egg gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#f2d3ac');
      grad.addColorStop(0.5, '#e0b588');
      grad.addColorStop(1, '#c99665');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Delicate micro speckles
      ctx.fillStyle = 'rgba(107, 68, 35, 0.15)';
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = Math.random() * 1.8 + 0.5;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const eggTexture = new THREE.CanvasTexture(canvas);

    const eggMat = new THREE.MeshPhysicalMaterial({
      map: eggTexture,
      roughness: 0.35,
      metalness: 0.05,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2
    });

    const eggMesh = new THREE.Mesh(eggGeo, eggMat);
    eggMesh.rotation.z = -0.15;
    scene.add(eggMesh);

    // Subtle 3D Orbiting Glow Rings
    const ringGeo = new THREE.TorusGeometry(1.35, 0.015, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd4a373,
      transparent: true,
      opacity: 0.4
    });
    const ringMesh1 = new THREE.Mesh(ringGeo, ringMat);
    ringMesh1.rotation.x = Math.PI / 2.3;
    scene.add(ringMesh1);

    const ringGeo2 = new THREE.TorusGeometry(1.5, 0.01, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x52b788,
      transparent: true,
      opacity: 0.35
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.x = -Math.PI / 3;
    ringMesh2.rotation.y = 0.4;
    scene.add(ringMesh2);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let isHovered = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX = x * 0.003;
      mouseY = y * 0.003;
    };

    const handleMouseEnter = () => { isHovered = true; };
    const handleMouseLeave = () => {
      isHovered = false;
      mouseX = 0;
      mouseY = 0;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Idle floating and rotating
      eggMesh.position.y = Math.sin(time * 1.5) * 0.08;

      if (isHovered) {
        eggMesh.rotation.y += (mouseX * 3 - eggMesh.rotation.y) * 0.08;
        eggMesh.rotation.x += (mouseY * 2 - eggMesh.rotation.x) * 0.08;
      } else {
        eggMesh.rotation.y += 0.008;
        eggMesh.rotation.x = Math.sin(time * 0.8) * 0.1;
      }

      ringMesh1.rotation.z += 0.006;
      ringMesh2.rotation.z -= 0.005;

      renderer?.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      if (renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-[360px] md:h-[480px] flex items-center justify-center cursor-grab active:cursor-grabbing relative"
      title="Hover and drag to rotate in 3D"
    >
      <div className="absolute bottom-2 text-center text-xs text-[#8C6239] font-medium tracking-wider uppercase opacity-70 pointer-events-none">
        ✦ Interactive 3D Model • Move Mouse to Orbit ✦
      </div>
    </div>
  );
};
