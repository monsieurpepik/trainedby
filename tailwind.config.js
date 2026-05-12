/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html'],
  theme: {
    extend: {
      colors: {
        surface: '#0a0a0a',
        'surface-2': '#111111',
        'surface-3': '#1a1a1a',
        'on-surface': '#ffffff',
        'on-surface-muted': 'rgba(255,255,255,0.5)',
        'on-surface-faint': 'rgba(255,255,255,0.15)',
        brand: '#D4622A',
        'brand-dim': 'rgba(212,98,42,0.15)',
        'brand-border': 'rgba(212,98,42,0.3)',
        'reps-green': '#00C853',
        'reps-green-dim': 'rgba(0,200,83,0.12)',
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        display: ['Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
