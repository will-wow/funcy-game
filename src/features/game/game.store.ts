import { useMemo } from "react";
import { create } from "zustand";

import { getEmptyNode } from "$nodes/empty-node";
import { GameNode } from "$nodes/nodes";

interface GameStore {
  nodes: Record<string, GameNode>;
  mode: "place" | "connect" | null;
  nodeToPlace: GameNode | null;
  selectedNode: string | null;
}

const DEFAULT_FUNCTION: Record<string, GameNode> = {
  p1: getEmptyNode("Parameter", { x: -12, y: 0, id: "p1" }),
  return: getEmptyNode("ReturnStatement", { x: 12, y: 0, id: "return" }),
};

const useGameStore = create<GameStore>(() => ({
  nodes: DEFAULT_FUNCTION,
  mode: null,
  nodeToPlace: null,
  selectedNode: null,
}));

export const useMode = () => {
  return useGameStore((state) => state.mode);
};

export const getMode = () => {
  return useGameStore.getState().mode;
};

export const setMode = (mode: GameStore["mode"]) => {
  const update: Partial<GameStore> = { mode };
  if (mode !== "place") {
    update.nodeToPlace = null;
  }
  if (mode !== "connect") {
    update.selectedNode = null;
  }
  useGameStore.setState(update);
};

export const useNodeToPlace = () => {
  return useGameStore((state) => state.nodeToPlace);
};

export const setNodeToPlace = (node: GameNode | null) => {
  useGameStore.setState({ nodeToPlace: node });
};

export const getNodeToPlace = () => {
  return useGameStore.getState().nodeToPlace;
};

export const resetNodes = () => {
  useGameStore.setState({ nodes: DEFAULT_FUNCTION });
};

export const useSelectedNode = () => {
  return useGameStore((state) => {
    if (!state.selectedNode) return null;

    return state.nodes[state.selectedNode];
  });
};

export const setSelectedNode = (id: string | null) => {
  useGameStore.setState({ selectedNode: id });
};

export const useNodes = () => {
  return useGameStore((state) => state.nodes);
};

export const useNodesList = () => {
  const nodes = useGameStore((state) => state.nodes);
  return useMemo(() => Object.values(nodes), [nodes]);
};

export const removeNode = (id: string) => {
  const nodes = { ...useGameStore.getState().nodes };
  delete nodes[id];
  useGameStore.setState({ nodes });
};

export const setNode = (node: GameNode) => {
  const nodes = useGameStore.getState().nodes;
  useGameStore.setState({
    nodes: {
      ...nodes,
      [node.id]: node,
    },
  });
};

export const updateNodes = (newNodes: Record<string, GameNode>) => {
  const nodes = useGameStore.getState().nodes;
  useGameStore.setState({
    nodes: {
      ...nodes,
      ...newNodes,
    },
  });
};
