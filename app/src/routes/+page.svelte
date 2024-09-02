<script lang="ts">
    import Navbar from "@/components/Navbar.svelte";
    import { signIn, signOut } from "@auth/sveltekit/client";
    import { page } from "$app/stores";
    console.log($page.data.session);
</script>

<Navbar />
<div class="p-24 container">
    {#if $page.data.session}
        <h1>You are logged in</h1>
        {#if $page.data.session.user?.image}
            <img
                    src={$page.data.session.user?.image}
                    alt="User Profile"
                    class="w-12 h-12"
            >
        {/if}
        <p>Signed in as {$page.data.session.user?.name}</p>
        <p>Your email is {$page.data.session.user?.email}</p>
        <p>Your session expires {$page.data.session.expires}</p>
        <button on:click={() => signOut()} class="bg-blue-500 py-1 px-2 text-white font-bold mt-4">Sign out</button>
    {:else}
        <h1>You are not logged in</h1>
        <h1>Welcome to Our Site</h1>
        <div class="auth-links">
            <a href="/signup" class="auth-btn">Sign Up</a>
            <a href="/login" class="auth-btn">Log In</a>
        </div>
    {/if}
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
    }

    .auth-links {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 2rem;
    }

    .auth-btn {
        flex: 1;
        padding: 0.5rem 1rem;
        background-color: #0070f3;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        text-align: center;
    }

    .auth-btn:hover {
        background-color: #005bb5;
    }

    .auth-links a {
        min-width: 120px;
        text-align: center;
    }
</style>
