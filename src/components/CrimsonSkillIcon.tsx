import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface SkillIconProps {
  skillName: string
  type: 'crimson' | 'void'
  intensity?: number
  isActive?: boolean
  onHover?: (active: boolean) => void
}

interface ParticleSystem {
  positions: Float32Array
  velocities: Float32Array
  colors: Float32Array
  ages: Float32Array
  maxParticles: number
  particleCount: number
}

export const CrimsonSkillIcon: React.FC<SkillIconProps> = ({
  skillName,
  type,
  intensity = 1,
  isActive = false,
  onHover,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const particleSystemRef = useRef<ParticleSystem | null>(null)
  const meshRef = useRef<THREE.Mesh | null>(null)
  const animationFrameRef = useRef<number>()
  const timeRef = useRef(0)

  // Color schemes
  const colorSchemes = {
    crimson: {
      primary: new THREE.Color(0xff0000),
      secondary: new THREE.Color(0xff6600),
      glow: new THREE.Color(0xff3333),
    },
    void: {
      primary: new THREE.Color(0x9933ff),
      secondary: new THREE.Color(0x6600ff),
      glow: new THREE.Color(0xcc66ff),
    },
  }

  const colors = colorSchemes[type]

  // Advanced vertex shader for magical effect
  const vertexShader = `
    uniform float time;
    uniform float intensity;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying float vHeight;
    attribute float aRandom;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      // Multi-layer noise animation
      vec3 pos = position;
      float wave1 = sin(pos.y * 3.0 + time) * 0.05 * intensity;
      float wave2 = cos(pos.x * 2.5 + time * 0.7) * 0.04 * intensity;
      float wave3 = sin((pos.x + pos.y) * 2.0 + time * 0.3) * 0.03 * intensity;
      
      pos += normal * (wave1 + wave2 + wave3);
      
      // Pulsing effect
      float pulse = sin(time * 2.0) * 0.5 + 0.5;
      pos *= (0.95 + pulse * 0.1);
      
      vHeight = length(pos);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `

  // Advanced fragment shader with multiple effects
  const fragmentShader = `
    uniform float time;
    uniform vec3 colorPrimary;
    uniform vec3 colorSecondary;
    uniform vec3 colorGlow;
    uniform float intensity;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying float vHeight;

    // Improved noise function
    float noise(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }

    void main() {
      // Radial gradient from center
      float dist = length(vUv - 0.5) * 2.0;
      float radial = 1.0 - dist;
      radial = smoothstep(0.0, 1.0, radial);
      
      // Animated noise pattern
      vec3 noiseSample = vec3(vUv, time * 0.3);
      float noiseVal = noise(noiseSample * 5.0);
      
      // Wave animation across surface
      float wave = sin(vUv.x * 6.28 + time) * 0.5 + 0.5;
      float ringPattern = sin(dist * 10.0 - time) * 0.5 + 0.5;
      
      // Combine effects
      float energyFlow = wave * radial;
      float magicCircles = ringPattern * radial * 0.7;
      
      // Color mixing
      vec3 baseColor = mix(colorPrimary, colorSecondary, noiseVal);
      vec3 glowColor = mix(colorGlow, colorPrimary, energyFlow);
      
      // Final composition
      vec3 finalColor = mix(baseColor, glowColor, magicCircles);
      finalColor += colorGlow * energyFlow * 0.5;
      
      // Edge glow effect
      float edgeGlow = pow(1.0 - dist, 3.0) * radial;
      finalColor += colorGlow * edgeGlow * intensity * 0.8;
      
      // Fresnel effect
      float fresnel = pow(1.0 - abs(dot(normalize(-vec3(0, 0, 1)), vNormal)), 2.0);
      finalColor += colorGlow * fresnel * 0.3;
      
      // Dynamic brightness
      float brightness = sin(time * 1.5) * 0.3 + 0.7;
      finalColor *= brightness * intensity;
      
      gl_FragColor = vec4(finalColor, radial * intensity);
    }
  `

  // Particle system shader
  const particleVertexShader = `
    attribute float aAge;
    attribute float aLifetime;
    attribute vec3 aVelocity;
    varying float vAlpha;
    varying vec3 vColor;

    uniform vec3 colorPrimary;
    uniform vec3 colorGlow;

    void main() {
      // Fade in and out
      float alpha = (1.0 - (aAge / aLifetime)) * sin(aAge / aLifetime * 3.14159);
      vAlpha = alpha;
      
      // Color transition
      vColor = mix(colorPrimary, colorGlow, aAge / aLifetime);
      
      // Size based on age
      float size = (1.0 - aAge / aLifetime) * 2.0;
      
      gl_PointSize = size;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const particleFragmentShader = `
    varying float vAlpha;
    varying vec3 vColor;

    void main() {
      // Circular particle
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      
      if (dist > 0.5) discard;
      
      // Soft edges
      float alpha = (1.0 - dist * 2.0) * vAlpha;
      gl_FragColor = vec4(vColor, alpha);
    }
  `

  useEffect(() => {
    if (!containerRef.current) return

    try {
      // Scene setup
      const scene = new THREE.Scene()
      sceneRef.current = scene

      // Camera
      const camera = new THREE.PerspectiveCamera(
        75,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      )
      camera.position.z = 2
      cameraRef.current = camera

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      containerRef.current.appendChild(renderer.domElement)
      rendererRef.current = renderer

      // Lighting
      const ambientLight = new THREE.AmbientLight(colors.glow, 0.8)
      scene.add(ambientLight)

      const pointLight = new THREE.PointLight(colors.glow, 1.5)
      pointLight.position.set(2, 2, 2)
      scene.add(pointLight)

      // Create icosahedron geometry with random attributes
      const geometry = new THREE.IcosahedronGeometry(1, 4)
      const randomAttr = new Float32Array(geometry.attributes.position.count)
      for (let i = 0; i < randomAttr.length; i++) {
        randomAttr[i] = Math.random()
      }
      geometry.setAttribute('aRandom', new THREE.BufferAttribute(randomAttr, 1))

      // Material with advanced shader
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          intensity: { value: intensity },
          colorPrimary: { value: colors.primary },
          colorSecondary: { value: colors.secondary },
          colorGlow: { value: colors.glow },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      })

      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)
      meshRef.current = mesh

      // Particle system
      const particleGeometry = new THREE.BufferGeometry()
      const particleCount = 100
      const positions = new Float32Array(particleCount * 3)
      const velocities = new Float32Array(particleCount * 3)
      const ages = new Float32Array(particleCount)
      const lifetimes = new Float32Array(particleCount)
      const colors_particles = new Float32Array(particleCount * 3)

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.random() * Math.PI * 2)
        const radius = Math.random() * 0.5
        positions[i * 3] = Math.cos(angle) * radius
        positions[i * 3 + 1] = Math.sin(angle) * radius
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2

        velocities[i * 3] = Math.cos(angle) * (Math.random() * 1 + 0.5)
        velocities[i * 3 + 1] = Math.sin(angle) * (Math.random() * 1 + 0.5)
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5

        ages[i] = Math.random() * 2
        lifetimes[i] = 2 + Math.random()
        colors_particles[i * 3] = colors.primary.r
        colors_particles[i * 3 + 1] = colors.primary.g
        colors_particles[i * 3 + 2] = colors.primary.b
      }

      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      particleGeometry.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3))
      particleGeometry.setAttribute('aAge', new THREE.BufferAttribute(ages, 1))
      particleGeometry.setAttribute('aLifetime', new THREE.BufferAttribute(lifetimes, 1))
      particleGeometry.setAttribute('aColor', new THREE.BufferAttribute(colors_particles, 3))

      const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
          colorPrimary: { value: colors.primary },
          colorGlow: { value: colors.glow },
        },
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
      })

      const particles = new THREE.Points(particleGeometry, particleMaterial)
      scene.add(particles)

      particleSystemRef.current = {
        positions,
        velocities,
        colors: colors_particles,
        ages,
        maxParticles: particleCount,
        particleCount,
      }

      // Animation loop
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate)
        timeRef.current += 0.016

        if (material instanceof THREE.ShaderMaterial) {
          material.uniforms.time.value = timeRef.current
          material.uniforms.intensity.value = intensity
        }

        // Rotate mesh
        if (meshRef.current) {
          meshRef.current.rotation.x += 0.002 * intensity
          meshRef.current.rotation.y += 0.003 * intensity
        }

        // Update particles
        if (particleSystemRef.current) {
          const ps = particleSystemRef.current
          for (let i = 0; i < ps.particleCount; i++) {
            ps.ages[i] += 0.016
            if (ps.ages[i] > ps.lifetimes[i]) {
              ps.ages[i] = 0
            }

            ps.positions[i * 3] += ps.velocities[i * 3] * 0.01
            ps.positions[i * 3 + 1] += ps.velocities[i * 3 + 1] * 0.01
            ps.positions[i * 3 + 2] += ps.velocities[i * 3 + 2] * 0.01
          }
          particleGeometry.attributes.position.needsUpdate = true
          particleGeometry.attributes.aAge.needsUpdate = true
        }

        renderer.render(scene, camera)
      }
      animate()

      // Hover effects
      const handleMouseEnter = () => {
        if (onHover) onHover(true)
        if (material instanceof THREE.ShaderMaterial) {
          material.uniforms.intensity.value = Math.min(intensity * 1.5, 2)
        }
      }

      const handleMouseLeave = () => {
        if (onHover) onHover(false)
        if (material instanceof THREE.ShaderMaterial) {
          material.uniforms.intensity.value = intensity
        }
      }

      containerRef.current?.addEventListener('mouseenter', handleMouseEnter)
      containerRef.current?.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        containerRef.current?.removeEventListener('mouseenter', handleMouseEnter)
        containerRef.current?.removeEventListener('mouseleave', handleMouseLeave)
        renderer.dispose()
        geometry.dispose()
        particleGeometry.dispose()
      }
    } catch (err) {
      console.error('Skill icon initialization failed:', err)
    }
  }, [type, intensity, onHover])

  return (
    <div
      ref={containerRef}
      className={`w-32 h-32 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
        type === 'crimson'
          ? 'border-red-500/50 hover:border-red-400/80'
          : 'border-purple-500/50 hover:border-purple-400/80'
      } ${isActive ? 'ring-2 ring-offset-2 ring-yellow-400' : ''}`}
      style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.95))' }}
    />
  )
}
