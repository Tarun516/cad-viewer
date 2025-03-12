import { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Stage,
  GizmoHelper,
  GizmoViewport,
} from "@react-three/drei";
import { STLLoader } from "three-stdlib";
import { OBJLoader } from "three-stdlib";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

export interface ModelViewerProps {
  modelUrl: string | null;
  fileType: string;
  onExport: (format: string) => void;
}

interface ModelProps {
  url: string;
  fileType: string;
  wireframe: boolean;
}

function Model({ url, fileType, wireframe }: ModelProps) {
  const objRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  if (fileType.toLowerCase() === "obj") {
    // Load OBJ model using OBJLoader
    const model = useLoader(OBJLoader, url);

    // Apply enhanced material settings to all meshes within the OBJ
    useEffect(() => {
      if (objRef.current) {
        objRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            child.material.wireframe = wireframe;
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.color.set("#88ccff");
              child.material.roughness = 0.2;
              child.material.metalness = 0.8;
            }
          }
        });
      }
    }, [wireframe, model]);

    // Center the OBJ model
    useEffect(() => {
      if (objRef.current) {
        const box = new THREE.Box3().setFromObject(objRef.current);
        const center = new THREE.Vector3();
        box.getCenter(center);
        objRef.current.position.sub(center);
      }
    }, [url, model]);

    return <primitive ref={objRef} object={model} />;
  } else {
    // Load STL model using STLLoader
    const geometry = useLoader(STLLoader, url);

    // Center the STL mesh
    useEffect(() => {
      if (meshRef.current) {
        geometry.computeBoundingBox();
        const box = geometry.boundingBox;
        if (box) {
          const center = new THREE.Vector3();
          box.getCenter(center);
          geometry.center();
          meshRef.current.position.copy(center);
        }
      }
    }, [url, geometry]);

    return (
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color="#88ccff"
          roughness={0.2}
          metalness={0.8}
          wireframe={wireframe}
        />
      </mesh>
    );
  }
}

interface SceneProps {
  modelUrl: string | null;
  fileType: string;
  autoRotate: boolean;
  darkBackground: boolean;
  wireframe: boolean;
}

function Scene({
  modelUrl,
  fileType,
  autoRotate,
  darkBackground,
  wireframe,
}: SceneProps) {
  return (
    <>
      {/* Set scene background */}
      <color
        attach="background"
        args={[darkBackground ? "#1a1a1a" : "#ffffff"]}
      />
      {/* Stage automatically centers and lights the model */}
      <Stage
        adjustCamera={true}
        preset="rembrandt"
        intensity={3}
        shadows
        environment={darkBackground ? "city" : "studio"}
      >
        {modelUrl && (
          <Model url={modelUrl} fileType={fileType} wireframe={wireframe} />
        )}
      </Stage>
      {/* OrbitControls for intuitive navigation */}
      <OrbitControls
        makeDefault
        autoRotate={autoRotate}
        autoRotateSpeed={3}
        enableZoom
        enablePan
        minDistance={2}
        maxDistance={20}
      />
      {/* Gizmo for orientation */}
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport />
      </GizmoHelper>
    </>
  );
}

export default function ModelViewer({
  modelUrl,
  fileType,
  onExport,
}: ModelViewerProps) {
  const [autoRotate, setAutoRotate] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [darkBackground, setDarkBackground] = useState(true);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap gap-4 items-center justify-center">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className="px-6 py-2 transition transform duration-300 hover:scale-105 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-md"
        >
          {autoRotate ? "Stop Rotation" : "Auto Rotate"}
        </button>
        <button
          onClick={() => setWireframe(!wireframe)}
          className="px-6 py-2 transition transform duration-300 hover:scale-105 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 shadow-md"
        >
          {wireframe ? "Solid View" : "Wireframe View"}
        </button>
        <button
          onClick={() => setDarkBackground(!darkBackground)}
          className="px-6 py-2 transition transform duration-300 hover:scale-105 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 shadow-md"
        >
          {darkBackground ? "White Background" : "Dark Background"}
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => onExport("stl")}
            className="px-6 py-2 transition transform duration-300 hover:scale-105 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-md"
          >
            Export as STL
          </button>
          <button
            onClick={() => onExport("obj")}
            className="px-6 py-2 transition transform duration-300 hover:scale-105 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-md"
          >
            Export as OBJ
          </button>
        </div>
      </div>

      {/* Full viewport height container for immersive model viewing */}
      <div className="w-full h-screen rounded-lg overflow-hidden shadow-xl">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 35 }}
          style={{ width: "100%", height: "100%" }}
        >
          <Scene
            modelUrl={modelUrl}
            fileType={fileType}
            autoRotate={autoRotate}
            darkBackground={darkBackground}
            wireframe={wireframe}
          />
        </Canvas>
      </div>
    </div>
  );
}
