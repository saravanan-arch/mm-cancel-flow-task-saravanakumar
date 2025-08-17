/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'dm-sans': ['DM Sans', 'sans-serif'],
        'dm-sans-light': ['DM Sans', 'sans-serif'],
        'dm-sans-normal': ['DM Sans', 'sans-serif'],
        'dm-sans-medium': ['DM Sans', 'sans-serif'],
        'dm-sans-semibold': ['DM Sans', 'sans-serif'],
        'dm-sans-bold': ['DM Sans', 'sans-serif'],
      },
      fontWeight: {
        'light': 300,
        'normal': 400,
        'medium': 500,
        'semibold': 600,
        'bold': 700,
      },
    },
  },
  plugins: [],
}
