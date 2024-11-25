<script lang="ts">
    import Navbar from "$lib/components/Navbar.svelte";
    import { signIn, signOut } from "@auth/sveltekit/client";
    import { page } from '$app/stores';
    import { onMount } from "svelte";
    import { setCookie, getCookie, deleteCookie } from '$lib/cookies';
    import { PUBLIC_VITE_API_URL, PUBLIC_VITE_API_TOKEN} from "$env/static/public";

    let sessionId: string | null = "No Session ID, You need to log in";
    import Activity from "lucide-svelte/icons/activity";
    import ArrowUpRight from "lucide-svelte/icons/arrow-up-right";
    import CircleUser from "lucide-svelte/icons/circle-user";
    import CreditCard from "lucide-svelte/icons/credit-card";
    import DollarSign from "lucide-svelte/icons/dollar-sign";
    import Menu from "lucide-svelte/icons/menu";
    import Package2 from "lucide-svelte/icons/package-2";
    import Search from "lucide-svelte/icons/search";
    import Users from "lucide-svelte/icons/users";
    import Shield from "lucide-svelte/icons/shield";
    import LogOut from "lucide-svelte/icons/log-out";

    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Sheet from "$lib/components/ui/sheet/index.js";
    import * as Table from "$lib/components/ui/table/index.js";

    const API_URL = import.meta.env.VITE_API_URL;

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

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
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
                            setCookie('sessionID', sessionId, 7);
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

<div class="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
    <Card.Root class="max-w-md mx-auto">
        <Card.Header class="space-y-2">
            {#if $page.data.session}
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        {#if $page.data.session.user?.image}
                            <Avatar.Root>
                                <Avatar.Image
                                        src={$page.data.session.user?.image}
                                        alt="Profile picture"
                                />
                                <Avatar.Fallback>
                                    <CircleUser class="w-6 h-6" />
                                </Avatar.Fallback>
                            </Avatar.Root>
                        {/if}
                        <div>
                            <Card.Title class="text-2xl font-bold">
                                Welcome back!
                            </Card.Title>
                            <p class="text-sm text-gray-500">
                                {$page.data.session.user?.name}
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" class="h-6">
                        <Shield class="w-3 h-3 mr-1" />
                        Active
                    </Badge>
                </div>
            {:else}
                <Card.Title class="text-2xl font-bold text-center">
                    Welcome to Smart Seminarian
                </Card.Title>
                <Card.Description class="text-center text-gray-500">
                    Please sign in to access your account
                </Card.Description>
            {/if}
        </Card.Header>

        <Card.Content class="space-y-4">
            {#if $page.data.session}
                <div class="space-y-3">
                    <div class="flex justify-between items-center p-3 rounded-lg border">
                        <span class="text-sm font-medium">Email</span>
                        <span class="text-sm">{$page.data.session.user?.email}</span>
                    </div>
                    <div class="flex justify-between items-center p-3 rounded-lg border">
                        <span class="text-sm font-medium">Session ID</span>
                        <span class="text-sm font-mono">{sessionId}</span>
                    </div>
                    <div class="flex justify-between items-center p-3 rounded-lg border">
                        <span class="text-sm font-medium">Expires</span>
                        <span class="text-sm">{formatDateTime($page.data.session.expires)}</span>
                    </div>
                </div>
            {/if}
        </Card.Content>

        <Card.Footer class="flex justify-center p-6">
            {#if $page.data.session}
                <Button
                        variant="destructive"
                        class="w-full max-w-xs bg-ssAccentColor hover:bg-ssMiddleGray"
                        on:click={handleSignOut}
                >
                    <LogOut class="w-4 h-4 mr-2" />
                    Sign out
                </Button>
            {:else}
                <Button
                        variant="default"
                        class="w-full max-w-xs bg-ssAccentColor hover:bg-ssAccentLighter"
                        href="/login"
                >
                    <CircleUser class="w-4 h-4 mr-2" />
                    Sign in
                </Button>
            {/if}
        </Card.Footer>
    </Card.Root>
</div>