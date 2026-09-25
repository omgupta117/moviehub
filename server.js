require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Dynamically import node-fetch (ESM package in CommonJS)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Validate API key at startup
if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key_here') {
    console.error('ERROR: TMDB_API_KEY is not set. Copy .env.example to .env and add your key.');
    process.exit(1);
}

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory rate limiting (per IP, 60 req/min)
const rateLimit = {};
app.use('/api/', (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    if (!rateLimit[ip]) rateLimit[ip] = [];
    rateLimit[ip] = rateLimit[ip].filter(t => now - t < 60000);
    if (rateLimit[ip].length >= 60) {
        return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    }
    rateLimit[ip].push(now);
    next();
});

// TMDB API proxy — keeps API key server-side
app.get('/api/tmdb/*splat', async (req, res) => {
    try {
        const endpoint = req.params.splat.join('/');
        
        // Basic input validation — only allow expected TMDB paths
        if (!endpoint || endpoint.includes('..')) {
            return res.status(400).json({ error: 'Bad request' });
        }
        
        const queryParams = new URLSearchParams(req.query).toString();
        const url = `${BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}${queryParams ? '&' + queryParams : ''}`;
        
        const response = await fetch(url, { timeout: 10000 });
        if (!response.ok) {
            const status = response.status === 404 ? 404 : 502;
            return res.status(status).json({ error: `TMDB returned ${response.status}` });
        }
        const data = await response.json();
        
        // Cache trending/popular endpoints for 5 min
        if (endpoint.startsWith('trending') || endpoint.startsWith('movie/popular')) {
            res.set('Cache-Control', 'public, max-age=300');
        }
        
        res.json(data);
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch data from TMDB' });
    }
});

// SPA fallback
app.get('*splat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`MovieHub server running at http://localhost:${PORT}`);
});
