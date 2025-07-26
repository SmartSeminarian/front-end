# create-svelte
[![Build docker image](https://github.com/SmartSeminarian/front-end/actions/workflows/on-push-main.yml/badge.svg)](https://github.com/SmartSeminarian/front-end/actions/workflows/on-push-main.yml)

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Developing](#developing)
- [Developing (Docker)](#developing-docker)
- [Testing](#testing)
- [Building](#building)
- [Frontend Documentation](#frontend-documentation)
  - [Architecture Overview](#architecture-overview)
  - [Key Features](#key-features)
  - [Pages and Routes](#pages-and-routes)
  - [UI Components](#ui-components)
  - [Knowledge Graph](#knowledge-graph)
  - [Learning Paths](#learning-paths)
- [Folder Structure](#folder-structure)

## Prerequisites
You need to have installed the following: 

- npm 
- docker

## Installation

How to install the project: 
```bash
# clone the repository
git clone https://github.com/SmartSeminarian/front-end.git
```
```bash
# navigate to the project directory
cd front-end
```
```bash
# install dependencies
npm install
```

## Initialize Secrets in .env 
You need to create a .env file with the following secrets.
How to find the GitHub Token

1. Go to your GitHub account > Settings > Developer Settings > OAuth Apps > New OAuth App then create a new App
2. For the Homepage URL: http://localhost:5173/ (or do http://localhost:5000 if you test with docker)
3. For the Authorization Callback URL: http://localhost:5173/auth/callback/github (or do http://localhost:5000/auth/callback/github if you test with docker)
4. You will need to generate a random 32 characters long string like this AUTH_SECRET="a9c344fe92e712c3b8bc584a04376a8d" (for that you can just call https://generate-secret.vercel.app/32 and take the string that is generated there)

```
AUTH_GITHUB_ID=<Github Client ID>
AUTH_GITHUB_SECRET=<Github Client Secret>
AUTH_SECRET=<32 Char Long Random String>
SEMINARIAN_STAGE_API_URL=https://api-stage.csai.site/
SEMINARIAN_API_URL=<The API URL> (for me it is this: http://localhost:5050/) 
SEMINARIAN_API_TOKEN=<API Token from our api> (f.e.: test:VongOahophufshepwucsimyig5ogukir)
VITE_API_URL=http://localhost:5050 
```

environment variable must still be prefixed with VITE_ because SvelteKit requires this prefix for exposing environment variables to the frontend!

## Developing (locally)

Once you've installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Developing (Docker)

To run the application using Docker, follow these steps in order:

```bash
# 1. Initialize environment variables (you'll be prompted for GitHub OAuth credentials and API URLs)
./init-local-env.sh
```

```bash
# 2. Build the local Docker image
./build-local-image.sh
```

```bash
# 3. Start the containers
docker compose up
```

## Testing 
To run the tests simply run the following command: 

```
npm test 
```

## Building

To create a production version of your app:

```bash
npm run build
```


You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Frontend Documentation

### Architecture Overview

The Smart Seminarian frontend is built with SvelteKit, a framework for building web applications of all sizes. The application follows these architectural principles:

- **Component-Based**: UI is broken down into reusable Svelte components
- **Routing**: SvelteKit's file-based routing system for navigation
- **State Management**: Svelte stores for global state management
- **API Integration**: Fetch API for communication with the backend
- **Authentication**: GitHub OAuth integration for user authentication
- **Responsive Design**: Tailwind CSS for responsive and mobile-friendly UI

### Key Features

- **GitHub Authentication**: Secure login using GitHub OAuth
- **Concept Management**: Create, view, and manage learning concepts
- **Knowledge Graph**: Interactive visualization of concepts and their relationships
- **Learning Paths**: Generate and visualize personalized learning paths
- **Chat Interface**: Interactive chat with AI tutor for learning assistance
- **Training Exercises**: Practice problems and coding exercises
- **User Dashboard**: Overview of learning progress and activities

### Pages and Routes

- **/** - Home page with application overview
- **/dashboard** - User dashboard with learning progress and recent activities
- **/concepts** - Browse and manage learning concepts
- **/concepts/[id]** - View and interact with a specific concept
- **/chat** - Chat interface for interacting with the AI tutor
- **/training** - Access coding exercises and practice problems
- **/learning** - Generate and manage learning paths
- **/graph** - Interactive knowledge graph visualization
- **/settings** - User settings and preferences

### UI Components

The application uses a custom UI component library built with Tailwind CSS. Key components include:

- **Navbar**: Navigation bar with responsive mobile menu
- **Card**: Container for content with consistent styling
- **Button**: Various button styles for different actions
- **Input**: Form input elements with validation
- **Badge**: Display status or category information
- **Progress**: Visual representation of completion or mastery
- **Sheet**: Slide-out panel for mobile navigation
- **Dropdown**: Menu for additional options

### Knowledge Graph

The knowledge graph visualization is built using Sigma.js and Graphology libraries. It provides:

- **Interactive Network View**: Visualize concepts and their relationships
- **Concept Nodes**: Nodes representing learning concepts, colored by difficulty and mastery level
- **Relationship Edges**: Connections between concepts showing prerequisites, alternatives, etc.
- **Filtering**: Filter the graph by concept type, difficulty, or mastery level
- **Zoom and Pan**: Navigate the graph with zoom and pan controls
- **Node Selection**: Click on nodes to view detailed information
- **Layout Options**: Different layout algorithms for optimal visualization

### Learning Paths

The learning path feature helps users create personalized learning journeys:

- **Path Generation**: AI-powered generation of learning paths based on user goals
- **Path Visualization**: Visual representation of the learning path as a directed graph
- **Progress Tracking**: Track mastery level for each concept in the path
- **Concept Relationships**: View relationships between concepts in the path
- **Interactive UI**: Mark progress, explore concepts, and navigate through the path
- **Integration with Knowledge Graph**: View the path in the context of the full knowledge graph

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
