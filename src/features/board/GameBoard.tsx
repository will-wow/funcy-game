"use client";

import { Dispatch, Fragment, SetStateAction, useState } from "react";
import { Vector2 } from "three";

import {
  GameNode,
  NodeId,
  isCalculatedNode,
  isExpressionNode,
  isVariableNode,
} from "$nodes/nodes";

import { setInputOnNode, setOutputOnNode } from "../nodes/input-output";

import { PlayArea } from "./components/PlayArea";
import { Connection } from "./nodes/Connection";
import { RenderNode } from "./nodes/RenderNode";

export interface GameBoardProps {
  nodes: Record<NodeId, GameNode>;
  onNodes: Dispatch<SetStateAction<Record<NodeId, GameNode>>>;
  mode: "place" | "connect";
  nodeToPlace: GameNode | null;
}

export function GameBoard({
  mode,
  nodeToPlace,
  nodes,
  onNodes,
}: GameBoardProps) {
  const [selectedNode, setSelectedNode] = useState<GameNode | null>(null);

  const [hoverPoint, setHoverPoint] = useState<Vector2 | null>(null);

  return (
    <PlayArea
      onHover={setHoverPoint}
      onClick={({ x, y }) => {
        if (mode === "place" && nodeToPlace) {
          onNodes((nodes) => {
            const newNode = {
              ...nodeToPlace,
              x,
              y,
              id: Math.random().toString(),
            };
            return {
              ...nodes,
              [newNode.id]: { ...newNode, x, y },
            };
          });
        }
      }}
    >
      <meshStandardMaterial color="#949a49" />

      {mode === "place" && hoverPoint && nodeToPlace && (
        <RenderNode
          node={nodeToPlace}
          color="#ffffff"
          x={hoverPoint.x}
          y={hoverPoint.y}
        />
      )}

      {mode === "connect" && selectedNode && hoverPoint && (
        <Connection
          startX={selectedNode.x}
          startY={selectedNode.y}
          endX={hoverPoint.x}
          endY={hoverPoint.y}
          color="#ffffff"
        />
      )}

      {Object.values(nodes).map((node) => {
        return (
          <Fragment key={node.id}>
            <RenderNode
              node={node}
              color="#000fff"
              x={node.x}
              y={node.y}
              onClick={(event) => {
                if (mode === "place") {
                  if (node.kind === "ReturnStatement") {
                    return;
                  }
                  onNodes((nodes) => {
                    const { [node.id]: _, ...rest } = nodes;
                    return rest;
                  });
                  event.stopPropagation();
                } else if (mode === "connect") {
                  if (selectedNode) {
                    if (
                      !(
                        isCalculatedNode(node) &&
                        (isExpressionNode(selectedNode) ||
                          isVariableNode(selectedNode))
                      )
                    ) {
                      return;
                    }
                    const nodeWithInput = setInputOnNode(node, selectedNode);
                    const selectedNodeWithOutput = setOutputOnNode(
                      selectedNode,
                      node
                    );

                    onNodes((nodes) => {
                      return {
                        ...nodes,
                        [node.id]: nodeWithInput,
                        [selectedNode.id]: selectedNodeWithOutput,
                      };
                    });

                    setSelectedNode(null);
                  } else {
                    setSelectedNode(node);
                  }
                }
              }}
            />

            {isExpressionNode(node) && node.output && (
              <Connection
                startX={node.x}
                startY={node.y}
                endX={nodes[node.output].x}
                endY={nodes[node.output].y}
                color="#000fff"
              />
            )}

            {isVariableNode(node) && (
              <>
                {node.outputs.map((output, i) => (
                  <Connection
                    key={`${output}-${i}`}
                    startX={node.x}
                    startY={node.y}
                    endX={nodes[output].x}
                    endY={nodes[output].y}
                    color="#000fff"
                  />
                ))}
              </>
            )}
          </Fragment>
        );
      })}
    </PlayArea>
  );
}
