// Regla mobile-first de la SPEC (TRD §5): las media queries solo mejoran con min-width.
// Cualquier max-width (o rango "width <") en una media query hace fallar el lint.
export default {
  extends: ['stylelint-config-standard'],
  rules: {
    'media-feature-range-notation': 'prefix',
    'media-feature-name-disallowed-list': [
      ['max-width', 'max-device-width'],
      { message: 'Mobile-first: usá @media (min-width: …); max-width está prohibido' },
    ],
    // CSS Modules: clases en camelCase
    'selector-class-pattern': [
      '^[a-z][a-zA-Z0-9]*$',
      { message: 'Las clases de CSS Modules van en camelCase' },
    ],
    'custom-property-pattern': null,
    'value-keyword-case': ['lower', { camelCaseSvgKeywords: true, ignoreKeywords: ['currentColor'] }],
    'declaration-block-single-line-max-declarations': null,
  },
  overrides: [
    {
      // tokens.css es copia literal del bloque de UX-UI §2.4: se respeta su notación
      files: ['src/styles/tokens.css'],
      rules: {
        'color-function-notation': null,
        'color-function-alias-notation': null,
        'alpha-value-notation': null,
        'value-keyword-case': null,
        'color-hex-length': null,
      },
    },
  ],
}
