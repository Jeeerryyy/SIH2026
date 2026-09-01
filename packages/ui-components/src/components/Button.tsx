import React from "react";
import { HireavillaTokens } from "../theme/tokens.js";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  style,
  ...props
}) => {
  const heights = { sm: "40px", md: "48px", lg: "54px" };
  const paddings = { sm: "0 20px", md: "0 32px", lg: "0 40px" };
  const fontSizes = { sm: "14px", md: "15px", lg: "16px" };

  let bg = HireavillaTokens.colors.primary;
  let color = "#FFFFFF";
  let border = "none";

  if (variant === "secondary") {
    bg = HireavillaTokens.colors.surfaceAlt;
    color = HireavillaTokens.colors.ink;
    border = `1px solid ${HireavillaTokens.colors.hairline}`;
  } else if (variant === "ghost") {
    bg = "transparent";
    color = HireavillaTokens.colors.link;
  } else if (variant === "danger") {
    bg = HireavillaTokens.colors.triage.emergencyRed;
    color = "#FFFFFF";
  }

  return (
    <button
      style={{
        backgroundColor: bg,
        color,
        border,
        borderRadius: HireavillaTokens.radius.full,
        height: heights[size],
        padding: paddings[size],
        fontSize: fontSizes[size],
        fontFamily: HireavillaTokens.typography.fontBody,
        fontWeight: 500,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        transition: "all 200ms ease",
        outline: "none",
        ...style
      }}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};
