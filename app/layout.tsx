import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prompt Brawl — Make Your Prompt Throw Hands",
  description:
    "Turn the wait for your AI response into a battle. Prompt Brawl pulls two fighters out of your prompt and lets them throw hands while the AI generates its answer.",
};

const fontVars: CSSProperties = {
  ["--font-display" as string]: "'Rajdhani', sans-serif",
  ["--font-body" as string]: "'Inter', sans-serif",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-void text-ink min-h-screen antialiased" style={fontVars}>
        {children}
      </body>
    </html>
  );
}
