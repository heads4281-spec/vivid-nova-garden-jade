import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

interface AnimationEngineProps {
  imageUrl?: string
  autoRotate?: boolean
  showControls?: boolean
  quality?: 'low' | 'medium' | 'high' | 'ultra'
  textureQuality?: 'low' | 'medium' | 'high'
  enablePostProcessing?: boolean
}

interface RenderSettings {
  resolution: number
  geometrySubdivisions: number
  shadowMapSize: number
  antialias: boolean
  pixelRatio: number
}

export const AnimationEngine: React.FC<AnimationEngineProps> = ({
  imageUrl,
  autoRotate = true,
  showControls = true,
  quality = 'high',
  textureQuality = 'high',
  enablePostProcessing = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const meshRef = useRef<THREE.Mesh | null>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const animationFrameRef = useRef<number>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fps, setFps] = useState(0)
  const [selectedQuality, setSelectedQuality] = useState<'low' | 'medium' | 'high' | 'ultra'>(quality)
  const [textureQualityOption, setTextureQualityOption] = useState<'low' | 'medium' | 'high'>(textureQuality)
  const [enableEffects, setEnableEffects] = useState(enablePostProcessing)
  const [waveIntensity, setWaveIntensity] = useState(0.1)
  const [glowIntensity, setGlowIntensity] = useState(0.5)
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(autoRotate)

  // Quality settings mapping
  const qualitySettings: Record<string, RenderSettings> = {
    low: {
      resolution: 0.5,
      geometrySubdivisions: 8,
      shadowMapSize: 512,
      antialias: false,
      pixelRatio: 1,
    },
    medium: {
      resolution: 0.75,
      geometrySubdivisions: 16,
      shadowMapSize: 1024,
      antialias: true,
      pixelRatio: 1,
    },
    high: {
      resolution: 1,
      geometrySubdivisions: 32,
      shadowMapSize: 2048,
      antialias: true,
      pixelRatio: window.devicePixelRatio,
    },
    ultra: {
      resolution: 1,
      geometrySubdivisions: 64,
      shadowMapSize: 4096,
      antialias: true,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    },
  }

  // Advanced vertex shader with multiple effects
  const vertexShader = `
    uniform float time;
    uniform float distortion;
    uniform float waveFrequency;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vWave;

    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      
      // Wave animation - multiple layers for complex motion
      vec3 pos = position;
      float wave1 = sin(position.x * waveFrequency + time) * distortion;
      float wave2 = cos(position.y * waveFrequency * 0.8 + time * 0.5) * distortion * 0.6;
      float wave3 = sin((position.x + position.y) * waveFrequency * 0.6 + time * 0.3) * distortion * 0.4;
      
      pos.z += wave1 + wave2 + wave3;
      vWave = wave1;
      
      // Subtle breathing effect
      float breathing = sin(time * 0.5) * 0.02;
      pos *= (1.0 + breathing);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `

  // Advanced fragment shader with multiple effects
  const fragmentShader = `
    uniform sampler2D texture;
    uniform float time;
    uniform vec3 colorShift;
    uniform float glowIntensity;
    uniform float waveIntensity;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vWave;

    void main() {
      vec2 uv = vUv;
      
      // Parallax distortion
      uv.x += sin(uv.y * 10.0 + time) * 0.02 * waveIntensity;
      uv.y += cos(uv.x * 10.0 + time * 0.7) * 0.02 * waveIntensity;
      
      // Chromatic aberration effect
      vec4 color;
      color.r = texture2D(texture, uv + vec2(0.01, 0.0)).r;
      color.g = texture2D(texture, uv).g;
      color.b = texture2D(texture, uv - vec2(0.01, 0.0)).b;
      color.a = texture2D(texture, uv).a;
      
      // Apply color shift
      vec3 shifted = mix(color.rgb, colorShift, 0.25);
      
      // Dynamic glow based on wave
      float glow = sin(time) * 0.5 + 0.5;
      float waveGlow = abs(vWave) * glowIntensity;
      
      // Fresnel effect for rim lighting
      vec3 viewDir = normalize(-vPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
      
      // Combine effects
      vec3 finalColor = shifted * (1.0 + (glow + waveGlow) * 0.3);
      finalColor += fresnel * colorShift * 0.2;
      
      // Vignette effect
      vec2 vignette = uv * (1.0 - uv);
      float vig = clamp(pow(vignette.x * vignette.y * 15.0, 0.25), 0.0, 1.0);
      finalColor *= mix(0.5, 1.0, vig);
      
      gl_FragColor = vec4(finalColor, color.a);
    }
  `

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return

    const settings = qualitySettings[selectedQuality]
    const width = containerRef.current.clientWidth * settings.resolution
    const height = containerRef.current.clientHeight * settings.resolution

    try {
      // Scene setup
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x000000)
      scene.fog = new THREE.Fog(0x000000, 1000, 10000)
      sceneRef.current = scene

      // Camera setup
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000)
      camera.position.set(0, 0, 3)
      cameraRef.current = camera

      // Renderer setup with optimization
      const renderer = new THREE.WebGLRenderer({
        antialias: settings.antialias,
        alpha: true,
        powerPreference: selectedQuality === 'low' ? 'low-power' : 'high-performance',
        precision: selectedQuality === 'low' ? 'lowp' : 'highp',
      })
      renderer.setSize(width, height)
      renderer.setPixelRatio(settings.pixelRatio)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = selectedQuality === 'low' ? THREE.BasicShadowMap : THREE.PCFShadowShadowMap
      renderer.shadowMap.autoUpdate = selectedQuality !== 'low'
      containerRef.current.appendChild(renderer.domElement)
      rendererRef.current = renderer

      // Advanced lighting setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(10, 10, 5)
      directionalLight.castShadow = selectedQuality !== 'low'
      if (directionalLight.shadow) {
        directionalLight.shadow.camera.left = -50
        directionalLight.shadow.camera.right = 50
        directionalLight.shadow.camera.top = 50
        directionalLight.shadow.camera.bottom = -50
        directionalLight.shadow.mapSize.width = settings.shadowMapSize
        directionalLight.shadow.mapSize.height = settings.shadowMapSize
        directionalLight.shadow.bias = -0.0001
      }
      scene.add(directionalLight)

      const pointLight = new THREE.PointLight(0xff00ff, 0.3)
      pointLight.position.set(-10, -10, 5)
      scene.add(pointLight)

      // Orbit controls
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.autoRotate = autoRotateEnabled
      controls.autoRotateSpeed = 4
      controls.enableZoom = true
      controls.enablePan = true
      controls.minDistance = 1
      controls.maxDistance = 10
      controlsRef.current = controls

      // FPS counter
      let frameCount = 0
      let lastTime = performance.now()

      // Animation loop
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate)

        // FPS calculation
        frameCount++
        const currentTime = performance.now()
        if (currentTime - lastTime >= 1000) {
          setFps(frameCount)
          frameCount = 0
          lastTime = currentTime
        }

        if (controlsRef.current) controlsRef.current.update()

        // Update shader uniforms
        if (materialRef.current) {
          materialRef.current.uniforms.time.value += 0.01
          materialRef.current.uniforms.distortion.value = waveIntensity
          materialRef.current.uniforms.glowIntensity.value = glowIntensity
        }

        renderer.render(scene, camera)
      }
      animate()

      // Handle window resize
      const handleResize = () => {
        if (!containerRef.current) return
        const newWidth = containerRef.current.clientWidth * settings.resolution
        const newHeight = containerRef.current.clientHeight * settings.resolution
        camera.aspect = newWidth / newHeight
        camera.updateProjectionMatrix()
        renderer.setSize(newWidth, newHeight)
      }
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        containerRef.current?.removeChild(renderer.domElement)
        renderer.dispose()
      }
    } catch (err) {
      setError(`Initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [selectedQuality, autoRotateEnabled, waveIntensity, glowIntensity])

  // Load and convert image to 3D mesh
  const loadImageAsTexture = async (url: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const textureLoader = new THREE.TextureLoader()
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        textureLoader.load(
          url,
          (tex) => resolve(tex),
          undefined,
          (err) => reject(err)
        )
      })

      // Apply texture quality settings
      if (textureQualityOption === 'low') {
        texture.magFilter = THREE.NearestFilter
        texture.minFilter = THREE.NearestFilter
      } else if (textureQualityOption === 'medium') {
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearMipmapLinearFilter
      } else {
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearMipmapLinearFilter
        texture.anisotropy = 16
      }

      if (sceneRef.current && meshRef.current) {
        sceneRef.current.remove(meshRef.current)
      }

      // Create shader material
      const material = new THREE.ShaderMaterial({
        uniforms: {
          texture: { value: texture },
          time: { value: 0 },
          distortion: { value: waveIntensity },
          waveFrequency: { value: 5 },
          colorShift: { value: new THREE.Color(0x00ff88) },
          glowIntensity: { value: glowIntensity },
        },
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
      })
      materialRef.current = material

      // Get geometry settings based on quality
      const settings = qualitySettings[selectedQuality]
      const geometry = new THREE.IcosahedronGeometry(2, settings.geometrySubdivisions)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = selectedQuality !== 'low'
      mesh.receiveShadow = selectedQuality !== 'low'
      sceneRef.current?.add(mesh)
      meshRef.current = mesh

      setIsLoading(false)
    } catch (err) {
      setError(`Failed to load image: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setIsLoading(false)
    }
  }

  // Load image when URL changes
  useEffect(() => {
    if (imageUrl) {
      loadImageAsTexture(imageUrl)
    }
  }, [imageUrl])

  return (
    <div className="w-full h-full flex flex-col bg-black">
      <div
        ref={containerRef}
        className="flex-1 w-full h-full relative"
        style={{ minHeight: '600px' }}
      />

      {/* Settings Panel */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md rounded-lg p-4 text-white text-sm max-w-xs">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Quality</label>
            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value as any)}
              className="w-full bg-gray-900 border border-purple-500/30 rounded px-2 py-1 text-xs"
            >
              <option value="low">Low (13gen weak phones)</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="ultra">Ultra (Advanced devices)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Texture Quality</label>
            <select
              value={textureQualityOption}
              onChange={(e) => setTextureQualityOption(e.target.value as any)}
              className="w-full bg-gray-900 border border-purple-500/30 rounded px-2 py-1 text-xs"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Wave Intensity: {waveIntensity.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={waveIntensity}
              onChange={(e) => setWaveIntensity(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Glow Intensity: {glowIntensity.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={glowIntensity}
              onChange={(e) => setGlowIntensity(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRotateEnabled}
              onChange={(e) => setAutoRotateEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-xs">Auto Rotation</span>
          </label>

          <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
            <p>FPS: {fps}</p>
            <p>Quality: {selectedQuality.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Controls Info */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md rounded-lg p-4 text-white text-sm">
        <div className="space-y-2">
          <p>🖱️ Drag to rotate | Scroll to zoom | Right-click to pan</p>
          <p>✨ Auto-rotation & Shader effects active</p>
          {isLoading && <p className="text-yellow-400">⏳ Loading texture...</p>}
          {error && <p className="text-red-400">❌ {error}</p>}
        </div>
      </div>
    </div>
  )
}
