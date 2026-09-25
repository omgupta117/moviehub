import { fetchFromAPI, IMG_BASE_URL, IMG_LARGE_URL } from './api.js';
import { store } from './store.js';
import { escapeHtml, formatRating, getYear } from './utils.js';

const App = {
    currentView: 'home',
    
    elements: {
        views: document.querySelectorAll('.view'),
        navLinks: document.querySelectorAll('.nav-link'),
        navbar: document.getElementById('navbar'),
        navLinksContainer: document.querySelector('.nav-links'),
        currentYear: document.getElementById('current-year'),
        
        // Search
        searchInput: document.getElementById('main-search-input'),
        searchGrid: document.getElementById('search-results-grid'),
        searchError: document.getElementById('search-error'),
        searchInfo: document.getElementById('search-results-info'),
        searchLoading: document.getElementById('search-loading'),
        
        // Popular
        popularGrid: document.getElementById('popular-movies-grid'),
        popularLoading: document.getElementById('popular-loading'),
        
        // Watchlist
        watchlistGrid: document.getElementById('watchlist-grid'),
        watchlistEmpty: document.getElementById('watchlist-empty'),
        
        // Details
        detailsContainer: document.getElementById('movie-details-content'),
        detailsBackdrop: document.getElementById('details-backdrop'),
        detailsError: document.getElementById('details-error'),
        detailsLoading: document.getElementById('details-loading'),
        similarSection: document.getElementById('similar-movies-section'),
        similarGrid: document.getElementById('similar-movies-grid')
    },

    init() {
        if (this.elements.currentYear) {
            this.elements.currentYear.textContent = new Date().getFullYear();
        }
        
        this.bindEvents();
        this.navigateTo('home');
    },

    bindEvents() {
        // Global navigation listeners (delegated)
        document.body.addEventListener('click', (e) => {
            const navLink = e.target.closest('[data-nav-target]');
            if (navLink) {
                e.preventDefault();
                this.navigateTo(navLink.dataset.navTarget);
            }

            if (e.target.closest('[data-action="mobile-menu"]')) {
                this.elements.navLinksContainer.classList.toggle('active');
            }

            if (e.target.closest('[data-action="back"]')) {
                this.navigateTo('search');
            }
            
            if (e.target.closest('[data-action="search"]')) {
                this.performSearch();
            }

            const watchlistBtn = e.target.closest('.btn-watchlist-toggle');
            if (watchlistBtn) {
                e.stopPropagation();
                this.handleWatchlistToggle(watchlistBtn);
            }
        });

        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performSearch();
            });
        }

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) this.elements.navbar.classList.add('scrolled');
            else this.elements.navbar.classList.remove('scrolled');
        });
    },

    navigateTo(viewId) {
        this.elements.views.forEach(view => view.classList.remove('active'));
        const targetView = document.getElementById(`${viewId}-view`);
        
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewId;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        if (this.elements.navLinksContainer.classList.contains('active')) {
            this.elements.navLinksContainer.classList.remove('active');
        }
        
        this.elements.navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.navTarget === viewId);
        });
        
        if (viewId === 'home') this.loadPopularMovies();
        if (viewId === 'watchlist') this.renderWatchlist();
        if (viewId === 'search' && this.elements.searchInput) {
            setTimeout(() => this.elements.searchInput.focus(), 100);
        }
    },

    generateSkeletons(count, element) {
        if (!element) return;
        element.innerHTML = Array(count).fill('<div class="skeleton skeleton-card"></div>').join('');
        element.classList.remove('hidden');
    },

    async loadPopularMovies() {
        if (this.elements.popularGrid.children.length > 0) return;
        
        this.generateSkeletons(10, this.elements.popularLoading);
        
        const data = await fetchFromAPI('/trending/movie/week');
        this.elements.popularLoading.classList.add('hidden');
        this.elements.popularGrid.innerHTML = '';
        
        if (!data || !data.results) {
            this.elements.popularGrid.innerHTML = '<div class="error-state">Failed to load trending movies. Please try again later.</div>';
            this.elements.popularGrid.classList.remove('hidden');
            return;
        }
        
        this.renderMovies(data.results.slice(0, 10), this.elements.popularGrid);
        this.elements.popularGrid.classList.remove('hidden');
    },

    async performSearch() {
        const query = this.elements.searchInput.value.trim();
        
        this.elements.searchGrid.innerHTML = '';
        this.elements.searchError.classList.add('hidden');
        this.elements.searchInfo.classList.add('hidden');
        
        if (!query) {
            this.elements.searchInfo.innerHTML = '<p>Please enter a search term.</p>';
            this.elements.searchInfo.classList.remove('hidden');
            return;
        }
        
        this.generateSkeletons(12, this.elements.searchLoading);
        
        const data = await fetchFromAPI(`/search/movie?query=${encodeURIComponent(query)}`);
        this.elements.searchLoading.classList.add('hidden');
        
        if (!data || !data.results) {
            this.elements.searchError.innerHTML = '<p>Failed to fetch search results. Please check your connection and try again.</p>';
            this.elements.searchError.classList.remove('hidden');
            return;
        }
        
        if (data.results.length === 0) {
            this.elements.searchInfo.innerHTML = `<p>No results found for "<strong>${escapeHtml(query)}</strong>". Try a different term.</p>`;
            this.elements.searchInfo.classList.remove('hidden');
            return;
        }
        
        this.renderMovies(data.results, this.elements.searchGrid);
    },

    renderMovies(movies, container) {
        container.innerHTML = '';
        movies.forEach(movie => {
            if (!movie.poster_path) return;
            
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            
            card.addEventListener('click', () => this.loadMovieDetails(movie.id));
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.loadMovieDetails(movie.id);
            });
            
            const inWatchlist = store.isInWatchlist(movie.id);
            const safeTitle = escapeHtml(movie.title);
            
            // Note: button has class btn-watchlist-toggle for event delegation
            card.innerHTML = `
                <img src="${IMG_BASE_URL}${movie.poster_path}" alt="${safeTitle} poster" class="movie-poster" loading="lazy">
                <div class="movie-overlay">
                    <h3 class="movie-title">${safeTitle}</h3>
                    <div class="movie-meta">
                        <span class="movie-rating">★ ${formatRating(movie.vote_average)}</span>
                    </div>
                    <button class="btn-card btn-watchlist-toggle" 
                            data-movie-id="${movie.id}" 
                            data-movie-title="${safeTitle}" 
                            data-movie-poster="${movie.poster_path}"
                            aria-label="${inWatchlist ? 'Remove from' : 'Add to'} watchlist">
                        ${inWatchlist ? '✓ In Watchlist' : '+ Watchlist'}
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    },

    handleWatchlistToggle(btnElement) {
        const movie = {
            id: parseInt(btnElement.dataset.movieId, 10),
            title: btnElement.dataset.movieTitle,
            poster_path: btnElement.dataset.moviePoster
        };
        
        const added = store.toggleWatchlist(movie);
        
        if (this.currentView === 'watchlist') {
            this.renderWatchlist();
        } else {
            btnElement.innerHTML = added ? '✓ In Watchlist' : '+ Watchlist';
            btnElement.setAttribute('aria-label', added ? 'Remove from watchlist' : 'Add to watchlist');
        }
    },

    renderWatchlist() {
        this.elements.watchlistGrid.innerHTML = '';
        const watchlist = store.getWatchlist();
        
        if (watchlist.length === 0) {
            this.elements.watchlistEmpty.classList.remove('hidden');
            this.elements.watchlistGrid.classList.add('hidden');
        } else {
            this.elements.watchlistEmpty.classList.add('hidden');
            this.elements.watchlistGrid.classList.remove('hidden');
            this.renderMovies(watchlist, this.elements.watchlistGrid);
        }
    },

    async loadMovieDetails(movieId) {
        this.navigateTo('details');
        
        this.elements.detailsContainer.classList.add('hidden');
        this.elements.detailsError.classList.add('hidden');
        this.elements.detailsBackdrop.style.backgroundImage = 'none';
        
        this.generateSkeletons(1, this.elements.detailsLoading);
        
        const movie = await fetchFromAPI(`/movie/${movieId}?append_to_response=credits`);
        
        this.elements.detailsLoading.classList.add('hidden');
        
        if (!movie) {
            this.elements.detailsError.innerHTML = '<p>Failed to load movie details. Please try again.</p><button class="btn-primary" data-action="back">Go Back</button>';
            this.elements.detailsError.classList.remove('hidden');
            return;
        }
        
        if (movie.backdrop_path) {
            this.elements.detailsBackdrop.style.backgroundImage = `url(${IMG_LARGE_URL}${movie.backdrop_path})`;
        }
        
        const inWatchlist = store.isInWatchlist(movie.id);
        const safeTitle = escapeHtml(movie.title);
        const posterSrc = movie.poster_path ? `${IMG_BASE_URL}${movie.poster_path}` : 'placeholder.jpg';
        
        const yearHtml = movie.release_date ? `<span class="tag">${getYear(movie.release_date)}</span>` : '';
        const runtimeHtml = movie.runtime ? `<span class="tag">${movie.runtime} min</span>` : '';
        const imdbHtml = movie.imdb_id ? `<a href="https://www.imdb.com/title/${movie.imdb_id}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="display: inline-block; text-decoration: none;">View on IMDb</a>` : '';
        
        this.elements.detailsContainer.innerHTML = `
            <div class="details-poster"><img src="${posterSrc}" alt="${safeTitle} poster"></div>
            <div class="details-info">
                <h2 class="details-title">${safeTitle}</h2>
                <div class="details-meta-tags">
                    <span class="tag rating-tag">★ ${formatRating(movie.vote_average)}</span>
                    ${yearHtml}
                    ${runtimeHtml}
                </div>
                <p class="details-overview">${escapeHtml(movie.overview) || 'No overview available.'}</p>
                <div style="margin-top: 20px;">
                    <button class="btn-primary btn-watchlist-toggle" 
                            data-movie-id="${movie.id}" 
                            data-movie-title="${safeTitle}" 
                            data-movie-poster="${movie.poster_path}"
                            style="margin-right: 10px;">
                        ${inWatchlist ? '✓ Remove from Watchlist' : '+ Add to Watchlist'}
                    </button>
                    ${imdbHtml}
                </div>
            </div>
        `;
        this.elements.detailsContainer.classList.remove('hidden');
        
        this.loadSimilarMovies(movieId);
    },

    async loadSimilarMovies(movieId) {
        this.elements.similarGrid.innerHTML = '';
        this.elements.similarSection.classList.remove('hidden');
        
        const data = await fetchFromAPI(`/movie/${movieId}/similar`);
        
        if (data && data.results && data.results.length > 0) {
            this.renderMovies(data.results.slice(0, 5), this.elements.similarGrid);
        } else {
            this.elements.similarSection.classList.add('hidden');
        }
    }
};

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => App.init());
