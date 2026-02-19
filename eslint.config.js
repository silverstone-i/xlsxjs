const js = require("@eslint/js");
const nodePlugin = require("eslint-plugin-n");
const prettierConfig = require("eslint-config-prettier");
const globals = require("globals");

module.exports = [
  {
    ignores: [
      ".grunt/**",
      "build/**",
      "dist/**",
      "out/**",
      "spec/manual/public/**",
    ],
  },
  js.configs.recommended,
  nodePlugin.configs["flat/recommended"],
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.mocha,
      },
    },
    settings: {
      node: {
        version: ">=12.0.0",
      },
    },
    rules: {
      "arrow-parens": ["error", "as-needed"],
      "class-methods-use-this": ["off"],
      "comma-dangle": [
        "error",
        {
          arrays: "always-multiline",
          objects: "always-multiline",
          imports: "always-multiline",
          exports: "always-multiline",
          functions: "never",
        },
      ],
      "default-case": ["off"],
      "func-names": ["off", "never"],
      "global-require": ["off"],
      "max-len": [
        "error",
        { code: 120, ignoreComments: true, ignoreStrings: true },
      ],
      "no-console": ["error", { allow: ["warn"] }],
      "no-continue": ["off"],
      "no-mixed-operators": ["off"],
      "no-multi-assign": ["off"],
      "no-param-reassign": ["off"],
      "no-path-concat": ["off"],
      "no-plusplus": ["off"],
      "no-prototype-builtins": ["off"],
      "no-redeclare": ["error", { builtinGlobals: false }],
      "no-restricted-syntax": [
        "error",
        "ForInStatement",
        "LabeledStatement",
        "WithStatement",
      ],
      "no-return-assign": ["off"],
      "no-trailing-spaces": ["error", { skipBlankLines: true }],
      "no-underscore-dangle": [
        "off",
        { allowAfterThis: true, allowAfterSuper: true },
      ],
      "no-unused-vars": [
        "error",
        { vars: "all", args: "none", ignoreRestSiblings: true },
      ],
      "no-use-before-define": [
        "error",
        { variables: false, classes: false, functions: false },
      ],
      "n/no-unsupported-features/es-syntax": [
        "error",
        { version: ">=10.0.0", ignores: [] },
      ],
      "n/process-exit-as-throw": ["off"],
      "object-curly-spacing": ["error", "never"],
      "object-property-newline": [
        "off",
        { allowMultiplePropertiesPerLine: true },
      ],
      "prefer-destructuring": ["warn", { array: false, object: true }],
      "prefer-object-spread": ["off"],
      "prefer-rest-params": ["off"],
      quotes: ["error", "single"],
      semi: ["error", "always"],
      "space-before-function-paren": [
        "error",
        { anonymous: "never", named: "never", asyncArrow: "always" },
      ],
      strict: ["off"],
    },
  },
  {
    files: ["spec/**/*.js"],
    languageOptions: {
      globals: {
        verquire: "readonly",
        describe: "readonly",
        expect: "readonly",
        before: "readonly",
        after: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        it: "readonly",
      },
    },
    rules: {
      "no-new": ["off"],
      "max-len": ["off"],
      "brace-style": ["off"],
      "array-bracket-spacing": ["off"],
      "no-sparse-arrays": ["off"],
      "object-property-newline": ["off"],
      "prefer-object-spread": ["off"],
      "no-underscore-dangle": ["off"],
    },
  },
  {
    files: ["eslint.config.js", "scripts/**/*.js"],
    rules: {
      "n/no-extraneous-require": ["off"],
      "n/no-unsupported-features/es-syntax": ["off"],
      "n/no-unsupported-features/node-builtins": ["off"],
      "no-process-exit": ["off"],
    },
  },
  {
    files: ["test/**/*.js"],
    rules: {
      "no-new": ["off"],
      "max-len": ["off"],
      "no-console": ["off"],
      "no-underscore-dangle": ["off"],
      "spaced-comment": ["off"],
    },
  },
];
