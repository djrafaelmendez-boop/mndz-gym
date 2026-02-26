const API_BASE = 'https://mndz-gym-api.onrender.com/api';

async function check() {
    console.log("Checking Render API...");
    try {
        const loginRes = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'testuser', password: 'Password123!' })
        });

        if (!loginRes.ok) {
            console.log("Login failed with status:", loginRes.status);
            const text = await loginRes.text();
            console.log("Response:", text.substring(0, 100));
            return;
        }

        const loginData = await loginRes.json();

        const exRes = await fetch(`${API_BASE}/exercises`, {
            headers: { 'Authorization': `Bearer ${loginData.token}` }
        });

        if (!exRes.ok) {
            console.log("Exercises fetch failed:", exRes.status);
            return;
        }

        const exercises = await exRes.json();
        const bench = exercises.find(e => e.name === 'Barbell Bench Press');
        console.log("Barbell Bench Press data:", bench);
    } catch (err) {
        console.log("Error:", err.message);
    }
}

check();
