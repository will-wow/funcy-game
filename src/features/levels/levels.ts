import { add } from "./levels/add";
import { demo } from "./levels/demo";
import { empty } from "./levels/empty";

export const levels = {
  empty,
  add,
  demo,
};

export function isLevelName(name: string): name is LevelName {
  return name in levels;
}

export type LevelName = keyof typeof levels;
