import React from "react";
import { HireavillaTokens } from "../theme/tokens.js";

export interface TableProps {
  headers: string[];
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ headers, children }) => {
  return (
    <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: HireavillaTokens.typography.fontBody,
          fontSize: "14px",
          textAlign: "left"
        }}
      >
        <thead>
          <tr style={{ backgroundColor: HireavillaTokens.colors.surfaceAlt, borderBottom: `1px solid ${HireavillaTokens.colors.hairline}` }}>
            {headers.map((header, idx) => (
              <th
                key={idx}
                style={{
                  padding: "12px 16px",
                  fontWeight: 600,
                  color: HireavillaTokens.colors.ink,
                  fontSize: "13px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};
