import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F8FAFC',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F1F5F9',
          tertiary: '#E2E8F0',
        },
        header: '#0F172A',
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          900: '#312E81',
        },
        accent: {
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        status: {
          queued: '#F59E0B',
          flight: '#3B82F6',
          holding: '#A855F7',
          sent: '#10B981',
          failed: '#EF4444',
        },
        slateText: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
          light: '#94A3B8',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(79, 70, 229, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        brand: '0 4px 14px 0 rgba(79, 70, 229, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
