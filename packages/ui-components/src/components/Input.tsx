import React from "react";
import { HireavillaTokens } from "../theme/tokens.js";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
      {label && (
        <label
          style={{
            fontFamily: HireavillaTokens.typography.fontBody,
            fontSize: "13px",
            fontWeight: 500,
            color: HireavillaTokens.colors.ink
          }}
        >
          {label}
        </label>
      )}
      <input
        style={{
          width: "100%",
          height: "46px",
          backgroundColor: HireavillaTokens.colors.body,
          border: `1px solid ${error ? HireavillaTokens.colors.triage.emergencyRed : HireavillaTokens.colors.hairline}`,
          borderRadius: HireavillaTokens.radius.none,
          padding: "0 16px",
          fontFamily: HireavillaTokens.typography.fontBody,
          fontSize: "15px",
          color: HireavillaTokens.colors.ink,
          boxSizing: "border-box",
          outline: "none",
          ...style
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: "12px", color: HireavillaTokens.colors.triage.emergencyRed }}>
          {error}
        </span>
      )}
    </div>
  );
};
