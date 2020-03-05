module.exports = {
    extends: ['airbnb-typescript/base'],
    parserOptions: {
      project: './tsconfig.json',
    },
    rules: {
        'no-underscore-dangle': 'off',
        'import/prefer-default-export': 'off',
        'import/no-default-export': 'error',
        'class-methods-use-this': 'off',
        'no-console': 'error'
    },
    overrides: [{
        files: ['*.test.ts'],
        extends: ["plugin:jest/recommended"],
        parserOptions: {
            createDefaultProgram: true,
        }
    }]
};
