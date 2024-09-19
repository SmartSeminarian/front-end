<script lang="ts">
    import Navbar from "$lib/components/Navbar.svelte";
    import { writable } from "svelte/store";
    import { getCookie } from "@/cookies";
    import { onMount, tick } from "svelte";
    import * as Command from "$lib/components/ui/command/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { PUBLIC_VITE_API_URL } from "$env/static/public";

    interface Message {
        sender: string;
        content: string;
    }

    interface Concept {
        id: string;
        name: string;
        description: string;
        difficulty: number;
    }

    let concepts: Concept[] = [];

    onMount(async () => {
        const sessionId = getCookie('sessionID');
        if (!sessionId) {
            console.log("No session ID found");
            return;
        }

        try {
            const response = await fetch(`${PUBLIC_VITE_API_URL}/concept`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'X-Session-ID': sessionId
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch concepts');
            }

            concepts = await response.json() as Concept[];
            concepts.sort((a, b) => a.difficulty - b.difficulty);
        } catch (error) {
            console.error('Error fetching concepts:', error);
        }
    });

    let messages = writable<Message[]>([]);
    let inputMessage = '';
    let loading = writable(false);
    let apiDescription = writable('');

    let open = false;
    let value = "";
    let selectedConcept: Concept | null = null;

    $: selectedValue = concepts.find((f) => f.name === value)?.description ?? "Select a Concept";

    function closeAndFocusTrigger(triggerId: string) {
        open = false;
        tick().then(() => {
            document.getElementById(triggerId)?.focus();
        });
    }

    const API_URL = `${PUBLIC_VITE_API_URL}/chat`;

    async function sendMessage() {
        if (!inputMessage.trim()) {
            apiDescription.set('Message cannot be empty.');
            return;
        }

        const sessionId = getCookie('sessionID');
        if (!sessionId) {
            apiDescription.set('Session ID not found');
            return;
        }

        messages.update((msgs) => [...msgs, { sender: 'user', content: inputMessage }]);

        const payload = {
            message: inputMessage,
            context: selectedConcept ? {
                type: "problem",
                id: selectedConcept.id
            } : {}
        };

        console.log(payload)
        console.log(selectedConcept?.id)
        console.log(selectedConcept?.name)

        inputMessage = '';
        loading.set(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId,
                },
                mode: 'cors',
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Error fetching assistant response: ${response.statusText}`);
            }

            const data = await response.json();
            messages.update((msgs) => [...msgs, { sender: 'assistant', content: data.assistant_response }]);

        } catch (error) {
            console.error('Error:', error);
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

    .command-item {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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

            <!-- Popover for selecting concepts -->
            <Popover.Root bind:open let:ids>
                <Popover.Trigger asChild let:builder>
                    <Button
                            builders={[builder]}
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            class="w-[200px] justify-between"
                    >
                        {selectedValue}
                    </Button>
                </Popover.Trigger>
                <Popover.Content class="w-[200px] p-0">
                    <Command.Root>
                        <Command.Input placeholder="Search concept..." class="h-9" />
                        <Command.Empty>No concepts found.</Command.Empty>
                        <Command.Group>
                            {#each concepts as concept}
                                <Command.Item
                                        value={concept.name}
                                        onSelect={(currentValue) => {
                                        value = currentValue;
                                        selectedConcept = concept;
                                        closeAndFocusTrigger(ids.trigger);
                                    }}
                                        class="command-item"
                                >
                                    {concept.name}
                                </Command.Item>
                            {/each}
                        </Command.Group>
                    </Command.Root>
                </Popover.Content>
            </Popover.Root>
        </div>
    </main>
</div>
