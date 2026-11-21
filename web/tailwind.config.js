/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui"

// Shared shape tokens for both themes.
const shape = {
  "--rounded-box": "0.75rem",
  "--rounded-btn": "0.5rem",
  "--rounded-badge": "9999px",
  "--animation-btn": "0.15s",
  "--animation-input": "0.15s",
  "--btn-focus-scale": "0.98",
  "--border-btn": "1px",
  "--tab-radius": "0.5rem",
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    // `lindu` (light) and `lindu-dark`; `business` kept for side-by-side comparison.
    themes: [
      {
        lindu: {
          ...shape,
          primary: "#2f4e7e",
          "primary-content": "#ffffff",
          secondary: "#0f766e",
          "secondary-content": "#ffffff",
          accent: "#b45309",
          "accent-content": "#ffffff",
          neutral: "#1e293b",
          "neutral-content": "#f8fafc",
          "base-100": "#ffffff",
          "base-200": "#f6f7f9",
          "base-300": "#e4e7ec",
          "base-content": "#0f172a",
          info: "#2563eb",
          "info-content": "#ffffff",
          success: "#15803d",
          "success-content": "#ffffff",
          warning: "#b45309",
          "warning-content": "#ffffff",
          error: "#dc2626",
          "error-content": "#ffffff",
        },
      },
      {
        "lindu-dark": {
          ...shape,
          primary: "#7aa2e3",
          "primary-content": "#0b1220",
          secondary: "#2dd4bf",
          "secondary-content": "#042f2e",
          accent: "#fbbf24",
          "accent-content": "#1c1404",
          neutral: "#cbd5e1",
          "neutral-content": "#0f172a",
          "base-100": "#10151d",
          "base-200": "#161c26",
          "base-300": "#222b38",
          "base-content": "#e2e8f0",
          info: "#60a5fa",
          "info-content": "#0b1220",
          success: "#4ade80",
          "success-content": "#052e16",
          warning: "#fbbf24",
          "warning-content": "#1c1404",
          error: "#f87171",
          "error-content": "#2a0909",
        },
      },
      "business",
    ],
    darkTheme: "lindu-dark",
  },
}
