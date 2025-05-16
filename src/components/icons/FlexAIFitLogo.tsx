import type { SVGProps } from 'react';

export function FlexAIFitLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="120"
      height="30"
      aria-label="FlexAI Fit Logo"
      {...props}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect width="50" height="50" rx="10" ry="10" fill="url(#logoGradient)">
        <animate attributeName="rx" values="10;25;10" dur="3s" repeatCount="indefinite" />
      </rect>
      <path d="M15 15 L15 35 L25 35 L25 25 L35 25 L35 15 Z M20 20 H30 V20" fill="hsl(var(--primary-foreground))" />
      <text
        x="60"
        y="35"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        fontSize="30"
        fontWeight="bold"
        fill="hsl(var(--foreground))"
      >
        FlexAI Fit
      </text>
    </svg>
  );
}
