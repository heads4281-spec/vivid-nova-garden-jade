import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface WeaponMechanics {
  name: string
  type: 'melee' | 'ranged' | 'magical' | 'hybrid'
  damage: number
  attackSpeed: number
  critChance: number
  range: number
  description: string
  effects: string[]
}

interface ProjectilePhysics {
  position: THREE.Vector3
  velocity: THREE.Vector3
  acceleration: THREE.Vector3
  lifetime: number
  maxLifetime: number
  damage: number
}

export const WeaponMechanicsEngine: React.FC<{
  weapon: WeaponMechanics
  isActive?: boolean
}> = ({ weapon, isActive = false }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const weaponMeshRef = useRef<THREE.Group | null>(null)
  const projectilesRef = useRef<ProjectilePhysics[]>([])
  const particlesRef = useRef<THREE.Points | null>(null)
  const animationFrameRef = useRef<number>()
  const timeRef = useRef(0)

  // Advanced weapon vertex shader
  const weaponVertexShader = `
    uniform float time;
    uniform float attackAnimation;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying float vDamage;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      vec3 pos = position;
      
      // Attack swing animation
      if (attackAnimation > 0.0) {
        float swing = sin(attackAnimation * 3.14159) * 0.3;
        pos.z += swing;
        pos.x += sin(attackAnimation * 3.14159) * 0.2;
      }
      
      // Idle rotation
      float idleRotX = sin(time * 0.5) * 0.05;
      float idleRotY = cos(time * 0.3) * 0.05;
      pos.x += idleRotX;
      pos.y += idleRotY;
      
      // Damage glow intensity
      vDamage = attackAnimation;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `

  // Advanced weapon fragment shader
  const weaponFragmentShader = `
    uniform float time;
    uniform vec3 weaponColor;
    uniform sampler2D texture;
    uniform float damage;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying float vDamage;

    void main() {
      vec3 color = weaponColor;
      
      // Energy flow along weapon
      float energyFlow = sin(vUv.y * 5.0 + time) * 0.5 + 0.5;
      
      // Damage intensity glow
      float damageGlow = vDamage * damage * 0.5;
      
      // Metal material effect
      vec3 metalColor = mix(color, vec3(1.0), 0.3);
      
      // Fresnel rim light
      vec3 viewDir = normalize(-vec3(0, 0, 1));
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);
      
      vec3 finalColor = metalColor * (1.0 + energyFlow * 0.2);
      finalColor += color * fresnel * (1.0 + damageGlow);
      finalColor += vec3(1.0, 0.5, 0.0) * energyFlow * damageGlow;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `

  // Projectile vertex shader
  const projectileVertexShader = `
    uniform float time;
    varying vec2 vUv;
    varying float vAge;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  // Projectile fragment shader
  const projectileFragmentShader = `
    uniform vec3 projectileColor;
    uniform float damage;
    varying vec2 vUv;

    void main() {
      vec2 center = vUv - 0.5;
      float dist = length(center) * 2.0;
      
      if (dist > 1.0) discard;
      
      float glow = (1.0 - dist) * (1.0 + damage);
      gl_FragColor = vec4(projectileColor, glow);
    }
  `

  // Create weapon based on type
  const createWeapon = (scene: THREE.Scene, weaponType: string) => {
    const weaponGroup = new THREE.Group()
    
    switch (weaponType) {
      case 'sword': {
        // Blade
        const bladeGeo = new THREE.BoxGeometry(0.1, 1.5, 0.02)
        const bladeMat = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            attackAnimation: { value: 0 },
            weaponColor: { value: new THREE.Color(0xff3333) },
            damage: { value: weapon.damage / 100 },
          },
          vertexShader: weaponVertexShader,
          fragmentShader: weaponFragmentShader,
        })
        const blade = new THREE.Mesh(bladeGeo, bladeMat)
        blade.position.z = 0.5
        weaponGroup.add(blade)

        // Guard
        const guardGeo = new THREE.BoxGeometry(0.3, 0.1, 0.05)
        const guardMat = new THREE.MeshPhongMaterial({ color: 0xffaa00 })
        const guard = new THREE.Mesh(guardGeo, guardMat)
        guard.position.y = -0.5
        guard.position.z = 0.5
        weaponGroup.add(guard)

        // Handle
        const handleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8)
        const handleMat = new THREE.MeshPhongMaterial({ color: 0x8b4513 })
        const handle = new THREE.Mesh(handleGeo, handleMat)
        handle.position.y = -1
        handle.position.z = 0.5
        weaponGroup.add(handle)
        break
      }
      case 'axe': {
        // Blade (double-sided)
        const bladeGeo = new THREE.BoxGeometry(0.3, 0.8, 0.05)
        const bladeMat = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            attackAnimation: { value: 0 },
            weaponColor: { value: new THREE.Color(0xff6666) },
            damage: { value: weapon.damage / 100 },
          },
          vertexShader: weaponVertexShader,
          fragmentShader: weaponFragmentShader,
        })
        const blade = new THREE.Mesh(bladeGeo, bladeMat)
        blade.position.z = 0.5
        blade.rotation.z = Math.PI / 4
        weaponGroup.add(blade)

        // Handle
        const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1, 8)
        const handleMat = new THREE.MeshPhongMaterial({ color: 0x654321 })
        const handle = new THREE.Mesh(handleGeo, handleMat)
        handle.position.y = -0.5
        handle.position.z = 0.5
        weaponGroup.add(handle)
        break
      }
      case 'bow': {
        // Bow frame
        const bowGeo = new THREE.BufferGeometry()
        const bowPositions = new Float32Array([
          -0.2, 1, 0, 0, 0.5, 0, -0.2, -1, 0,
          0.2, 1, 0, 0, 0.5, 0, 0.2, -1, 0,
        ])
        bowGeo.setAttribute('position', new THREE.BufferAttribute(bowPositions, 3))
        const bowMat = new THREE.LineBasicMaterial({ color: 0x8b4513 })
        const bow = new THREE.LineSegments(bowGeo, bowMat)
        weaponGroup.add(bow)

        // String
        const stringGeo = new THREE.BufferGeometry()
        const stringPositions = new Float32Array([
          0, 1, 0, 0.1, 0, 0, 0, -1, 0,
        ])
        stringGeo.setAttribute('position', new THREE.BufferAttribute(stringPositions, 3))
        const stringMat = new THREE.LineBasicMaterial({ color: 0xcccccc })
        const string = new THREE.LineSegments(stringGeo, stringMat)
        weaponGroup.add(string)
        break
      }
      case 'staff': {
        // Shaft
        const shaftGeo = new THREE.CylinderGeometry(0.05, 0.05, 2, 8)
        const shaftMat = new THREE.MeshPhongMaterial({ color: 0x8b4513 })
        const shaft = new THREE.Mesh(shaftGeo, shaftMat)
        shaft.position.z = 0.5
        weaponGroup.add(shaft)

        // Orb at top
        const orbGeo = new THREE.SphereGeometry(0.15, 16, 16)
        const orbMat = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            attackAnimation: { value: 0 },
            weaponColor: { value: new THREE.Color(0x9933ff) },
            damage: { value: weapon.damage / 100 },
          },
          vertexShader: weaponVertexShader,
          fragmentShader: weaponFragmentShader,
        })
        const orb = new THREE.Mesh(orbGeo, orbMat)
        orb.position.y = 1.2
        orb.position.z = 0.5
        weaponGroup.add(orb)
        break
      }
    }

    scene.add(weaponGroup)
    return weaponGroup
  }

  // Fire projectile
  const fireProjectile = (weaponMesh: THREE.Group) => {
    const projectile: ProjectilePhysics = {
      position: weaponMesh.position.clone().add(new THREE.Vector3(0, 0.5, 0.5)),
      velocity: new THREE.Vector3(0, 0.5, 1).multiplyScalar(weapon.range * 2),
      acceleration: new THREE.Vector3(0, -9.81 * 0.5, 0),
      lifetime: 0,
      maxLifetime: 5,
      damage: weapon.damage,
    }
    projectilesRef.current.push(projectile)
  }

  // Initialize scene
  useEffect(() => {
    if (!containerRef.current) return

    try {
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x1a1a1a)
      sceneRef.current = scene

      const camera = new THREE.PerspectiveCamera(
        75,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      )
      camera.position.set(0, 0, 3)
      cameraRef.current = camera

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      containerRef.current.appendChild(renderer.domElement)
      rendererRef.current = renderer

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight.position.set(5, 10, 5)
      scene.add(directionalLight)

      const pointLight = new THREE.PointLight(0xff3333, 1)
      pointLight.position.set(0, 0, 2)
      scene.add(pointLight)

      // Create weapon
      let weaponType = 'sword'
      if (weapon.type === 'melee') weaponType = 'sword'
      else if (weapon.type === 'ranged') weaponType = 'bow'
      else if (weapon.type === 'magical') weaponType = 'staff'
      else weaponType = 'axe'

      const weaponMesh = createWeapon(scene, weaponType)
      weaponMeshRef.current = weaponMesh

      // Animation loop
      let attackProgress = 0
      let lastShotTime = 0

      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate)
        timeRef.current += 0.016

        // Weapon rotation and animation
        if (weaponMesh) {
          weaponMesh.rotation.x += 0.01
          weaponMesh.rotation.y += 0.015

          // Attack animation
          if (isActive) {
            attackProgress += 0.05
            if (attackProgress >= 1) {
              attackProgress = 0
              if (timeRef.current - lastShotTime > 1 / weapon.attackSpeed) {
                fireProjectile(weaponMesh)
                lastShotTime = timeRef.current
              }
            }

            // Update shader uniforms
            weaponMesh.children.forEach((child) => {
              if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
                child.material.uniforms.time.value = timeRef.current
                child.material.uniforms.attackAnimation.value = attackProgress
              }
            })
          }
        }

        // Update projectiles
        projectilesRef.current = projectilesRef.current.filter((proj) => {
          proj.lifetime += 0.016
          if (proj.lifetime > proj.maxLifetime) return false

          // Physics
          proj.velocity.add(proj.acceleration.clone().multiplyScalar(0.016))
          proj.position.add(proj.velocity.clone().multiplyScalar(0.016))

          return true
        })

        renderer.render(scene, camera)
      }
      animate()

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        containerRef.current?.removeChild(renderer.domElement)
        renderer.dispose()
      }
    } catch (err) {
      console.error('Weapon mechanics engine failed:', err)
    }
  }, [weapon, isActive])

  return <div ref={containerRef} className="w-full h-64 rounded-lg overflow-hidden bg-gray-900" />
}
