/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0F172A',
          800: '#14213D',
          700: '#1E293B',
          600: '#334155',
        },
        traffic: {
          freeflow: '#10B981', // green/teal
          moderate: '#2563EB', // blue
          heavy: '#F59E0B',    // amber
          gridlock: '#EF4444', // red
        },
        canvas: '#F5F7FB',
        borderSubtle: '#E4E7EC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(16, 24, 40, 0.06), 0 1px 2px -1px rgba(16, 24, 40, 0.06)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
