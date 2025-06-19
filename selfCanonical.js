document.addEventListener('DOMContentLoaded', () => {
    try {
        const url = new URL(window.location.href);
        if (!['http:', 'https:'].includes(url.protocol)) {
            console.warn('selfCanonical: Non-HTTP(S) URL detected, skipping canonical link creation');
            return;
        }
        url.search = '';
        url.hash = '';
        const existing = document.querySelector('link[rel="canonical"]');
        if (existing) {
            existing.href = url.toString();
        } else {
            const link = document.createElement('link');
            link.rel = 'canonical';
            link.href = url.toString();
            document.head.appendChild(link);
        }
    } catch (error) {
        console.error('Failed to set canonical URL:', error);
        // Fallback: ensure we don't break page functionality
        // The page will continue to work without the canonical link
    }
});