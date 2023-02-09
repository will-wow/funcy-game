/* eslint-disable no-console */
"use client";
import { Project, ts } from "ts-morph";

export type NodeId = string;

export type NodeKind = keyof typeof ts.SyntaxKind;

type NullableNodeId = NodeId | null;

interface BaseGameNode {
  id: NodeId;
  kind: NodeKind;
  x: number;
  y: number;
}

/** Variables and parameters, that can have multiple outputs */
interface BaseVariableGameNode extends BaseGameNode {
  outputs: NodeId[];
}

/** Expressions with one output */
interface BaseExpressionGameNode extends BaseGameNode {
  output: NullableNodeId;
}

/** Nodes with inputs. The actual node type should be a tuple of NullableNodeIds */
interface BaseCalculatedGameNode extends BaseGameNode {
  inputs: NullableNodeId[];
}

/** A function parameter, with many outputs. */
export interface ParameterGameNode extends BaseVariableGameNode {
  kind: "Parameter";
  name: string;
  type: "number" | "string" | "boolean";
}

/** A variable, with one input and many outputs. */
export interface VariableGameNode extends BaseVariableGameNode {
  kind: "Identifier";
  name: string;
  type: "infer" | "number" | "string" | "boolean";
  inputs: [NullableNodeId];
}

/** The return statement, which has no output. */
export interface ReturnStatementGameNode extends BaseGameNode {
  kind: "ReturnStatement";
  inputs: [NullableNodeId];
}

export interface BinaryExpressionGameNode extends BaseExpressionGameNode {
  kind: "BinaryExpression";
  operator: ts.BinaryOperator;
  inputs: [left: NullableNodeId, right: NullableNodeId];
}

