"use client";
import { createProject, ts } from "@ts-morph/bootstrap";
import { BinaryExpression, Project, SyntaxList } from "ts-morph";

export type NodeId = string;

export type NodeKind = keyof typeof ts.SyntaxKind;

interface ReferenceId {
  id: NodeId;
  param?: boolean;
}

interface BaseGameNode {
  id: NodeId;
  kind: NodeKind;
  x: number;
  y: number;
}

interface BaseExpressionGameNode extends BaseGameNode {
  output: ReferenceId;
}

export interface ParameterGameNode extends BaseGameNode {
  kind: "Parameter";
  name: string;
  type: NodeKind;
}

export interface BinaryExpressionGameNode extends BaseExpressionGameNode {
  kind: "BinaryExpression";
  operator: ts.BinaryOperator;
  left: ReferenceId;
  right: ReferenceId;
}

export interface ConditionalExpressionGameNode extends BaseExpressionGameNode {
  kind: "ConditionalExpression";
  condition: ReferenceId;
  whenTrue: ReferenceId;
  whenFalse: ReferenceId;
}

export interface ReturnStatementGameNode extends BaseGameNode {
  kind: "ReturnStatement";
  input: ReferenceId;
}

export interface VariableGameNode extends BaseGameNode {
  kind: "Identifier";
  name: string;
  type: "number" | "string" | "bundle" | "infer";
  input?: ReferenceId;
}

export interface NumericLiteralGameNode extends BaseExpressionGameNode {
  kind: "NumericLiteral";
  value: number;
}

export interface StringLiteralGameNode extends BaseExpressionGameNode {
  kind: "StringLiteral";
  value: string;
}

export interface CallExpressionGameNode extends BaseExpressionGameNode {
  kind: "CallExpression";
  moduleName?: string;
  functionName: string;
  params: ReferenceId[];
}

export type GameNode =
  | BinaryExpressionGameNode
  | CallExpressionGameNode
  | ConditionalExpressionGameNode
  | NumericLiteralGameNode
  | ParameterGameNode
  | ReturnStatementGameNode
  | StringLiteralGameNode
  | VariableGameNode;

export function isExpression(node: any): node is BaseExpressionGameNode {
  return "output" in node;
}

export function getEmptyNode(kind: NodeKind, x = 0, y = 0): GameNode {
  const id = Math.random().toString();
  switch (kind) {
    case "StringLiteral": {
      return {
        kind,
        id,
        x,
        y,
        value: "",
      };
    }
    case "NumericLiteral": {
      return {
        kind,
        id,
        x,
        y,
        value: 1,
      };
    }
    case "Identifier": {
      return { kind, id, x: 0, y: 0, name: "", type: "number" };
    }
    case "BinaryExpression": {
      return {
        kind,
        id,
        x,
        y,
        operator: ts.SyntaxKind.PlusToken,
      };
    }
    case "ConditionalExpression": {
      return {
        kind,
        id,
        x,
        y,
      };
    }
    default: {
      throw new Error(`Unknown node kind, ${node.kind}`);
    }
  }
}

export function setInputOnNode<T extends GameNode>(
  node: T,
  inputNode: GameNode
): GameNode | null {
  const reference: ReferenceId = {
    id: inputNode.id,
    param: inputNode.kind === "Parameter",
  };

  switch (node.kind) {
    case "BinaryExpression": {
      if (node.left) {
        return {
          ...node,
          right: reference,
        };
      } else {
        return {
          ...node,
          left: reference,
        };
      }
    }
    case "ConditionalExpression": {
      if (node.whenTrue) {
        console.log("whenTrue, setting whenFalse");
        return {
          ...node,
          whenFalse: reference,
        };
      } else if (node.condition) {
        console.log("condition, setting whenTrue");
        return {
          ...node,
          whenTrue: reference,
        };
      } else {
        console.log("nothing, setting condition");
        return {
          ...node,
          condition: reference,
        };
      }
    }
    case "ReturnStatement": {
      return {
        ...node,
        input: reference,
      };
    }
  }
  return null;
}

