import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const SustainabilityCanvas: React.FC = () => {
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
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const greenLight = new THREE.PointLight(0x52b788, 2.5, 10);
    greenLight.position.set(2, 3, 2);
    scene.add(greenLight);

    const goldLight = new THREE.PointLight(0xe9c46a, 2.0, 10);
    goldLight.position.set(-2, -1, 2);
    scene.add(goldLight);

    // Central Organic Sphere / Earth Core
    const coreGeo = new THREE.IcosahedronGeometry(0.8, 3);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x1b4332,
      roughness: 0.4,
      metalness: 0.2,
      wireframe: false
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Wireframe Outer Earth Orbit Shell
    const wireGeo = new THREE.IcosahedronGeometry(1.15, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x52b788,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    // Rotating Leaf Nodes around Orbit
    const orbitGroup = new THREE.Group();
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.2, 0.3, 0, 0.6);
    leafShape.quadraticCurveTo(-0.2, 0.3, 0, 0);
    const leafGeo = new THREE.ShapeGeometry(leafShape);

    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x74c69d,
      side: THREE.DoubleSide,
      roughness: 0.3
    });

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0);
      leaf.rotation.z = angle + Math.PI / 2;
      leaf.scale.set(0.6, 0.6, 0.6);
      orbitGroup.add(leaf);
    }
    scene.add(orbitGroup);

    // Seed Spores / Pollen floating
    const sporeCount = 40;
    const sporeGeo = new THREE.BufferGeometry();
    const sporePos = new Float32Array(sporeCount * 3);
    for (let i = 0; i < sporeCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const rad = 1.4 + Math.random() * 0.8;
      sporePos[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
      sporePos[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
      sporePos[i * 3 + 2] = rad * Math.cos(phi);
    }
    sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePos, 3));
    const sporeMat = new THREE.PointsMaterial({
      color: 0xffd166,
      size: 0.06,
      transparent: true,
      opacity: 0.8
    });
    const spores = new THREE.Points(sporeGeo, sporeMat);
    scene.add(spores);

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
      const t = clock.getElapsedTime();

      coreMesh.rotation.y = t * 0.2;
      coreMesh.rotation.x = Math.sin(t * 0.3) * 0.1;

      wireMesh.rotation.y = -t * 0.15;
      wireMesh.rotation.z = t * 0.1;

      orbitGroup.rotation.z = t * 0.25;
      orbitGroup.rotation.x = Math.sin(t * 0.5) * 0.2;

      spores.rotation.y = t * 0.08;

      renderer?.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
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
      className="w-full h-[320px] sm:h-[400px] relative flex items-center justify-center pointer-events-none"
      aria-hidden="true"
    />
  );
};
