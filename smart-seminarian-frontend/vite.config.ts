/// <reference types="vitest" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { svelteTesting } from '@testing-library/svelte/vite'
import path from 'path';

export default defineConfig({
	plugins: [sveltekit(), svelteTesting()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src')
		}
	},
	test: {
        globals: true,
        environment: 'jsdom',
    },
});