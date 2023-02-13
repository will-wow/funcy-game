"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { MOUSE } from "three";

import { GameBoard } from "$board/GameBoard";
import { getEmptyNode } from "$nodes/empty-node";
import { NINETY_DEGREES } from "$three/rotations";

import { Lighting } from "./env/Lighting";
import {
  getMode,
  getSelectedNode,
  resetNodes,
  setMode,
  setNodeToPlace,
  setSelectedNode,
  useFocusPoint,
  useMode,
} from "./game.store";
import { EditSelectedNode } from "./ui/EditNode";
import { ModeSelector } from "./ui/ModeSelector";
import { NodeSelector } from "./ui/NodeSelector";
import { Shortcuts } from "./ui/Shortcuts";

export function Game() {
  const mode = useMode();
  const focusPoint = useFocusPoint();

  return (
    <Shortcuts
      onChange={(name, pressed) => {
        if (!pressed) return;

        if (name === "esc") {
          if (getSelectedNode()) {
            setSelectedNode(null);
          } else {
            setMode("select");
          }
        } else if (name === "place") {
          setMode("place");
        } else if (name === "connect") {
          setMode("connect");
        } else if (getMode() === "place") {
          const node = getEmptyNode({ kind: name });
          setNodeToPlace(node);
        }
      }}
    >
      <div
        className="h-screen relative"
        onContextMenu={(e) => {
          e.preventDefault();

          if (mode === "connect") {
            setSelectedNode(null);
          }
        }}
      >
        <Canvas>
          <GameBoard />

          <Lighting />

          <OrbitControls
            target={focusPoint}
            mouseButtons={{
              MIDDLE: MOUSE.DOLLY,
              RIGHT: MOUSE.ROTATE,
            }}
            maxPolarAngle={NINETY_DEGREES - 0.01}
            maxDistance={100}
          />
        </Canvas>

        <div className="absolute top-0 right-0 flex flex-col">
          <button className="border border-white" onClick={resetNodes}>
            Clear
          </button>
          <br />
          <NodeSelector />
        </div>

        <EditSelectedNode className="absolute top-0 left-0" />

        <ModeSelector className="absolute bottom-0 left-0" />
      </div>
    </Shortcuts>
  );
}
