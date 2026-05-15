/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  plugins: [
    function ({ addBase, addComponents, addUtilities }) {
      addBase({
        '::-ms-reveal': {
          display: 'none'
        },
        html: {
          height: '100%',
          margin: 0,
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale'
        },
        body: {
          height: '100%'
        },
        a: {
          cursor: 'pointer',
          textDecoration: 'none'
        },
        'a:hover': {
          textDecoration: 'underline'
        },
        'button:focus': {
          outlineColor: 'transparent',
          outlineOffset: '2px',
          outlineStyle: 'solid',
          outlineWidth: '2px'
        },
        'input::-webkit-search-cancel-button': {
          display: 'none'
        }
      });
      addComponents({
        'button-link': {
          cursor: 'pointer'
        },
        '.button-link:hover': {
          textDecoration: 'underline'
        }
      });
      addUtilities({
        '.absolute-center': {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        },
        '.fill-space': {
          height: '100%',
          width: '100%'
        },
        '.flex-center': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        },
        '.flex-inline-center': {
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center'
        },
        '.icon-shadow': {
          filter: 'drop-shadow(1px 1px 1px rgb(0 0 0))'
        },
        '.text-shadow': {
          textShadow: '1px 1px 1px rgb(0 0 0)'
        }
      });
    }
  ]
};
