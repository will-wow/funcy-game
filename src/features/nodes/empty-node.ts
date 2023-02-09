import { ts } from "ts-morph";
import { NodeKind, GameNode } from "./nodes";

export function getEmptyNode(
  kind: NodeKind,
  { id = Math.random().toString(), x = 0, y = 0 } = {}
): GameNode {
  switch (kind) {
    case "Parameter": {
      return { kind, id, x, y, name: "p1", type: "number", outputs: [] };
    }
    case "Identifier": {
      return {
        kind,
        id,
        x: 0,
        y: 0,
        name: "",
        type: "number",
        inputs: [null],
        outputs: [],
      };
    }
    case "ReturnStatement": {
      return {
        kind,
        id,
        x,
        y,
        inputs: [null],
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
      };
    }
    default: {
      throw new Error(`Unknown node kind, ${kind}`);
    }
  }
}
