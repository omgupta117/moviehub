export function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/'/g, "&#39;")
              .replace(/"/g, '&quot;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
}

export function formatRating(rating) {
    return rating ? rating.toFixed(1) : 'NR';
}

export function getYear(dateString) {
    return dateString ? dateString.split('-')[0] : '';
}
