import { Center, Cone } from "@react-three/drei";
import { Vector2 } from "three";

import { EULER_180_X } from "$three/rotations";

export interface PlayAreaProps {
  onHover: (updateHover: (lastPoint: Vector2 | null) => Vector2 | null) => void;
  onClick: (point: Vector2) => void;
  children: React.ReactNode;
}

/** Render the play area, and send grid-based events back. */
export function PlayArea({ onHover, onClick, children }: PlayAreaProps) {
  return (
    <>
      <Center bottom>
        <Cone
          args={[64, 512]}
          rotation={EULER_180_X}
          onPointerMove={(event) => {
            const x = Math.round(event.point.x);
            const y = Math.round(event.point.z);
            onHover((lastPoint) => {
              if (lastPoint && lastPoint.x === x && lastPoint.y === y) {
                return lastPoint;
              }
              return new Vector2(x, y);
            });
          }}
          onClick={(event) => {
            const x = Math.round(event.point.x);
            const y = Math.round(event.point.z);

            onClick(new Vector2(x, y));
          }}
        >
          <meshStandardMaterial color="#949a49" />
        </Cone>
      </Center>
      {children}
    </>
  );
}
