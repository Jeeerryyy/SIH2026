import React from "react";
import { HireavillaTokens } from "../theme/tokens.js";

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface NavbarProps {
  brandName?: string;
  brandSubtitle?: string;
  items: NavItem[];
  userBadge?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  brandName = "ArogyaSetu Bridge",
  brandSubtitle = "Government of Maharashtra",
  items,
  userBadge,
  onLogout
}) => {
  return (
    <header
      style={{
        backgroundColor: HireavillaTokens.colors.body,
        borderBottom: `1px solid ${HireavillaTokens.colors.hairline}`,
        padding: "0 24px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: HireavillaTokens.typography.fontBody,
        position: "sticky",
        top: 0,
        zIndex: 100
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: HireavillaTokens.radius.full,
            backgroundColor: HireavillaTokens.colors.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontWeight: "bold",
            fontSize: "16px"
          }}
        >
          A
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: "16px", color: HireavillaTokens.colors.ink, letterSpacing: "-0.2px" }}>
            {brandName}
          </div>
          <div style={{ fontSize: "11px", color: HireavillaTokens.colors.muted }}>
            {brandSubtitle}
          </div>
        </div>
      </div>

      <nav style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {items.map((item, idx) => (
          <a
            key={idx}
            href={item.href}
            style={{
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
              padding: "8px 16px",
              borderRadius: HireavillaTokens.radius.full,
              color: item.active ? HireavillaTokens.colors.primary : HireavillaTokens.colors.ink,
              backgroundColor: item.active ? HireavillaTokens.colors.surfaceAlt : "transparent",
              transition: "all 180ms ease"
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {userBadge && (
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              padding: "4px 10px",
              backgroundColor: HireavillaTokens.colors.surfaceAlt,
              color: HireavillaTokens.colors.link,
              borderRadius: HireavillaTokens.radius.full
            }}
          >
            {userBadge}
          </span>
        )}
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              border: `1px solid ${HireavillaTokens.colors.hairline}`,
              backgroundColor: "transparent",
              borderRadius: HireavillaTokens.radius.full,
              padding: "6px 14px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              color: HireavillaTokens.colors.ink
            }}
          >
            Sign Out
          </button>
        )}
      </div>
    </header>
  );
};
