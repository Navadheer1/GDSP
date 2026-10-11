import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "var(--surface)",
          secondary: "var(--surface-secondary)",
          hover: "var(--surface-hover)",
        },
        ink: {
          DEFAULT: "#15152B",
          navy: "#15152B",
          muted: "#6F7088",
          subtle: "#9596AA",
        },
        violet: {
          electric: "#6654F5",
          soft: "#8A7CFF",
          light: "#EBE8FF",
          glow: "rgba(102, 84, 245, 0.15)",
        },
        accent: {
          sky: "#78B9FF",
          emerald: "#10B981",
          amber: "#F59E0B",
          coral: "#F43F5E",
        },
        brand: {
          50: "#FAF9FF",
          100: "#F4F2FF",
          200: "#E6E2FF",
          300: "#C9C2FE",
          400: "#9E90FF",
          500: "#6654F5",
          600: "#5542E5",
          700: "#4431D0",
          800: "#3422AA",
          900: "#1E1275",
        },
        navy: {
          900: "#15152B",
          800: "#1D1D3A",
          700: "#2B2B50",
          600: "#3D3D6C",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(21, 21, 43, 0.03), 0 1px 3px 1px rgba(21, 21, 43, 0.02)',
        'card': '0 4px 20px -2px rgba(102, 84, 245, 0.06), 0 2px 6px -1px rgba(21, 21, 43, 0.04)',
        'card-hover': '0 12px 30px -4px rgba(102, 84, 245, 0.12), 0 4px 10px -2px rgba(21, 21, 43, 0.06)',
        'workspace': '0 20px 48px -8px rgba(102, 84, 245, 0.10), 0 8px 16px -4px rgba(21, 21, 43, 0.04)',
        'glow-violet': '0 0 30px -4px rgba(102, 84, 245, 0.35)',
        'button-primary': '0 4px 14px 0 rgba(102, 84, 245, 0.35)',
      },
      animation: {
        'drift-slow': 'drift 18s ease-in-out infinite alternate',
        'drift-reverse': 'driftReverse 22s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        drift: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '100%': { transform: 'translate(30px, -20px) scale(1.08)' },
        },
        driftReverse: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '100%': { transform: 'translate(-25px, 25px) scale(0.95)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
