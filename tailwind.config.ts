import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Toss Korean FinTech Brand Colors
        toss: {
          blue: '#3182F6',
          hover: '#2272EB',
          subtle: '#E8F3FF',
          dark: '#1B64DA',
        },
        surface: {
          canvas: '#FFFFFF',
          subdued: '#F2F4F6',
          elevated: '#FFFFFF',
          border: '#E5E8EB',
          borderHover: '#D1D6DB',
        },
        ink: {
          primary: '#191F28',
          secondary: '#333D4B',
          muted: '#6F7780',
          disabled: '#B0B8C1',
        },
        status: {
          success: '#03B26C',
          successBg: '#E6FAF2',
          warning: '#FE9800',
          warningBg: '#FFF5E6',
          danger: '#F04452',
          dangerBg: '#FEECED',
        },
      },
      borderRadius: {
        'none': '0',
        'sm': '2px',
        'DEFAULT': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '10px',
        '2xl': '10px',
        '3xl': '10px',
        'full': '9999px',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
