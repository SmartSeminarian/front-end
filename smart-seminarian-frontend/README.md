# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Table of Contents

- [Installation](#installation)
- [Developing](#developing)
- [Building](#building)
- [Folder Structure](#folder-structure)


## Installation

Explain how to install the project:
```bash
# clone the repository
git clone https://github.com/SmartSeminarian/front-end.git
```
```bash
# navigate to the project directory
cd smart-seminarian-frontend
```
```bash
# install dependencies
npm install
```


## Developing

Once you've installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```


You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Folder Structure

- **.svelte-kit/**: Contains SvelteKit specific build artifacts. This directory is generated during the build process and should not be modified manually.

- **node_modules/**: Contains all the project's dependencies installed via npm or yarn.

- **src/**: The main source directory for the application.
    - **lib/**: Contains reusable modules and utilities.
        - **assets/**: Static assets like images or fonts.
        - **components/**: Reusable Svelte components.
        - **index.ts**: Entry point for exporting modules from the `lib` directory.
        - **utils.ts**: Utility functions used throughout the application.
    - **routes/**: Contains the application’s route components and pages.
        - **dashboard/**: Contains the components and pages related to the dashboard route.
        - **login/**: Contains the components and pages related to the login route.
        - **signup/**: Contains the components and pages related to the signup route.
        - **+layout.svelte**: Svelte component that defines the layout for the routes.
        - **+page.svelte**: Main page component for the root route.
    - **app.css**: Global styles for the application.
    - **app.d.ts**: TypeScript declaration file for global types.
    - **app.html**: Main HTML file for the application.

- **static/**: Contains static files that are served directly without processing (f.e. favicon)
- **.npmrc**: Configuration file for npm, used to set custom npm settings.