export interface ConditionalExpressionGameNode extends BaseExpressionGameNode {
  kind: "ConditionalExpression";
  inputs: [
    condition: NullableNodeId,
    whenTrue: NullableNodeId,
    whenFalse: NullableNodeId
  ];
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
  /** params */
  inputs: NodeId[];
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

export function isExpressionNode(node: any): node is BaseExpressionGameNode {
  return "output" in node;
}

export function isVariableNode(node: any): node is BaseVariableGameNode {
  return "outputs" in node;
}

export function isCalculatedNode(node: any): node is BaseCalculatedGameNode {
  return "inputs" in node;
}

/*
 * TODO:
 * - Change GameNotes to all use an tuple of inputs to make it easier to count references
 * - Also change the setInputOnNode to use array.push which is simpler
 * - then calculate reference counts, and decrement as we go.
 * - then have a while loop that compiles statements for notes with no references.
 * - when there are no more references, we're done.
 * - just use String ids for input/output references instead of objects
 */

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

function immutableTuplePush<T extends any[]>(tuple: T, value: T[number]): T {
  const result = [...tuple];
  result.push(value);

  let isNullFound = false;

  return tuple.map((item) => {
    if (isNullFound) return item;
    if (item === null) {
      isNullFound = true;
      return value;
    }
    return item;
  }) as T;
}

export function setInputOnNode<T extends BaseCalculatedGameNode>(
  node: T,
  inputNode: GameNode
): T {
  return { ...node, inputs: immutableTuplePush(node.inputs, inputNode.id) };
}

export function setOutputOnNode<
  T extends BaseExpressionGameNode | BaseVariableGameNode
>(node: T, outputNode: GameNode): T {
  if (isVariableNode(node)) {
    return {
      ...node,
      outputs: [...node.outputs, outputNode.id],
    };
  } else {
    return { ...node, output: outputNode.id };
  }
}

function countReferences(nodes: Record<NodeId, GameNode>): ReferenceCounts {
  const referenceCounts: ReferenceCounts = {};
  Object.values(nodes).forEach((node) => {
    if (!isCalculatedNode(node)) return;
    node.inputs.forEach((input) => {
      if (!input) {
        throw new Error("Can't count references with null input");
      }
      if (nodes[input].kind === "Identifier") {
        referenceCounts[input] = (referenceCounts[input] || 0) + 1;
      }
    });
  });
  return referenceCounts;
}

function usedReferences(
  nodes: Record<string, GameNode>,
  referenceCounts: ReferenceCounts
) {
  const usedReferenceId = Object.keys(referenceCounts).find(
    (id) => referenceCounts[id] === 0
  );
  if (!usedReferenceId) {
    console.error(
      referenceCounts,
      Object.keys(referenceCounts).map((id) => nodes[id])
    );
    throw new Error("No reference found with 0 references");
  }

  delete referenceCounts[usedReferenceId];

  return usedReferenceId;
}

function parse(nodes: Record<NodeId, GameNode>): ts.Statement[] {
  const referenceCounts = countReferences(nodes);
  const returnNode = Object.values(nodes).find(
    (node) => node.kind === "ReturnStatement"
  );
  if (!returnNode) {
    throw new Error("No return node found");
  }
  const returnExpression = parseNodeAndOutputs(
    nodes,
    returnNode,
    referenceCounts
  );

  const statements: ts.Statement[] = [
    ts.factory.createReturnStatement(returnExpression),
  ];

  while (true) {
    if (Object.keys(referenceCounts).length === 0) {
      break;
    }

    const usedReferenceId = usedReferences(nodes, referenceCounts);
    const node = nodes[usedReferenceId] as VariableGameNode;

    const typeKind = getKeywordType(node.type);
    const typeKeyword = typeKind
      ? ts.factory.createKeywordTypeNode(typeKind)
      : undefined;

    statements.push(
      ts.factory.createVariableStatement(
        undefined,
        ts.factory.createVariableDeclarationList(
          [
            ts.factory.createVariableDeclaration(
              node.name,
              undefined,
              typeKeyword,
              parseNodeAndInputs(nodes, nodes[node.inputs[0]!], referenceCounts)
            ),
          ],
          ts.NodeFlags.Const
        )
      )
    );
  }

  return statements.reverse();
}

/** Parse a node, and also parse any of its outputs to walk the whole tree. */
function parseNodeAndOutputs(
  nodes: Record<NodeId, GameNode>,
  node: GameNode,
  referenceCounts: ReferenceCounts,
  outputId?: NodeId
): ts.Expression {
  // Start by parsing the current node.
  const newTree = parseNodeAndInputs(nodes, node, referenceCounts);

  // Don't look for an output if there isn't none.
  // This is the end for returns.
  if (!isExpressionNode(node)) return newTree;

  // If there should be an output but it's not connected, that's an error.
  if (!node.output) {
    throw new Error(`Node ${node.kind} has no output`);
  }

  // When you get to the node that outputs to return, stop.
  // This lets the calling function wrap a return statement around the expression.
  if (node.output === "return" || node.output === outputId) {
    return newTree;
  }

  // Parse the output node, passing in the current node as the input.
  return parseNodeAndInputs(nodes, nodes[node.output], referenceCounts, {
    parsedNodeId: node.id,
    expression: newTree,
  });
}

/** A parsed expression, with the ID of the node that was parsed. */
interface ParsedTree {
  parsedNodeId: NodeId;
  expression: ts.Expression;
}

/** Parse a branch, which may have already been parsed. */
function parseBranch(
  nodes: Record<NodeId, GameNode>,
  /** Output ID of the current node being processed */
  outputId: NodeId,
  /** ID of the input node to be parsed. */
  expectedInputId: NullableNodeId,
  referenceCounts: ReferenceCounts,
  /** The parsed current input, which may be used in this branch. */
  possibleInputTree?: ParsedTree
) {
  if (!expectedInputId) {
    throw new Error(`Missing input ID for branch`);
  }

  if (possibleInputTree && expectedInputId === possibleInputTree.parsedNodeId) {
    return possibleInputTree.expression;
  }

  const node = nodes[expectedInputId];

  return parseNodeAndOutputs(nodes, node, referenceCounts, outputId);
}

type ReferenceCounts = Record<NodeId, number>;

function noteReference(id: string, referenceCounts: ReferenceCounts) {
  // If the reference is don't, we're parsing the assignment, so ignore it.
  if (referenceCounts[id]) {
    // Decrement a used reference
    referenceCounts[id]--;
  }
  return referenceCounts;
}

/**
 * Parse a node, and all of its inputs.
 * Optionally takes an already parsed input
 */
function parseNodeAndInputs(
  /** Table of all nodes */
  nodes: Record<NodeId, GameNode>,
  /** The current node */
  node: GameNode,
  referenceCounts: ReferenceCounts,
  /** The tree of the last node parsed */
  inputTree?: ParsedTree
): ts.Expression {
  /** The ID of this node, to be used as the output to other branches. */
  const outputId = node.id;
  switch (node.kind) {
    case "Parameter": {
      return ts.factory.createIdentifier(node.name);
    }
    case "Identifier": {
      noteReference(node.id, referenceCounts);
      return ts.factory.createIdentifier(node.name);
      // const { name, input, type } = node;

      // const typeKind = getKeywordType(type);
      // const typeKeyword =
      //   type === "infer"
      //     ? undefined
      //     : ts.factory.createKeywordTypeNode(typeKind);

      // return ts.factory.createCallExpression(
      //   ts.factory.createIdentifier("let"),
      //   undefined,
      //   [
      //     // Variable
      //     parseBranch(nodes, outputId, input, inputTree),
      //     // Let Binding
      //     ts.factory.createArrowFunction(
      //       undefined,
      //       undefined,
      //       [
      //         ts.factory.createParameterDeclaration(
      //           undefined,
      //           undefined,
      //           name,
      //           undefined,
      //           typeKeyword,
      //           undefined
      //         ),
      //       ],
      //       undefined,
      //       undefined,
      //       // Body
      //       ts.factory.createIdentifier(name)
      //     ),
      //   ]
      // );
    }
    case "BinaryExpression": {
      const {
        operator,
        inputs: [left, right],
      } = node;
      return ts.factory.createBinaryExpression(
        parseBranch(nodes, outputId, left, referenceCounts, inputTree),
        operator,
        parseBranch(nodes, outputId, right, referenceCounts, inputTree)
      );
    }
    case "ConditionalExpression": {
      const [condition, whenTrue, whenFalse] = node.inputs;
      return ts.factory.createConditionalExpression(
        parseBranch(nodes, outputId, condition, referenceCounts, inputTree),
        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        parseBranch(nodes, outputId, whenTrue, referenceCounts, inputTree),
        ts.factory.createToken(ts.SyntaxKind.ColonToken),
        parseBranch(nodes, outputId, whenFalse, referenceCounts, inputTree)
      );
    }
    case "NumericLiteral": {
      return ts.factory.createNumericLiteral(node.value);
    }
    case "StringLiteral": {
      return ts.factory.createStringLiteral(node.value);
    }
    case "ReturnStatement": {
      const [input] = node.inputs;
      if (!input) {
        throw new Error(`Return statement has no input`);
      }
      return parseNodeAndInputs(nodes, nodes[input], referenceCounts);
    }
    default: {
      throw new Error(`Unknown node kind, ${node.kind}`);
    }
  }
}

function getKeywordType(
  type: "infer" | "string" | "number" | "boolean"
): ts.KeywordTypeSyntaxKind | null {
  switch (type) {
    case "infer":
      return null;
    case "string":
      return ts.SyntaxKind.StringKeyword;
    case "number":
      return ts.SyntaxKind.NumberKeyword;
    case "boolean":
      return ts.SyntaxKind.BooleanKeyword;
    default:
      throw new Error(`Unknown type ${type}`);
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
    const typeKind = getKeywordType(param.type);
    if (!typeKind) {
      throw new Error(`Unknown type ${param.type} for ${param.name}`);
    }
    const type = ts.factory.createKeywordTypeNode(typeKind);

    return ts.factory.createParameterDeclaration(
      undefined,
      undefined,
      name,
      undefined,
      type,
      undefined
    );
  });

  const statements = parse(nodes);

  return ts.factory.createFunctionDeclaration(
    undefined,
    undefined,
    functionName,
    undefined,
    parameters,
    ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
    ts.factory.createBlock(statements, true)
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
