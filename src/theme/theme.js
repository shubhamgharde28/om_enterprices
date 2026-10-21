import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
    },
    primary: {
      50: '#eaf7ff',
      100: '#d7efff',
      200: '#b3defd',
      300: '#7fc7fc',
      400: '#39a8f9',
      500: '#1686dc',
      600: '#0d6ab4',
      700: '#0e568d',
      800: '#134a77',
      900: '#153d61',
    },
    accent: {
      50: '#edfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    neutral: {
      50: '#f8fafc',
      100: '#eef3f7',
      200: '#dfeaf2',
      300: '#c5d4df',
      400: '#9aaec0',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    landing: {
      background: '#f7f5f1',
      backgroundDeep: '#e6edf2',
      canvas: '#f4f5f4',
      surface: '#ffffff',
      border: '#e8e5df',
      gold: '#c68b32',
      foreground: '#142b3a',
      muted: '#667583',
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    display: 'Georgia, "Times New Roman", serif',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  radii: {
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '28px',
  },
  shadows: {
    soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
    card: '0 18px 44px rgba(13, 106, 180, 0.12)',
  },
  breakpoints: {
    sm: '30em',
    tablet: '37.5em',
    md: '48em',
    lg: '62em',
    xl: '80em',
    '2xl': '96em',
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'full',
        fontWeight: '600',
      },
      variants: {
        solid: {
          bg: 'primary.500',
          color: 'white',
          _hover: { bg: 'primary.600' },
        },
        outline: {
          border: '1px solid',
          borderColor: 'primary.200',
          color: 'primary.700',
          _hover: { bg: 'primary.50' },
        },
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'primary.400',
      },
    },
    Card: {
      baseStyle: {
        borderRadius: 'xl',
        boxShadow: 'soft',
      },
    },
  },
})

export default theme
