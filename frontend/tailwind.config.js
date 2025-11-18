/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      colors: {
        green: {
          light: '#D6FDE5',
          normal: '#82C397',
          semidark: '#3E7358',
          dark: '#284F43',
        },
        gray: {
          light: '#E5E5E5',
          dark: '#383B42'
        },
        white: '#EEEEEE',
        tomato: '#A43F3D'
      },
      fontSize: {
        h1: ['32px', { lineHeight: '42px', fontWeight: '700' }],
        h2: ['24px', { lineHeight: '34px', fontWeight: '600' }],
        h3: ['20px', { lineHeight: '28px', fontWeight: '600' }],
        h4: ['18px', { lineHeight: '26px', fontWeight: '500' }],
        bodyLg: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        bodyMd: ['14px', { lineHeight: '22px', fontWeight: '400' }],
        bodySm: ['12px', { lineHeight: '20px', fontWeight: '400' }],
        caption: ['10px', { lineHeight: '14px', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
}

