import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Compass, RotateCw } from 'lucide-react';

export default function BlochSphere({ blochCoordinates = [], selectedQubit = 0, onSelectQubit }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const arrowRef = useRef(null);
  const pointRef = useRef(null);
  const rendererRef = useRef(null);

  const currentCoord = blochCoordinates.find(c => c.qubit_index === selectedQubit) || {
    x: 0, y: 0, z: 1, theta_rad: 0, phi_rad: 0
  };

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 320;
    const height = currentMount.clientHeight || 320;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(2.2, 1.8, 2.5);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.innerHTML = '';
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1.2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // 4. Bloch Sphere Geometry
    const sphereRadius = 1.0;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 32, 32);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x18181b,
      transparent: true,
      opacity: 0.3,
      wireframe: false,
      shininess: 90
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphereMesh);

    // 5. Equator & Meridian Rings
    const ringMatCyan = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
    const ringMatSlate = new THREE.LineBasicMaterial({ color: 0x71717a, transparent: true, opacity: 0.5 });

    // Equator (X-Z plane in Three.js where Y is up)
    const equatorGeo = new THREE.BufferGeometry();
    const ringPoints = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta)));
    }
    equatorGeo.setFromPoints(ringPoints);
    const equatorLine = new THREE.Line(equatorGeo, ringMatCyan);
    scene.add(equatorLine);

    // Meridian (X-Y plane)
    const meridianLine1 = new THREE.Line(equatorGeo.clone().rotateZ(Math.PI / 2), ringMatSlate);
    scene.add(meridianLine1);

    // 6. Coordinate Axes (Physics: Z is up, X is forward, Y is right)
    // Three.js: Y is up, X is right, Z is forward
    const axisMat = new THREE.LineBasicMaterial({ color: 0x52525b });
    const createAxis = (from, to) => {
      const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
      return new THREE.Line(geo, axisMat);
    };
    scene.add(createAxis(new THREE.Vector3(-1.3, 0, 0), new THREE.Vector3(1.3, 0, 0)));
    scene.add(createAxis(new THREE.Vector3(0, -1.3, 0), new THREE.Vector3(0, 1.3, 0)));
    scene.add(createAxis(new THREE.Vector3(0, 0, -1.3), new THREE.Vector3(0, 0, 1.3)));

    // 7. State Vector Arrow
    // Physics coordinates: (x, y, z)
    // Three.js coordinates: threeX = x, threeY = z (up), threeZ = -y
    const dir = new THREE.Vector3(currentCoord.x, currentCoord.z, -currentCoord.y).normalize();
    const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), sphereRadius, 0xffffff, 0.16, 0.08);
    scene.add(arrow);
    arrowRef.current = arrow;

    // Glowing tip sphere
    const tipGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0xd4d4d8 });
    const tipMesh = new THREE.Mesh(tipGeo, tipMat);
    tipMesh.position.copy(dir.clone().multiplyScalar(sphereRadius));
    scene.add(tipMesh);
    pointRef.current = tipMesh;

    // 8. Mouse Drag Interactive Orbit
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let rotationSpeed = 0.005;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      scene.rotation.y += deltaX * rotationSpeed;
      scene.rotation.x += deltaY * rotationSpeed;

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 9. Render Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, []);

  // Update arrow whenever coordinates change
  useEffect(() => {
    if (!arrowRef.current || !pointRef.current) return;
    const targetDir = new THREE.Vector3(currentCoord.x, currentCoord.z, -currentCoord.y);
    const len = targetDir.length();
    if (len > 0.001) {
      targetDir.normalize();
      arrowRef.current.setDirection(targetDir);
      arrowRef.current.setLength(Math.min(1.0, len), 0.16, 0.08);
      pointRef.current.position.copy(targetDir.clone().multiplyScalar(Math.min(1.0, len)));
    }
  }, [currentCoord]);

  return (
    <div className="liquid-glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '8px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} className="bklit-text-cyan" />
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', textShadow: '0 0 8px rgba(255,255,255,0.4)' }}>3D Bloch Sphere</h3>
        </div>

        {/* Qubit Selector */}
        {blochCoordinates.length > 1 && (
          <div style={{ display: 'flex', gap: '4px' }}>
            {blochCoordinates.map((c) => (
              <button
                key={c.qubit_index}
                onClick={() => onSelectQubit && onSelectQubit(c.qubit_index)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  background: selectedQubit === c.qubit_index ? '#27272a' : 'rgba(255,255,255,0.06)',
                  color: selectedQubit === c.qubit_index ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${selectedQubit === c.qubit_index ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: selectedQubit === c.qubit_index ? '0 0 10px rgba(255, 255, 255, 0.2)' : 'none'
                }}
              >
                q[{c.qubit_index}]
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3D Canvas Mount (BKLIT LED Backlit Engine) */}
      <div
        ref={mountRef}
        className="bklit-container"
        style={{
          width: '100%',
          flex: 1,
          minHeight: '260px',
          position: 'relative',
          borderRadius: '6px',
          overflow: 'hidden',
          cursor: 'grab',
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, rgba(5, 5, 5, 0.98) 80%)'
        }}
      />

      {/* Spherical Coordinate Readouts (BKLIT LED Readout Panel) */}
      <div style={{
        marginTop: '12px',
        padding: '12px 14px',
        background: 'rgba(10, 10, 10, 0.9)',
        borderRadius: '6px',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: 'inset 0 0 12px rgba(255, 255, 255, 0.05)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.78rem'
      }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>θ (Polar): </span>
          <span style={{ color: '#ffffff', fontWeight: 700, textShadow: '0 0 8px rgba(255, 255, 255, 0.6)' }}>
            {currentCoord.theta_rad.toFixed(3)} rad ({(currentCoord.theta_rad * 180 / Math.PI).toFixed(1)}°)
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>φ (Azimuth): </span>
          <span style={{ color: '#a1a1aa', fontWeight: 700, textShadow: '0 0 8px rgba(255, 255, 255, 0.4)' }}>
            {currentCoord.phi_rad.toFixed(3)} rad ({(currentCoord.phi_rad * 180 / Math.PI).toFixed(1)}°)
          </span>
        </div>
        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
          <span>X: <strong style={{ color: '#fff', textShadow: '0 0 6px rgba(255,255,255,0.5)' }}>{currentCoord.x.toFixed(3)}</strong></span>
          <span>Y: <strong style={{ color: '#fff', textShadow: '0 0 6px rgba(255,255,255,0.5)' }}>{currentCoord.y.toFixed(3)}</strong></span>
          <span>Z: <strong style={{ color: '#fff', textShadow: '0 0 6px rgba(255,255,255,0.5)' }}>{currentCoord.z.toFixed(3)}</strong></span>
        </div>
      </div>
    </div>
  );
}
