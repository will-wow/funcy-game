module.exports = {
  root: true,
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:jest-dom/recommended",
    "plugin:react-hooks/recommended",
    "next",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  rules: {
    "import/prefer-default-export": "off",
    "no-plusplus": "off",
    "jsx-a11y/label-has-associated-control": ["error", { assert: "either" }],
    "jsx-a11y/media-has-caption": "off",
    "no-console": ["error", { allow: ["error", "trace"] }],
    "class-methods-use-this": "off",
    "arrow-body-style": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: false,
        argsIgnorePattern: "^rest|^_",
      },
    ],
    "lines-between-class-members": [
      "error",
      "always",
      { exceptAfterSingleLine: true },
    ],
    "@typescript-eslint/no-empty-function": "off",
    "react/jsx-props-no-spreading": "off",
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "**/*.test.{ts,tsx}",
          "**/test/**/*.{ts,tsx}",
          "**/*.stories.{ts,tsx}",
          "**/setupTests.ts",
        ],
      },
    ],
    // Allow apostrophes.
    "react/no-unescaped-entities": ["error", { forbid: [">", "}"] }],
    "no-else-return": "off",

    // Empty interfaces with extends are useful for yup models.
    "@typescript-eslint/no-empty-interface": [
      "error",
      {
        allowSingleExtends: true,
      },
    ],
    // Allow noopener without noreferrer
    "react/jsx-no-target-blank": [
      "error",
      {
        allowReferrer: true,
      },
    ],

    // TODO: Remove these
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",

    // Rely on typescript for these:
    "no-unused-vars": "off",
    "import/no-unresolved": "off",
    "import/extensions": "off",
    "react/prop-types": "off",
    "react/jsx-filename-extension": [1, { extensions: [".ts", ".tsx"] }],
    "react/require-default-props": 0,
    "no-useless-constructor": "off",
    "no-empty-function": "off",
    "no-undef": "off",
    "no-redeclare": "off",
    "no-shadow": "off",

    // uses app instead of pages
    "no-html-link-for-pages": "off",
  },
};
