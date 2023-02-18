import { GameNodes } from "$nodes/nodes";

interface Test<Args extends any[] = any[], Expected = any> {
  args: Args;
  expect: Expected;
}

export interface Level<Args extends any[] = any[], Expected = any> {
  name: string;
  mainFunction: string;
  nodes: GameNodes;
  tests: Test<Args, Expected>[];
}
