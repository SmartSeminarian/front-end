import { render, screen } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import '@testing-library/jest-dom';

import NavBar from './Navbar.svelte';

let mockUrl = 'http://localhost/' // Initial mock url

vi.mock('$app/stores', async () => {
	const { readable } = await import('svelte/store');
	/**
	 * @type {import('$app/stores').getStores}
	 */
	const getStores = () => ({
		page: readable({ 
            url: new URL(mockUrl),
            params: {},
            data: {
                session: {
                    user: {
                        image: {}, // Random image
                        name: {},
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
		__setMockUrl: (url) => {  // Used for checking which link is active for every different url
			mockUrl = url;
	}};
});

test('displays all navigation bar links', () => {

    render(NavBar);

	expect(screen.getByRole('link', { name: /acme inc/i })).toBeInTheDocument(); // Accessing home link by span class
    expect(screen.getByRole('link', { name: /smart seminarian/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /courses/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /training/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /feedback/i })).toBeInTheDocument();

});

test("home link is active and the rest are not, when url is '/'", () => {
	
	render(NavBar);

	// Can't test if home link is active because it doesn't use isActive function
	// Check that other links are not active
	const smartSeminarianLink = screen.getByRole('link', { name: /smart seminarian/i });
	const coursesLink = screen.getByRole('link', { name: /courses/i });
	const trainingLink = screen.getByRole('link', { name: /training/i });
	const feedbackLink = screen.getByRole('link', { name: /feedback/i });

	expect(smartSeminarianLink).not.toHaveClass('nav-link active');
	expect(coursesLink).not.toHaveClass('nav-link active');
	expect(trainingLink).not.toHaveClass('nav-link active');
	expect(feedbackLink).not.toHaveClass('nav-link actYive');

});

test("smartSeminarianLink is active and the rest are not, when url is '/dashboard'", async () => {
	
	const { __setMockUrl } = await vi.importMock('$app/stores');

	__setMockUrl('http://localhost/dashboard');

	render(NavBar);
	
	const smartSeminarianLink = screen.getByRole('link', { name: /smart seminarian/i });
	const coursesLink = screen.getByRole('link', { name: /courses/i });
	const trainingLink = screen.getByRole('link', { name: /training/i });
	const feedbackLink = screen.getByRole('link', { name: /feedback/i });

	expect(smartSeminarianLink).toHaveClass('nav-link active');
	expect(coursesLink).not.toHaveClass('nav-link active');
	expect(trainingLink).not.toHaveClass('nav-link active');
	expect(feedbackLink).not.toHaveClass('nav-link active');

});

test("coursesLink is active and the rest are not, when url is '/concepts'", async () => {
	
	const { __setMockUrl } = await vi.importMock('$app/stores')

	__setMockUrl('http://localhost/courses')

	render(NavBar);
	
	const smartSeminarianLink = screen.getByRole('link', { name: /smart seminarian/i });
	const coursesLink = screen.getByRole('link', { name: /courses/i });
	const trainingLink = screen.getByRole('link', { name: /training/i });
	const feedbackLink = screen.getByRole('link', { name: /feedback/i });

	expect(smartSeminarianLink).not.toHaveClass('nav-link active');
	expect(coursesLink).toHaveClass('nav-link active');
	expect(trainingLink).not.toHaveClass('nav-link active');
	expect(feedbackLink).not.toHaveClass('nav-link active');

});

test("trainingLink is active and the rest are not, when url is '/training'", async () => {
	
	const { __setMockUrl } = await vi.importMock('$app/stores')

	__setMockUrl('http://localhost/training')

	render(NavBar);
	
	const smartSeminarianLink = screen.getByRole('link', { name: /smart seminarian/i });
	const coursesLink = screen.getByRole('link', { name: /courses/i });
	const trainingLink = screen.getByRole('link', { name: /training/i });
	const feedbackLink = screen.getByRole('link', { name: /feedback/i });

	expect(smartSeminarianLink).not.toHaveClass('nav-link active');
	expect(coursesLink).not.toHaveClass('nav-link active');
	expect(trainingLink).toHaveClass('nav-link active');
	expect(feedbackLink).not.toHaveClass('nav-link active');

});

test("chat is active and the rest are not, when url is '/chat'", async () => {
	
	const { __setMockUrl } = await vi.importMock('$app/stores')

	__setMockUrl('http://localhost/feedback')

	render(NavBar);
	
	const smartSeminarianLink = screen.getByRole('link', { name: /smart seminarian/i });
	const coursesLink = screen.getByRole('link', { name: /courses/i });
	const trainingLink = screen.getByRole('link', { name: /training/i });
	const feedbackLink = screen.getByRole('link', { name: /feedback/i });

	expect(smartSeminarianLink).not.toHaveClass('nav-link active');
	expect(coursesLink).not.toHaveClass('nav-link active');
	expect(trainingLink).not.toHaveClass('nav-link active');
	expect(feedbackLink).toHaveClass('nav-link active');

});

