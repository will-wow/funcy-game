import { useMemo } from "react";
import { create } from "zustand";

import { GameNode, NullableNodeId } from "$nodes/nodes";

interface GameStore {
  nodes: Record<string, GameNode>;
  mode: "place" | "connect" | null;
  nodeToPlace: GameNode | null;
  selectedNode: string | null;
}

const DEFAULT_FUNCTION: Record<string, GameNode> = {
  f1: {
    name: "abs",
    width: 26,
    height: 8,
    kind: "FunctionDeclaration",
    x: 0,
    y: 0,
    id: "f1",
  },
  return: {
    inputs: ["0f9be3e9-1718-4c10-bcd1-00fb6a4ae095"],
    kind: "ReturnStatement",
    x: 12,
    y: 0,
    id: "return",
  },
  "7c84f835-6c94-4f64-9dc2-cfd6249c2d56": {
    operator: 33,
    output: "0f9be3e9-1718-4c10-bcd1-00fb6a4ae095",
    inputs: [
      "bd273cf2-7715-40ac-9f98-b981ba73daa4",
      "48b29fb6-1464-43e4-941d-637db8931e21",
    ],
    kind: "BinaryExpression",
    id: "7c84f835-6c94-4f64-9dc2-cfd6249c2d56",
    x: -9,
    y: 0,
  },
  "48b29fb6-1464-43e4-941d-637db8931e21": {
    value: 0,
    output: "7c84f835-6c94-4f64-9dc2-cfd6249c2d56",
    kind: "NumericLiteral",
    id: "48b29fb6-1464-43e4-941d-637db8931e21",
    x: -9,
    y: 2,
  },
  "0f9be3e9-1718-4c10-bcd1-00fb6a4ae095": {
    output: "return",
    inputs: [
      "7c84f835-6c94-4f64-9dc2-cfd6249c2d56",
      "bd273cf2-7715-40ac-9f98-b981ba73daa4",
      "a92adbac-aae6-4bf2-b439-51d1200dbcd8",
    ],
    kind: "ConditionalExpression",
    id: "0f9be3e9-1718-4c10-bcd1-00fb6a4ae095",
    x: 0,
    y: 0,
  },
  "bd273cf2-7715-40ac-9f98-b981ba73daa4": {
    name: "x",
    type: "number",
    outputs: [
      "7c84f835-6c94-4f64-9dc2-cfd6249c2d56",
      "0f9be3e9-1718-4c10-bcd1-00fb6a4ae095",
      "a92adbac-aae6-4bf2-b439-51d1200dbcd8",
    ],
    kind: "Parameter",
    id: "bd273cf2-7715-40ac-9f98-b981ba73daa4",
    x: -12,
    y: -3,
  },
  "a92adbac-aae6-4bf2-b439-51d1200dbcd8": {
    operator: 41,
    output: "0f9be3e9-1718-4c10-bcd1-00fb6a4ae095",
    inputs: [
      "d56a4324-616e-4308-85b8-717ad88082bf",
      "bd273cf2-7715-40ac-9f98-b981ba73daa4",
    ],
    kind: "BinaryExpression",
    id: "a92adbac-aae6-4bf2-b439-51d1200dbcd8",
    x: -1,
    y: 2,
  },
  "d56a4324-616e-4308-85b8-717ad88082bf": {
    value: -1,
    output: "a92adbac-aae6-4bf2-b439-51d1200dbcd8",
    kind: "NumericLiteral",
    id: "d56a4324-616e-4308-85b8-717ad88082bf",
    x: 2,
    y: 2,
  },
  "6167244b-cb78-4f0c-88b8-ea3acc99bade": {
    name: "size",
    width: 16,
    height: 8,
    kind: "FunctionDeclaration",
    id: "6167244b-cb78-4f0c-88b8-ea3acc99bade",
    x: -5,
    y: 10,
  },
  "dd18aa02-c607-46b1-9418-95634525e767": {
    name: "length",
    type: "number",
    outputs: ["4c9b477a-6558-42b5-99d1-b65bc2e695f6"],
    kind: "Parameter",
    id: "dd18aa02-c607-46b1-9418-95634525e767",
    x: -12,
    y: 7,
  },
  "aeb896d9-607f-4360-b3d6-224e0f5e2162": {
    output: "622425b1-311f-4cec-94b6-f465dd65ad57",
    inputs: [
      "4c9b477a-6558-42b5-99d1-b65bc2e695f6",
      "7a3ac968-96cc-440a-acc3-2f08dd7c541f",
      "01607fdd-7889-443f-9c79-351023cf5ca5",
    ],
    kind: "ConditionalExpression",
    id: "aeb896d9-607f-4360-b3d6-224e0f5e2162",
    x: -2,
    y: 10,
  },
  "absRef": {
    inputs: ["f1"],
    output: "4c9b477a-6558-42b5-99d1-b65bc2e695f6",
    kind: "Identifier",
    id: "absRef",
    x: -11,
    y: 10,
  },
  "4c9b477a-6558-42b5-99d1-b65bc2e695f6": {
    inputs: ["absRef", "dd18aa02-c607-46b1-9418-95634525e767"],
    output: "aeb896d9-607f-4360-b3d6-224e0f5e2162",
    kind: "CallExpression",
    id: "4c9b477a-6558-42b5-99d1-b65bc2e695f6",
    x: -9,
    y: 10,
  },
  "7a3ac968-96cc-440a-acc3-2f08dd7c541f": {
    value: "big",
    output: "aeb896d9-607f-4360-b3d6-224e0f5e2162",
    kind: "StringLiteral",
    id: "7a3ac968-96cc-440a-acc3-2f08dd7c541f",
    x: -4,
    y: 8,
  },
  "01607fdd-7889-443f-9c79-351023cf5ca5": {
    value: "small",
    output: "aeb896d9-607f-4360-b3d6-224e0f5e2162",
    kind: "StringLiteral",
    id: "01607fdd-7889-443f-9c79-351023cf5ca5",
    x: -4,
    y: 12,
  },
  "622425b1-311f-4cec-94b6-f465dd65ad57": {
    inputs: ["aeb896d9-607f-4360-b3d6-224e0f5e2162"],
    kind: "ReturnStatement",
    id: "622425b1-311f-4cec-94b6-f465dd65ad57",
    x: 2,
    y: 10,
  },
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

export function useNodesOfType<T extends GameNode>(kind: T["kind"]): T[] {
  const nodes = useGameStore((state) => state.nodes);
  return useMemo(() => {
    return Object.values(nodes).filter((node) => node.kind === kind) as T[];
  }, [kind, nodes]);
}

export const useGetNode = (nodeId: NullableNodeId) => {
  return useGameStore((state) => {
    if (!nodeId) return null;
    return state.nodes[nodeId] || null;
  });
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
