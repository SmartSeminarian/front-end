<script lang="ts">
    import { onMount } from 'svelte';
    import { writable, type Writable } from 'svelte/store';
    import { getCookie } from "$lib/cookies";
    import { PUBLIC_VITE_API_URL } from "$env/static/public";

    // Import Sigma and Graph types
    let Sigma: typeof import('sigma').default | undefined;
    let Graph: typeof import('graphology').default | undefined;
    let renderer: typeof import('sigma').default | undefined;

    // Props
    export let learningPath: any = null;
    export let userKnowledge: Record<string, number> = {};

    // State
    const isLoading: Writable<boolean> = writable(true);
    const error: Writable<string | null> = writable(null);
    const relationships: Writable<any[]> = writable([]);

    // Function to get mastery level for a concept
    function getMasteryLevel(conceptId: string): number {
        return userKnowledge[conceptId] || 0;
    }

    // Function to get node color based on mastery level
    function getNodeColor(conceptId: string, index: number): string {
        // Get mastery level
        const mastery = getMasteryLevel(conceptId);

        // Color based on mastery level
        if (mastery < 0.3) {
            return "#FFD700"; // Gold for not started/beginner
        } else if (mastery < 0.6) {
            return "#DAA520"; // Goldenrod for intermediate
        } else {
            return "#B8860B"; // Dark goldenrod for advanced/expert
        }
    }

    // Function to get node size based on position in path and mastery
    function getNodeSize(conceptId: string, index: number): number {
        // Base size
        const baseSize = 15;

        // Mastery affects size
        const mastery = getMasteryLevel(conceptId);
        const masteryMultiplier = 1 + mastery * 0.5;

        // Earlier nodes in the path are slightly larger
        const positionMultiplier = 1 + (learningPath.suggested_path.length - index) * 0.1;

        return baseSize * masteryMultiplier * positionMultiplier;
    }

    // Function to get relationship color based on type
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

    // Function to fetch relationships between concepts
    async function fetchRelationships() {
        const sessionId = getCookie('sessionID');
        if (!sessionId) {
            error.set('Session ID not found');
            return;
        }

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
            console.error('Failed to fetch relationships:', err);
            relationships.set([]);
        }
    }

    // Function to initialize the graph
    function initializeGraph() {
        const container = document.getElementById('learning-path-graph');
        if (container && Graph && Sigma && learningPath && learningPath.suggested_path.length > 0) {
            const graph = new Graph({ allowSelfLoops: false });

            // Add nodes in a path layout
            const pathLength = learningPath.suggested_path.length;
            const width = container.clientWidth;
            const height = container.clientHeight;
            const startX = width * 0.1;
            const endX = width * 0.9;
            const centerY = height / 2;
            const xStep = (endX - startX) / (pathLength - 1 || 1);

            // Add nodes
            learningPath.suggested_path.forEach((node: any, index: number) => {
                const x = startX + xStep * index;
                const y = centerY + (index % 2 === 0 ? -50 : 50); // Zigzag pattern for better visibility

                graph.addNode(node.id, {
                    x,
                    y,
                    type: 'circle',
                    size: getNodeSize(node.id, index),
                    label: `${index + 1}. ${node.name}`,
                    color: getNodeColor(node.id, index),
                    hover_color: '#FF1493', // Hot pink for hover
                });
            });

            // Add edges connecting the path
            for (let i = 0; i < pathLength - 1; i++) {
                const sourceId = learningPath.suggested_path[i].id;
                const targetId = learningPath.suggested_path[i + 1].id;

                graph.addEdge(sourceId, targetId, {
                    size: 2,
                    color: '#4CAF50', // Green for path edges
                    type: 'arrow',
                    hover_color: '#000',
                });
            }

            // Add actual concept relationships
            $relationships.forEach(rel => {
                // Check if both source and target are in the learning path
                const sourceInPath = learningPath.suggested_path.some(node => node.id === rel.source_id);
                const targetInPath = learningPath.suggested_path.some(node => node.id === rel.target_id);

                if (sourceInPath && targetInPath && graph.hasNode(rel.source_id) && graph.hasNode(rel.target_id)) {
                    // Check if an edge already exists between these nodes
                    if (!graph.hasEdge(rel.source_id, rel.target_id) && !graph.hasEdge(rel.target_id, rel.source_id)) {
                        graph.addEdge(rel.source_id, rel.target_id, {
                            size: 1,
                            color: getRelationshipColor(rel.relation_type),
                            type: 'line',
                            hover_color: '#000',
                            label: rel.relation_type,
                        });
                    }
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

            isLoading.set(false);
        } else {
            if (!container) {
                error.set('Graph container not found');
            } else if (!Graph || !Sigma) {
                error.set('Graph libraries not loaded');
            } else if (!learningPath || !learningPath.suggested_path.length) {
                error.set('No learning path data available');
            }
            isLoading.set(false);
        }
    }

    onMount(async () => {
        if (typeof window !== 'undefined') {
            try {
                const sigmaModule = await import('sigma');
                const graphologyModule = await import('graphology');

                Sigma = sigmaModule.default;
                Graph = graphologyModule.default;

                // Fetch relationships before initializing the graph
                await fetchRelationships();

                // Initialize graph after modules and data are loaded
                initializeGraph();
            } catch (err) {
                console.error('Failed to load graph libraries or fetch data:', err);
                error.set('Failed to load graph visualization libraries or fetch data');
                isLoading.set(false);
            }
        }
    });

    // Re-initialize graph when learning path or relationships change
    $: if (learningPath && Graph && Sigma && $relationships) {
        initializeGraph();
    }
</script>

<div class="relative w-full h-[400px] bg-gray-50 rounded-lg overflow-hidden">
    {#if $isLoading}
        <div class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    {/if}

    {#if $error}
        <div class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div class="text-red-500 text-center p-4">
                <p class="font-semibold">Error</p>
                <p>{$error}</p>
            </div>
        </div>
    {/if}

    <div id="learning-path-graph" class="w-full h-full"></div>

    <!-- Legend -->
    <div class="absolute right-4 bottom-4 bg-white p-3 rounded-lg shadow-md text-sm">
        <h3 class="font-medium mb-2">Legend</h3>

        <div class="space-y-1">
            <h4 class="font-medium mt-1">Mastery Levels:</h4>
            <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" style="background-color: #FFD700;"></div>
                <span>Not Started/Beginner</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" style="background-color: #DAA520;"></div>
                <span>Intermediate</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" style="background-color: #B8860B;"></div>
                <span>Advanced/Expert</span>
            </div>

            <h4 class="font-medium mt-3">Relationships:</h4>
            <div class="flex items-center gap-2">
                <div class="w-4 h-1" style="background-color: #4CAF50;"></div>
                <span>Learning Path</span>
            </div>
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
        </div>
    </div>
</div>

<style>
    #learning-path-graph {
        width: 100%;
        height: 100%;
    }
</style>
