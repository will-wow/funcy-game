import { Center, Text3D } from "@react-three/drei";
import { GroupProps } from "@react-three/fiber";

import { GameNode } from "$nodes/nodes";
import { noop, stopPropagation } from "$utils/utils";
import monogram from "~/assets/monogram.json";

import { RenderInputs } from "./RenderInputs";
import { OnNodeCallback } from "./RenderNodeProps";

export interface TextNodeProps extends Omit<CubeProps, "onClick"> {
  value: string | number;
  node: GameNode;
  onHover?: OnNodeCallback;
  onClick?: OnNodeCallback;
}

export function TextNode({
  value,
  x,
  y,
  color,
  node,
  onHover = noop,
  onClick = noop,
  ...props
}: TextNodeProps) {
  return (
    <group position={[x, 0, y]} {...props}>
      <mesh
        onPointerMove={stopPropagation}
        onPointerEnter={(e) => {
          onHover?.(e, 0);
        }}
        onClick={(e) => {
          onClick?.(e, 0);
        }}
      >
        <Center top position={[0, 0.5, 0]}>
          <Text3D font={monogram as any} height={0.5} size={1} castShadow>
            <meshStandardMaterial color={color} />
            {value || ""}
          </Text3D>
        </Center>
        <Center top>
          <mesh castShadow>
            <boxGeometry args={[1, 0.5, 1]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </Center>
      </mesh>

      <RenderInputs
        node={node}
        color={color}
        onHover={onHover}
        onClick={onClick}
      />
    </group>
  );
}

export interface CubeProps extends Omit<GroupProps, "position" | "rotation"> {
  x: number;
  y: number;
  color?: string;
}
