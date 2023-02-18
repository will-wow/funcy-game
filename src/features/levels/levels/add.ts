import { Level } from "$levels/Level";

export const add: Level<[number, number], number> = {
  name: "Add",
  mainFunction: "add",
  nodes: {
    "b765acba-fe34-49a2-975d-926eb130bf8e": {
      name: "add",
      width: 16,
      height: 8,
      kind: "FunctionDeclaration",
      id: "b765acba-fe34-49a2-975d-926eb130bf8e",
      x: -1,
      y: 0,
    },
    "e712e60c-d389-44d2-a452-7fbffb2aec69": {
      name: "x",
      type: "number",
      array: false,
      outputs: [],
      kind: "Parameter",
      id: "e712e60c-d389-44d2-a452-7fbffb2aec69",
      x: -8,
      y: -2,
    },
    "fc4b2e3a-be12-4a41-b68c-8fe357267b7a": {
      name: "y",
      type: "number",
      array: false,
      outputs: [],
      kind: "Parameter",
      id: "fc4b2e3a-be12-4a41-b68c-8fe357267b7a",
      x: -8,
      y: 1,
    },
    "5dc8a657-6891-4dba-8c8d-fecc44cc5e9f": {
      operator: 39,
      output: null,
      inputs: [null, null],
      kind: "BinaryExpression",
      id: "5dc8a657-6891-4dba-8c8d-fecc44cc5e9f",
      x: -2,
      y: -1,
    },
    "3157f7db-2e75-473e-9109-c6fa076ff164": {
      inputs: [null],
      kind: "ReturnStatement",
      id: "3157f7db-2e75-473e-9109-c6fa076ff164",
      x: 6,
      y: -1,
    },
  },
  tests: [
    {
      args: [1, 2],
      expect: 3,
    },
    {
      args: [-1, -2],
      expect: -3,
    },
  ],
};
