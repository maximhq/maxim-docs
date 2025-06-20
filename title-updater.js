// Custom script to update page titles with Maxim Python SDK suffix
(function () {
    function isPythonSDKPage() {
        // Check if current page is a Python SDK reference page
        const currentPath = window.location.pathname;

        // Check if the path matches Python SDK reference patterns
        return currentPath.includes('/sdk/python');
    }

    function updatePageTitle() {
        // Only update title if this is a Python SDK page
        if (!isPythonSDKPage()) {
            return;
        }

        // Get the current page title from the frontmatter or h1
        const titleElement = document.querySelector('h1') || document.querySelector('[data-title]');
        let pageTitle = '';

        // Try to get title from various sources
        if (titleElement) {
            pageTitle = titleElement.textContent || titleElement.innerText || '';
        }

        // Fallback to document title if no h1 found
        if (!pageTitle) {
            pageTitle = document.title;
        }

        // Clean up the title (remove extra whitespace)
        pageTitle = pageTitle.trim();

        // Only update if we have a meaningful title and it doesn't already include our suffix
        if (pageTitle && !pageTitle.includes('| Maxim Python SDK')) {
            // Remove any existing suffixes that might be there
            pageTitle = pageTitle.replace(/\s*\|.*$/, '');

            // Add our custom suffix
            document.title = pageTitle + ' | Maxim Python SDK';
        }
    }

    // Update title when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updatePageTitle);
    } else {
        updatePageTitle();
    }

    // Also update when navigating (for SPAs)
    if (window.history && window.history.pushState) {
        const originalPushState = window.history.pushState;
        window.history.pushState = function () {
            originalPushState.apply(window.history, arguments);
            setTimeout(updatePageTitle, 100); // Small delay to ensure DOM is updated
        };

        const originalReplaceState = window.history.replaceState;
        window.history.replaceState = function () {
            originalReplaceState.apply(window.history, arguments);
            setTimeout(updatePageTitle, 100);
        };

        window.addEventListener('popstate', function () {
            setTimeout(updatePageTitle, 100);
        });
    }

    // Watch for title changes using MutationObserver
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    // Check if title-related elements changed
                    const titleChanged = Array.from(mutation.addedNodes).some(node =>
                        node.nodeType === Node.ELEMENT_NODE &&
                        (node.tagName === 'H1' || node.querySelector && node.querySelector('h1'))
                    );

                    if (titleChanged || mutation.target.tagName === 'TITLE') {
                        setTimeout(updatePageTitle, 50);
                    }
                }
            });
        });

        observer.observe(document, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // Also observe the title element specifically
        const titleElement = document.querySelector('title');
        if (titleElement) {
            observer.observe(titleElement, {
                childList: true,
                characterData: true
            });
        }
    }
})();