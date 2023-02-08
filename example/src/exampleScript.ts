/* eslint-disable @typescript-eslint/no-unused-vars */

function iff<Cond extends true | false, T, F>(
  a: Cond,
  t: T,
  f: F
): Cond extends true ? T : F {
  if (a === true) {
    return t as any;
  } else {
    return f as any;
  }
}

function lt(a: number, b: number): boolean {
  return a < b;
}

function gt(a: number, b: number): boolean {
  return a > b;
}

function and<A, B>(a: A, b: B): A | B {
  return a && b;
}

function or<A, B>(a: A, b: B): A | B {
  return a || b;
}

function add(a: number, b: number): number {
  return a + b;
}

function sub(a: number, b: number): number {
  return a - b;
}

function mul(a: number, b: number): number {
  return a * b;
}

function neg(a: number): number {
  return -a;
}

function abs(a: number): number {
  return lt(a, 0) ? neg(a) : a;
}

function eq<T>(a: T, b: T): boolean {
  return a === b;
}

function assert<T extends string>(type: T, a: string): T {
  if (a !== type) throw new Error(a + " !== " + type);
  return a as T;
}

function chop(a: "tree"): "wood" {
  if (a !== "tree") throw new Error(`Invalid tree: ${a}`);
  return "wood";
}

function forge(mat: "ore", fuel: "wood"): "iron";
function forge(mat: "iron", fuel: "wood", addition: "charcoal"): "steel";
function forge(mat: "wood", fuel: "wood"): "charcoal";
function forge(
  mat: "ore" | "iron" | "wood",
  fuel: "wood",
  addition?: "charcoal"
): "iron" | "steel" | "charcoal" {
  if (mat === "ore" && fuel === "wood") {
    return "iron";
  }
  if (mat === "wood" && fuel === "wood") {
    return "charcoal";
  }
  if (mat === "iron" && fuel === "wood" && addition === "charcoal") {
    return "steel";
  }
  throw new Error(`Invalid forge: ${mat}, ${fuel}, ${addition}`);
}

function craftSword(metal: "iron", handle: "wood"): "iron sword";
function craftSword(metal: "steel", handle: "wood"): "steel sword";
function craftSword(
  metal: "iron" | "steel",
  handle: "wood"
): "iron sword" | "steel sword" {
  if (metal === "steel") return "steel sword";
  if (metal === "iron") return "iron sword";
  throw new Error(`Invalid metal: ${metal}`);
}

interface Resources {
  tree: number;
  ore: number;
  wood: number;
  iron: number;
  steel: number;
  charcoal: number;
}

type Resource = keyof Resources;

class Bundle {
  private inputs: Resources = {
    tree: 0,
    ore: 0,
    wood: 0,
    iron: 0,
    steel: 0,
    charcoal: 0,
  };

  constructor(inputs: Partial<Resources>) {
    this.inputs = {
      ...this.inputs,
      ...inputs,
    };
  }

  get<T extends Resource>(name: T): T {
    if (this.inputs[name]) {
      this.inputs[name] -= 1;
      return name;
    } else {
      throw new Error(`Missing 1 ${name}`);
    }
  }

  has(name: Resource, count = 1): boolean {
    return this.inputs[name] >= count;
  }
}

function main(bundle: Bundle): string {
  return bundle.has("steel")
    ? craftSword(bundle.get("steel"), chop(bundle.get("tree")))
    : bundle.has("tree", 5 + 1)
    ? craftSword(
        // Metal
        forge(
          // Iron
          forge(bundle.get("ore"), chop(bundle.get("tree"))),
          // Wood
          chop(bundle.get("tree")),
          // Charcoal
          forge(
            chop(bundle.get("tree")),
            chop(bundle.get("tree"))
            // chop(inputs.get("tree"))
          )
        ),
        // Handle
        chop(bundle.get("tree"))
      )
    : craftSword(
        forge(bundle.get("ore"), chop(bundle.get("tree"))),
        chop(bundle.get("tree"))
      );
}
