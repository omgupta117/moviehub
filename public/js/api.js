const API_BASE_URL = "/api/tmdb";
export const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";
export const IMG_LARGE_URL = "https://image.tmdb.org/t/p/w1280";

export async function fetchFromAPI(endpoint) {
    try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error('Fetch Error:', error);
        return null;
    }
}