// const nodes: Record<NodeId, GameNode> = {
//   "1": {
//     id: "1",
//     kind: "Parameter",
//     name: "f",
//     type: "NumberKeyword",
//     x: 0,
//     y: 0,
//   },
//   "2": {
//     id: "2",
//     kind: "NumericLiteral",
//     value: 1,
//     x: 0,
//     y: 0,
//     output: { id: "3" },
//   },
//   "3": {
//     id: "3",
//     kind: "BinaryExpression",
//     operator: ts.SyntaxKind.SlashToken,
//     left: { id: "1" },
//     right: { id: "2" },
//     x: 0,
//     y: 0,
//     output: { id: "return" },
//   },
//   return: {
//     id: "4",
//     kind: "ReturnStatement",
//     input: {
//       id: "3",
//     },
//     x: 0,
//     y: 0,
//   },
// };

// function parseWithReturn(
//   node: GameNode,
//   connections: { inputId?: ReferenceId; outputId?: ReferenceId },
//   tree?: ts.Statement
// ) {
//   const newTree = parse(node, connections, tree);
//   if (connections.outputId?.id === "return") {
//     return ts.factory.createReturnStatement(newTree);
//   } else {
//     return newTree;
//   }
// }

function parseWithOutput(
  nodes: Record<NodeId, GameNode>,
  node: GameNode,
  { outputId }: { outputId?: ReferenceId },
  tree?: ts.Expression
): ts.Expression {
  const newTree = parse(nodes, node, {}, tree);

  if (!isExpression(node)) return newTree;

  if (node.output.id === "return" || node.output.id === outputId?.id) {
    return newTree;
  }

  return parse(
    nodes,
    nodes[node.output.id],
    { inputId: { id: node.id } },
    newTree
  );
}

function parseOrInput(
  nodes: Record<NodeId, GameNode>,
  referenceId: ReferenceId,
  tree: ts.Expression | undefined,
  inputId: ReferenceId | undefined,
  node: GameNode
) {
  if (tree && inputId?.id && inputId.id === node.id) return tree;

  return parseWithOutput(nodes, node, { outputId: referenceId }, tree);
}

function parse(
  nodes: Record<NodeId, GameNode>,
  node: GameNode,
  { inputId }: { inputId?: ReferenceId },
  tree?: ts.Expression
): ts.Expression {
  const referenceId = { id: node.id, param: node.kind === "Parameter" };
  switch (node.kind) {
    case "Parameter": {
      return ts.factory.createIdentifier(node.name);
    }
    case "BinaryExpression": {
      const { left, right, operator } = node;
      return ts.factory.createBinaryExpression(
        parseOrInput(nodes, referenceId, tree, inputId, nodes[left.id]),
        operator,
        parseOrInput(nodes, referenceId, tree, inputId, nodes[right.id])
      );
    }
    case "ConditionalExpression": {
      const { condition, whenTrue, whenFalse, id } = node;
      return ts.factory.createConditionalExpression(
        parseOrInput(nodes, referenceId, tree, inputId, nodes[condition.id]),
        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        parseOrInput(nodes, referenceId, tree, inputId, nodes[whenTrue.id]),
        ts.factory.createToken(ts.SyntaxKind.ColonToken),
        parseOrInput(nodes, referenceId, tree, inputId, nodes[whenFalse.id])
      );
    }
    case "NumericLiteral": {
      console.log("numeric", node);
      return ts.factory.createNumericLiteral(node.value);
    }
    case "StringLiteral": {
      return ts.factory.createStringLiteral(node.value);
    }
    case "ReturnStatement": {
      return parse(nodes, nodes[node.input.id], {});
    }
    default: {
      throw new Error(`Unknown node kind, ${node.kind}`);
    }
  }
}

