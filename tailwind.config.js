/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'hover:shadow-glowWhite',
    'shadow-glowWhite',
    'enabled:hover:shadow-glow',
    'enabled:hover:shadow-glowPurple',
    'enabled:hover:shadow-glowCyan',
    'enabled:hover:shadow-glowWhite',
  ],
  theme: {
    extend: {
      screens: {
        xs: '320px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        handwriting: ['"Playwrite RO"', 'cursive'],
      },
      fontSize: {
        'heading-xl': '1.875rem', // 3xl
      },
      colors: {
        neonPink: '#FF007F',
        glowPurple: '#8A2BE2',
        neonCyan: '#00FFFF',
        darkPurple: '#0b0019', // from moodboard — for background
        gray: '#ffffff33',
      },
      boxShadow: {
        glow: '0 0 12px rgba(255, 0, 255, 0.6)', // pink glow
        glowPurple: '0 0 12px rgba(138, 43, 226, 0.6)', // purple glow
        glowCyan: '0 0 12px rgba(0, 255, 255, 0.6)', // cyan glow
        glowWhite: '0 0 12px rgba(255, 255, 255, 1)', // white glow
      },
      dropShadow: {
        'inner-glowPink': '0 0 8px #FF007F',
        'inner-glowWhite': '0 0 4px #FFFFFF',
      },
      borderRadius: {
        DEFAULT: '0.5rem', // applies when using just `rounded`
        xl: '0.5rem',
        '2xl': '1rem',
      },
      borderWidth: {
        DEFAULT: '2px',
        1: '1px',
        3: '3px',
      },
      spacing: {
        '12': '3rem',
      },
      transitionProperty: {
        DEFAULT: 'all',
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease-in-out',
      }
    },
  },
  variants: {
    extend: {
      boxShadow: ['enabled'],
    },
  },

  plugins: [],
};
