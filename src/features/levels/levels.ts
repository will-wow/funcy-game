import { add } from "./levels/add";
import { demo } from "./levels/demo";
import { empty } from "./levels/empty";
import { fibN } from "./levels/fibN";
import { fizzBuzz } from "./levels/fizzBuzz";

export const levels = {
  empty,
  add,
  demo,
  fibN,
  fizzBuzz,
};

export function isLevelName(name: string): name is LevelName {
  return name in levels;
}

export type LevelName = keyof typeof levels;
