import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#DC2626',
        surface: '#0F172A',
        elevated: '#1E293B',
        background: '#080C14',
        borderDefault: '#1E293B',
        borderSubtle: '#334155',
        textPrimary: '#F8FAFC',
        textSecondary: '#94A3B8',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
      },
      fontFamily: {
        headline: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-inter)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
        label: ['var(--font-public-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
