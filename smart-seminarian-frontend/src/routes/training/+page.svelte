<script lang="ts">
    import loader from '@monaco-editor/loader';
    import { onDestroy, onMount } from 'svelte';
    import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
    import Navbar from "@/components/Navbar.svelte";

    let editor: Monaco.editor.IStandaloneCodeEditor;
    let monaco: typeof Monaco;
    let editorContainer: HTMLElement;
    let output = '';

    onMount(async () => {
        const monacoEditor = await import('monaco-editor');
        loader.config({ monaco: monacoEditor.default });

        monaco = await loader.init();

        editor = monaco.editor.create(editorContainer, {
            value: 'const firstName = "Smart";\n' +
                'const lastName = "Seminarian";\n' +
                '\n' +
                'const fullName = firstName + " " + lastName;\n' +
                'console.log("Hello, " + fullName); // Output: "Hello, Smart Seminarian"\n',
            language: 'javascript',
            theme: 'vs-dark'
        });
    });

    onDestroy(() => {
        monaco?.editor.getModels().forEach((model) => model.dispose());
        editor?.dispose();
    });

    function runCode() {
        const code = editor.getValue();
        output = ''; // Clear previous output

        // Override console.log to capture the output
        const originalConsoleLog = console.log;
        console.log = (...args) => {
            output += args.join(' ') + '\n';
            originalConsoleLog(...args); // Also log to the browser console
        };

        try {
            eval(code);
        } catch (e) {
            if (e instanceof Error) {
                output += `Error: ${e.message}`;
            } else {
                output += 'Unknown error occurred';
            }
        }

        console.log = originalConsoleLog; // Restore original console.log
    }
</script>

<Navbar />
<div class="container">
    <div class="main-content">
        <div class="editor-section">
            <div class="editor-header">
                <h2>Code Editor (currently JavaScript)</h2>
                <button class="run-button" on:click={runCode}>Run Code</button>
            </div>
            <div class="editor-container" bind:this={editorContainer}></div>
        </div>
        <div class="result-container">
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
        background-color: white;
        height: 100vh;
        display: flex;
        flex-direction: column;
    }

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        padding: 0;
        box-sizing: border-box;
    }

    .main-content {
        display: flex;
        flex: 1;
        width: 100%;
        max-width: 1200px;
        padding: 20px;
        box-sizing: border-box;
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
        padding: 10px;
        background-color: #ffffff;
    }

    .result-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 300px;
        padding: 10px;
        background-color: #ffffff;
        overflow-y: auto;
    }

    .run-button {
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        background-color: #3595F5;
        color: white;
        border: none;
        border-radius: 4px;
        transition: background-color 0.3s ease;
    }

    .run-button:hover {
        background-color: #93C0EC;
    }

    h2 {
        margin-top: 0;
        text-align: center;
        color: #87929D;
    }

    pre {
        flex: 1;
        padding: 10px;
        border-radius: 8px;
        white-space: pre-wrap;
        word-wrap: break-word;
        border: 1px solid #AEB5BD;
    }
</style>
