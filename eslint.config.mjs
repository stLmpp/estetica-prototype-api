// @ts-check
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const seenExceptionCodes = new Map();

/** @type {import('eslint').Rule.RuleModule} */
const noDuplicateExceptionCode = {
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type !== 'Identifier' ||
          node.callee.name !== 'exception'
        ) {
          return;
        }
        const [arg] = node.arguments;
        if (arg?.type !== 'ObjectExpression') {
          return;
        }
        const codeProp = arg.properties.find(
          (property) =>
            property.type === 'Property' &&
            property.key.type === 'Identifier' &&
            property.key.name === 'code',
        );
        if (codeProp?.value?.type !== 'Literal') {
          return;
        }
        const code = codeProp.value.value;
        const location = `${context.filename}:${codeProp.loc.start.line}`;
        const previousLocation = seenExceptionCodes.get(code);
        if (previousLocation && previousLocation !== location) {
          context.report({
            node: codeProp,
            message: `Exception code "${code}" is already defined in ${previousLocation}`,
          });
        }
        seenExceptionCodes.set(code, location);
      },
    };
  },
};

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
        },
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
    plugins: {
      local: {
        rules: {
          'no-duplicate-exception-code': noDuplicateExceptionCode,
        },
      },
    },
    rules: {
      'local/no-duplicate-exception-code': 'error',
    },
  },
);
