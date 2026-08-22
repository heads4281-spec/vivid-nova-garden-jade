import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface AnimationEngineProps {
  imageUrl?: string;
  autoRotate?: boolean;
  showControls?: boolean;
}

export const AnimationEngine: React.FC<AnimationEngineProps> = ({
  imageUrl,
  autoRotate = true,
  showControls = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 1000, 10000);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      10000
    );
    camera.position.set(0, 0, 3);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff00ff, 0.3);
    pointLight.position.set(-10, -10, 5);
    scene.add(pointLight);

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 4;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [autoRotate]);

  // Load and convert image to 3D mesh
  const loadImageAsTexture = async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const textureLoader = new THREE.TextureLoader();
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        textureLoader.load(
          url,
          (tex) => resolve(tex),
          undefined,
          (err) => reject(err)
        );
      });

      if (sceneRef.current && meshRef.current) {
        sceneRef.current.remove(meshRef.current);
      }

      // Create shader material with advanced animation
      const material = new THREE.ShaderMaterial({
        uniforms: {
          texture: { value: texture },
          time: { value: 0 },
          distortion: { value: 0.1 },
          colorShift: { value: new THREE.Color(0x00ff88) },
        },
        vertexShader: `
          uniform float time;
          uniform float distortion;
          varying vec2 vUv;
          varying vec3 vPosition;

          void main() {
            vUv = uv;
            vPosition = position;
            
            // Wave animation
            vec3 pos = position;
            pos.z += sin(position.x * 10.0 + time) * distortion;
            pos.y += cos(position.y * 10.0 + time * 0.5) * distortion;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D texture;
          uniform float time;
          uniform vec3 colorShift;
          varying vec2 vUv;
          varying vec3 vPosition;

          void main() {
            vec2 uv = vUv;
            
            // Distortion effect
            uv.x += sin(uv.y * 10.0 + time) * 0.05;
            uv.y += cos(uv.x * 10.0 + time) * 0.05;
            
            vec4 texColor = texture2D(texture, uv);
            
            // Color shift effect
            vec3 shifted = mix(texColor.rgb, colorShift, 0.3);
            
            // Glow effect
            float glow = sin(time) * 0.5 + 0.5;
            gl_FragColor = vec4(shifted * (1.0 + glow * 0.2), texColor.a);
          }
        `,
        side: THREE.DoubleSide,
      });

      // Create geometry and mesh
      const geometry = new THREE.IcosahedronGeometry(2, 32);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      sceneRef.current?.add(mesh);
      meshRef.current = mesh;

      // Animate material uniform
      const animate = () => {
        if (material.uniforms.time) {
          material.uniforms.time.value += 0.01;
        }
        requestAnimationFrame(animate);
      };
      animate();

      setIsLoading(false);
    } catch (err) {
      setError(`Failed to load image: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  // Load image when URL changes
  useEffect(() => {
    if (imageUrl) {
      loadImageAsTexture(imageUrl);
    }
  }, [imageUrl]);

  return (
    <div className="w-full h-full flex flex-col bg-black">
      <div
        ref={containerRef}
        className="flex-1 w-full h-full relative"
        style={{ minHeight: '600px' }}
      />

      {showControls && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md rounded-lg p-4 text-white text-sm">
          <div className="space-y-2">
            <p>🖱️ Drag to rotate | Scroll to zoom | Right-click to pan</p>
            <p>✨ Auto-rotation enabled | Shader effects active</p>
            {isLoading && <p className="text-yellow-400">⏳ Loading texture...</p>}
            {error && <p className="text-red-400">❌ {error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
