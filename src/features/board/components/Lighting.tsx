import { Environment, Sky, PerspectiveCamera } from "@react-three/drei";
import { EULER_NEGATIVE_90_X } from "$three/rotations";

export function Lighting() {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 15, 0]}
        rotation={EULER_NEGATIVE_90_X}
      />

      <ambientLight intensity={0.1} />
      <directionalLight position={[0, 500, 500]} />

      <Environment preset="forest" />
      <Sky
        distance={450000}
        sunPosition={[0.5, 1, 0]}
        inclination={0}
        azimuth={0.25}
      />
    </>
  );
}
