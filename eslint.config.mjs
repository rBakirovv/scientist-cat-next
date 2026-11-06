import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import pluginQuery from '@tanstack/eslint-plugin-query';
import fsd from 'eslint-plugin-fsd-lint';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...pluginQuery.configs['flat/recommended'],
  // Слои FSD описывают src. realtime/ — отдельный Node-процесс, а не слой,
  // и правила вроде «только абсолютные импорты» к нему неприменимы.
  { ...fsd.configs.recommended, files: ['src/**/*.{ts,tsx}'] },
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
