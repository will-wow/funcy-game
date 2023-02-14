import {
  Environment,
  PerspectiveCamera,
  Sky,
  useHelper,
} from "@react-three/drei";
import { useCallback, useRef } from "react";
import {
  CameraHelper,
  DirectionalLight,
  OrthographicCamera,
  Vector3,
} from "three";

import { EULER_NEGATIVE_90_X } from "$three/rotations";

const LIGHT_POSITION = new Vector3(100, 200, 500);

export function Lighting() {
  const lightRef = useCameraHelper(false);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 15, 0]}
        rotation={EULER_NEGATIVE_90_X}
      />

      <ambientLight intensity={0.1} />
      <directionalLight
        ref={lightRef}
        intensity={1}
        position={LIGHT_POSITION}
        shadow-camera-near={0.5}
        shadow-camera-far={800}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-mapSize={[4056, 4056]}
        castShadow
        color="#fff5b6"
      />

      <Environment preset="warehouse" background />
      <Sky sunPosition={LIGHT_POSITION} />
    </>
  );
}

const useCameraHelper = (enabled = false) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const cameraRef = useRef<OrthographicCamera>(null!);

  const ref = useCallback(
    (directionalLight: DirectionalLight) => {
      cameraRef.current = directionalLight?.shadow.camera;
    },
    [cameraRef]
  );

  useHelper(enabled && cameraRef, CameraHelper);

  return ref;
};
