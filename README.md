# Smart Seminarian Frontend

[![Build docker image](https://github.com/SmartSeminarian/front-end/actions/workflows/on-push-main.yml/badge.svg)](https://github.com/SmartSeminarian/front-end/actions/workflows/on-push-main.yml)

This repository describes the frontend of the smart seminarian. The Wireframe and UI/UX Design of the frontend can be found here on [Figma](https://www.figma.com/design/3uktwiRfEoWQIdEwH75HTO/TEG-Workshop?node-id=0-1&t=JH0tdJCOj7aV535k-1). 

## Figma Design
The Design Files on Figma are structured as followed: 
1. **UI Design**: Files of the UI Design, Wireframes, Transitions
2. **Moodboard**: Inspiration for UI Design, Color palettes and Typography

## Framework Choice for Frontend: [Svelte](https://svelte.dev/)

1. **Performance**:
    - **Fast and Efficient**: Svelte compiles code into highly optimized JavaScript, which makes pages load faster and improves performance.
    - **No Virtual DOM**: Unlike other frameworks, Svelte skips the virtual DOM, reducing overhead and speeding things up. It is very lightweight

2. **Developer Experience**:
    - **Reactive Programming**: Svelte's reactivity model makes managing state easier and the code more understandable.
    - **Single File Components**: You can write HTML, CSS, and JavaScript in a single file, making components more self-contained and manageable.
    - **TypeScript Support**: Great TypeScript support helps catch errors early and offers better tooling.

3. **Ease of Use**:
    - **Less Boilerplate**: SvelteKit cuts down on boilerplate code, so we can focus more on writing logic instead of configuring stuff.
    - **Simplified Routing**: The file-based routing system is intuitive and easy to set up.

4. **SEO and Accessibility**:
    - **Server-Side Rendering (SSR)**: SvelteKit comes with SSR support out of the box, which helps with SEO and initial load times.
    - **Progressive Enhancement**: Ensures the application works for everyone, regardless of their browser's capabilities.

5. **Flexibility**:
    - **Static Site Generation**: SvelteKit can generate static sites, making the app more scalable and reducing server load.
    - **Hybrid Apps**: You can create hybrid apps that use both SSR and client-side rendering.

6. **Community and Ecosystem**:
    - **Growing Community**: There's a rapidly growing community with lots of resources, tutorials, and plugins.
    - **Rich Ecosystem**: Integrates well with tools and services like Vite, and has adapter support for different deployment platforms.

7. **Modern Tooling**:
    - **Vite Integration**: SvelteKit uses Vite, which provides a modern development experience with hot module replacement and fast builds.
    - **Built-In State Management**: Svelte's built-in stores simplify state management.

## Tools for UI Automation Testing (TBD)

1. **[Cypress](https://www.cypress.io/)**:
   - **Overview**: Cypress is a JavaScript-based end-to-end testing framework tailored for modern web applications, including those built with Svelte.
   - **Features**:
      - Real-time reloading and automatic waiting for elements.
      - Time travel debugging with snapshots of tests as they run.
      - Easy setup and integration with Svelte projects.
   - **Why Choose Cypress**: Cypress provides a developer-friendly experience with powerful debugging capabilities.

2. **[Playwright](https://playwright.dev/)**:
   - **Overview**: Playwright is a Node.js library developed by Microsoft for automating browsers (Chromium, Firefox, and WebKit) with a single API.
   - **Features**:
      - Cross-browser testing capabilities.
      - Auto-waiting for elements, network activity, and UI assertions.
      - Multiple browser contexts for parallel testing.
   - **Why Choose Playwright**: Playwright's robust cross-browser testing and advanced automation features make it suitable for comprehensive testing of Svelte applications.

3. **[Svelte Testing Library](https://www.npmjs.com/package/@testing-library/svelte)**:
   - **Overview**: Svelte Testing Library is a lightweight solution built on top of DOM Testing Library, designed specifically for testing Svelte components.
   - **Features**:
      - Provides utilities to test Svelte components in a user-centric manner.
      - Encourages good testing practices by focusing on the user interactions and DOM state.
      - Seamless integration with Jest or other testing frameworks.
   - **Why Choose Svelte Testing Library**: It offers a simple and effective way to test Svelte components by focusing on user interactions.
