import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", md: "2rem" },
      screens: { "2xl": "1320px" },
    },
    extend: {
      fontFamily: {
        sans: ["Rubik", "Heebo", "system-ui", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        raised: "hsl(var(--raised))",
        overlay: "hsl(var(--overlay))",
        light: {
          DEFAULT: "hsl(var(--light))",
          foreground: "hsl(var(--light-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--surface))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        vsa: "hsl(var(--vs-a))",
        vsb: "hsl(var(--vs-b))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        /* Aliases from the previous light theme. The site was built against
           these names; mapping them onto the dark palette keeps every screen
           coherent while sections are migrated one at a time. Remove once
           nothing references them. */
        ink: {
          DEFAULT: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          muted: "hsl(var(--muted-foreground))",
        },
        signal: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      borderRadius: {
        chip: "var(--radius-chip)",
        card: "var(--radius-card)",
        hero: "var(--radius-hero)",
      },
      boxShadow: {
        // On a black canvas a drop shadow is invisible — depth has to come
        // from a light rim instead.
        rim: "inset 0 1px 0 hsl(0 0% 100% / 0.06)",
        card: "inset 0 1px 0 hsl(0 0% 100% / 0.06)",
        lift: "0 32px 64px -24px hsl(0 0% 0% / 0.9), inset 0 1px 0 hsl(0 0% 100% / 0.08)",
        glow: "0 0 0 1px hsl(var(--accent) / 0.4), 0 12px 40px -8px hsl(var(--accent) / 0.35)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
        // Overshoots slightly then settles — for the circular arrow buttons.
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "ken-burns": {
          from: { transform: "scale(1)" },
          to: { transform: "scale(1.08)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        /* A slow drift for the accent glow behind the hero product. */
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(2%, -3%, 0) scale(1.06)" },
        },
        /* The dot that travels around the step indicator. */
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.5s ease both",
        "ken-burns": "ken-burns 14s ease-out both",
        shimmer: "shimmer 1.6s linear infinite",
        marquee: "marquee 40s linear infinite",
        drift: "drift 18s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.22, 1, 0.36, 1) infinite",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
