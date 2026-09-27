# MovieHub 🎬

MovieHub is a movie discovery website built for people who enjoy finding something good to watch without digging through multiple platforms.

You can explore trending movies, search for a specific title, and open a movie to see its details like rating, runtime, genres, cast, crew, and overview.

The project uses the TMDB API for movie data and an Express.js backend to handle API requests securely.

## Live Demo

🌐 https://moviehub-2-i72z.onrender.com

## What you can do

- Browse trending movies
- Search for movies by title
- Open a detailed movie page
- Check ratings, genres, runtime and release year
- View cast, director and writer information
- Open the movie directly on IMDb
- Save movies to a personal watchlist
- Use the site comfortably on desktop and mobile

## Tech Stack

**Frontend**
- HTML
- CSS
- JavaScript

**Backend**
- Node.js
- Express.js

**API**
- TMDB API

**Deployment**
- Render

## How it works

The frontend doesn't communicate directly with TMDB using the API key.

Instead, requests go through the Express server:

```text
Browser → Express Server → TMDB API
                       ↓
                  Movie Data
                       ↓
                    Browser
