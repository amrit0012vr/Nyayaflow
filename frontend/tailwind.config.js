/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="contrast"]'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1200px',
      },
    },
    extend: {
      colors: {
        gov: {
          bg: 'var(--c-bg)',
          surface: 'var(--c-surface)',
          text: 'var(--c-text)',
          'text-muted': 'var(--c-text-muted)',
          border: 'var(--c-border)',
          navy: 'var(--c-navy)',
          'navy-dark': 'var(--c-navy-dark)',
          blue: 'var(--c-blue)',
          saffron: 'var(--c-saffron)',
          green: 'var(--c-green)',
          danger: 'var(--c-danger)',
          'warning-bg': 'var(--c-warning-bg)',
          focus: 'var(--c-focus)',
        }
      },
      fontFamily: {
        sans: [
          '"Noto Sans"',
          '"Noto Sans Devanagari"',
          '"Noto Sans Oriya"',
          'system-ui',
          'Arial',
          'sans-serif'
        ],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
        md: '4px',
        lg: '6px',
        full: '9999px',
      },
      boxShadow: {
        gov: '0 1px 2px rgba(0, 0, 0, 0.08)',
        panel: '0 1px 3px rgba(11, 42, 91, 0.06)',
      }
    },
  },
  plugins: [],
}
