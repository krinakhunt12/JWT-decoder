import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ─── 1. Scene & Camera Setup (Full Viewport Coverage) ───
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 38);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ─── Curated Monochromatic Light Purple / Lavender Palette ───
    const PURPLE_BRIGHT = 0xc084fc; // Lilac / Purple-400
    const PURPLE_SOFT   = 0xd8b4fe; // Soft Lavender / Purple-300
    const PURPLE_MAIN   = 0xa855f7; // Light Purple / Purple-500
    const PURPLE_PALE   = 0xe9d5ff; // Whisper Violet / Purple-200
    const PURPLE_MUTED  = 0x7e22ce; // Deep Soft Accent

    // ─── STAGE 1 (Top / Hero): Gyroscopic JWT Token Rings ───
    const heroGyroGroup = new THREE.Group();
    scene.add(heroGyroGroup);

    // Header Ring
    const r1Geo = new THREE.TorusGeometry(12, 0.12, 16, 80);
    const r1Mat = new THREE.MeshBasicMaterial({ color: PURPLE_BRIGHT, wireframe: true, transparent: true, opacity: 0.28 });
    const r1 = new THREE.Mesh(r1Geo, r1Mat);
    r1.rotation.x = Math.PI / 3;
    heroGyroGroup.add(r1);

    // Payload Ring
    const r2Geo = new THREE.TorusGeometry(9.4, 0.1, 16, 70);
    const r2Mat = new THREE.MeshBasicMaterial({ color: PURPLE_SOFT, wireframe: true, transparent: true, opacity: 0.32 });
    const r2 = new THREE.Mesh(r2Geo, r2Mat);
    r2.rotation.y = Math.PI / 4;
    r2.rotation.x = -Math.PI / 6;
    heroGyroGroup.add(r2);

    // Signature Ring
    const r3Geo = new THREE.TorusGeometry(6.8, 0.08, 16, 60);
    const r3Mat = new THREE.MeshBasicMaterial({ color: PURPLE_MAIN, wireframe: true, transparent: true, opacity: 0.35 });
    const r3 = new THREE.Mesh(r3Geo, r3Mat);
    r3.rotation.z = Math.PI / 5;
    heroGyroGroup.add(r3);

    // Outer Equator Halo
    const haloGeo = new THREE.TorusGeometry(14, 0.03, 16, 90);
    const haloMat = new THREE.MeshBasicMaterial({ color: PURPLE_PALE, wireframe: true, transparent: true, opacity: 0.18 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    heroGyroGroup.add(halo);

    // Central Verification Octahedron Key
    const coreGeo = new THREE.OctahedronGeometry(3.0, 0);
    const coreMat = new THREE.MeshBasicMaterial({ color: PURPLE_MAIN, wireframe: true, transparent: true, opacity: 0.35 });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    heroGyroGroup.add(coreMesh);

    // Inner Luminous Core Sphere
    const innerGlowGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const innerGlowMat = new THREE.MeshBasicMaterial({ color: PURPLE_BRIGHT, transparent: true, opacity: 0.16 });
    const innerGlow = new THREE.Mesh(innerGlowGeo, innerGlowMat);
    heroGyroGroup.add(innerGlow);

    // Satellites
    const satellites = [
      { mesh: new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), new THREE.MeshBasicMaterial({ color: PURPLE_BRIGHT, transparent: true, opacity: 0.75 })), radius: 12, speed: 0.8, offset: 0 },
      { mesh: new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), new THREE.MeshBasicMaterial({ color: PURPLE_SOFT, transparent: true, opacity: 0.7 })), radius: 9.4, speed: -1.1, offset: Math.PI / 2 },
      { mesh: new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), new THREE.MeshBasicMaterial({ color: PURPLE_PALE, transparent: true, opacity: 0.8 })), radius: 6.8, speed: 1.4, offset: Math.PI },
    ];
    satellites.forEach(s => heroGyroGroup.add(s.mesh));

    heroGyroGroup.position.set(13, 4, -4);

    // ─── STAGE 2 (Upper-Middle / Algorithms & Threat Intel): Floating Crystal Shards ───
    const shardGroup = new THREE.Group();
    scene.add(shardGroup);

    const shardConfigs = [
      { geo: new THREE.OctahedronGeometry(1.8, 0), x: -19, y: 14, z: -8, speed: 0.9 },
      { geo: new THREE.TetrahedronGeometry(1.6, 0), x: -24, y: -4, z: -10, speed: 1.1 },
      { geo: new THREE.DodecahedronGeometry(1.5, 0), x: -14, y: -16, z: -7, speed: 0.8 },
      { geo: new THREE.IcosahedronGeometry(1.4, 0), x: 21, y: -12, z: -12, speed: 1.2 },
      { geo: new THREE.OctahedronGeometry(1.9, 0), x: 25, y: 16, z: -14, speed: 0.7 },
      { geo: new THREE.TetrahedronGeometry(1.5, 0), x: -8, y: 22, z: -9, speed: 1.0 },
      { geo: new THREE.DodecahedronGeometry(1.6, 0), x: 18, y: -26, z: -8, speed: 0.85 },
      { geo: new THREE.OctahedronGeometry(1.5, 0), x: -20, y: -30, z: -11, speed: 1.15 },
    ];

    const shards = shardConfigs.map((cfg, idx) => {
      const mat = new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? PURPLE_BRIGHT : PURPLE_SOFT,
        wireframe: true,
        transparent: true,
        opacity: 0.24,
      });
      const mesh = new THREE.Mesh(cfg.geo, mat);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      shardGroup.add(mesh);
      return {
        mesh,
        rotSpeedX: 0.007 + idx * 0.002,
        rotSpeedY: 0.01 + idx * 0.002,
        baseY: cfg.y,
        floatSpeed: cfg.speed,
      };
    });

    // ─── STAGE 3 (Middle / Claims Dictionary & Workflow): Undulating Light Purple Wave Ribbons ───
    const waveRibbonsGroup = new THREE.Group();
    scene.add(waveRibbonsGroup);

    const ribbonCurves = [];
    const ribbonCount = 4;
    const ribbonPointsCount = 64;

    for (let r = 0; r < ribbonCount; r++) {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(ribbonPointsCount * 3);
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

      const mat = new THREE.LineBasicMaterial({
        color: r % 2 === 0 ? PURPLE_BRIGHT : PURPLE_SOFT,
        transparent: true,
        opacity: 0.22 - r * 0.035,
      });

      const line = new THREE.Line(geo, mat);
      waveRibbonsGroup.add(line);
      ribbonCurves.push({
        line,
        geo,
        yBase: -12 + r * 5,
        zBase: -8 + r * 2.5,
        freq: 0.1 + r * 0.03,
        speed: 0.7 + r * 0.25,
      });
    }

    // ─── STAGE 4 (Whole Page / Global): Luminous Stardust Constellation with Connective Threads ───
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pVelocities = [];

    // Distribute particles across a wide 3D vertical volume spanning the full viewport
    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 68;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 58;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 32;

      pVelocities.push({
        x: (Math.random() - 0.5) * 0.016,
        y: (Math.random() - 0.5) * 0.016,
        z: (Math.random() - 0.5) * 0.012,
      });
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: PURPLE_BRIGHT,
      size: 1.6,
      transparent: true,
      opacity: 0.42,
    });
    const pSystem = new THREE.Points(particleGeo, pMat);
    scene.add(pSystem);

    // Delicate translucent purple connective lines
    const maxLines = 220;
    const linePos = new Float32Array(maxLines * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: PURPLE_PALE,
      transparent: true,
      opacity: 0.18,
    });
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineMesh);

    // ─── STAGE 5 (Bottom / CTA & FAQ): Secondary Luminous Horizon Ring ───
    const bottomRingGeo = new THREE.TorusGeometry(18, 0.08, 16, 100);
    const bottomRingMat = new THREE.MeshBasicMaterial({
      color: PURPLE_SOFT,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const bottomRing = new THREE.Mesh(bottomRingGeo, bottomRingMat);
    bottomRing.position.set(-10, -28, -10);
    bottomRing.rotation.x = Math.PI / 3.5;
    scene.add(bottomRing);

    // ─── Mouse Movement & Full-Page Scroll Tracking ───
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let scrollY = 0;
    let scrollProgress = 0;

    const onMouseMove = (e) => {
      const halfX = window.innerWidth / 2;
      const halfY = window.innerHeight / 2;
      mouseX = (e.clientX - halfX) * 0.0007;
      mouseY = (e.clientY - halfY) * 0.0007;
    };

    const onScroll = () => {
      scrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollProgress = Math.min(1, Math.max(0, scrollY / maxScroll));
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // ─── 60 FPS Render Loop (Continuous Whole-Page Flow) ───
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Inertial damping for mouse parallax
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // 1. Gyroscope Rings Rotation with scroll influence
      r1.rotation.z = time * 0.22 + scrollY * 0.0004;
      r2.rotation.x = time * -0.26 + targetY * 1.2;
      r3.rotation.y = time * 0.3 + targetX * 1.2;
      halo.rotation.z = time * -0.14;

      heroGyroGroup.rotation.y = time * 0.08 + targetX * 1.4;
      heroGyroGroup.rotation.x = time * 0.05 + targetY * 1.0;

      // Gyro group glides vertically as user scrolls down the page
      heroGyroGroup.position.y = 4 - scrollProgress * 14;
      heroGyroGroup.position.x = 13 - scrollProgress * 6;

      // Satellites
      satellites[0].mesh.position.set(
        Math.cos(time * satellites[0].speed + satellites[0].offset) * satellites[0].radius,
        Math.sin(time * satellites[0].speed + satellites[0].offset) * satellites[0].radius,
        0
      );
      satellites[1].mesh.position.set(
        0,
        Math.cos(time * satellites[1].speed + satellites[1].offset) * satellites[1].radius,
        Math.sin(time * satellites[1].speed + satellites[1].offset) * satellites[1].radius
      );
      satellites[2].mesh.position.set(
        Math.cos(time * satellites[2].speed + satellites[2].offset) * satellites[2].radius,
        0,
        Math.sin(time * satellites[2].speed + satellites[2].offset) * satellites[2].radius
      );

      // Core Diamond Pulsing
      coreMesh.rotation.x = time * 0.45;
      coreMesh.rotation.y = time * 0.55;
      const breathe = 1 + Math.sin(time * 2.2) * 0.07;
      coreMesh.scale.set(breathe, breathe, breathe);
      innerGlow.scale.set(breathe * 1.25, breathe * 1.25, breathe * 1.25);

      // 2. Animate Wave Ribbons
      ribbonCurves.forEach((r, rIdx) => {
        const positions = r.geo.attributes.position.array;
        for (let i = 0; i < ribbonPointsCount; i++) {
          const x = (i - ribbonPointsCount / 2) * 1.3;
          const y = r.yBase + Math.sin(x * r.freq + time * r.speed + rIdx) * 2.2;
          const z = r.zBase + Math.cos(x * r.freq * 0.8 + time * (r.speed * 0.7)) * 1.6;

          positions[i * 3] = x;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = z;
        }
        r.geo.attributes.position.needsUpdate = true;
      });

      // 3. Floating Shards Tumble
      shards.forEach((s, idx) => {
        s.mesh.rotation.x += s.rotSpeedX;
        s.mesh.rotation.y += s.rotSpeedY;
        s.mesh.position.y = s.baseY + Math.sin(time * s.floatSpeed + idx) * 1.4;
      });

      // 4. Bottom Horizon Ring Rotation
      bottomRing.rotation.z = time * 0.16 + scrollY * 0.0003;
      bottomRing.rotation.y = Math.PI / 6 + targetX * 1.0;

      // 5. Ambient Stardust Drift throughout the whole scene
      const pos = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += pVelocities[i].x;
        pos[i * 3 + 1] += pVelocities[i].y;
        pos[i * 3 + 2] += pVelocities[i].z;

        if (Math.abs(pos[i * 3]) > 34) pVelocities[i].x *= -1;
        if (Math.abs(pos[i * 3 + 1]) > 29) pVelocities[i].y *= -1;
        if (Math.abs(pos[i * 3 + 2]) > 16) pVelocities[i].z *= -1;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Connect nearby nodes with light purple lines
      let lineIdx = 0;
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = pos[i * 3] - pos[j * 3];
          const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
          const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < 100 && lineIdx < maxLines) {
            linePos[lineIdx * 6] = pos[i * 3];
            linePos[lineIdx * 6 + 1] = pos[i * 3 + 1];
            linePos[lineIdx * 6 + 2] = pos[i * 3 + 2];

            linePos[lineIdx * 6 + 3] = pos[j * 3];
            linePos[lineIdx * 6 + 4] = pos[j * 3 + 1];
            linePos[lineIdx * 6 + 5] = pos[j * 3 + 2];
            lineIdx++;
          }
        }
      }
      lineGeo.setDrawRange(0, lineIdx * 2);
      lineGeo.attributes.position.needsUpdate = true;

      // 6. Camera Glides Dynamically Down the Whole Page on Scroll
      // Camera moves gracefully along the Y axis following scrollProgress
      camera.position.x = targetX * 4.0;
      camera.position.y = -targetY * 4.0 - scrollProgress * 16;
      camera.lookAt(0, -scrollProgress * 16, 0);

      renderer.render(scene, camera);
    };

    animate();

    // ─── Resource Cleanup ───
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      r1Geo.dispose();
      r1Mat.dispose();
      r2Geo.dispose();
      r2Mat.dispose();
      r3Geo.dispose();
      r3Mat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      innerGlowGeo.dispose();
      innerGlowMat.dispose();
      bottomRingGeo.dispose();
      bottomRingMat.dispose();
      particleGeo.dispose();
      pMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      ribbonCurves.forEach((r) => {
        r.geo.dispose();
        r.line.material.dispose();
      });
      shards.forEach((s) => {
        s.mesh.geometry.dispose();
        s.mesh.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        maskImage: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 95%)",
        WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 95%)",
      }}
    />
  );
}
