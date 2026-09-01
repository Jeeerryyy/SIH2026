import React from "react";
import { TriageUrgencyTier } from "@arogyasetu/shared-types";
import { HireavillaTokens } from "../theme/tokens.js";

export interface BadgeProps {
  tier?: TriageUrgencyTier;
  children: React.ReactNode;
  variant?: "default" | "sage" | "outline";
}

export const Badge: React.FC<BadgeProps> = ({ tier, children, variant = "default" }) => {
  let bg = HireavillaTokens.colors.surfaceAlt;
  let color = HireavillaTokens.colors.ink;
  let border = "none";

  if (tier === TriageUrgencyTier.EMERGENCY_RED) {
    bg = HireavillaTokens.colors.triage.emergencyRedBg;
    color = HireavillaTokens.colors.triage.emergencyRed;
  } else if (tier === TriageUrgencyTier.URGENT_AMBER) {
    bg = HireavillaTokens.colors.triage.urgentAmberBg;
    color = HireavillaTokens.colors.triage.urgentAmber;
  } else if (tier === TriageUrgencyTier.SEMI_URGENT_YELLOW) {
    bg = HireavillaTokens.colors.triage.semiUrgentYellowBg;
    color = HireavillaTokens.colors.triage.semiUrgentYellow;
  } else if (tier === TriageUrgencyTier.ROUTINE_GREEN) {
    bg = HireavillaTokens.colors.triage.routineGreenBg;
    color = HireavillaTokens.colors.triage.routineGreen;
  } else if (variant === "sage") {
    bg = HireavillaTokens.colors.primary;
    color = "#FFFFFF";
  } else if (variant === "outline") {
    bg = "transparent";
    color = HireavillaTokens.colors.ink;
    border = `1px solid ${HireavillaTokens.colors.hairline}`;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px 12px",
        borderRadius: HireavillaTokens.radius.full,
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: "0.2px",
        backgroundColor: bg,
        color,
        border,
        fontFamily: HireavillaTokens.typography.fontBody
      }}
    >
      {children}
    </span>
  );
};
