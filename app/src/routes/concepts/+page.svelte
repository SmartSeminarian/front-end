<script lang="ts">
    import Activity from "lucide-svelte/icons/activity";
    import ArrowUpRight from "lucide-svelte/icons/arrow-up-right";
    import CircleUser from "lucide-svelte/icons/circle-user";
    import CreditCard from "lucide-svelte/icons/credit-card";
    import DollarSign from "lucide-svelte/icons/dollar-sign";
    import Menu from "lucide-svelte/icons/menu";
    import Package2 from "lucide-svelte/icons/package-2";
    import Search from "lucide-svelte/icons/search";
    import Users from "lucide-svelte/icons/users";

    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Sheet from "$lib/components/ui/sheet/index.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import Navbar from "$lib/components/Navbar.svelte";
</script>

<div class="flex min-h-screen w-full flex-col">
    <Navbar />
    <main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">

        <div class="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <Card.Root class="xl:col-span-2">
                <Card.Header class="flex flex-row items-center">
                    <div class="grid gap-2">
                        <Card.Title>What is the Stdlib?</Card.Title>
                        <Card.Description>The C Standard Library (stdlib) is a collection of pre-written code in C that provides essential functions and macros for tasks such as input/output operations, memory management, string manipulation, mathematical computations, and more</Card.Description>
                    </div>
                    <Button href="##" size="sm" class="ml-auto gap-1">
                        View All
                        <ArrowUpRight class="h-4 w-4" />
                    </Button>
                </Card.Header>
            </Card.Root>
            <Card.Root>
                <Card.Header>
                    <Card.Title>Your Learning curve</Card.Title>
                </Card.Header>
                <Card.Content class="grid gap-8">
                    <div class="flex items-center gap-4">

                        <div class="grid gap-1">
                            <p class="text-sm font-medium leading-none">Introduction to C</p>
                            <p class="text-sm text-muted-foreground">Exercise, Reading</p>
                        </div>
                        <div class="ml-auto font-medium">20 min</div>
                    </div>
                    <div class="flex items-center gap-4">

                        <div class="grid gap-1">
                            <p class="text-sm font-medium leading-none">C Basics</p>
                            <p class="text-sm text-muted-foreground">Reading</p>
                        </div>
                        <div class="ml-auto font-medium">30 min</div>
                    </div>
                    <div class="flex items-center gap-4">

                        <div class="grid gap-1">
                            <p class="text-sm font-medium leading-none">Syntax</p>
                            <p class="text-sm text-muted-foreground">Reading</p>
                        </div>
                        <div class="ml-auto font-medium">20 min</div>
                    </div>
                    <div class="flex items-center gap-4">

                        <div class="grid gap-1">
                            <p class="text-sm font-medium leading-none">Fundamentals 2</p>
                            <p class="text-sm text-muted-foreground">Reading</p>
                        </div>
                        <div class="ml-auto font-medium">20 min</div>
                    </div>
                    <div class="flex items-center gap-4">

                        <div class="grid gap-1">
                            <p class="text-sm font-medium leading-none">Fundamentals 3</p>
                            <p class="text-sm text-muted-foreground">Reading</p>
                        </div>
                        <div class="ml-auto font-medium">20 min</div>
                    </div>
                </Card.Content>
            </Card.Root>
        </div>
    </main>
</div>
