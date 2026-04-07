module.exports = {
	root: true,
	env: {
		node: true,
		es2021: true,
		jest: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.jest.json',
		tsconfigRootDir: __dirname,
	},
	plugins: ['@typescript-eslint'],
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	ignorePatterns: ['dist/', 'node_modules/'],
	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
	},
};
