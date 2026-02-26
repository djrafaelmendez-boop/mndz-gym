const API_BASE = 'https://mndz-gym-api.onrender.com/api';

async function check() {
    console.log("Fetching production exercises...");
    // Let's create a test login, or just fetch if there's a public endpoint?
    // Wait, GET /api/exercises is authenticated.
    // I will just login with the test account I made in the browser subagent.
    const loginRes = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'Password123!' })
    });
    const loginData = await loginRes.json();
    if (!loginData.token) {
        console.error("Login failed:", loginData);
        process.exit(1);
    }

    const exRes = await fetch(`${API_BASE}/exercises`, {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    const exercises = await exRes.json();
    const bench = exercises.find(e => e.name === 'Barbell Bench Press');
    console.log("Barbell Bench Press data:", bench);
}

check();
