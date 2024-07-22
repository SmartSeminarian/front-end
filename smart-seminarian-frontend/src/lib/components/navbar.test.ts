import { render, screen } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import '@testing-library/jest-dom';

import NavBar from './Navbar.svelte';

vi.mock('$app/stores', async () => {
	const { readable } = await import('svelte/store');
	/**
	 * @type {import('$app/stores').getStores}
	 */
	const getStores = () => ({
		page: readable({ 
            url: new URL('http://localhost'),
            params: {},
            data: {
                session: {
                    user: {
                        image: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fletsenhance.io%2F&psig=AOvVaw2MZwFKOyPvc3Tx5nsR__eY&ust=1721757333558000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCIja04Ocu4cDFQAAAAAdAAAAABAE', // Random image
                        name: 'Test User'
                    }
                }
            }
        }),
	});
	/** @type {typeof import('$app/stores').page} */
	const page = {
		subscribe(fn) {
			return getStores().page.subscribe(fn);
		}
	};
	return {
		getStores,
		page,
	};
});

test('displays navigation bar links', () => {

    render(NavBar);

    expect(screen.getByRole('link', { name: /smart seminarian/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /courses/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /training/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /feedback/i })).toBeInTheDocument();
    
});
