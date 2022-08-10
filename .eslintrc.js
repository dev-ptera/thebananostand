module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    extends: [
        '@brightlayer-ui/eslint-config/ts',
        "plugin:cypress/recommended"
    ],
    parserOptions: {
        project: './tsconfig.json',
    },
    env: {
        browser: true,
    },
};
