<!-- src/routes/+page.svelte -->
<script>
</script>

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

<div class="container">
    <h1>Welcome to Our Site</h1>
    <a href="/signup">Sign Up</a>
    <a href="/login">Log In</a>
    <a href="/dashboard">Dashboard</a>
</div>
