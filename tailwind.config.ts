import tailwindcssAnimate from 'tailwindcss-animate';
import plugin from 'tailwindcss/plugin';
import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.1)'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        DEFAULT: '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
      backgroundOpacity: {
        '5': '0.05',
        '10': '0.1',
        '15': '0.15',
        '95': '0.95',
      },
      backdropSaturate: {
        '110': '1.1',
        '125': '1.25',
        '150': '1.5',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
        'glass-gradient-dark': 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.05))',
      }
    }
  },
  plugins: [
    tailwindcssAnimate,
    plugin(({ addUtilities }) => {
      const newUtilities = {
        '.glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px) saturate(1.5)',
          '-webkit-backdrop-filter': 'blur(8px) saturate(1.5)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(255, 255, 255, 0.125)'
        },
        '.glass-dark': {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(8px) saturate(1.5)',
          '-webkit-backdrop-filter': 'blur(8px) saturate(1.5)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        },
        '.glass-no-border': {
          borderColor: 'transparent'
        },
        '.backdrop-saturate-110': {
          backdropFilter: 'saturate(1.1)',
          '-webkit-backdrop-filter': 'saturate(1.1)',
        },
        '.backdrop-saturate-125': {
          backdropFilter: 'saturate(1.25)',
          '-webkit-backdrop-filter': 'saturate(1.25)',
        },
        '.backdrop-saturate-150': {
          backdropFilter: 'saturate(1.5)',
          '-webkit-backdrop-filter': 'saturate(1.5)',
        },
      }
      addUtilities(newUtilities)
    })
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
};

export default config;