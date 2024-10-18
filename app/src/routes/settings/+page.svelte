<script>
    import { onMount } from 'svelte';
    import Navbar from "@/components/Navbar.svelte";

    let version = 'no version yet';
    const API_URL = 'https://api-stage.csai.site';

    onMount(async () => {
        try {
            const response = await fetch(`${API_URL}/version`);
            console.log("API URL:", API_URL);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            version = data.version;
        } catch (error) {
            console.error('Error fetching version:', error);
        }
    });
</script>

<Navbar/>
<p>UI Version: {version}</p>
