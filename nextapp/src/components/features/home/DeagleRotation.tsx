"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  useGLTF,
  Center,
  Environment,
  ContactShadows,
  Float,
} from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store";

export function DeagleRotation() {
  const { scene } = useGLTF("/models/deagle.glb");
  const rotationGroupRef = useRef<THREE.Group>(null);
  const scrollYProgress = useStore((state) => state.scrollYProgress);

  useFrame(() => {
    if (!rotationGroupRef.current) return;
    const p = scrollYProgress.get();
    const initialRotation = {
      x: THREE.MathUtils.degToRad(135),
      y: THREE.MathUtils.degToRad(40),
      z: THREE.MathUtils.degToRad(230),
    };

    // Вращение (вокруг своей оси)
    rotationGroupRef.current.rotation.x = initialRotation.x + p * Math.PI * 4;
    rotationGroupRef.current.rotation.y = initialRotation.y + p * Math.PI * 4;
    rotationGroupRef.current.rotation.z = initialRotation.z + p * Math.PI * 4;
  });

  return (
    <>
      <Environment preset="city" />

      {/* 1. ПОЗИЦИОННАЯ ГРУППА: Смещаем всё влево */}
      {/* x: -1.5 (влево), y: 0, z: 0 */}
      <group position={[-1.1, 0, 0]}>
        {/* 2. ГРУППА ВРАЩЕНИЯ: Крутится в локальных координатах */}
        <group ref={rotationGroupRef}>
          <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
            {/* 3. ЦЕНТРОВЩИК: Делает ось вращения правильной */}
            <Center>
              <primitive object={scene} scale={1.8} />
            </Center>
          </Float>
        </group>
      </group>

      {/* Тень тоже стоит сместить чуть левее, чтобы она была под пушкой */}
      <ContactShadows
        position={[-1.5, -1.5, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
      />
    </>
  );
}
