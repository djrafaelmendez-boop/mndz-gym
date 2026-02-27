const API_BASE = 'https://mndz-gym-api.onrender.com/api';

async function checkPatch() {
    console.log("Checking patch API...");
    try {
        const res = await fetch(`${API_BASE}/patch-debug`);
        if (!res.ok) {
            console.log("Failed with status:", res.status);
            return;
        }
        const data = await res.json();
        console.log("Patch Result:", data);
    } catch (err) {
        console.log("Error:", err.message);
    }
}

checkPatch();
