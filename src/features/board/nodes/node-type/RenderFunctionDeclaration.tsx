import { BBAnchor, Center, Text3D } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";

import { FunctionDeclarationGameNode } from "$nodes/nodes";
import { solarized } from "$utils/dracula";
import monogram from "~/assets/monogram.json";

import { RenderNodeProps } from "./RenderNodeProps";

export function RenderFunctionDeclaration({
  node,
  x,
  y,
  color,
  onClick,
  ...rest
}: RenderNodeProps<FunctionDeclarationGameNode>) {
  const fnColor = color === "#000fff" ? solarized.yellow : solarized.base0;
  function handleClick(e: ThreeEvent<MouseEvent>) {
    onClick?.(e, 0);
  }
  return (
    <group {...rest} position={[x, 0, y]} onClick={handleClick}>
      {/* Wrap in a group, so the BBAnchor doesn't leave the outer group. */}
      <group>
        <mesh position={[0, 0, node.height / 2 - 0.05]}>
          <boxGeometry args={[node.width, 0.2, 0.1]} />
          <meshStandardMaterial color={fnColor} />
        </mesh>

        <mesh position={[0, 0, -(node.height / 2 - 0.05)]}>
          <boxGeometry args={[node.width, 0.2, 0.1]} />
          <meshStandardMaterial color={fnColor} />
        </mesh>

        <mesh position={[node.width / 2, 0, 0]}>
          <boxGeometry args={[0.1, 0.2, node.height]} />
          <meshStandardMaterial color={fnColor} />
        </mesh>

        <mesh position={[-node.width / 2, 0, 0]}>
          <boxGeometry args={[0.1, 0.2, node.height]} />
          <meshStandardMaterial color={fnColor} />
        </mesh>

        <BBAnchor anchor={[-1, 0, -1]}>
          <Center top right position={[0, 0.2, -0.25]}>
            <Text3D font={monogram as any} height={0.5} size={1} castShadow>
              <meshStandardMaterial color={solarized.blue} />
              {node.name || ""}
            </Text3D>
          </Center>
        </BBAnchor>
      </group>
    </group>
  );
}
