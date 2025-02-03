module.exports = {
	extends: [
		'airbnb',
		'airbnb-typescript',
		'next/core-web-vitals',
		'plugin:storybook/recommended',
	],
	plugins: ['@typescript-eslint', 'import'],
	parserOptions: {
		project: './tsconfig.json'
	},
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
		},
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true,
				project: './tsconfig.json'
			},
		},
	},
	rules: {
		'no-tabs': 'off',
		indent: 'off',
		'sort-keys': 'off',
		'prettier/prettier': ['off', {
			useTabs: false
		}],
		'@typescript-eslint/indent': ['error', 'tab'],
		'react/jsx-indent': ['error', 'tab'],
		'react/jsx-indent-props': ['error', 'tab'],
		'react/react-in-jsx-scope': 'off',
		'no-underscore-dangle': 'off',
		'no-plusplus': ['error', {
			'allowForLoopAfterthoughts': true
		}],
		'jsx-a11y/label-has-associated-control': 'off',
		'jsx-a11y/anchor-is-valid': ['error', {
			'components': ['Link'],
			'specialLink': ['hrefLeft', 'hrefRight'],
			'aspects': ['invalidHref', 'preferButton']
		}],
		'@next/next/no-img-element': 'off',
		'import/no-anonymous-default-export': 'off',
		'react/require-default-props': 'off',
		'tailwindcss/no-custom-classname': 'off',
	}
};
