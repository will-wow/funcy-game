import { ts } from "ts-morph";

import { GameNode, NodeKind } from "./nodes";

export function getEmptyNode(
  kind: NodeKind,
  { id = Math.random().toString(), x = 0, y = 0 } = {}
): GameNode {
  switch (kind) {
    case "FunctionDeclaration": {
      return {
        kind,
        id,
        x,
        y,
        name: "f1",
        width: 16,
        height: 8,
      };
    }
    case "Parameter": {
      return {
        kind,
        id,
        x,
        y,
        name: "p1",
        type: "number",
        outputs: [],
        function: null,
      };
    }
    case "Identifier": {
      return {
        kind,
        id,
        x,
        y,
        name: "",
        type: "number",
        inputs: [null],
        outputs: [],
        function: null,
      };
    }
    case "ReturnStatement": {
      return {
        kind,
        id,
        x,
        y,
        inputs: [null],
        function: null,
      };
    }
    case "StringLiteral": {
      return {
        kind,
        id,
        x,
        y,
        value: "",
        output: null,
        function: null,
      };
    }
    case "NumericLiteral": {
      return {
        kind,
        id,
        x,
        y,
        value: 1,
        output: null,
        function: null,
      };
    }
    case "BinaryExpression": {
      return {
        kind,
        id,
        x,
        y,
        operator: ts.SyntaxKind.PlusToken,
        output: null,
        inputs: [null, null],
        function: null,
      };
    }
    case "ConditionalExpression": {
      return {
        kind,
        id,
        x,
        y,
        output: null,
        inputs: [null, null, null],
        function: null,
      };
    }
    default: {
      throw new Error(`Unknown node kind, ${kind}`);
    }
  }
}
