module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/tests'],
	testMatch: ['**/*.test.ts'],
	clearMocks: true,
	transform: {
		'^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
	},
	moduleFileExtensions: ['ts', 'js', 'json'],
};
