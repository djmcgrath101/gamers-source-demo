import ngrx from '@ngrx/eslint-plugin/v9';
import nx from '@nx/eslint-plugin';
const ngrxSignalsConfigs = ngrx.configs.signals ?? [];
const ngrxSignalsPlugins = ngrxSignalsConfigs
  .filter(config => config.plugins)
  .reduce((plugins, config) => ({ ...plugins, ...config.plugins }), {});
const ngrxSignalsRules = ngrxSignalsConfigs
  .filter(config => config.rules)
  .reduce((rules, config) => ({ ...rules, ...config.rules }), {});

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/vite.config.*.timestamp*', '**/vitest.config.*.timestamp*']
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'scope:tools',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:tools']
            },
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:core',
                'type:data-access',
                'type:feature',
                'type:testing',
                'type:types',
                'type:ui',
                'type:utils'
              ]
            },
            {
              sourceTag: 'type:core',
              onlyDependOnLibsWithTags: [
                'type:data-access',
                'type:testing',
                'type:types',
                'type:ui',
                'type:utils'
              ]
            },
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: [
                'type:data-access',
                'type:types',
                'type:testing',
                'type:utils'
              ]
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: [
                'type:data-access',
                'type:testing',
                'type:types',
                'type:ui',
                'type:utils'
              ]
            },
            {
              sourceTag: 'type:plugin',
              onlyDependOnLibsWithTags: ['type:plugin', 'type:types', 'type:utils']
            },
            {
              sourceTag: 'type:testing',
              onlyDependOnLibsWithTags: ['type:*', '!type:app']
            },
            {
              sourceTag: 'type:types',
              onlyDependOnLibsWithTags: ['type:types']
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:testing', 'type:types', 'type:ui', 'type:utils']
            },
            {
              sourceTag: 'type:utils',
              onlyDependOnLibsWithTags: ['type:types', 'type:utils']
            }
          ]
        }
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lodash',
              message:
                'Import from lodash-es instead so bundle builds can tree-shake lodash utilities.'
            },
            {
              name: 'zod',
              message:
                'Import schema builders from zod/mini and core errors/types from zod/v4/core to keep browser bundles small.'
            }
          ],
          patterns: [
            {
              group: ['lodash/*'],
              message:
                'Import from lodash-es instead so bundle builds can tree-shake lodash utilities.'
            }
          ]
        }
      ]
    }
  },
  {
    files: ['**/*.ts'],
    plugins: ngrxSignalsPlugins,
    rules: {
      ...ngrxSignalsRules
    }
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs'
    ],
    // Override or add rules here
    rules: {}
  },
  {
    files: ['**/*.json'],
    // Override or add rules here
    rules: {},
    languageOptions: {
      parser: await import('jsonc-eslint-parser')
    }
  }
];
