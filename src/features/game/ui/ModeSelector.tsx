/* eslint-disable no-console */
import clsx from "clsx";
import { ReactNode } from "react";

import { GameMode, getNodes, setMode, useMode } from "$game/game.store";
import { Level } from "$levels/Level";
import { compileNodes } from "$parser/compile";
import { CloseIcon } from "~/icons/CloseIcon";
import { ConnectionIcon } from "~/icons/ConnectIcon";
import { PlusIcon } from "~/icons/PlusIcon";
import { SelectIcon } from "~/icons/SelectIcon";
import { TerminalIcon } from "~/icons/TerminalIcon";

export interface ModeSelectorProps {
  level: Level;
  className?: string;
}

export function ModeSelector({ className, level }: ModeSelectorProps) {
  return (
    <div className={clsx(className, "flex flex-col gap-1 p-2")}>
      <SelectModeButton mode="place" icon={<PlusIcon />} />
      <SelectModeButton mode="connect" icon={<ConnectionIcon />} />
      <SelectModeButton mode="remove" icon={<CloseIcon />} />
      <SelectModeButton mode="select" icon={<SelectIcon />} />
      <ModeButton
        icon={<TerminalIcon />}
        label="Run"
        className="bg-purple-600 hover:bg-purple-800"
        onClick={async () => {
          try {
            const nodes = getNodes();

            // eslint-disable-next-line no-console
            console.log(nodes);

            const { generatedCode, diagnostics, js } = await compileNodes(
              nodes
            );

            if (diagnostics.length) {
              console.error(
                generatedCode,
                diagnostics.map((d) => d.getMessageText())
              );
              return;
            }
            console.log("ts\n", generatedCode);
            console.log("js\n", js);

            const main = eval?.(`
							${js}

							${level.mainFunction};
						`);

            const results = level.tests.map(({ args, expect }) => {
              const result = main(...args);
              return {
                args,
                expect,
                result,
                pass: result === expect,
              };
            });

            if (results.every((r) => r.pass)) {
              console.log("tests passed");
            } else {
              console.error("Tests failed!");

              results.forEach((r) => {
                if (r.pass) return;

                console.error(
                  "expected",
                  `${level.mainFunction}(${r.args
                    .map((arg) => JSON.stringify(arg))
                    .join(", ")})`,
                  "to return",
                  r.expect,
                  "but it returned",
                  r.result
                );
              });
            }
          } catch (e) {
            console.error(e);
          }
        }}
      />
    </div>
  );
}

interface ModeButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}

function ModeButton({ label, icon, className, onClick }: ModeButtonProps) {
  return (
    <button
      className={clsx(
        className,
        `
					text-white
					rounded-full
					w-10
					h-10
					flex
					justify-center
					items-center
				`
      )}
      title={label}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

interface SelectModeButtonProps {
  icon: ReactNode;
  mode: GameMode;
}

function SelectModeButton({ mode, icon }: SelectModeButtonProps) {
  const currentMode = useMode();

  const className =
    mode === currentMode
      ? "bg-orange-600 hover:bg-orange-700"
      : "bg-orange-400 hover:bg-orange-500";

  return (
    <ModeButton
      className={className}
      label={mode}
      icon={icon}
      // className={currentMode === mode ? "bg-blue-900" : "bg-blue-600"}
      onClick={() => {
        setMode(mode);
      }}
    />
  );
}