function makeFunction(name: string, nodes: Record<string, GameNode>) {
  const functionName = ts.factory.createIdentifier(name);

  const nodeList = Object.values(nodes);
  const params = nodeList.filter(
    (node) => node.kind === "Parameter"
  ) as ParameterGameNode[];

  const firstExpression = nodeList.find((node) => node.kind !== "Parameter");

  if (!firstExpression) {
    throw new Error("No first expression");
  }

  console.log(nodes);

  const parameters = Object.values(params).map((param) => {
    const name = ts.factory.createIdentifier(param.name);
    const type = ts.factory.createKeywordTypeNode(
      ts.SyntaxKind[param.type] as ts.KeywordTypeSyntaxKind
    );

    return ts.factory.createParameterDeclaration(
      undefined,
      undefined,
      name,
      undefined,
      type,
      undefined
    );
  });

  const expression = parseWithOutput(nodes, firstExpression, {});

  const returnStatement = ts.factory.createReturnStatement(expression);

  return ts.factory.createFunctionDeclaration(
    undefined,
    undefined,
    functionName,
    undefined,
    parameters,
    ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
    ts.factory.createBlock([returnStatement], true)
  );
}

const project = new Project({
  useInMemoryFileSystem: true,
  compilerOptions: {
    strict: true,
    forceConsistentCasingInFileNames: true,
  },
});

const resultFile = project.createSourceFile("file.ts");

const printer = ts.createPrinter();

export async function testPrint(nodes: Record<string, GameNode>) {
  const functionDeclaration = makeFunction("add1", nodes);

  const result = printer.printNode(
    ts.EmitHint.Unspecified,
    functionDeclaration,
    resultFile.compilerNode
  );

  resultFile.replaceWithText(result);

  // project.updateSourceFile("file.ts", result);

  // const program = project.createProgram();

  // const sourceFile = project.getSourceFileOrThrow("file.ts");
  // const x = sourceFile.getChildAt(0);
  // const functionDeclaration = makeFunction("add1");
  // const sourceFile = project.createSourceFile("file.ts", functionDeclaration);
  // sourceFile.formatText();

  // const compilerHost: ts.CompilerHost = {
  //   getSourceFile(fileName) {
  //     if (fileName === resultFile.fileName) {
  //       return resultFile;
  //     }
  //   },
  //   fileExists(fileName) {
  //     return fileName === resultFile.fileName;
  //   },
  //   getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
  //   writeFile() {},
  //   getDefaultLibFileName() {
  //     return "lib.d.ts";
  //   },
  //   getCanonicalFileName: (fileName) =>
  //     ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
  //   readFile() {
  //     return resultFile.text;
  //   },
  //   useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
  //   getNewLine: () => ts.sys.newLine,
  // };

  // const options = {
  //   target: ts.ScriptTarget.ESNext,
  //   lib: ["esnext"],
  //   strict: true,
  //   forceConsistentCasingInFileNames: true,
  //   noEmit: true,
  //   module: ts.ModuleKind.ESNext,
  //   moduleResolution: ts.ModuleResolutionKind.NodeJs,
  // };

  // const program = ts.createProgram(["file.ts"], options, compilerHost);

  // console.log(compilerHost.getDefaultLibFileName(options));

  // const libFile = readFileSync();
  // this.compilerHost.addFile("lib.d.ts", libFile.toString());

  const diags = project.getPreEmitDiagnostics();

  // const tc = project.getTypeChecker();

  // tc.getTypeOfSymbolAtLocation();

  // diags.forEach((diag) => {
  //   // console.log('diag', diag.compilerObject);
  //   // const pos = resultFile.compilerNode.getPositionOfLineAndCharacter(
  //   //   diag.getLineNumber()!,
  //   //   diag.getStart()!
  //   // );

  //   const node = resultFile.getDescendantAtPos(diag.getStart()!) as SyntaxList;

  //   console.log(node.getFullText(), diag.getStart()!);

  //   console.log("node kind", node?.getKindName(), node.getPos());
  // });

  // sourceFile.forEachChild((node) => {
  //   console.log("position", node.getStart(sourceFile));
  // });

  // console.log("text", sourceFile.getText());

  // const typeChecker = program.getTypeChecker();
  if (diags.length) {
    console.error(
      result,
      diags.map((diag) => diag.getMessageText())
    );
  } else {
    console.log(result);
  }
  return result;
}
