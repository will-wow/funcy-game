import { ThreeEvent } from "@react-three/fiber";

/** Throw an error if the condition is not met. */
export function assert(
  condition: unknown,
  message?: string
): asserts condition {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

export function stopPropagation(e: ThreeEvent<any>) {
  e.stopPropagation();
}

export function noop() {}
