module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'table-green': '#228B22',
        'card-blue': '#1e40af',
        'uno-red': '#ff2222',
        'uno-blue': '#0055ff',
        'uno-green': '#44aa00',
        'uno-yellow': '#ffcc00',
      },
      boxShadow: {
        'card': '2px 4px 8px rgba(0,0,0,0.4)',
        'avatar': '0 4px 6px rgba(0,0,0,0.3)',
      }
    },
  },
  plugins: [],
}
