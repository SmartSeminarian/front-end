<script lang="ts">
    import loader from '@monaco-editor/loader';
    import { onDestroy, onMount } from 'svelte';
    import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
    import Navbar from "@/components/Navbar.svelte";
    import { getCookie } from '$lib/cookies'; // Ensure this path is correct

    let editor: Monaco.editor.IStandaloneCodeEditor;
    let monaco: typeof Monaco;
    let editorContainer: HTMLElement;
    let output = '';
    let apiDescription = ''; // API description
    let apiExampleInput = ''; // API example input
    let apiExampleOutput = ''; // API example output

    // Fetch text from the API
    async function fetchText() {
        const sessionId = getCookie('sessionID');
        if (!sessionId) {
            apiDescription = 'Session ID not found';
            return;
        }

        try {
            const response = await fetch('https://api-stage.csai.site/problem', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            apiDescription = data.description || 'No description available';
            apiExampleInput = data.exampleInput || 'No example input available';
            apiExampleOutput = data.exampleOutput || 'No example output available';
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
</script>
<Navbar />

<div class="container">
    <div class="api-section">
        <h2>Problem Description</h2>
        <p>{apiDescription}</p>
        <h3>Example Input</h3>
        <pre>{apiExampleInput}</pre>
        <h3>Example Output</h3>
        <pre>{apiExampleOutput}</pre>
        <button class="fetch-button" on:click={fetchText}>Fetch New Text</button>
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
</style>
