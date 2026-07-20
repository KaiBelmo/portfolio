/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    },
    extend: {
      colors: {
        canvas: 'var(--canvas)',
        surface: 'var(--surface)',
        'surface-soft': 'var(--surface-soft)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',
        signal: 'var(--signal)',
        'scene-wash': 'var(--scene-wash)',
        shadow: 'var(--shadow)',
        // Legacy system tokens
        'sys-bg': 'var(--sys-bg)',
        'sys-surface': 'var(--sys-surface)',
        'sys-raised': 'var(--sys-raised)',
        'sys-cream': 'var(--sys-cream)',
        'sys-muted': 'var(--sys-muted)',
        'sys-signal': 'var(--sys-signal)',
        'sys-signal-soft': 'var(--sys-signal-soft)',
        'sys-line': 'var(--sys-line)',
        'sys-line-strong': 'var(--sys-line-strong)',
        'sys-focus': 'var(--sys-focus)',
      },
      borderColor: {
        DEFAULT: 'var(--sys-line)',
      },
      fontFamily: {
        display: 'var(--display)',
        body: 'var(--body)',
        mono: 'var(--mono)',
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        'compact': { 'max': '520px' },
        'mobile': { 'max': '600px' },
        'tablet': { 'max': '800px' },
        'desktop-sm': { 'max': '980px' },
        'desktop-md': { 'max': '1120px' },
      },
      transitionTimingFunction: {
        'ease-smooth': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      boxShadow: {
        'pixel': '4px 4px 0 var(--ink)',
        'pixel-accent': '4px 4px 0 var(--accent)',
        'pixel-lg': '5px 5px 0 var(--accent)',
      },
    },
  },
  plugins: [],
}
