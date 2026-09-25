# MovieHub

A premium movie discovery platform powered by [TMDB](https://www.themoviedb.org/).

## Features

- **Trending Movies** — Browse what's popular this week
- **Movie Search** — Search by title with instant results
- **Movie Details** — View ratings, runtime, overview, and similar movies
- **Watchlist** — Save movies to a personal watchlist (localStorage)
- **IMDb Links** — Direct links to IMDb pages
- **Responsive Design** — Works on all devices from 360px to 2560px+

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v16+
- A TMDB API key ([get one here](https://www.themoviedb.org/settings/api))

### Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd MovieHub

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env and add your TMDB API key

# 4. Start the server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

```
MovieHub/
├── server.js          # Express proxy server (hides API key)
├── public/
│   ├── index.html     # SPA entry point
│   ├── style.css      # Stylesheet (responsive)
│   └── script.js      # Client-side application logic
├── .env               # Environment variables (not committed)
├── .env.example       # Environment template
├── .gitignore
├── package.json
└── README.md
```

**API Architecture:** The frontend calls `/api/tmdb/*` which is proxied by the Express server to the TMDB API. The API key never reaches the client.

## License

ISC
