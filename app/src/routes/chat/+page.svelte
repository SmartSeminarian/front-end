<script lang="ts">
    import Navbar from "$lib/components/Navbar.svelte";
    import { writable } from "svelte/store";
    import { getCookie } from "@/cookies";

    // Typedefinition
    interface Message {
        sender: string;
        content: string;
    }

    let messages = writable<Message[]>([]);
    let inputMessage = '';
    let loading = writable(false);
    let apiDescription = writable('');

    const API_URL = 'https://api-stage.csai.site/chat';

    // Function to send a message to the assistant
    async function sendMessage() {
        if (!inputMessage.trim()) return;

        const sessionId = getCookie('sessionID');
        if (!sessionId) {
            apiDescription.set('Session ID not found');
            return;
        }

        messages.update((msgs) => [...msgs, { sender: 'user', content: inputMessage }]);

        const payload = {
            message: inputMessage,
            context: {
                type: 'problem',
                id: sessionId,
            },
        };

        inputMessage = '';
        loading.set(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Session-ID': sessionId,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                messages.update((msgs) => [...msgs, { sender: 'assistant', content: data.response }]);
            } else {
                messages.update((msgs) => [
                    ...msgs,
                    { sender: 'assistant', content: 'Error fetching response from assistant.' },
                ]);
            }
        } catch (error) {
            messages.update((msgs) => [
                ...msgs,
                { sender: 'assistant', content: 'Failed to reach assistant.' },
            ]);
        } finally {
            loading.set(false);
        }
    }
</script>

<style>
    .container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        max-width: 700px;
        margin: 0 auto;
        padding: 1rem;
    }

    .chat-container {
        flex-grow: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        border: 1px solid #e2e2e2;
        padding: 1rem;
        border-radius: 12px;
    }

    .message {
        display: flex;
        gap: 0.5rem;
        padding: 0.75rem;
        border-radius: 8px;
        font-size: 0.875rem;
    }

    .message.user {
        justify-content: flex-end;
        background-color: #dbeafe;
        align-self: flex-end;
    }

    .message.assistant {
        justify-content: flex-start;
        background-color: #f9fafb;
        align-self: flex-start;
    }

    .input-box {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
    }

    .input-box input {
        flex-grow: 1;
        padding: 0.75rem;
        border: 1px solid #ccc;
        border-radius: 8px;
        font-size: 0.875rem;
        outline: none;
    }

    .input-box button {
        padding: 0.75rem 1rem;
        border-radius: 8px;
        background-color: #007bff;
        color: white;
        border: none;
        cursor: pointer;
        font-size: 0.875rem;
    }

    .input-box button:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
    }
</style>

<Navbar />
<div class="container">

    <main class="flex flex-col gap-4">
        {#if $apiDescription}
            <div class="error-message" aria-live="polite">
                <strong>{$apiDescription}</strong>
            </div>
        {/if}

        <!-- Chat section -->
        <div class="chat-container" aria-live="polite" aria-relevant="additions">
            {#each $messages as msg}
                <div class="message {msg.sender}" role="dialog">
                    <span><strong>{msg.sender === 'user' ? 'You' : 'Assistant'}:</strong></span>
                    <span>{msg.content}</span>
                </div>
            {/each}

            {#if $loading}
                <div class="message assistant">
                    <strong>Assistant:</strong> Typing...
                </div>
            {/if}
        </div>

        <!-- Input section -->
        <div class="input-box">
            <input
                    type="text"
                    placeholder="Type your message..."
                    bind:value={inputMessage}
                    aria-label="Message Input"
                    on:keydown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button on:click={sendMessage} disabled={$loading}>
                Send
            </button>
        </div>
    </main>
</div>
