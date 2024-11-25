<script lang="ts">
    import Navbar from "@/components/Navbar.svelte";

    interface Developer {
        name: string;
        description: string;
    }

    const developers: Developer[] = [
        {
            name: "Kirill Krinkin",
            description: "Project Lead & Research"
        },
        {
            name: "Zakhar Mostovoi",
            description: "Backend Development"
        },
        {
            name: "Michalis Christodoulou",
            description: "CI/CD"
        },
        {
            name: "Heidi Albarazi",
            description: "Frontend Development & UI/UX Design"
        }
    ];

    const projectDescription: string = `
        Smart Seminarian Description
    `;
</script>

<Navbar />

<section class="about-us">
    <div class="header">
        <h1>About Us</h1>
        <p>Meet the passionate team behind our innovative project.</p>
    </div>

    <div class="team">
        {#each developers as developer}
            <div class="team-member">
                <div class="avatar"></div>
                <h2>{developer.name}</h2>
                <p>{developer.description}</p>
            </div>
        {/each}
    </div>

    <div class="project">
        <h2>Our Project</h2>
        <p>{projectDescription}</p>
    </div>
</section>

<style>
    .about-us {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 20px;
    }

    .header {
        text-align: center;
        margin-bottom: 60px;
    }

    .header h1 {
        font-size: 2.5rem;
        font-weight: bold;
    }

    .header p {
        margin-top: 10px;
        font-size: 1.2rem;
        color: #333333;
    }

    .team {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 40px;
        justify-items: center;
    }

    .team-member {
        text-align: center;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
    }

    .team-member .avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: #f0f0f0;
        margin: 0 auto 20px;
    }

    .team-member h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 10px;
    }

    .team-member p {
        font-size: 1rem;
        color: #333333;
        line-height: 1.5;
    }

    .project {
        text-align: center;
        margin-top: 80px;
    }

    .project h2 {
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 20px;
    }

    .project p {
        font-size: 1.2rem;
        color: #333333;
        line-height: 1.8;
        max-width: 800px;
        margin: 0 auto;
    }
</style>
