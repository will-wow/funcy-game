import { Cone } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useCallback } from "react";
import React from "react";
import { Vector2 } from "three";

import { setFocusPoint } from "$game/game.store";
import { EULER_180_X } from "$three/rotations";
import { solarized } from "$utils/dracula";

export interface PlayAreaProps {
  onHover: (updateHover: (lastPoint: Vector2 | null) => Vector2 | null) => void;
  onClick: (point: Vector2) => void;
  children: React.ReactNode;
}

/** Render the play area, and send grid-based events back. */
function PlayAreaComponent({ onHover, onClick, children }: PlayAreaProps) {
  const handleHover = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      const x = Math.round(event.point.x);
      const y = Math.round(event.point.z);
      onHover((lastPoint) => {
        if (lastPoint && lastPoint.x === x && lastPoint.y === y) {
          return lastPoint;
        }
        return new Vector2(x, y);
      });
    },
    [onHover]
  );

  return (
    <>
      <Cone
        args={[64, 512]}
        position={[0, -256, 0]}
        rotation={EULER_180_X}
        onPointerMove={handleHover}
        onClick={(event) => {
          const x = Math.round(event.point.x);
          const y = Math.round(event.point.z);

          onClick(new Vector2(x, y));
        }}
        onDoubleClick={(event) => {
          event.stopPropagation();
          setFocusPoint(event.point);
        }}
        receiveShadow
      >
        <meshStandardMaterial color={solarized.base3} />
      </Cone>

      <mesh castShadow position={[0, 0.5, 2]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={solarized.base3} />
      </mesh>

      {children}
    </>
  );
}
export const PlayArea = React.memo(PlayAreaComponent);
PlayArea.displayName = "PlayArea";
