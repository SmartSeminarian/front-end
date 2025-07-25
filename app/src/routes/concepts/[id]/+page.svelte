<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { getCookie } from "$lib/cookies";
    import { PUBLIC_VITE_API_URL } from "$env/static/public";
    import Navbar from "$lib/components/Navbar.svelte";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
    import { Progress } from "$lib/components/ui/progress/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs/index.js";
    import { AlertCircle, BookOpen, Brain, Lightbulb, HelpCircle, Code, CheckCircle } from "lucide-svelte";
    import { writable, type Writable } from 'svelte/store';

    interface Concept {
        id: string;
        name: string;
        description: string;
        difficulty: number;
        related_concepts?: RelatedConcept[];
    }

    interface RelatedConcept {
        id: string;
        name: string;
        relation_type: string;
    }

    interface ContentResponse {
        content: string | object;
    }

    interface QuizQuestion {
        question: string;
        options: string[];
        answer: string | number;
    }

    const concept: Writable<Concept | null> = writable(null);
    const explanation: Writable<string> = writable("");
    const analogy: Writable<string> = writable("");
    const quiz: Writable<QuizQuestion[]> = writable([]);
    const masteryLevel: Writable<number> = writable(0);
    const isLoading: Writable<boolean> = writable(false);
    const error: Writable<string | null> = writable(null);
    const activeTab: Writable<string> = writable("explanation");
    const selectedAnswers: Writable<Record<number, number | string>> = writable({});
    const quizSubmitted: Writable<boolean> = writable(false);
    const quizScore: Writable<number> = writable(0);

    // Get concept ID from URL
    const conceptId = $page.params.id;

    async function fetchConcept() {
        const sessionId = getCookie('sessionID');
        if (!sessionId) {
            error.set('Session ID not found');
            return;
        }

        isLoading.set(true);
        error.set(null);

        try {
            const response = await fetch(`${PUBLIC_VITE_API_URL}/concept/${conceptId}`, {
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
            concept.set(data);
        } catch (err) {
            error.set(err instanceof Error ? err.message : 'Failed to fetch concept');
            concept.set(null);
        } finally {
            isLoading.set(false);
        }
    }

    async function fetchMasteryLevel() {
        const sessionId = getCookie('sessionID');
        if (!sessionId) {
            return;
        }

        try {
            // This endpoint would need to be implemented to return user's mastery level for a specific concept
            const response = await fetch(`${PUBLIC_VITE_API_URL}/user/knowledge/${conceptId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId
                }
            });

            if (!response.ok) {
                // If not found, assume mastery level is 0
                if (response.status === 404) {
                    masteryLevel.set(0);
                    return;
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            masteryLevel.set(data.mastery_level);
        } catch (err) {
            console.error('Failed to fetch mastery level:', err);
            // Default to 0 if there's an error
            masteryLevel.set(0);
        }
    }

    async function updateMasteryLevel(level: number) {
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

            // Update local state
            masteryLevel.set(level);
        } catch (err) {
            console.error('Failed to update mastery level:', err);
            error.set(err instanceof Error ? err.message : 'Failed to update mastery level');
            setTimeout(() => error.set(null), 3000);
        }
    }

    async function fetchContent(type: string) {
        const sessionId = getCookie('sessionID');
        if (!sessionId) {
            error.set('Session ID not found');
            return;
        }

        isLoading.set(true);

        try {
            const response = await fetch(`${PUBLIC_VITE_API_URL}/concept/${conceptId}/content?type=${type}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data: ContentResponse = await response.json();
            
            // Update the appropriate store based on content type
            if (type === 'explanation') {
                explanation.set(data.content as string);
            } else if (type === 'analogy') {
                analogy.set(data.content as string);
            } else if (type === 'quiz') {
                // Reset quiz state
                selectedAnswers.set({});
                quizSubmitted.set(false);
                quizScore.set(0);
                
                // Handle quiz content (could be string or object)
                if (typeof data.content === 'string') {
                    // Try to parse if it's a JSON string
                    try {
                        const parsedQuiz = JSON.parse(data.content);
                        quiz.set(Array.isArray(parsedQuiz) ? parsedQuiz : []);
                    } catch {
                        quiz.set([]);
                        console.error('Failed to parse quiz content');
                    }
                } else if (Array.isArray(data.content)) {
                    quiz.set(data.content);
                } else {
                    quiz.set([]);
                }
            }
        } catch (err) {
            console.error(`Failed to fetch ${type}:`, err);
            if (type === 'explanation') {
                explanation.set("Failed to load explanation.");
            } else if (type === 'analogy') {
                analogy.set("Failed to load analogy.");
            } else if (type === 'quiz') {
                quiz.set([]);
            }
        } finally {
            isLoading.set(false);
        }
    }

    function handleTabChange(tab: string) {
        activeTab.set(tab);
        
        // Fetch content if not already loaded
        if (tab === 'explanation' && !$explanation) {
            fetchContent('explanation');
        } else if (tab === 'analogy' && !$analogy) {
            fetchContent('analogy');
        } else if (tab === 'quiz' && $quiz.length === 0) {
            fetchContent('quiz');
        }
    }

    function selectAnswer(questionIndex: number, answerIndex: number | string) {
        selectedAnswers.update(answers => {
            answers[questionIndex] = answerIndex;
            return answers;
        });
    }

    function submitQuiz() {
        let correct = 0;
        
        $quiz.forEach((question, index) => {
            if ($selectedAnswers[index] === question.answer) {
                correct++;
            }
        });
        
        const score = $quiz.length > 0 ? correct / $quiz.length : 0;
        quizScore.set(score);
        quizSubmitted.set(true);
        
        // Update mastery level based on quiz performance
        // Only increase if the new score would be higher
        if (score > $masteryLevel) {
            updateMasteryLevel(score);
        }
    }

    function resetQuiz() {
        selectedAnswers.set({});
        quizSubmitted.set(false);
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

    function getRelationshipLabel(type: string): string {
        switch (type) {
            case "IS_PREREQUISITE_FOR":
                return "Prerequisite for";
            case "DEEPENS":
                return "Deepens understanding of";
            case "IS_AN_ALTERNATIVE_TO":
                return "Alternative to";
            default:
                return "Related to";
        }
    }

    onMount(async () => {
        await fetchConcept();
        await fetchMasteryLevel();
        await fetchContent('explanation');  // Load explanation by default
    });
</script>

<Navbar />

<div class="container mx-auto px-4 py-8">
    {#if $isLoading && !$concept}
        <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    {:else if $error && !$concept}
        <div class="text-center p-12 bg-red-50 rounded-lg text-red-500">
            <AlertCircle class="h-12 w-12 mx-auto mb-4" />
            <h3 class="text-xl font-medium mb-2">Error Loading Concept</h3>
            <p>{$error}</p>
        </div>
    {:else if $concept}
        <div class="mb-8 flex justify-between items-center">
            <h1 class="text-3xl font-bold">{$concept.name}</h1>
            <Badge class={getMasteryColor($masteryLevel)}>
                {getMasteryText($masteryLevel)} ({Math.round($masteryLevel * 100)}%)
            </Badge>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Content -->
            <div class="lg:col-span-2">
                <Card class="mb-8">
                    <CardHeader>
                        <CardTitle>About this Concept</CardTitle>
                        <CardDescription>
                            Difficulty: {$concept.difficulty}/5
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>{$concept.description}</p>
                    </CardContent>
                </Card>

                <Tabs value={$activeTab} onValueChange={handleTabChange} class="w-full">
                    <TabsList class="grid grid-cols-3">
                        <TabsTrigger value="explanation" class="flex items-center gap-2">
                            <Brain class="h-4 w-4" />
                            <span>Explanation</span>
                        </TabsTrigger>
                        <TabsTrigger value="analogy" class="flex items-center gap-2">
                            <Lightbulb class="h-4 w-4" />
                            <span>Analogy</span>
                        </TabsTrigger>
                        <TabsTrigger value="quiz" class="flex items-center gap-2">
                            <HelpCircle class="h-4 w-4" />
                            <span>Quiz</span>
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="explanation" class="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Explanation</CardTitle>
                                <CardDescription>
                                    A clear explanation of {$concept.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {#if $isLoading}
                                    <div class="flex justify-center items-center h-32">
                                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                {:else}
                                    <div class="prose max-w-none">
                                        <p>{$explanation}</p>
                                    </div>
                                {/if}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="analogy" class="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Analogy</CardTitle>
                                <CardDescription>
                                    Understanding {$concept.name} through metaphors
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {#if $isLoading}
                                    <div class="flex justify-center items-center h-32">
                                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                {:else}
                                    <div class="prose max-w-none">
                                        <p>{$analogy}</p>
                                    </div>
                                {/if}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="quiz" class="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quiz Yourself</CardTitle>
                                <CardDescription>
                                    Test your understanding of {$concept.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {#if $isLoading}
                                    <div class="flex justify-center items-center h-32">
                                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                {:else if $quiz.length === 0}
                                    <p>No quiz available for this concept.</p>
                                {:else if $quizSubmitted}
                                    <div class="mb-6">
                                        <div class="text-center mb-4">
                                            <h3 class="text-xl font-bold">Quiz Results</h3>
                                            <p class="text-lg">
                                                You scored {Math.round($quizScore * 100)}% 
                                                ({Math.round($quizScore * $quiz.length)}/{$quiz.length} correct)
                                            </p>
                                        </div>
                                        
                                        <div class="space-y-6">
                                            {#each $quiz as question, qIndex}
                                                <div class="border rounded-lg p-4 {$selectedAnswers[qIndex] === question.answer ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}">
                                                    <p class="font-medium mb-2">{qIndex + 1}. {question.question}</p>
                                                    <div class="space-y-2">
                                                        {#each question.options as option, oIndex}
                                                            <div class="flex items-center gap-2">
                                                                <div class="w-5 h-5 flex items-center justify-center">
                                                                    {#if oIndex === question.answer}
                                                                        <CheckCircle class="text-green-500 h-5 w-5" />
                                                                    {:else if $selectedAnswers[qIndex] === oIndex}
                                                                        <AlertCircle class="text-red-500 h-5 w-5" />
                                                                    {/if}
                                                                </div>
                                                                <span class={oIndex === question.answer ? 'font-medium text-green-700' : ''}>{option}</span>
                                                            </div>
                                                        {/each}
                                                    </div>
                                                </div>
                                            {/each}
                                        </div>
                                        
                                        <div class="mt-6 flex justify-center">
                                            <Button on:click={resetQuiz}>Try Again</Button>
                                        </div>
                                    </div>
                                {:else}
                                    <div class="space-y-6">
                                        {#each $quiz as question, qIndex}
                                            <div class="border rounded-lg p-4">
                                                <p class="font-medium mb-2">{qIndex + 1}. {question.question}</p>
                                                <div class="space-y-2">
                                                    {#each question.options as option, oIndex}
                                                        <label class="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                                                            <input 
                                                                type="radio" 
                                                                name={`question-${qIndex}`} 
                                                                value={oIndex} 
                                                                checked={$selectedAnswers[qIndex] === oIndex}
                                                                on:change={() => selectAnswer(qIndex, oIndex)}
                                                            />
                                                            <span>{option}</span>
                                                        </label>
                                                    {/each}
                                                </div>
                                            </div>
                                        {/each}
                                        
                                        <div class="mt-6 flex justify-center">
                                            <Button on:click={submitQuiz}>Submit Answers</Button>
                                        </div>
                                    </div>
                                {/if}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            
            <!-- Sidebar -->
            <div class="lg:col-span-1">
                <!-- Mastery Progress -->
                <Card class="mb-6">
                    <CardHeader>
                        <CardTitle>Your Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="mb-4">
                            <div class="flex justify-between text-sm mb-1">
                                <span>Mastery Level</span>
                                <span>{Math.round($masteryLevel * 100)}%</span>
                            </div>
                            <Progress value={$masteryLevel * 100} />
                        </div>
                        <div class="flex justify-between">
                            <Button variant="outline" size="sm" on:click={() => updateMasteryLevel(Math.min($masteryLevel + 0.1, 1))}>
                                <CheckCircle class="h-4 w-4 mr-2" />
                                Mark Progress
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                
                <!-- Related Concepts -->
                {#if $concept.related_concepts && $concept.related_concepts.length > 0}
                    <Card>
                        <CardHeader>
                            <CardTitle>Related Concepts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div class="space-y-3">
                                {#each $concept.related_concepts as related}
                                    <div class="border rounded p-3">
                                        <div class="text-sm text-gray-500 mb-1">
                                            {getRelationshipLabel(related.relation_type)}
                                        </div>
                                        <a href={`/concepts/${related.id}`} class="font-medium hover:text-blue-600">
                                            {related.name}
                                        </a>
                                    </div>
                                {/each}
                            </div>
                        </CardContent>
                    </Card>
                {/if}
            </div>
        </div>
    {:else}
        <div class="text-center p-12 bg-gray-50 rounded-lg">
            <h3 class="text-xl font-medium mb-2">Concept Not Found</h3>
            <p class="text-gray-600 mb-4">
                The concept you're looking for could not be found.
            </p>
            <a href="/concepts" class="text-blue-600 hover:underline">
                Browse all concepts
            </a>
        </div>
    {/if}
</div>