<script lang="ts">
    import loader from '@monaco-editor/loader';
    import { onDestroy, onMount } from 'svelte';
    import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
    import Navbar from "@/components/Navbar.svelte";
    import { getCookie } from '$lib/cookies';
    import {PUBLIC_VITE_API_URL} from "$env/static/public";
    import * as Resizable from "$lib/components/ui/resizable/index.js";
    import { writable } from 'svelte/store';


    let editor: Monaco.editor.IStandaloneCodeEditor;
    let monaco: typeof Monaco;
    let editorContainer: HTMLElement;
    let output = '';
    let apiDescription = ''; // API description
    let apiExampleInput = ''; // API example input
    let apiExampleOutput = ''; // API example output
    let problemID = '';

    let evaluation = ''
    let evaluationMessage = ''


    async function submitMockSolution() {
        const sessionId = getCookie('sessionID');
        if (!sessionId) {
            apiDescription = 'Session ID not found';
            return;
        }

        try {
            const response = await fetch(`${PUBLIC_VITE_API_URL}/solution`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId
                },
                body: JSON.stringify({
                    problemId: problemID,
                    solutionCode: "mock mock mock"
                })
            });
            console.log("Response:", response);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);
            evaluation = data.evaluation.evaluation || 'No description available';
            evaluationMessage = data.message || 'No example input available';
        } catch (error) {
            apiDescription = 'Error fetching text';
        }
    }

    async function fetchText() {
        const sessionId = getCookie('sessionID');
        if (!sessionId) {
            apiDescription = 'Session ID not found';
            return;
        }

        try {
            const response = await fetch(`${PUBLIC_VITE_API_URL}/problem`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId
                }
            });
            console.log("Response:", response);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);
            problemID = data.problem.id
            apiDescription = data.problem.description || 'No description available';
            apiExampleInput = data.problem.exampleInput || 'No example input available';
            apiExampleOutput = data.problem.exampleOutput || 'No example output available';
        } catch (error) {
            apiDescription = 'Error fetching text';
        }
    }

    onMount(async () => {
        const monacoEditor = await import('monaco-editor');
        loader.config({ monaco: monacoEditor.default });
        monaco = await loader.init();

        editor = monaco.editor.create(editorContainer, {
            value: `const firstName = "Smart";
const lastName = "Seminarian";

const fullName = firstName + " " + lastName;
console.log("Hello, " + fullName); // Output: "Hello, Smart Seminarian"`,
            language: 'javascript',
            theme: 'vs-dark'
        });

        await fetchText();
    });

    onDestroy(() => {
        monaco?.editor.getModels().forEach(model => model.dispose());
        editor?.dispose();
    });

    function runCode() {
        const code = editor.getValue();
        output = '';

        const originalConsoleLog = console.log;
        console.log = (...args) => {
            output += args.join(' ') + '\n';
            originalConsoleLog(...args);
        };

        try {
            eval(code);
        } catch (e) {
            output += `Error: ${e instanceof Error ? e.message : 'Unknown error occurred'}`;
        }
        console.log = originalConsoleLog; // Restore original console.log
    }

    // structure of a problem
    interface Problem {
        id: number;
        title: string;
        description: string;
        exampleInput: string;
        exampleOutput: string;
    }

    let selectedProblem = writable<Problem | null>(null);    // Sample problems
    const problems = [
        { id: 1, title: "Item 1", description: "This is the content for Item 1", exampleInput: "123", exampleOutput: "123" },
        { id: 2, title: "Item 2", description: "This is the content for Item 2", exampleInput: "123", exampleOutput: "123" },
        { id: 3, title: "Item 3", description: "This is the content for Item 3", exampleInput: "123", exampleOutput: "123" },
    ];

    // Function to handle item click
    function selectItem(problem: Problem) {
        selectedProblem.set(problem);
    }
</script>
<Navbar />


