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
          margin: 0,
          height: '100%',
          textRendering: 'optimizeLegibility'
        },
        'button:focus': {
          outlineColor: 'transparent',
          outlineOffset: '2px',
          outlineStyle: 'solid',
          outlineWidth: '2px'
        },
        'input::-webkit-search-cancel-button': {
          display: 'none'
        },
        figure: {
          margin: 0
        }
      });
      addComponents({
        '.button-link': {
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontWeight: '600',
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
