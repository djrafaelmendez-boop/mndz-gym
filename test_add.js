import fs from 'fs';

async function test() {
    try {
        const loginRes = await fetch('http://localhost:5001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        if (!token) throw new Error("Login failed");
        
        console.log("Token:", token);
        
        const schedRes = await fetch('http://localhost:5001/api/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ routineId: 1, date: new Date().toISOString() })
        });
        
        const responseText = await schedRes.text();
        console.log("Schedule Response:", responseText);
    } catch(e) {
        console.error("Test failed:", e);
    }
}

test();
