import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '.dark-theme'],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
