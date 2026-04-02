/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'Noto Sans KR', 'system-ui', 'sans-serif'],
      },
      colors: {
        dale: {
          orange: '#FF5722',
          'orange-light': '#FF8A65',
          peach: '#FFF3E0',
          dark: '#1A1A1A',
          gray: '#666666',
          splash: '#FFFAF7',
          bg: '#F8F9FA',
          'orange-tint': '#FFE0D6',
          'orange-tint-light': '#FFEDE8',
          'orange-tint-lightest': '#FFF8F5',
        },
      },
    },
  },
  plugins: [],
}
