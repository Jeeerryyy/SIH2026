import React from "react";
import "./globals.css";

export const metadata = {
  title: "ArogyaSetu Bridge — Provider & DHO Command Center",
  description: "Enterprise State-Scale Telemedicine & Health Mesh Platform (Government of Maharashtra)",
  keywords: "ArogyaSetu, Maharashtra Health, Teleconsultation, ASHA, DHO, SIH 2026",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#75A68C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;450;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
