"use client";

import { Fragment, useState } from "react";
import { Vector2 } from "three";

import {
  removeNode,
  setNode,
  setSelectedNode,
  updateNodes,
  useMode,
  useNodes,
  useNodeToPlace,
  useSelectedNode,
} from "$game/game.store";
import {
  isCalculatedNode,
  isExpressionNode,
  isVariableNode,
} from "$nodes/nodes";

import { setInputOnNode, setOutputOnNode } from "../nodes/input-output";

import { PlayArea } from "./components/PlayArea";
import { Connection } from "./nodes/Connection";
import { RenderNode } from "./nodes/RenderNode";

export function GameBoard() {
  const [hoverPoint, setHoverPoint] = useState<Vector2 | null>(null);
  const mode = useMode();
  const nodeToPlace = useNodeToPlace();
  const selectedNode = useSelectedNode();
  const nodes = useNodes();

  return (
    <PlayArea
      onHover={setHoverPoint}
      onClick={({ x, y }) => {
        if (nodeToPlace) {
          setNode({
            ...nodeToPlace,
            x,
            y,
            id: Math.random().toString(),
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

                  removeNode(node.id);
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

                    updateNodes({
                      [node.id]: nodeWithInput,
                      [selectedNode.id]: selectedNodeWithOutput,
                    });

                    setSelectedNode(null);
                  } else {
                    setSelectedNode(node.id);
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
