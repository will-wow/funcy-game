import { createContext } from "react";
import ts from "typescript";

export const SourceContext = createContext<ts.SourceFile>(null!);
