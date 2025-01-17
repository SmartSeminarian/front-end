<script lang="ts">
    import { writable } from "svelte/store";
    import { onMount } from "svelte";
    import { getCookie } from "@/cookies";
    import * as Command from "$lib/components/ui/command";
    import * as Popover from "$lib/components/ui/popover";
    import { Button } from "$lib/components/ui/button";
    import { ScrollArea } from "$lib/components/ui/scroll-area";
    import { Separator } from "$lib/components/ui/separator";
    import { formatDistance } from "date-fns";
    import Navbar from "@/components/Navbar.svelte";
    import {PUBLIC_VITE_API_URL} from "$env/static/public";


    interface Message {
        content: {
            assistant: string;
            user: string;
            context_id: string | null;
            context_type: string | null;
        };
        id: number;
        timestamp: string;
    }

    interface Concept {
        id: string;
        name: string;
        description: string;
    }

    interface SessionGroup {
        sessionId: string;
        messages: Message[];
        lastTimestamp: string;
    }

    export let messages = writable<Message[]>([]);
    export let concepts: Concept[] = [];
    export let loading = writable(false);

    let sessionGroups: SessionGroup[] = [];
    let currentSessionId = getCookie('sessionID');
    let activeSessionId = writable<string>(currentSessionId);
    let inputMessage = '';
    let messageContainer: HTMLElement;
    let conceptPopoverOpen = false;
    let selectedConcept: Concept | null = null;

    $: selectedConceptLabel = selectedConcept?.name || "Select a Concept";

    onMount(async () => {
        await fetchDialogues();
    });

    async function fetchDialogues() {
        const sessionId = getCookie('sessionID');
        if (!sessionId) {
            console.log('Session ID not found');
            return;
        }
        try {
            const response = await fetch(`${PUBLIC_VITE_API_URL}/dialogues`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'X-Session-ID': sessionId
                }
            });

            console.log("response", response);

            if (!response.ok) {
                throw new Error('Failed to fetch dialogues, status: ' + response.status);
            }

            const dialogues = await response.json() as Message[];

            const groups = new Map<string, Message[]>();
            dialogues.forEach(message => {
                const sessionId = message.content.context_id || 'default';
                if (!groups.has(sessionId)) {
                    groups.set(sessionId, []);
                }
                groups.get(sessionId)?.push(message);
            });

            sessionGroups = Array.from(groups.entries()).map(([sessionId, msgs]) => ({
                sessionId,
                messages: msgs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
                lastTimestamp: msgs[0].timestamp
            })).sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime());

            if (currentSessionId) {
                const currentSession = sessionGroups.find(g => g.sessionId === currentSessionId);
                if (currentSession) {
                    messages.set(currentSession.messages);
                }
            }
        } catch (error) {
            console.error('Error fetching dialogues:', error);
        }
    }

    function switchSession(sessionId: string) {
        activeSessionId.set(sessionId);
        const session = sessionGroups.find(g => g.sessionId === sessionId);
        if (session) {
            messages.set(session.messages);
        }
    }

    $: if ($messages && messageContainer) {
        setTimeout(() => {
            messageContainer.scrollTo({
                top: messageContainer.scrollHeight,
                behavior: 'smooth'
            });
        }, 0);
    }

    function formatMessageTime(timestamp: string): string {
        return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
    }

    async function handleSendMessage() {
        if (!inputMessage.trim()) return;

        const sessionId = getCookie('sessionID');
        if (!sessionId) return;

        const newMessage = {
            content: {
                assistant: '',
                user: inputMessage,
                context_id: selectedConcept?.id || null,
                context_type: selectedConcept ? "problem" : null
            },
            id: Date.now(),
            timestamp: new Date().toISOString()
        };

        messages.update(msgs => [...msgs, newMessage]);
        inputMessage = '';
        loading.set(true);

        try {
            const response = await fetch(`${PUBLIC_VITE_API_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId,
                },
                body: JSON.stringify({
                    message: newMessage.content.user,
                    context: selectedConcept ? {
                        type: "problem",
                        id: selectedConcept.id
                    } : {}
                }),
            });

            if (!response.ok) throw new Error('Failed to send message');

            const data = await response.json();
            messages.update(msgs => {
                const lastMsg = msgs[msgs.length - 1];
                lastMsg.content.assistant = data.assistant_response;
                return msgs;
            });

            await fetchDialogues();
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            loading.set(false);
        }
    }
</script>

<div class="flex flex-col h-screen bg-background">
    <Navbar />

    <main class="flex-1 flex overflow-hidden">
        <div class="w-64 border-r flex-shrink-0">
            <div class="h-full flex flex-col">
                <div class="p-4">
                    <h2 class="text-lg font-semibold">Chat History</h2>
                </div>
                <ScrollArea class="flex-1">
                    <div class="px-2 space-y-2">
                        {#each sessionGroups as group}
                            <button
                                    class="w-full p-3 text-left hover:bg-muted rounded-lg transition-colors
                                       {$activeSessionId === group.sessionId ? 'bg-muted' : ''}"
                                    on:click={() => switchSession(group.sessionId)}
                            >
                                <div class="font-medium truncate">Session {group.sessionId}</div>
                                <div class="text-sm text-muted-foreground">
                                    {formatMessageTime(group.lastTimestamp)}
                                </div>
                            </button>
                            <Separator class="my-2" />
                        {/each}
                    </div>
                </ScrollArea>
            </div>
        </div>

        <div class="flex-1 flex flex-col min-w-0">
            <ScrollArea class="flex-1" bind:this={messageContainer}>
                <div class="p-4 space-y-4">
                    {#each $messages as message}
                        {#if message.content.user}
                            <div class="flex flex-col items-end gap-1">
                                <div class="max-w-[80%] bg-primary text-primary-foreground rounded-xl rounded-tr-sm p-3">
                                    {message.content.user}
                                </div>
                                <span class="text-xs text-muted-foreground">
                                    {formatMessageTime(message.timestamp)}
                                </span>
                            </div>
                        {/if}

                        {#if message.content.assistant}
                            <div class="flex flex-col items-start gap-1">
                                <div class="max-w-[80%] bg-muted rounded-xl rounded-tl-sm p-3">
                                    {message.content.assistant}
                                </div>
                                <span class="text-xs text-muted-foreground">
                                    {formatMessageTime(message.timestamp)}
                                </span>
                            </div>
                        {/if}
                    {/each}

                    {#if $loading}
                        <div class="flex items-center space-x-2 p-3 bg-muted w-fit rounded-xl">
                            {#each Array(3) as _, i}
                                <div
                                        class="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"
                                        style="animation-delay: {i * 0.2}s"
                                />
                            {/each}
                        </div>
                    {/if}
                </div>
            </ScrollArea>

            <div class="border-t p-4 bg-background">
                <div class="flex gap-2">
                    <Popover.Root bind:open={conceptPopoverOpen}>
                        <Popover.Trigger asChild let:builder>
                            <Button
                                    builders={[builder]}
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={conceptPopoverOpen}
                                    class="w-[200px] justify-between truncate"
                            >
                                {selectedConceptLabel}
                            </Button>
                        </Popover.Trigger>
                        <Popover.Content class="w-[200px] p-0">
                            <Command.Root>
                                <Command.Input placeholder="Search concepts..." class="h-9" />
                                <Command.Empty>No concepts found.</Command.Empty>
                                <Command.Group>
                                    {#each concepts as concept}
                                        <Command.Item
                                                value={concept.name}
                                                onSelect={() => {
                                                selectedConcept = concept;
                                                conceptPopoverOpen = false;
                                            }}
                                                class="truncate"
                                        >
                                            {concept.name}
                                        </Command.Item>
                                    {/each}
                                </Command.Group>
                            </Command.Root>
                        </Popover.Content>
                    </Popover.Root>

                    <input
                            type="text"
                            class="flex-1 px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Type your message..."
                            bind:value={inputMessage}
                            on:keydown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    />

                    <Button
                            variant="default"
                            disabled={$loading}
                            on:click={handleSendMessage}
                    >
                        Send
                    </Button>
                </div>
            </div>
        </div>
    </main>
</div>
