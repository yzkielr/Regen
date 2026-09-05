'use client'

import { Canvas } from '@react-three/fiber'
import {
  Center,
  Environment,
  Float,
  Lightformer,
  OrbitControls,
  useGLTF,
} from '@react-three/drei'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { Suspense, useEffect, useRef, useState } from 'react'

function Models() {
  const pen = useGLTF('/pen.glb')
  const retatritude = useGLTF('/retatritude.glb')

  useEffect(() => {
    ;[
      { scene: pen.scene, isPen: true },
      { scene: retatritude.scene, isPen: false },
    ].forEach(({ scene, isPen }) => {
      scene.traverse((child: any) => {
        if (!child.isMesh) return

        const name = child.name?.toLowerCase() || ''

        if (
          name.includes('plane') ||
          name.includes('floor') ||
          name.includes('base')
        ) {
          child.visible = false
          return
        }

        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material]

        materials.forEach((material: any) => {
          if (!material) return

          // Pen lebih matte, cartridge tetap punya pantulan lebih jelas
          if (isPen && 'envMapIntensity' in material) {
            material.envMapIntensity = 0
          }

          if (!isPen && 'envMapIntensity' in material) {
            material.envMapIntensity = 1.2
          }

          material.needsUpdate = true
        })
      })
    })
  }, [pen, retatritude])

  return (
    <group position={[0, -0.15, 0]}>
      <group
        position={[-0.95, 0, 0.35]}
        rotation={[0, Math.PI / 10, -3]}
      >
        <Center>
          <primitive object={pen.scene} scale={0.026} />
        </Center>
      </group>

      <group
        position={[0.95, -0.18, 0]}
        rotation={[0, -Math.PI / 10, 12]}
      >
        <Center>
          <primitive object={retatritude.scene} scale={0.23} />
        </Center>
      </group>
    </group>
  )
}

useGLTF.preload('/pen.glb')
useGLTF.preload('/retatritude.glb')

export default function PenModel() {
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true)

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }

      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false)
      }, 140)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [])

  return (
    <div
      className="absolute inset-y-0 left-1/2 z-20 w-screen -translate-x-1/2"
      style={{ contain: 'layout paint' }}
    >
      <div className="h-full min-h-[650px] w-full cursor-grab active:cursor-grabbing">
        <Canvas
          /*
            Canvas berhenti merender selama halaman di-scroll.
            Model tetap melanjutkan animasi sesaat setelah scroll berhenti.
          */
          frameloop={isScrolling ? 'demand' : 'always'}
          dpr={[1, 1.25]}
          camera={{ position: [0, 0, 9], fov: 45 }}
          gl={{
            alpha: true,
            antialias: true,
            premultipliedAlpha: false,
            powerPreference: 'high-performance',
          }}
          style={{ background: 'transparent' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
            gl.outputColorSpace = SRGBColorSpace
            gl.toneMapping = ACESFilmicToneMapping
            gl.toneMappingExposure = 1.05
          }}
        >
          <Suspense fallback={null}>
            {/* Softbox reflection lokal */}
            <Environment resolution={128} background={false}>
              <Lightformer
                form="rect"
                intensity={4}
                color="#ffffff"
                position={[4, 5, 5]}
                scale={[5, 5, 1]}
              />

              <Lightformer
                form="rect"
                intensity={1.7}
                color="#dcebe6"
                position={[-5, 2, 2]}
                scale={[4, 3, 1]}
              />

              <Lightformer
                form="rect"
                intensity={2.4}
                color="#ffffff"
                position={[0, 4, -5]}
                scale={[3, 5, 1]}
              />
            </Environment>

            {/* Lighting tetap sama */}
            <ambientLight intensity={0.22} />
            <directionalLight position={[5, 8, 6]} intensity={1.65} />
            <directionalLight position={[-5, 3, 4]} intensity={0.5} />
            <directionalLight position={[0, 4, -6]} intensity={0.8} />
            <directionalLight position={[0, -4, 3]} intensity={0.18} />

            <Float
              speed={isScrolling ? 0 : 1.15}
              rotationIntensity={0.07}
              floatIntensity={0.12}
            >
              <Models />
            </Float>
          </Suspense>

          <OrbitControls
            enableZoom={false}
            autoRotate={!isScrolling}
            autoRotateSpeed={0.55}
            enableDamping
            dampingFactor={0.06}
            rotateSpeed={0.75}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
          />
        </Canvas>
      </div>
    </div>
  )
}