import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          midnight: '#0B1F3A',
          gold: '#D4AF37',
          'soft-white': '#F8F9FB',
        },
      },
    },
  },
  plugins: [],
}
export default config
