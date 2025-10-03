const nextEslintConfig = require('next/eslint-config-next');

module.exports = [
  ...nextEslintConfig,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { 
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
          'caughtErrorsIgnorePattern': '^_'
        }
      ],
      'react/no-unescaped-entities': [
        'error',
        {
          'forbid': ['>', '"', '}'] // Only forbid these, allow apostrophes
        }
      ]
    },
  },
];