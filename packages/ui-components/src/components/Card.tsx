import React from "react";
import { HireavillaTokens } from "../theme/tokens.js";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "surface" | "surface-alt" | "surface-raised";
  noBorder?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "surface",
  noBorder = false,
  style,
  ...props
}) => {
  let bg = HireavillaTokens.colors.body;
  if (variant === "surface-alt") bg = HireavillaTokens.colors.surfaceAlt;
  if (variant === "surface-raised") bg = HireavillaTokens.colors.surfaceRaised;

  return (
    <div
      style={{
        backgroundColor: bg,
        color: HireavillaTokens.colors.ink,
        border: noBorder ? "none" : `1px solid ${HireavillaTokens.colors.hairline}`,
        borderRadius: HireavillaTokens.radius.none,
        padding: HireavillaTokens.spacing.xl,
        fontFamily: HireavillaTokens.typography.fontBody,
        boxSizing: "border-box",
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};
