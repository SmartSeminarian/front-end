<script lang="ts">
    import { onMount } from "svelte";
    import { getCookie } from "$lib/cookies";
    import { PUBLIC_VITE_API_URL } from "$env/static/public";
    import Navbar from "$lib/components/Navbar.svelte";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
    import { Progress } from "$lib/components/ui/progress/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { AlertCircle, CheckCircle, BookOpen, ArrowRight } from "lucide-svelte";
    import { writable, type Writable } from 'svelte/store';
    import LearningPathGraph from "./LearningPathGraph.svelte";

    interface LearningPathNode {
        id: string;
        name: string;
    }

    interface LearningPath {
        goal: string;
        suggested_path: LearningPathNode[];
    }

    interface UserKnowledge {
        concept_id: string;
        mastery_level: number;
    }

    const learningGoal: Writable<string> = writable("");
    const currentPath: Writable<LearningPath | null> = writable(null);
    const isLoading: Writable<boolean> = writable(false);
    const error: Writable<string | null> = writable(null);
    const userKnowledge: Writable<Record<string, number>> = writable({});

    async function generateLearningPath() {
        const sessionId = getCookie('sessionID');
        if (!sessionId) {
            error.set('Session ID not found');
            return;
        }

        const goal = $learningGoal;
        if (!goal) {
            error.set('Please enter a learning goal');
            return;
        }

        isLoading.set(true);
        error.set(null);

        try {
            const response = await fetch(`${PUBLIC_VITE_API_URL}/learning-path/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId
                },
                body: JSON.stringify({
                    goal: goal
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            currentPath.set(data);
        } catch (err) {
            error.set(err instanceof Error ? err.message : 'Failed to generate learning path');
            currentPath.set(null);
        } finally {
            isLoading.set(false);
        }
    }

    async function fetchUserKnowledge() {
        const sessionId = getCookie('sessionID');
        if (!sessionId) {
            error.set('Session ID not found');
            return;
        }

        try {
            // This endpoint would need to be implemented to return all user knowledge
            const response = await fetch(`${PUBLIC_VITE_API_URL}/user/knowledge`, {
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
            const knowledgeMap: Record<string, number> = {};

            data.knowledge.forEach((item: UserKnowledge) => {
                knowledgeMap[item.concept_id] = item.mastery_level;
            });

            userKnowledge.set(knowledgeMap);
        } catch (err) {
            console.error('Failed to fetch user knowledge:', err);
            // Don't set error here to avoid disrupting the main flow
        }
    }

    async function updateMasteryLevel(conceptId: string, level: number) {
        const sessionId = getCookie('sessionID');
        if (!sessionId) {
            error.set('Session ID not found');
            return;
        }

        try {
            const response = await fetch(`${PUBLIC_VITE_API_URL}/concept/${conceptId}/mastery`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId
                },
                body: JSON.stringify({
                    masteryLevel: level
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Update local knowledge state
            userKnowledge.update(knowledge => {
                knowledge[conceptId] = level;
                return knowledge;
            });
        } catch (err) {
            console.error('Failed to update mastery level:', err);
            // Show a temporary error message
            error.set(err instanceof Error ? err.message : 'Failed to update mastery level');
            setTimeout(() => error.set(null), 3000);
        }
    }

    function getMasteryLevel(conceptId: string): number {
        return $userKnowledge[conceptId] || 0;
    }

    function getMasteryText(level: number): string {
        if (level < 0.2) return "Not Started";
        if (level < 0.4) return "Beginner";
        if (level < 0.6) return "Intermediate";
        if (level < 0.8) return "Advanced";
        return "Expert";
    }

    function getMasteryColor(level: number): string {
        if (level < 0.2) return "bg-gray-200";
        if (level < 0.4) return "bg-blue-200";
        if (level < 0.6) return "bg-green-200";
        if (level < 0.8) return "bg-yellow-200";
        return "bg-red-200";
    }

    onMount(async () => {
        await fetchUserKnowledge();
    });
</script>

<Navbar />

<div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Learning Path Generator</h1>

    <div class="mb-8">
        <Card>
            <CardHeader>
                <CardTitle>Set Your Learning Goal</CardTitle>
                <CardDescription>
                    Enter what you want to learn, and we'll generate a personalized learning path for you.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div class="flex gap-4">
                    <Input 
                        bind:value={$learningGoal} 
                        placeholder="e.g., Learn to build a REST API with Flask" 
                        class="flex-1"
                    />
                    <Button on:click={generateLearningPath} disabled={$isLoading}>
                        {$isLoading ? 'Generating...' : 'Generate Path'}
                    </Button>
                </div>
                {#if $error}
                    <div class="mt-4 flex items-center gap-2 text-red-500">
                        <AlertCircle class="h-5 w-5" />
                        <span>{$error}</span>
                    </div>
                {/if}
            </CardContent>
        </Card>
    </div>

    {#if $currentPath}
        <div class="mb-8">
            <h2 class="text-2xl font-bold mb-4">Your Learning Path: {$currentPath.goal}</h2>

            <!-- Learning Path Graph Visualization -->
            <div class="mb-8">
                <Card>
                    <CardHeader>
                        <div class="flex justify-between items-center">
                            <div>
                                <CardTitle>Learning Path Visualization</CardTitle>
                                <CardDescription>
                                    Visual representation of your learning journey
                                </CardDescription>
                            </div>
                            <a href="/graph" class="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                View in Full Graph
                            </a>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <LearningPathGraph learningPath={$currentPath} userKnowledge={$userKnowledge} />
                    </CardContent>
                </Card>
            </div>

            <!-- Learning Path Items List -->
            <div class="space-y-4">
                {#each $currentPath.suggested_path as node, index}
                    <Card>
                        <CardHeader class="pb-2">
                            <div class="flex justify-between items-center">
                                <CardTitle class="text-xl">{index + 1}. {node.name}</CardTitle>
                                <Badge class={getMasteryColor(getMasteryLevel(node.id))}>
                                    {getMasteryText(getMasteryLevel(node.id))}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div class="mb-4">
                                <div class="flex justify-between text-sm mb-1">
                                    <span>Mastery Level</span>
                                    <span>{Math.round(getMasteryLevel(node.id) * 100)}%</span>
                                </div>
                                <Progress value={getMasteryLevel(node.id) * 100} />
                            </div>
                        </CardContent>
                        <CardFooter class="flex justify-between">
                            <div class="flex gap-2">
                                <Button variant="outline" size="sm" on:click={() => updateMasteryLevel(node.id, Math.min(getMasteryLevel(node.id) + 0.1, 1))}>
                                    <CheckCircle class="h-4 w-4 mr-2" />
                                    Mark Progress
                                </Button>
                                <Button variant="outline" size="sm">
                                    <BookOpen class="h-4 w-4 mr-2" />
                                    Explore
                                </Button>
                            </div>
                            <a href={`/concepts/${node.id}`} class="inline-flex items-center text-blue-600 hover:text-blue-800">
                                Learn More <ArrowRight class="h-4 w-4 ml-1" />
                            </a>
                        </CardFooter>
                    </Card>
                {/each}
            </div>
        </div>
    {:else if !$isLoading}
        <div class="text-center p-12 bg-gray-50 rounded-lg">
            <h3 class="text-xl font-medium mb-2">No Learning Path Generated Yet</h3>
            <p class="text-gray-600 mb-4">
                Enter your learning goal above and click "Generate Path" to get started.
            </p>
        </div>
    {/if}
</div>
