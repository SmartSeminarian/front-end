<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    import { signIn } from "@auth/sveltekit/client";
    import { page } from "$app/stores";
    import { goto } from '$app/navigation';

    const dispatcher = createEventDispatcher();

    // Function to check session and redirect if logged in
    const checkSessionAndRedirect = () => {
        onMount(() => {
            const unsubscribe = page.subscribe($page => {
                if ($page.data.session) {
                    goto('/dashboard');
                }
            });

            return () => unsubscribe();
        });
    };

    checkSessionAndRedirect();
</script>

<style>

</style>

<div class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
    <div class="flex items-center justify-center py-12">
        <div class="mx-auto grid w-[350px] gap-6">
            <div class="grid gap-2 text-center">
                <h1 class="text-3xl font-bold">Login</h1>
                <p class="text-balance text-muted-foreground">
                    Enter your username below to login to your account
                </p>
            </div>
            <form class="grid gap-4">
                <div class="grid gap-2">
                    <Label for="username">Username</Label>
                    <Input id="username" type="text" placeholder="Username" required />
                </div>
                <div class="grid gap-2">
                    <div class="flex items-center">
                        <Label for="password">Password</Label>
                        <a href="##" class="ml-auto inline-block text-sm underline">
                            Forgot your password?
                        </a>
                    </div>
                    <Input id="password" type="password" required />
                </div>
                <Button type="submit" class="w-full">Login</Button>
                <Button on:click={() => signIn("github")} variant="outline" class="w-full">Login with Github</Button>
            </form>
            <div class="mt-4 text-center text-sm">
                Don&apos;t have an account?
                <a href="/signup" class="underline"> Sign up </a>
            </div>
        </div>
    </div>
    <div class="hidden lg:block bg-blue-200">
        <!-- This div now has a blue background -->
    </div>
</div>
