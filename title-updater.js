// Custom script to update page titles with Maxim SDK suffix
(function () {
    function getSDKType() {
        // Check if current page is an SDK reference page and return the SDK type
        const currentPath = window.location.pathname;

        // Check for Python SDK reference pages
        if (currentPath.includes("/sdk/python")) {
            return "python";
        }

        // Check for TypeScript SDK reference pages
        if (currentPath.includes("/sdk/typescript")) {
            return "typescript";
        }

        // Not an SDK page
        return null;
    }

    function updatePageTitle() {
        const sdkType = getSDKType();

        // Only update title if this is an SDK page
        if (!sdkType) {
            return;
        }

        // Get the current page title from the frontmatter or h1
        const titleElement =
            document.querySelector("h1") || document.querySelector("[data-title]");
        let pageTitle = "";

        // Try to get title from various sources
        if (titleElement) {
            pageTitle = titleElement.textContent || titleElement.innerText || "";
        }

        // Fallback to document title if no h1 found
        if (!pageTitle) {
            pageTitle = document.title;
        }

        // Clean up the title (remove extra whitespace)
        pageTitle = pageTitle.trim();

        // Determine the appropriate suffix based on SDK type
        const suffix =
            sdkType === "python" ? "| Maxim Python SDK" : "| Maxim TypeScript SDK";

        // Only update if we have a meaningful title and it doesn't already include our suffix
        if (pageTitle && !pageTitle.includes(suffix)) {
            // Remove any existing SDK suffixes that might be there
            pageTitle = pageTitle.replace(
                /\s*\|\s*Maxim\s+(Python|TypeScript)\s+SDK.*$/,
                "",
            );

            // Also remove any other existing suffixes
            pageTitle = pageTitle.replace(/\s*\|.*$/, "");

            // Add our custom suffix
            document.title = pageTitle + " " + suffix;
        }
    }

    // Update title when page loads
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", updatePageTitle);
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

        window.addEventListener("popstate", function () {
            setTimeout(updatePageTitle, 100);
        });
    }

    // Watch for title changes using MutationObserver
    if (typeof MutationObserver !== "undefined") {
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (
                    mutation.type === "childList" ||
                    mutation.type === "characterData"
                ) {
                    // Check if title-related elements changed
                    const titleChanged = Array.from(mutation.addedNodes).some(
                        (node) =>
                            node.nodeType === Node.ELEMENT_NODE &&
                            (node.tagName === "H1" ||
                                (node.querySelector && node.querySelector("h1"))),
                    );

                    if (titleChanged || mutation.target.tagName === "TITLE") {
                        setTimeout(updatePageTitle, 50);
                    }
                }
            });
        });

        observer.observe(document, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        // Also observe the title element specifically
        const titleElement = document.querySelector("title");
        if (titleElement) {
            observer.observe(titleElement, {
                childList: true,
                characterData: true,
            });
        }
    }
})();
