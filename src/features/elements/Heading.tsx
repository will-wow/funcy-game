import clsx from "clsx";
import { createElement } from "react";

export type HeadingSize = "sm" | "md" | "lg";

export interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?: "sm" | "md" | "lg";
}

export function Heading({
  children,
  as = "h2",
  size = "md",
  className,
}: HeadingProps) {
  const sizeClass = getSize(size);

  return createElement(
    as,
    {
      className: clsx(sizeClass, className),
    },
    children
  );
}

function getSize(size: HeadingSize) {
  switch (size) {
    case "sm": {
      return "text-2xl";
    }
    case "md": {
      return "text-3xl";
    }
    case "lg": {
      return "text-4xl";
    }
  }
}
