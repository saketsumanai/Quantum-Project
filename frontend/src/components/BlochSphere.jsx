import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Compass } from 'lucide-react';

export default function BlochSphere({ blochCoordinates = [], selectedQubit = 0, onSelectQubit }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const arrowRef = useRef(null);
  const pointRef = useRef(null);

  const currentCoord = blochCoordinates.find((c) => c.qubit_index === selectedQubit) || {
    x: 0, y: 0, z: 1, theta_rad: 0, phi_rad: 0,
  };

  const theta = currentCoord.theta_rad || 0;
  const phi = currentCoord.phi_rad || 0;
  const prob0 = Math.cos(theta / 2) ** 2;
  const prob1 = Math.sin(theta / 2) ** 2;

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 320;
    const height = currentMount.clientHeight || 280;

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
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
      opacity: 0.35,
      wireframe: false,
      shininess: 90
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphereMesh);

    // 5. Equator & Meridian Rings
    const ringMatCyan = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
    const ringMatSlate = new THREE.LineBasicMaterial({ color: 0x71717a, transparent: true, opacity: 0.5 });

    const equatorGeo = new THREE.BufferGeometry();
    const ringPoints = [];
    for (let i = 0; i <= 64; i++) {
      const thetaAngle = (i / 64) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(Math.cos(thetaAngle), 0, Math.sin(thetaAngle)));
    }
    equatorGeo.setFromPoints(ringPoints);
    const equatorLine = new THREE.Line(equatorGeo, ringMatCyan);
    scene.add(equatorLine);

    const meridianLine1 = new THREE.Line(equatorGeo.clone().rotateZ(Math.PI / 2), ringMatSlate);
    scene.add(meridianLine1);

    // 6. Coordinate Axes
    const axisMat = new THREE.LineBasicMaterial({ color: 0x52525b });
    const createAxis = (from, to) => {
      const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
      return new THREE.Line(geo, axisMat);
    };
    scene.add(createAxis(new THREE.Vector3(-1.3, 0, 0), new THREE.Vector3(1.3, 0, 0)));
    scene.add(createAxis(new THREE.Vector3(0, -1.3, 0), new THREE.Vector3(0, 1.3, 0)));
    scene.add(createAxis(new THREE.Vector3(0, 0, -1.3), new THREE.Vector3(0, 0, 1.3)));

    // 7. State Vector Arrow
    const dir = new THREE.Vector3(currentCoord.x, currentCoord.z, -currentCoord.y).normalize();
    const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), sphereRadius, 0xffffff, 0.16, 0.08);
    scene.add(arrow);
    arrowRef.current = arrow;

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
    <div style={{
      background: 'linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '16px',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      color: '#f3f4f6',
      fontFamily: 'var(--font-sans)',
    }}>
      {/* Header with Qubit Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} color="#ffffff" />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              3D Bloch Sphere
            </div>
            <div style={{ fontSize: '0.7rem', color: '#a1a1aa', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Geometric state projection &amp; basis weights
            </div>
          </div>
        </div>

        {/* Qubit Selector */}
        {blochCoordinates.length > 1 && (
          <div style={{ display: 'flex', gap: '6px' }}>
            {blochCoordinates.map((c) => (
              <button
                key={c.qubit_index}
                onClick={() => onSelectQubit && onSelectQubit(c.qubit_index)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid',
                  background: selectedQubit === c.qubit_index ? '#ffffff' : 'rgba(255,255,255,0.05)',
                  borderColor: selectedQubit === c.qubit_index ? '#ffffff' : 'rgba(255,255,255,0.14)',
                  color: selectedQubit === c.qubit_index ? '#000000' : '#a1a1aa',
                  boxShadow: selectedQubit === c.qubit_index ? '0 0 14px rgba(255,255,255,0.25)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                q[{c.qubit_index}]
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          flex: 1,
          minHeight: '260px',
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          cursor: 'grab',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.04) 0%, rgba(5, 5, 5, 0.98) 85%)'
        }}
      />

      {/* Basis Probability Meters */}
      <div style={{ width: '100%', marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem' }}>
          <span style={{ width: '32px', fontFamily: 'var(--font-mono)', color: '#a1a1aa' }}>|0⟩:</span>
          <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${(prob0 * 100).toFixed(1)}%`, height: '100%', background: 'linear-gradient(90deg, #ffffff, #a1a1aa)', borderRadius: '3px' }} />
          </div>
          <span style={{ width: '42px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
            {(prob0 * 100).toFixed(1)}%
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem' }}>
          <span style={{ width: '32px', fontFamily: 'var(--font-mono)', color: '#a1a1aa' }}>|1⟩:</span>
          <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${(prob1 * 100).toFixed(1)}%`, height: '100%', background: 'linear-gradient(90deg, #d4d4d8, #71717a)', borderRadius: '3px' }} />
          </div>
          <span style={{ width: '42px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
            {(prob1 * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Numeric Coordinate Readout */}
      <div style={{
        marginTop: '12px',
        padding: '10px 14px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.74rem',
        fontFamily: 'var(--font-mono)',
        color: '#a1a1aa',
      }}>
        <span>X: <strong style={{ color: '#fff' }}>{currentCoord.x.toFixed(3)}</strong></span>
        <span>Y: <strong style={{ color: '#fff' }}>{currentCoord.y.toFixed(3)}</strong></span>
        <span>Z: <strong style={{ color: '#fff' }}>{currentCoord.z.toFixed(3)}</strong></span>
        <span>θ: {((theta * 180) / Math.PI).toFixed(1)}°</span>
        <span>φ: {((phi * 180) / Math.PI).toFixed(1)}°</span>
      </div>
    </div>
  );
}
