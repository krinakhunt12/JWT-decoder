import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ─── 1. Scene & Camera Setup ───
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 36);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ─── Curated Light Purple / Lavender Palette ───
    // Soft, luminous, elegant on crisp white background
    const PURPLE_BRIGHT = 0xc084fc; // Lilac / Purple-400
    const PURPLE_SOFT = 0xd8b4fe; // Soft Lavender / Purple-300
    const PURPLE_MAIN = 0xa855f7; // Pure Light Purple / Purple-500
    const PURPLE_PALE = 0xe9d5ff; // Whisper Violet / Purple-200
    const PURPLE_DEEP = 0x9333ea; // Royal Accent / Purple-600

    // ─── 2. Gyroscopic Cryptographic JWT Rings (Light Purple) ───
    const gyroGroup = new THREE.Group();
    scene.add(gyroGroup);

    // Ring 1: Outer Header Token Ring
    const ring1Geo = new THREE.TorusGeometry(12.5, 0.12, 16, 90);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: PURPLE_BRIGHT,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    gyroGroup.add(ring1);

    // Ring 2: Middle Claims Payload Ring
    const ring2Geo = new THREE.TorusGeometry(9.8, 0.1, 16, 80);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: PURPLE_SOFT,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    gyroGroup.add(ring2);

    // Ring 3: Inner Signature Verification Ring
    const ring3Geo = new THREE.TorusGeometry(7.2, 0.08, 16, 70);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: PURPLE_MAIN,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.z = Math.PI / 5;
    gyroGroup.add(ring3);

    // Ring 4: Delicate Outer Equator Halo
    const haloGeo = new THREE.TorusGeometry(14.5, 0.03, 16, 100);
    const haloMat = new THREE.MeshBasicMaterial({
      color: PURPLE_PALE,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    gyroGroup.add(halo);

    // Central Key Diamond Core (Nested Octahedron & Icosahedron)
    const coreGeo = new THREE.OctahedronGeometry(3.2, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: PURPLE_MAIN,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    gyroGroup.add(coreMesh);

    const innerCoreGeo = new THREE.IcosahedronGeometry(1.8, 0);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: PURPLE_SOFT,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    gyroGroup.add(innerCore);

    // Soft Ambient Light Pulse Core
    const glowGeo = new THREE.SphereGeometry(1.0, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: PURPLE_BRIGHT,
      transparent: true,
      opacity: 0.16,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    gyroGroup.add(glowMesh);

    // Position Gyro Ring group in upper-right visual anchor
    gyroGroup.position.set(13, 3, -4);

    // Light Purple Orbital Satellites revolving along rings
    const satellites = [
      { mesh: new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), new THREE.MeshBasicMaterial({ color: PURPLE_BRIGHT, transparent: true, opacity: 0.75 })), radius: 12.5, speed: 0.9, offset: 0, axis: 'x' },
      { mesh: new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), new THREE.MeshBasicMaterial({ color: PURPLE_SOFT, transparent: true, opacity: 0.7 })), radius: 9.8, speed: -1.2, offset: Math.PI / 2, axis: 'y' },
      { mesh: new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), new THREE.MeshBasicMaterial({ color: PURPLE_PALE, transparent: true, opacity: 0.8 })), radius: 7.2, speed: 1.5, offset: Math.PI, axis: 'z' },
    ];
    satellites.forEach(s => gyroGroup.add(s.mesh));

    // ─── 3. Undulating Light Purple Quantum Wave Ribbons ───
    const waveRibbonsGroup = new THREE.Group();
    scene.add(waveRibbonsGroup);

    const ribbonCurves = [];
    const ribbonCount = 3;
    const ribbonPointsCount = 60;

    for (let r = 0; r < ribbonCount; r++) {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(ribbonPointsCount * 3);
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

      const mat = new THREE.LineBasicMaterial({
        color: r === 0 ? PURPLE_BRIGHT : r === 1 ? PURPLE_SOFT : PURPLE_PALE,
        transparent: true,
        opacity: 0.22 - r * 0.04,
      });

      const line = new THREE.Line(geo, mat);
      waveRibbonsGroup.add(line);
      ribbonCurves.push({
        line,
        geo,
        yBase: -10 + r * 3,
        zBase: -10 + r * 2,
        freq: 0.12 + r * 0.04,
        speed: 0.8 + r * 0.3,
      });
    }

    // ─── 4. Floating Light Purple Cryptographic Shards (Data Crystals) ───
    const shardGroup = new THREE.Group();
    scene.add(shardGroup);

    const shardConfigs = [
      { geo: new THREE.OctahedronGeometry(1.6, 0), x: -18, y: 12, z: -8, speed: 0.9 },
      { geo: new THREE.TetrahedronGeometry(1.5, 0), x: -22, y: -6, z: -10, speed: 1.1 },
      { geo: new THREE.DodecahedronGeometry(1.4, 0), x: -10, y: -16, z: -6, speed: 0.8 },
      { geo: new THREE.IcosahedronGeometry(1.3, 0), x: 19, y: -14, z: -12, speed: 1.2 },
      { geo: new THREE.OctahedronGeometry(1.7, 0), x: 23, y: 16, z: -14, speed: 0.7 },
      { geo: new THREE.TetrahedronGeometry(1.4, 0), x: -6, y: 18, z: -9, speed: 1.0 },
    ];

    const shards = shardConfigs.map((cfg, idx) => {
      const mat = new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? PURPLE_BRIGHT : PURPLE_SOFT,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      });
      const mesh = new THREE.Mesh(cfg.geo, mat);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      shardGroup.add(mesh);
      return {
        mesh,
        rotSpeedX: 0.008 + idx * 0.002,
        rotSpeedY: 0.012 + idx * 0.003,
        baseY: cfg.y,
        floatSpeed: cfg.speed,
      };
    });

    // ─── 5. Luminous Light Purple Particle Matrix (Whisper Constellation) ───
    const particleCount = 75;
    const particleGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 62;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 46;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      pVelocities.push({
        x: (Math.random() - 0.5) * 0.018,
        y: (Math.random() - 0.5) * 0.018,
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
    const maxLines = 180;
    const linePos = new Float32Array(maxLines * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: PURPLE_PALE,
      transparent: true,
      opacity: 0.20,
    });
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineMesh);

    // ─── 6. Smooth Mouse Parallax & Scroll Glide ───
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let scrollY = 0;

    const onMouseMove = (e) => {
      const halfX = window.innerWidth / 2;
      const halfY = window.innerHeight / 2;
      mouseX = (e.clientX - halfX) * 0.0008;
      mouseY = (e.clientY - halfY) * 0.0008;
    };

    const onScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ─── 7. Main Animation Loop ───
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Inertial damping for mouse parallax
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // 1. Gyroscopic Rings Rotation
      ring1.rotation.z = time * 0.22 + scrollY * 0.0004;
      ring2.rotation.x = time * -0.28 + targetY * 1.2;
      ring3.rotation.y = time * 0.32 + targetX * 1.2;
      halo.rotation.z = time * -0.15;

      gyroGroup.rotation.y = time * 0.09 + targetX * 1.5;
      gyroGroup.rotation.x = time * 0.06 + targetY * 1.0;

      // Satellite revolutions
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
      innerCore.rotation.x = -time * 0.6;
      innerCore.rotation.z = time * 0.4;

      const breathe = 1 + Math.sin(time * 2.2) * 0.07;
      coreMesh.scale.set(breathe, breathe, breathe);
      glowMesh.scale.set(breathe * 1.2, breathe * 1.2, breathe * 1.2);

      // 2. Animate Undulating Purple Wave Ribbons
      ribbonCurves.forEach((r, rIdx) => {
        const positions = r.geo.attributes.position.array;
        for (let i = 0; i < ribbonPointsCount; i++) {
          const x = (i - ribbonPointsCount / 2) * 1.2;
          const y = r.yBase + Math.sin(x * r.freq + time * r.speed + rIdx) * 2.4;
          const z = r.zBase + Math.cos(x * r.freq * 0.8 + time * (r.speed * 0.7)) * 1.8;

          positions[i * 3] = x;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = z;
        }
        r.geo.attributes.position.needsUpdate = true;
      });

      // 3. Floating Light Purple Shards
      shards.forEach((s, idx) => {
        s.mesh.rotation.x += s.rotSpeedX;
        s.mesh.rotation.y += s.rotSpeedY;
        s.mesh.position.y = s.baseY + Math.sin(time * s.floatSpeed + idx) * 1.2;
      });

      // 4. Ambient Particle Network Drift
      const pos = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += pVelocities[i].x;
        pos[i * 3 + 1] += pVelocities[i].y;
        pos[i * 3 + 2] += pVelocities[i].z;

        if (Math.abs(pos[i * 3]) > 32) pVelocities[i].x *= -1;
        if (Math.abs(pos[i * 3 + 1]) > 24) pVelocities[i].y *= -1;
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

          if (distSq < 105 && lineIdx < maxLines) {
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

      // Camera parallax tilt with subtle scroll elevation
      camera.position.x = targetX * 4.5;
      camera.position.y = -targetY * 4.5 + Math.min(scrollY * 0.005, 8);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // ─── 8. Comprehensive GPU Cleanup ───
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Geometries & Materials
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      particleGeo.dispose();
      pMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      ribbonCurves.forEach(r => {
        r.geo.dispose();
        r.line.material.dispose();
      });
      shards.forEach(s => {
        s.mesh.geometry.dispose();
        s.mesh.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        maskImage: "radial-gradient(ellipse at 50% 35%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 85%)",
        WebkitMaskImage: "radial-gradient(ellipse at 50% 35%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 85%)",
      }}
    />
  );
}
