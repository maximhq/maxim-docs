const jsonLd = {
	"@context": "https://schema.org",
	"@type": "WebPage",
	url: "https://www.getmaxim.ai/docs",
	name: "Maxim AI Documentation",
	description:
		"Comprehensive documentation for Maxim's end-to-end platform for AI simulation, evaluation, and observability. Learn how to build, evaluate, and monitor GenAI workflows at scale.",
	publisher: {
		"@type": "Organization",
		name: "Maxim AI",
		url: "https://www.getmaxim.ai/",
		logo: {
			"@type": "ImageObject",
			url: "https://cdn.getmaxim.ai/public/images/logo.png",
			width: 300,
			height: 60,
		},
		sameAs: ["https://twitter.com/getmaximai", "https://www.linkedin.com/company/maxim-ai", "https://www.youtube.com/@getmaximai"],
	},
	mainEntity: {
		"@type": "TechArticle",
		name: "Maxim AI Documentation",
		url: "https://www.getmaxim.ai/docs",
		headline: "Maxim AI Docs",
		description:
			"Technical documentation for Maxim AI's simulation, evaluation, and observability features including custom evaluators, workflows, and agent logs.",
		inLanguage: "en",
	},
};

function injectJsonLd() {
	const script = document.createElement("script");
	script.type = "application/ld+json";
	script.text = JSON.stringify(jsonLd);

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => {
			document.head.appendChild(script);
		});
	} else {
		document.head.appendChild(script);
	}

	return () => {
		if (script.parentNode) {
			script.parentNode.removeChild(script);
		}
	};
}

// Call the function to inject JSON-LD
const cleanup = injectJsonLd();

// Cleanup when needed
// cleanup()