<Resizable.PaneGroup direction="horizontal" class="pane-group">
    <!-- Sidebar (25% width) -->
    <Resizable.Pane defaultSize={25}>
        <div class="flex flex-col h-full p-4 bg-gray-100 border-r border-gray-200">
            <span class="font-semibold text-lg mb-4">Items List</span>

            {#each problems as problem (problem.id)}
                <button
                        on:click={() => selectItem(problem)}
                        class="p-2 mb-2 text-left bg-white border rounded-md hover:bg-gray-50"
                >
                    {problem.title}
                </button>
            {/each}
        </div>
    </Resizable.Pane>

    <!-- Resizable Handle -->
    <Resizable.Handle withHandle class="border-gray-300" />

    <!-- Main Content (75% width) -->
    <Resizable.Pane defaultSize={75}>
        <div class="flex h-full items-center justify-center p-6 bg-white">
            <!-- Dynamically show content based on the selected item -->
            <div class="text-center">
                {#if $selectedProblem}
                    <h2 class="text-2xl font-bold mb-4">{$selectedProblem.title}</h2>
                    <p>{$selectedProblem.description}</p>
                    <p>{$selectedProblem.exampleInput}</p>
                    <p>{$selectedProblem.exampleOutput}</p>
                {:else}
                    <span class="text-gray-500">Select an item to view the content</span>
                {/if}
            </div>
        </div>
    </Resizable.Pane>
</Resizable.PaneGroup>

<div class="container">
    <div class="api-section">
        <h2>Problem Description</h2>
        <p>{apiDescription}</p>
        <h3>Example Input</h3>
        <pre>{apiExampleInput}</pre>
        <h3>Example Output</h3>
        <pre>{apiExampleOutput}</pre>
        <p>Evaluation:</p>
        <pre>{evaluationMessage}</pre>
        <pre>{evaluation}</pre>
        <button class="fetch-button" on:click={fetchText}>Fetch New Text</button>
        <button class="fetch-button" on:click={submitMockSolution}>MockButton</button>
    </div>

    <div class="main-content">
        <div class="editor-section">
            <div class="editor-header">
                <h2>Code Editor</h2>
                <button class="run-button" on:click={runCode}>Run Code</button>
            </div>
            <div class="editor-container" bind:this={editorContainer}></div>
        </div>
        <div class="result-section">
            <h2>Output</h2>
            <pre>{output}</pre>
        </div>
    </div>
</div>
<style>
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
        display: flex;
        flex-direction: column;
        height: 100vh;
    }

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        box-sizing: border-box;
        flex: 1;
    }

    .api-section {
        width: 100%;
        max-width: 800px;
        padding: 20px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
    }

    .api-section h2 {
        margin-top: 0;
        color: #333;
    }

    .api-section h3 {
        margin-bottom: 0;
        color: #555;
    }

    .api-section p, .api-section pre {
        margin: 10px 0;
        color: #666;
    }

    .fetch-button {
        display: block;
        width: 100%;
        max-width: 200px;
        padding: 10px;
        font-size: 16px;
        cursor: pointer;
        background-color: #007BFF;
        color: #fff;
        border: none;
        border-radius: 4px;
        transition: background-color 0.2s;
        margin-top: 10px;
        text-align: center;
    }

    .fetch-button:hover {
        background-color: #0056b3;
    }

    .main-content {
        display: flex;
        width: 100%;
        max-width: 1200px;
        gap: 20px;
    }

    .editor-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .editor-container {
        flex: 1;
        min-height: 300px;
        background-color: #fff;
    }

    .result-section {
        flex: 1;
        min-height: 300px;
        padding: 10px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .run-button {
        padding: 10px;
        font-size: 16px;
        cursor: pointer;
        background-color: #28a745;
        color: #fff;
        border: none;
        border-radius: 4px;
        transition: background-color 0.2s;
    }

    .run-button:hover {
        background-color: #218838;
    }

    pre {
        padding: 10px;
        border-radius: 4px;
        background-color: #f8f9fa;
        border: 1px solid #ddd;
        overflow-x: auto;
    }
    /* Custom styling to ensure full width and responsive design */
    .pane-group {
        min-height: 100vh;
        width: 100vw;
    }
</style>
