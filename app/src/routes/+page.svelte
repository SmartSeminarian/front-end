<script lang="ts">
    import Navbar from "$lib/components/Navbar.svelte";
    import { signIn, signOut } from "@auth/sveltekit/client";
    import { page } from '$app/stores';
    import { onMount } from "svelte";
    import { setCookie, getCookie, deleteCookie } from '$lib/cookies';
    import { PUBLIC_VITE_API_URL, PUBLIC_VITE_API_TOKEN} from "$env/static/public";

    let sessionId: string | null = "No Session ID, You need to log in";

    function deleteAllCookies() {
        const cookies = document.cookie.split(';');
        cookies.forEach((cookie) => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
    }

    const handleSignOut = () => {
        deleteAllCookies();
        signOut();
    };

    onMount(() => {
        sessionId = getCookie('sessionID');

        if (!sessionId) {
            const session = $page.data.session;
            if (session) {
                fetch(`${PUBLIC_VITE_API_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        github_username: session.user?.name,
                        token: PUBLIC_VITE_API_TOKEN
                    })
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        sessionId = data['session_id'] || "No Session ID returned";
                        if (sessionId != null) {
                            setCookie('sessionID', sessionId, 7); // Cookie expires in 7 days
                        }
                    })
                    .catch(error => {
                        console.error("Error fetching session ID:", error);
                        sessionId = "Error fetching session ID";
                    });
            }
        }
    });
</script>

<Navbar />
<div class="p-24">
    {#if $page.data.session}
        <h1>You are logged in</h1>
        {#if $page.data.session.user?.image}
            <img src={$page.data.session.user?.image} alt="User Profile" class="w-12 h-12">
        {/if}
        <p>Signed in as {$page.data.session.user?.name}</p>
        <p>Your email is {$page.data.session.user?.email}</p>
        <p>Your Session expires {$page.data.session.expires}</p>
        <p>Seminarian-Session-ID: {sessionId}</p>
        <button on:click={() => handleSignOut()} class="bg-blue-500 py-1 px-2 text-white font-bold">Sign out</button>
    {:else}
        <h1>You are not logged in</h1>
        <h1>Welcome to Our Site</h1>
        <a href="/signup">Sign Up</a>
        <a href="/login">Log In</a>
        <p>Seminarian-Session-ID: {sessionId}</p>
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
    a {
        margin: 1rem;
        padding: 0.5rem 1rem;
        background-color: #0070f3;
        color: white;
        text-decoration: none;
        border-radius: 5px;
    }
    a:hover {
        background-color: #005bb5;
    }
</style>
