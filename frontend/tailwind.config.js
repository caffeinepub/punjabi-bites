/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Saffron - primary brand color
        saffron: {
          50:  'oklch(0.97 0.03 75)',
          100: 'oklch(0.94 0.06 72)',
          200: 'oklch(0.88 0.10 70)',
          300: 'oklch(0.82 0.14 68)',
          400: 'oklch(0.76 0.17 66)',
          500: 'oklch(0.72 0.18 65)',
          600: 'oklch(0.65 0.17 62)',
          700: 'oklch(0.55 0.15 58)',
          800: 'oklch(0.45 0.12 55)',
          900: 'oklch(0.35 0.09 50)',
        },
        // Deep Red - secondary brand color
        deepRed: {
          50:  'oklch(0.97 0.02 25)',
          100: 'oklch(0.92 0.04 25)',
          200: 'oklch(0.82 0.07 25)',
          300: 'oklch(0.68 0.10 25)',
          400: 'oklch(0.52 0.13 25)',
          500: 'oklch(0.42 0.14 25)',
          600: 'oklch(0.35 0.14 25)',
          700: 'oklch(0.28 0.12 25)',
          800: 'oklch(0.22 0.10 25)',
          900: 'oklch(0.15 0.07 25)',
        },
        // Cream - background tones
        cream: {
          50:  'oklch(0.98 0.01 80)',
          100: 'oklch(0.96 0.02 78)',
          200: 'oklch(0.92 0.03 76)',
          300: 'oklch(0.86 0.04 74)',
          400: 'oklch(0.78 0.05 72)',
          500: 'oklch(0.70 0.05 70)',
        },
        // Spice - text and accent tones
        spice: {
          100: 'oklch(0.92 0.04 40)',
          200: 'oklch(0.84 0.07 38)',
          300: 'oklch(0.74 0.09 36)',
          400: 'oklch(0.64 0.10 35)',
          500: 'oklch(0.55 0.10 34)',
          600: 'oklch(0.46 0.09 33)',
          700: 'oklch(0.38 0.08 32)',
        },
        // Semantic tokens mapped to brand
        background: 'oklch(var(--background) / <alpha-value>)',
        foreground: 'oklch(var(--foreground) / <alpha-value>)',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        card: '0 2px 8px oklch(0.2 0.04 30 / 0.08), 0 1px 3px oklch(0.2 0.04 30 / 0.06)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
};
