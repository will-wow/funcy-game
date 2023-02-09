"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { MOUSE } from "three";

import { GameBoard } from "$board/GameBoard";
import { getEmptyNode } from "$nodes/empty-node";
import { GameNode, NodeId } from "$nodes/nodes";
import { compileNodes } from "$parser/compile";
import { NINETY_DEGREES } from "$three/rotations";

import { Lighting } from "./env/Lighting";
import { NodeSelector } from "./ui/NodeSelector";

const DEFAULT_FUNCTION: Record<string, GameNode> = {
  p1: getEmptyNode("Parameter", { x: -12, y: 0, id: "p1" }),
  return: getEmptyNode("ReturnStatement", { x: 12, y: 0, id: "return" }),
};

export function Game() {
  const [nodes, setNodes] =
    useState<Record<NodeId, GameNode>>(DEFAULT_FUNCTION);
  const [mode, setMode] = useState<"place" | "connect">("place");
  const [nodeToPlace, setNodeToPlace] = useState<GameNode | null>(null);

  return (
    <div className="h-screen relative">
      <Canvas>
        <GameBoard
          mode={mode}
          nodeToPlace={nodeToPlace}
          nodes={nodes}
          onNodes={setNodes}
        />

        <Lighting />

        <OrbitControls
          mouseButtons={{
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.ROTATE,
          }}
          maxPolarAngle={NINETY_DEGREES - 0.01}
          maxDistance={100}
        />
      </Canvas>

      <div className="absolute top-0 right-0 flex flex-col">
        <button
          className="border border-white"
          onClick={() => setNodes(DEFAULT_FUNCTION)}
        >
          Clear
        </button>
        <br />
        <NodeSelector value={nodeToPlace} onChange={setNodeToPlace} />
      </div>

      <div className="flex justify-between absolute bottom-0 left-10 right-10">
        <button onClick={() => setMode("place")}>Place</button>
        <button onClick={() => setMode("connect")}>Connect</button>
        <button
          onClick={async () => {
            const { generatedCode, diagnostics } = await compileNodes(
              "f",
              nodes
            );

            if (diagnostics.length) {
              console.error(
                generatedCode,
                diagnostics.map((d) => d.getMessageText())
              );
            } else {
              // eslint-disable-next-line no-console
              console.log(generatedCode);
            }
          }}
        >
          Run
        </button>
      </div>
    </div>
  );
}
