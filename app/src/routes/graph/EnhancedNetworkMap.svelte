<script lang="ts">
    import { onMount } from 'svelte';
    import { getCookie } from "$lib/cookies";
    import { PUBLIC_VITE_API_URL } from "$env/static/public";
    import { Info, X, Settings, Image, Plus, Minus, HelpCircle } from 'lucide-svelte';
    import { writable, type Writable } from 'svelte/store';

    let Sigma: typeof import('sigma').default | undefined;
    let Graph: typeof import('graphology').default | undefined;
    let renderer: typeof import('sigma').default | undefined;
    let layout: 'circular' | 'random' = 'circular'; // Default to circular layout

    interface Concept {
        id: string;
        name: string;
        description: string;
        difficulty: number;
    }

    interface ConceptRelationship {
        source_id: string;
        target_id: string;
        relation_type: string;
    }

    interface UserKnowledge {
        concept_id: string;
        mastery_level: number;
    }

    interface LearningPath {
        goal: string;
        suggested_path: { id: string; name: string }[];
    }

    const concepts: Writable<Concept[]> = writable([]);
    const relationships: Writable<ConceptRelationship[]> = writable([]);
    const userKnowledge: Writable<Record<string, number>> = writable({});
    const currentPath: Writable<LearningPath | null> = writable(null);
    const selectedConcept: Writable<Concept | null> = writable(null);
    const isLoading: Writable<boolean> = writable(false);
    const error: Writable<string | null> = writable(null);
    const showSidebar: Writable<boolean> = writable(true);

    const toggleSidebar = () => {
        showSidebar.update(value => !value);
    };

    async function fetchConcepts() {
        const sessionId = getCookie('sessionID');
        if (!sessionId) {
            error.set('Session ID not found');
            return;
        }

        isLoading.set(true);
        error.set(null);

        try {
            const response = await fetch(`${PUBLIC_VITE_API_URL}/concept`, {
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
            concepts.set(data);
        } catch (err) {
            error.set(err instanceof Error ? err.message : 'Failed to fetch concepts');
            concepts.set([]);
        } finally {
            isLoading.set(false);
        }
    }

    async function fetchRelationships() {
        const sessionId = getCookie('sessionID');
        if (!sessionId) {
            error.set('Session ID not found');
            return;
        }

        isLoading.set(true);
        error.set(null);

        try {
            const response = await fetch(`${PUBLIC_VITE_API_URL}/concept/relationships`, {
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
            relationships.set(data.relationships);
        } catch (err) {
            error.set(err instanceof Error ? err.message : 'Failed to fetch relationships');
            relationships.set([]);
        } finally {
            isLoading.set(false);
        }
    }

    async function fetchUserKnowledge() {
        const sessionId = getCookie('sessionID');
        if (!sessionId) {
            return;
        }

        try {
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
            userKnowledge.set({});
        }
    }

    async function fetchCurrentPath() {
        const sessionId = getCookie('sessionID');
        if (!sessionId) {
            return;
        }

        try {
            const response = await fetch(`${PUBLIC_VITE_API_URL}/user/current-path`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // No current path
                    currentPath.set(null);
                    return;
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            currentPath.set(data);
        } catch (err) {
            console.error('Failed to fetch current path:', err);
            currentPath.set(null);
        }
    }

    function selectConcept(conceptId: string) {
        const found = $concepts.find(c => c.id === conceptId);
        if (found) {
            selectedConcept.set(found);
        }
    }

    function getMasteryLevel(conceptId: string): number {
        return $userKnowledge[conceptId] || 0;
    }

    function getRelationshipColor(type: string): string {
        switch (type) {
            case "IS_PREREQUISITE_FOR":
                return "#FF4500"; // Orange-Red
            case "DEEPENS":
                return "#32CD32"; // Lime Green
            case "IS_AN_ALTERNATIVE_TO":
                return "#1E90FF"; // Dodger Blue
            default:
                return "#d3d3d3"; // Light Gray
        }
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

    function getNodeColor(conceptId: string, difficulty: number): string {
        // If the concept is in the current path, highlight it
        const isInPath = $currentPath?.suggested_path.some(node => node.id === conceptId) || false;
        
        // Get mastery level
        const mastery = getMasteryLevel(conceptId);
        
        if (isInPath) {
            // Highlight path nodes with a gold color, varying by mastery
            return mastery < 0.3 ? "#FFD700" : // Gold for not started/beginner
                   mastery < 0.6 ? "#DAA520" : // Goldenrod for intermediate
                   "#B8860B";                  // Dark goldenrod for advanced/expert
        } else {
            // Regular nodes colored by difficulty, with mastery affecting brightness
            const baseColors = [
                "#FF4500", // Red-Orange (difficulty 1)
                "#FF8C00", // Dark Orange (difficulty 2)
                "#32CD32", // Lime Green (difficulty 3)
                "#1E90FF", // Dodger Blue (difficulty 4)
                "#9932CC"  // Dark Orchid (difficulty 5)
            ];
            
            // Adjust color based on mastery (higher mastery = more saturated)
            const baseColor = baseColors[Math.min(difficulty - 1, 4)];
            
            // For low mastery, make the color more faded
            if (mastery < 0.3) {
                return fadeColor(baseColor, 0.5);
            }
            
            return baseColor;
        }
    }

    function fadeColor(hex: string, opacity: number): string {
        // Convert hex to RGB
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        // Mix with white based on opacity
        const r2 = Math.round(r + (255 - r) * (1 - opacity));
        const g2 = Math.round(g + (255 - g) * (1 - opacity));
        const b2 = Math.round(b + (255 - b) * (1 - opacity));
        
        // Convert back to hex
        return `#${r2.toString(16).padStart(2, '0')}${g2.toString(16).padStart(2, '0')}${b2.toString(16).padStart(2, '0')}`;
    }

    function getNodeSize(conceptId: string, difficulty: number): number {
        // Base size by difficulty
        const baseSize = 10 + difficulty * 3;
        
        // If in current path, make it larger
        const isInPath = $currentPath?.suggested_path.some(node => node.id === conceptId) || false;
        const pathMultiplier = isInPath ? 1.5 : 1;
        
        // Mastery also affects size slightly
        const mastery = getMasteryLevel(conceptId);
        const masteryMultiplier = 1 + mastery * 0.5;
        
        return baseSize * pathMultiplier * masteryMultiplier;
    }

    function initializeGraph() {
        const container = document.getElementById('sigma-container');
        if (container && Graph && Sigma && $concepts.length > 0) {
            const graph = new Graph({ allowSelfLoops: false });

            // Add nodes with dynamic layout
            const radius = 300;
            const centerX = 500;
            const centerY = 350;

            $concepts.forEach((concept, index) => {
                const x = layout === 'circular'
                    ? centerX + radius * Math.cos((2 * Math.PI * index) / $concepts.length)
                    : Math.random() * 1000;
                const y = layout === 'circular'
                    ? centerY + radius * Math.sin((2 * Math.PI * index) / $concepts.length)
                    : Math.random() * 700;

                graph.addNode(concept.id, {
                    x,
                    y,
                    type: 'circle',
                    size: getNodeSize(concept.id, concept.difficulty),
                    label: concept.name,
                    color: getNodeColor(concept.id, concept.difficulty),
                    hover_color: '#FF1493', // Hot pink for hover
                });
            });

            // Add edges with relationship types
            $relationships.forEach(rel => {
                if (graph.hasNode(rel.source_id) && graph.hasNode(rel.target_id)) {
                    graph.addEdge(rel.source_id, rel.target_id, {
                        size: 1,
                        color: getRelationshipColor(rel.relation_type),
                        hover_color: '#000',
                        label: getRelationshipLabel(rel.relation_type),
                    });
                }
            });

            // Initialize Sigma renderer
            if (renderer) renderer.kill(); // Clean up previous instance
            renderer = new Sigma(graph, container, {
                renderLabels: true,
                labelRenderedSizeThreshold: 1, // Always render labels
                labelSize: 14,
                labelWeight: 'bold',
            });

            // Add click event to nodes
            renderer.on('clickNode', (event) => {
                selectConcept(event.node);
            });
        } else {
            console.error('Sigma container not found, modules not loaded, or no concepts available!');
        }
    }

    function toggleLayout() {
        layout = layout === 'circular' ? 'random' : 'circular';
        initializeGraph();
    }

    onMount(async () => {
        if (typeof window !== 'undefined') {
            const sigmaModule = await import('sigma');
            const graphologyModule = await import('graphology');

            Sigma = sigmaModule.default;
            Graph = graphologyModule.default;

            // Fetch data
            await fetchConcepts();
            await fetchRelationships();
            await fetchUserKnowledge();
            await fetchCurrentPath();

            // Initialize graph after data is loaded
            initializeGraph();
        }
    });
</script>

<div class="relative h-screen w-full bg-gray-50">
    <!-- Main Content -->
    <div class="h-full w-full flex">
        <!-- Graph Area -->
        <div class="flex-1 relative">
            {#if $isLoading}
                <div class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            {/if}
            
            <div id="sigma-container" class="h-full"></div>

            <!-- Control Buttons -->
            <div class="absolute right-4 top-4 flex flex-col gap-2">
                <button class="p-2 bg-white rounded-full shadow hover:bg-gray-50" on:click={toggleSidebar}>
                    <Info class="w-5 h-5" />
                </button>
                <button class="p-2 bg-white rounded-full shadow hover:bg-gray-50" on:click={toggleLayout}>
                    <Settings class="w-5 h-5" />
                </button>
                <button class="p-2 bg-white rounded-full shadow hover:bg-gray-50">
                    <Plus class="w-5 h-5" />
                </button>
                <button class="p-2 bg-white rounded-full shadow hover:bg-gray-50">
                    <Minus class="w-5 h-5" />
                </button>
            </div>

            <!-- Legend -->
            <div class="absolute left-4 bottom-4 bg-white p-4 rounded-lg shadow-md">
                <h3 class="font-medium mb-2">Legend</h3>
                
                <div class="space-y-2">
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 rounded-full" style="background-color: #FFD700;"></div>
                        <span>Current Learning Path</span>
                    </div>
                    
                    <h4 class="font-medium mt-2">Relationships:</h4>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-1" style="background-color: #FF4500;"></div>
                        <span>Prerequisite</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-1" style="background-color: #32CD32;"></div>
                        <span>Deepens</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-1" style="background-color: #1E90FF;"></div>
                        <span>Alternative</span>
                    </div>
                    
                    <h4 class="font-medium mt-2">Difficulty:</h4>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 rounded-full" style="background-color: #FF4500;"></div>
                        <span>Easy (1)</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 rounded-full" style="background-color: #FF8C00;"></div>
                        <span>Medium (2-3)</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 rounded-full" style="background-color: #1E90FF;"></div>
                        <span>Hard (4-5)</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sidebar -->
        {#if $showSidebar && $selectedConcept}
            <div class="w-80 border-l bg-white p-6 overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-xl font-semibold">{$selectedConcept.name}</h1>
                    <button class="p-1 rounded-full hover:bg-gray-100" on:click={() => selectedConcept.set(null)}>
                        <X class="w-5 h-5" />
                    </button>
                </div>

                <div class="space-y-6">
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <p class="text-gray-600">Difficulty: {$selectedConcept.difficulty}/5</p>
                            <div class="px-2 py-1 rounded text-sm {getMasteryLevel($selectedConcept.id) < 0.2 ? 'bg-gray-200' : 
                                                                    getMasteryLevel($selectedConcept.id) < 0.4 ? 'bg-blue-200' :
                                                                    getMasteryLevel($selectedConcept.id) < 0.6 ? 'bg-green-200' :
                                                                    getMasteryLevel($selectedConcept.id) < 0.8 ? 'bg-yellow-200' :
                                                                    'bg-red-200'}">
                                {getMasteryLevel($selectedConcept.id) < 0.2 ? 'Not Started' :
                                 getMasteryLevel($selectedConcept.id) < 0.4 ? 'Beginner' :
                                 getMasteryLevel($selectedConcept.id) < 0.6 ? 'Intermediate' :
                                 getMasteryLevel($selectedConcept.id) < 0.8 ? 'Advanced' :
                                 'Expert'} ({Math.round(getMasteryLevel($selectedConcept.id) * 100)}%)
                            </div>
                        </div>
                        <p class="mt-4 text-gray-700">
                            {$selectedConcept.description}
                        </p>
                    </div>

                    <div class="flex gap-2">
                        <a href={`/concepts/${$selectedConcept.id}`} class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block text-center">
                            Explore Concept
                        </a>
                        <a href="/learning" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 inline-block text-center">
                            Learning Paths
                        </a>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    #sigma-container {
        width: 100%;
        height: 100%;
    }
</style>