<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { signIn } from "@auth/sveltekit/client";
    import { Github, Loader2 } from 'lucide-svelte';

    let isLoading = false;

    // List of quotes
    const quotes = [
        {
            text: "Controlling complexity is the essence of computer programming.",
            author: "Brian Kernighan"
        },
        {
            text: "The best way to learn is to do; the worst way to teach is to talk.",
            author: "Donald Knuth"
        },
        {
            text: "Computer science is no more about computers than astronomy is about telescopes.",
            author: "Edsger Dijkstra"
        },
        {
            text: "He who refuses to do arithmetic is doomed to talk nonsense.",
            author: "John McCarthy"
        },
        {
            text: "Simplicity is prerequisite for reliability.",
            author: "Edsger Dijkstra"
        },
        {
            text: "Programs must be written for people to read, and only incidentally for machines to execute.",
            author: "Harold Abelson"
        },
        {
            text: "The purpose of computing is insight, not numbers.",
            author: "Richard Hamming"
        },
        {
            text: "Premature optimization is the root of all evil.",
            author: "Donald Knuth"
        },
        {
            text: "Learning to write programs stretches your mind, and helps you think better.",
            author: "Bill Gates"
        },
        {
            text: "The best way to predict the future is to invent it.",
            author: "Alan Kay"
        }
    ];

    // Randomly select a quote
    let selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];

    async function handleSignIn() {
        isLoading = true;
        await signIn("github");
        isLoading = false;
    }
</script>

<!-- Full-page layout, no scrolling -->
<div class="container relative h-screen flex items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
    <!-- Login button in the top-right corner -->
    <Button href="/examples/authentication" variant="ghost" class="absolute right-4 top-4 md:right-8 md:top-8">
        Login
    </Button>

    <!-- Left side with background image and randomly selected quote -->
    <div class="relative hidden h-full flex-col text-white lg:flex dark:border-r">
        <div
                class="absolute inset-0 bg-cover"
                style="background-image: url(https://images.unsplash.com/photo-1637946175559-22c4fe13fc54?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGFic3RyYWN0JTIwJTIwZ2VvbWV0cmljJTIwZGFya3xlbnwwfHwwfHx8MA%3D%3D);"
        />
        <div class="relative z-20 p-10 text-lg font-medium">
            Smart Seminarian
        </div>
        <div class="relative z-20 mt-auto p-10">
            <blockquote class="space-y-2">
                <p class="text-lg">
                    &ldquo;{selectedQuote.text}&rdquo;
                </p>
                <footer class="text-sm">{selectedQuote.author}</footer>
            </blockquote>
        </div>
    </div>

    <!-- Right side with GitHub login button -->
    <div class="flex items-center justify-center p-8 h-full">
        <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div class="flex flex-col space-y-2 text-center">
                <h1 class="text-2xl font-semibold tracking-tight">Login with GitHub</h1>
                <p class="text-muted-foreground text-sm">
                    Use your GitHub account to log in.
                </p>
            </div>

            <!-- GitHub login button -->
            <Button on:click={handleSignIn} variant="outline" class="w-full">
                {#if isLoading}
                    <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                {:else}
                    <Github class="mr-2 h-4 w-4" />
                    Login with GitHub
                {/if}
            </Button>

            <!-- Terms of Service and Privacy Policy -->
            <p class="text-muted-foreground px-8 text-center text-sm">
                By logging in, you agree to our
                <a href="/terms" class="hover:text-primary underline underline-offset-4">
                    Terms of Service
                </a>
                and
                <a href="/privacy" class="hover:text-primary underline underline-offset-4">
                    Privacy Policy
                </a>
                .
            </p>
        </div>
    </div>
</div>
