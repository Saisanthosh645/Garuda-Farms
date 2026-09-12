import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion, useScroll, useTransform } from 'motion/react';

interface ClayPot3DCanvasProps {
  className?: string;
  size?: number; // Size in pixels
  interactive?: boolean;
}

export const ClayPot3DCanvas: React.FC<ClayPot3DCanvasProps> = ({ 
  className = '', 
  size = 280,
  interactive = true 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollY } = useScroll();

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  // Motion parallax for smooth vertical translation along scroll — desktop only
  const potY = useTransform(scrollY, [0, 1200], isMobile ? [0, 0] : [0, 40]);
  const potScale = useTransform(scrollY, [0, 400, 1000], isMobile ? [1, 1, 1] : [1, 1.05, 0.98]);

  useEffect(() => {
    // Do not initialise Three.js on mobile — too expensive for low-end devices
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    if (!canvasRef.current || !containerRef.current) return;

    const width = size;
    const height = size;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 7.5);

    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Lighting for Warm Terracotta Clay
    const ambientLight = new THREE.AmbientLight(0xffebd8, 1.4);
    scene.add(ambientLight);

    const mainSun = new THREE.DirectionalLight(0xfff6ea, 2.2);
    mainSun.position.set(5, 8, 6);
    mainSun.castShadow = true;
    scene.add(mainSun);

    const clayWarmRim = new THREE.PointLight(0xd97736, 3.0, 12);
    clayWarmRim.position.set(-5, 1, 3);
    scene.add(clayWarmRim);

    const softFillLight = new THREE.DirectionalLight(0x73a987, 0.8);
    softFillLight.position.set(-4, -4, 2);
    scene.add(softFillLight);

    // 3. Construct Procedural 3D Terracotta Clay Pot (Matka / Earthen Vessel)
    const points: THREE.Vector2[] = [];
    
    // Pot Profile (Bottom to Rim)
    points.push(new THREE.Vector2(0, -2.1));
    points.push(new THREE.Vector2(0.6, -2.1));
    points.push(new THREE.Vector2(1.2, -1.9));
    points.push(new THREE.Vector2(1.9, -1.2));
    points.push(new THREE.Vector2(2.3, -0.3));
    points.push(new THREE.Vector2(2.4, 0.5));
    points.push(new THREE.Vector2(2.1, 1.2));
    points.push(new THREE.Vector2(1.4, 1.7));
    points.push(new THREE.Vector2(1.15, 2.0));
    points.push(new THREE.Vector2(1.2, 2.15));
    points.push(new THREE.Vector2(1.45, 2.35)); // Outer lip
    points.push(new THREE.Vector2(1.3, 2.45));  // Top rim curve
    points.push(new THREE.Vector2(1.0, 2.35));  // Inner lip
    points.push(new THREE.Vector2(0.95, 2.0));  // Inner neck
    points.push(new THREE.Vector2(1.9, 0.4));   // Inner belly wall
    points.push(new THREE.Vector2(0.5, -1.9));  // Inner base
    points.push(new THREE.Vector2(0, -1.9));

    const potGeometry = new THREE.LatheGeometry(points, 64);

    // Clay Standard Material with warmth & roughness
    const clayMaterial = new THREE.MeshStandardMaterial({
      color: 0xbe5c34, // Natural Terracotta Clay Orange-Brown
      roughness: 0.62,
      metalness: 0.05,
      bumpScale: 0.05,
    });

    const potMesh = new THREE.Mesh(potGeometry, clayMaterial);
    potMesh.castShadow = true;
    potMesh.receiveShadow = true;
    potMesh.rotation.x = 0.2; // Slight forward tilt for heroic 3D angle
    scene.add(potMesh);

    // 4. Add Traditional White Muggu / Kolam Decorative Art Ring around belly
    const mugguGroup = new THREE.Group();
    const ringRadius = 2.42;
    const dotCount = 24;

    for (let i = 0; i < dotCount; i++) {
      const angle = (i / dotCount) * Math.PI * 2;
      
      // Muggu White Rice-Powder Art Dots
      const dotGeo = new THREE.SphereGeometry(0.07, 16, 16);
      const dotMat = new THREE.MeshStandardMaterial({ 
        color: 0xfffcf5, 
        roughness: 0.3,
        emissive: 0xfff8ee,
        emissiveIntensity: 0.2
      });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.position.set(
        Math.cos(angle) * ringRadius,
        0.2 + Math.sin(angle * 4) * 0.1, // Wavy traditional curve elevation
        Math.sin(angle) * ringRadius
      );
      mugguGroup.add(dotMesh);

      // Lotus Petal Art Accents around belly
      if (i % 2 === 0) {
        const petalShape = new THREE.ConeGeometry(0.12, 0.3, 12);
        const petalMat = new THREE.MeshStandardMaterial({ 
          color: 0xf5ebd6, 
          roughness: 0.4 
        });
        const petalMesh = new THREE.Mesh(petalShape, petalMat);
        petalMesh.position.set(
          Math.cos(angle) * (ringRadius + 0.05),
          0.05,
          Math.sin(angle) * (ringRadius + 0.05)
        );
        petalMesh.rotation.z = Math.PI / 2;
        petalMesh.rotation.y = -angle;
        mugguGroup.add(petalMesh);
      }
    }
    potMesh.add(mugguGroup);

    // Upper neck Muggu white ring
    const upperRingGeo = new THREE.TorusGeometry(1.22, 0.035, 16, 64);
    const whiteArtMat = new THREE.MeshStandardMaterial({ color: 0xfdfaf2, roughness: 0.4 });
    const upperRing = new THREE.Mesh(upperRingGeo, whiteArtMat);
    upperRing.rotation.x = Math.PI / 2;
    upperRing.position.y = 1.95;
    potMesh.add(upperRing);

    // 5. Scroll Interaction & Continuous Animation Loop
    let animationFrameId: number;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const delta = currentScroll - lastScrollY;
      lastScrollY = currentScroll;
      
      // Accelerate rotation on scroll velocity
      if (potMesh) {
        potMesh.rotation.y += delta * 0.004;
      }
    };

    if (interactive) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = Date.now() * 0.0012;

      // Smooth idle rotation + levitation floating movement
      potMesh.rotation.y += 0.006;
      potMesh.position.y = Math.sin(time) * 0.18;
      potMesh.rotation.z = Math.sin(time * 0.8) * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (interactive) {
        window.removeEventListener('scroll', handleScroll);
      }
      potGeometry.dispose();
      clayMaterial.dispose();
      renderer.dispose();
    };
  }, [size, interactive]);

  return (
    <motion.div 
      ref={containerRef}
      style={{ y: potY, scale: potScale }}
      className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}
    >
      {/* Soft warm clay glow shadow */}
      <div 
        className="absolute bottom-2 w-3/4 h-8 rounded-[50%] bg-[#b55227]/25 blur-xl pointer-events-none"
        style={{ transform: 'scaleY(0.4)' }}
      />
      <canvas 
        ref={canvasRef} 
        className="drop-shadow-[0_20px_35px_rgba(180,80,30,0.35)]"
      />
    </motion.div>
  );
};
