/**
 * Hireavilla Luxury Sage & Serene Earth Design System Tokens
 */

export const HireavillaTokens = {
  colors: {
    primary: "#75A68C",          // Sage Green primary brand accent
    primaryHover: "#456B4D",     // Darker sage for active/hover states
    link: "#517C65",             // Dark sage for inline links & subnav
    onPrimary: "#2D2D2E",        // Near-black text on brand
    ink: "#2D2D2E",              // Primary typography ink
    body: "#FFFFFF",             // Pure white primary background
    surfaceAlt: "#E3EDE8",       // Soft sage alternating surface band
    surfaceRaised: "#DCE5E1",    // Elevated container surface
    hairline: "#D6D6D6",         // 1px subtle borders & dividers
    muted: "#737373",            // Secondary metadata & helper text
    faint: "#659079",            // Input placeholders & tertiary text
    neutral1: "#000000",         // Decorative overlays only
    
    // Clinical Triage Urgency Semantic Palette
    triage: {
      emergencyRed: "#C8372D",
      emergencyRedBg: "#FDF2F2",
      urgentAmber: "#D97706",
      urgentAmberBg: "#FEF9C3",
      semiUrgentYellow: "#858C2B",
      semiUrgentYellowBg: "#F9FBE7",
      routineGreen: "#517C65",
      routineGreenBg: "#E3EDE8"
    }
  },
  
  typography: {
    fontDisplay: "'Athelas', 'Georgia', 'Playfair Display', serif",
    fontBody: "'Hanken Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: {
      displayXl: "48px",
      headingMd: "24px",
      bodyLg: "18px",
      bodyMd: "16px",
      bodySm: "14px",
      caption: "12px"
    },
    lineHeight: {
      display: "1.25",
      heading: "1.35",
      body: "1.5"
    }
  },

  radius: {
    none: "0px",
    xs: "6px",
    sm: "10px",
    full: "9999px" // 40px–48px pill buttons
  },

  spacing: {
    xxs: "4px",
    xs: "8px",
    sm: "12px",
    md: "16px",
    lg: "20px",
    xl: "24px",
    xxl: "32px",
    xxxl: "64px",
    section: "80px",
    band: "120px"
  }
};
