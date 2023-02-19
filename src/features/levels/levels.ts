import { add } from "./levels/add";
import { demo } from "./levels/demo";
import { empty } from "./levels/empty";
import { fibN } from "./levels/fibN";

export const levels = {
  empty,
  add,
  demo,
  fibN,
};

export function isLevelName(name: string): name is LevelName {
  return name in levels;
}

export type LevelName = keyof typeof levels;
