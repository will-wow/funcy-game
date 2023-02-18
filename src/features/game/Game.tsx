"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { MOUSE } from "three";

import { GameBoard } from "$board/GameBoard";
import { LevelName, levels } from "$levels/levels";
import { getEmptyNode } from "$nodes/empty-node";
import { NINETY_DEGREES } from "$three/rotations";

import { Lighting } from "./env/Lighting";
import {
  getMode,
  getSelectedNode,
  resetNodes,
  setLevel,
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

export interface GameProps {
  levelName: LevelName;
}

export function Game({ levelName }: GameProps) {
  const mode = useMode();
  const focusPoint = useFocusPoint();

  const level = levels[levelName];

  useEffect(() => {
    setLevel(level);
  }, [level]);

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
        <Canvas shadows>
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

        <ModeSelector className="absolute bottom-0 left-0" level={level} />
      </div>
    </Shortcuts>
  );
}
