/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0b0f19',       # Slate 950 deep indigo
          card: '#161f32',     # Slate 900 tint
          border: '#23304a',   # Slate 800 borderline
          primary: '#6366f1',  # Indigo 500
          secondary: '#38bdf8',# Sky 400
          success: '#10b981',  # Emerald 500
          danger: '#f43f5e',   # Rose 500
          warning: '#f59e0b',  # Amber 500
          text: '#f8fafc',     # Slate 50
          muted: '#94a3b8',    # Slate 400
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 4px 20px -2px rgba(99, 102, 241, 0.12), 0 2px 8px -1px rgba(56, 189, 248, 0.08)',
        glow: '0 0 15px 2px rgba(99, 102, 241, 0.45)',
      }
    },
  },
  plugins: [],
}
