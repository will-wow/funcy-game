"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { parseSource } from "~/lib/parse";
// import { SourceContext } from "./SourceContext";
import { RenderBody } from "./Render";

const f = `
function iff<T, F>(a: any, t: T, f: F): T | F {
  return a ? t : f;
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

function main(): void {
  iff(gt(1, 0), sub(1, 1), 0);
}
`;

const NINETY_DEGREES = Math.PI / 2;

export function Game() {
  const source = useSource(f);

  source.getChildren();

  const main = source.getFunctionOrThrow("main");

  if (!main) return null;
  return (
    <Canvas>
      {/* <SourceContext.Provider value={source}> */}
      <RenderBody node={main.getBody()!} />

      {/* {source.statements.map((node, i) => {
          return (
            <group key={i} position={[0, 0, -i * 1.2]}>
              <RenderNode node={node} />
            </group>
          );
        })} */}

      <PerspectiveCamera
        makeDefault
        position={[0, 10, 0]}
        rotation={[NINETY_DEGREES, 0, 0]}
      />

      <ambientLight intensity={0.1} />
      <directionalLight position={[0, 500, 500]} />

      <Grid args={[100, 100]} />
      <OrbitControls />
      {/* </SourceContext.Provider> */}
    </Canvas>
  );
}

const useSource = (f: string) => {
  return useMemo(() => {
    return parseSource(f);
  }, [f]);
};
