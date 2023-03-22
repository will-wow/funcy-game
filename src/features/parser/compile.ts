import { Project, ts, Node } from "ts-morph";

import { GameNode, isFunctionNode } from "$nodes/nodes";

import { makeFunction } from "./lib/makeFunction";

const project = new Project({
  useInMemoryFileSystem: true,
  compilerOptions: {
    strict: true,
    forceConsistentCasingInFileNames: true,
  },
});

const sourceFile = project.createSourceFile("file.ts");

const printer = ts.createPrinter();

/** Compile a set of nodes into a program. */
export async function compileNodes(nodes: Record<string, GameNode>) {
  const functions = Object.values(nodes).filter(isFunctionNode);

  const generatedCode = functions
    .map((fn) => {
      const functionDeclaration = makeFunction(fn, nodes);

      return printer.printNode(
        ts.EmitHint.Unspecified,
        functionDeclaration,
        sourceFile.compilerNode
      );
    })
    .join("\n\n");

  sourceFile.replaceWithText(generatedCode);
  const sourceText = sourceFile.getFullText();

  const diagnostics = project.getPreEmitDiagnostics();

  if (diagnostics.length) {
    diagnostics.forEach((diag) => {
      const start = diag.getStart() || 0;
      const length = diag.getLength() || 0;

      const leadingText = sourceText.slice(0, start);

      const leadingCommentMatch = leadingText.match(leadingTagCommentRegex);
      const tagsBeforeError = leadingCommentMatch
        ? [leadingCommentMatch?.[1]]
        : [];

      const errorContents = sourceText.slice(start, start + length);

      const contentsTagsMatches = [...errorContents.matchAll(tagCommentRegex)];
      const contentsTags = contentsTagsMatches.map((match) => match[1]);

      const tagsInError = [...tagsBeforeError, ...contentsTags];
      console.error(tagsInError, diag.getMessageText());
    });

    console.error(
      generatedCode,
      diagnostics.map((diag) => diag.getMessageText())
    );
  }

  const js = project.emitToMemory();
  return { generatedCode, diagnostics, js: js.getFiles()[0].text };
}

function getNodeAtPosition(node: Node<ts.Node>, pos: number): Node<ts.Node> {
  const child = node.getChildAtPos(pos);

  return child && child.getPos() !== pos ? getNodeAtPosition(child, pos) : node;
}

const leadingTagCommentRegex = /\/\*@([-a-z0-9]+)\*\/ $/;
const tagCommentRegex = /\/\*@([-a-z0-9]+)\*\/ /g;
