import type { Config } from 'tailwindcss'
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        priority: {
          red: '#EF4444',
          yellow: '#F59E0B',
          blue: '#3B82F6',
        },
      },
    },
  },
  plugins: [],
}
export default config