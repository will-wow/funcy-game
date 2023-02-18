"use client";

import { ThreeEvent } from "@react-three/fiber";
import { Fragment, useCallback, useState } from "react";
import { Vector2, Vector3 } from "three";

import {
  GameMode,
  removeConnection,
  removeNode,
  setNode,
  setSelectedNode,
  updateNodes,
  useMode,
  useNodes,
  useNodeToPlace,
  useSelectedNode,
} from "$game/game.store";
import { generateNodeId } from "$nodes/empty-node";
import {
  GameNode,
  isCalculatedNode,
  isExpressionNode,
  isVariableNode,
} from "$nodes/nodes";
import { solarized } from "$utils/dracula";

import { setInputOnNode, setOutputOnNode } from "../nodes/input-output";

import { PlayArea } from "./components/PlayArea";
import { Connection, ConnectionToNode } from "./nodes/Connection";
import { RenderNode } from "./nodes/RenderNode";

export function GameBoard() {
  const [hoverPoint, setHoverPoint] = useState<Vector3 | null>(null);
  const mode = useMode();
  const nodeToPlace = useNodeToPlace();
  const selectedNode = useSelectedNode();
  const nodes = useNodes();

  const handlePlayAreaClick = useCallback(
    ({ x, y }: Vector2) => {
      if (mode === "place" && nodeToPlace) {
        setNode({
          ...nodeToPlace,
          x,
          y,
          id: generateNodeId(),
        });
      } else {
        setSelectedNode(null);
      }
    },
    [mode, nodeToPlace]
  );

  return (
    <PlayArea onHover={setHoverPoint} onClick={handlePlayAreaClick}>
      {mode === "place" && hoverPoint && nodeToPlace && (
        <RenderNode
          node={nodeToPlace}
          color="#ffffff"
          x={hoverPoint.x}
          y={hoverPoint.z}
        />
      )}

      {mode === "connect" && selectedNode && hoverPoint && (
        <Connection
          startX={selectedNode.x}
          startZ={selectedNode.y}
          endX={hoverPoint.x}
          endY={hoverPoint.y}
          endZ={hoverPoint.z}
          color="#ffffff"
        />
      )}

      {Object.values(nodes).map((node) => {
        return (
          <Fragment key={node.id}>
            <RenderNode
              node={node}
              color={selectedNode?.id === node.id ? "#400400" : "#000fff"}
              x={node.x}
              y={node.y}
              onClick={(e, inputIndex) => {
                handleNodeClick(
                  e,
                  node,
                  inputIndex,
                  nodeToPlace,
                  selectedNode,
                  mode
                );
              }}
              onHover={(e, hoveredInputIndex) => {
                handleNodeHover(
                  e,
                  mode,
                  node,
                  hoveredInputIndex,
                  setHoverPoint
                );
              }}
            />

            {isCalculatedNode(node) && (
              <>
                {node.inputs.map((inputId, inputIndex) => {
                  // Don't render a connection from identifiers to their functions.
                  if (!inputId || node.kind === "Identifier") return null;
                  return (
                    <ConnectionToNode
                      key={`${node.id}-${inputIndex}`}
                      startNode={nodes[inputId]}
                      endNode={node}
                      color={solarized.green}
                      onClick={() => {
                        // eslint-disable-next-line no-console
                        console.log("clicked connection", {
                          receivingNode: node,
                          outputtingNode: nodes[inputId],
                          inputIndex,
                        });
                        if (mode === "remove") {
                          removeConnection(node.id, inputIndex);
                        }
                      }}
                    />
                  );
                })}
              </>
            )}
          </Fragment>
        );
      })}
    </PlayArea>
  );
}

function handleNodeHover(
  e: ThreeEvent<MouseEvent>,
  mode: GameMode,
  hoveredNode: GameNode,
  hoveredInputIndex: number,
  setHoverPoint: (point: Vector3 | null) => void
) {
  e.stopPropagation();

  if (mode !== "connect") return;

  setHoverPoint(new Vector3(hoveredNode.x, hoveredInputIndex, hoveredNode.y));
}

function handleNodeClick(
  e: ThreeEvent<MouseEvent>,
  node: GameNode,
  inputIndex: number,
  nodeToPlace: GameNode | null,
  selectedNode: GameNode | null,
  mode: GameMode
) {
  e.stopPropagation();

  if (mode === "place" && node.kind === "FunctionDeclaration" && nodeToPlace) {
    const x = Math.round(e.point.x);
    const y = Math.round(e.point.z);
    const id = generateNodeId();
    setNode({
      ...nodeToPlace,
      x,
      y,
      id,
    });
    setSelectedNode(id);
  } else if (mode === "select") {
    setSelectedNode(node.id);
  } else if (mode === "remove") {
    removeNode(node.id);
  } else if (mode === "connect") {
    if (selectedNode) {
      if (
        // Ignore clicks on nodes that don't accept input.
        !(
          isCalculatedNode(node) &&
          (isExpressionNode(selectedNode) || isVariableNode(selectedNode))
        ) ||
        // Ignore clicks on the same node.
        selectedNode.id === node.id
      ) {
        return;
      }
      const nodeWithInput = setInputOnNode(node, selectedNode, inputIndex);
      const selectedNodeWithOutput = setOutputOnNode(selectedNode, node);

      updateNodes({
        [node.id]: nodeWithInput,
        [selectedNode.id]: selectedNodeWithOutput,
      });

      setSelectedNode(null);
    } else {
      setSelectedNode(node.id);
    }
  }
}
