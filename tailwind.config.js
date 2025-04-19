import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Add this line
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Keep if using pages dir
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Add if you have components dir
  ],
  theme: {
    extend: {
      // Add Poppins to the font family list
      fontFamily: {
        sans: ['Poppins', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
}

