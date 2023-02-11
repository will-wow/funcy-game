import { KeyboardControls, KeyboardControlsEntry } from "@react-three/drei";
import { ReactNode } from "react";

// Copied from types
type KeyboardControlsState<T extends string = string> = {
  [K in T]: boolean;
};

// Copied from types
export type KeyboardControlsOnChange<T extends string = string> = (
  name: ShortcutControls,
  pressed: boolean,
  state: KeyboardControlsState<T>
) => void;

export interface ShortcutsProps {
  children: ReactNode;
  onChange?: KeyboardControlsOnChange<ShortcutControls>;
}

export function Shortcuts({ children, onChange }: ShortcutsProps) {
  return (
    <KeyboardControls
      map={keyboardMap}
      onChange={(name, pressed, state) => {
        if (onChange) {
          onChange(
            name as ShortcutControls,
            pressed,
            state as KeyboardControlsState<ShortcutControls>
          );
        }
      }}

    >
      {children}
    </KeyboardControls>
  );
}

export enum ShortcutControls {
  esc = "esc",
  place = "place",
  connect = "connect",
  variable = "Identifier",
  number = "NumericLiteral",
  string = "StringLiteral",
  parameter = "Parameter",
  operator = "BinaryExpression",
  if = "ConditionalExpression",
  call = "CallExpression",
}

// TOOD: use https://github.com/JohannesKlauss/react-hotkeys-hook
// Do multiple keys

const keyboardMap: KeyboardControlsEntry<ShortcutControls>[] = [
  { name: ShortcutControls.esc, keys: ["Escape"] },
  { name: ShortcutControls.place, keys: ["p"] },
  { name: ShortcutControls.connect, keys: ["c"] },
  // Node types
  { name: ShortcutControls.number, keys: ["n"] },
  { name: ShortcutControls.string, keys: ["s"] },
  { name: ShortcutControls.parameter, keys: ["a"] },
  { name: ShortcutControls.operator, keys: ["o"] },
  { name: ShortcutControls.if, keys: ["i"] },
  { name: ShortcutControls.call, keys: ["f"] },
];
