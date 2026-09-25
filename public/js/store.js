const STORAGE_KEY = 'moviehub_watchlist';

export const store = {
    watchlist: JSON.parse(localStorage.getItem(STORAGE_KEY)) || [],

    getWatchlist() {
        return this.watchlist;
    },

    isInWatchlist(id) {
        return this.watchlist.some(m => m.id === id);
    },

    toggleWatchlist(movie) {
        const index = this.watchlist.findIndex(m => m.id === movie.id);
        const added = index === -1;
        
        if (added) {
            this.watchlist.push(movie);
        } else {
            this.watchlist.splice(index, 1);
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.watchlist));
        return added;
    }
};
