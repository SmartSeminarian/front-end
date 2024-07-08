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
</script>

<div class="flex min-h-screen w-full flex-col">
    <header class="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav
                class="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6"
        >
            <a href="##" class="flex items-center gap-2 text-lg font-semibold md:text-base">
                <Package2 class="h-6 w-6" />
                <span class="sr-only">Acme Inc</span>
            </a>
            <a href="##" class="text-foreground transition-colors hover:text-foreground">
                Smart Seminarian
            </a>
            <a href="##" class="text-muted-foreground transition-colors hover:text-foreground">
                Courses
            </a>
            <a href="##" class="text-muted-foreground transition-colors hover:text-foreground">
                Training
            </a>
            <a href="##" class="text-muted-foreground transition-colors hover:text-foreground">
                Feedback
            </a>
        </nav>
        <Sheet.Root>
            <Sheet.Trigger asChild let:builder>
                <Button
                        variant="outline"
                        size="icon"
                        class="shrink-0 md:hidden"
                        builders={[builder]}
                >
                    <Menu class="h-5 w-5" />
                    <span class="sr-only">Toggle navigation menu</span>
                </Button>
            </Sheet.Trigger>
            <Sheet.Content side="left">
                <nav class="grid gap-6 text-lg font-medium">
                    <a href="##" class="flex items-center gap-2 text-lg font-semibold">
                        <Package2 class="h-6 w-6" />
                        <span class="sr-only">Acme Inc</span>
                    </a>
                    <a href="##" class="hover:text-foreground"> Dashboard </a>
                    <a href="##" class="text-muted-foreground hover:text-foreground"> Orders </a>
                    <a href="##" class="text-muted-foreground hover:text-foreground"> Lectures </a>
                    <a href="##" class="text-muted-foreground hover:text-foreground"> Exercises </a>
                    <a href="##" class="text-muted-foreground hover:text-foreground"> Smart Seminarian </a>
                </nav>
            </Sheet.Content>
        </Sheet.Root>
        <div class="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <form class="ml-auto flex-1 sm:flex-initial">
                <div class="relative">
                    <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                            type="search"
                            placeholder="Ask a question..."
                            class="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                    />
                </div>
            </form>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                    <Button
                            builders={[builder]}
                            variant="secondary"
                            size="icon"
                            class="rounded-full"
                    >
                        <CircleUser class="h-5 w-5" />
                        <span class="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                    <DropdownMenu.Label>My Account</DropdownMenu.Label>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item>Settings</DropdownMenu.Item>
                    <DropdownMenu.Item>Support</DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item>Logout</DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>
    </header>
    <main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div class="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card.Root>
                <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Card.Title class="text-sm font-medium">Next Module</Card.Title>
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold">C Programming Basics</div>
                    <p class="text-xs text-muted-foreground">Reading Exercise</p>
                </Card.Content>
            </Card.Root>
            <Card.Root>
                <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Card.Title class="text-sm font-medium">Recommended</Card.Title>
                    <Users class="h-4 w-4 text-muted-foreground" />
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold">Stdlib</div>
                    <p class="text-xs text-muted-foreground">Coding Exercise</p>
                </Card.Content>
            </Card.Root>
            <Card.Root>
                <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Card.Title class="text-sm font-medium">Your Mistakes wrapped up</Card.Title>
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold">10 Coding Errors</div>
                    <p class="text-xs text-muted-foreground">Some description</p>
                </Card.Content>
            </Card.Root>
            <Card.Root>
                <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Card.Title class="text-sm font-medium">Exercise</Card.Title>
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold">Description</div>
                    <p class="text-xs text-muted-foreground">Description</p>
                </Card.Content>
            </Card.Root>
        </div>
        <div class="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <Card.Root class="xl:col-span-2">
                <Card.Header class="flex flex-row items-center">
                    <div class="grid gap-2">
                        <Card.Title>Next Up</Card.Title>
                        <Card.Description>What should come next?</Card.Description>
                    </div>
                    <Button href="##" size="sm" class="ml-auto gap-1">
                        View All
                        <ArrowUpRight class="h-4 w-4" />
                    </Button>
                </Card.Header>
                <Card.Content>
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head>Course</Table.Head>
                                <Table.Head class="xl:table.-column hidden">Type</Table.Head>
                                <Table.Head class="xl:table.-column hidden">Status</Table.Head>
                                <Table.Head class="xl:table.-column hidden">Date</Table.Head>
                                <Table.Head class="text-right">Time</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell>
                                    <div class="font-medium">C Programming Example 1</div>
                                    <div class="hidden text-sm text-muted-foreground md:inline">
                                        Some description of this course
                                    </div>
                                </Table.Cell>
                                <Table.Cell class="xl:table.-column hidden">C Programming Example </Table.Cell>
                                <Table.Cell class="xl:table.-column hidden">
                                    <Badge class="text-xs" variant="outline">Approved</Badge>
                                </Table.Cell>
                                <Table.Cell
                                        class="md:table.-cell xl:table.-column hidden lg:hidden"
                                >
                                    2023-06-23
                                </Table.Cell>
                                <Table.Cell class="text-right">20 min</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>
                                    <div class="font-medium">Programming 2</div>
                                    <div class="hidden text-sm text-muted-foreground md:inline">
                                        Description2
                                    </div>
                                </Table.Cell>
                                <Table.Cell class="xl:table.-column hidden">Refund</Table.Cell>
                                <Table.Cell class="xl:table.-column hidden">
                                    <Badge class="text-xs" variant="outline">Declined</Badge>
                                </Table.Cell>
                                <Table.Cell
                                        class="md:table.-cell xl:table.-column hidden lg:hidden"
                                >
                                    2023-06-24
                                </Table.Cell>
                                <Table.Cell class="text-right">15 min</Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table.Root>
                </Card.Content>
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
