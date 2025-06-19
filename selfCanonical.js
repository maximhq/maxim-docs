function updateCanonical() {
    try {
        const url = new URL(window.location.href);
        if (!['http:', 'https:'].includes(url.protocol)) {
            console.warn('selfCanonical: Non-HTTP(S) URL detected, skipping canonical/og:url link creation');
            return;
        }
        url.search = '';
        url.hash = '';
        url.pathname = '/docs' + url.pathname;        
        // Remove existing canonical link if present
        const existingCanonical = document.querySelector('link[rel="canonical"]');
        if (existingCanonical) {
            console.log("existing canonical", existingCanonical);
            existingCanonical.parentNode.removeChild(existingCanonical);
        }        
        // Add canonical link
        const link = document.createElement('link');
        link.rel = 'canonical';
        link.href = url.toString();
        document.head.appendChild(link);                
    } catch (error) {
        console.error('Failed to set canonical and og:url:', error);
        // Fallback: ensure we don't break page functionality
    }
}

// Run after DOMContentLoaded and also after a short delay to catch late additions
function runCanonicalUrlUpdate() {
    updateCanonical();
    // Try again after a short delay in case tags are added late
    setTimeout(updateCanonical, 500);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    runCanonicalUrlUpdate();
} else {
    document.addEventListener('DOMContentLoaded', runCanonicalUrlUpdate);
}
