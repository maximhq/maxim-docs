(function() {
    function injectFooter() {
        // Check if footer already exists
        if (document.getElementById('custom-footer')) {
            return;
        }

        // Compliance logo CDN URLs
        const socPath = 'https://cdn.prod.website-files.com/665ab0daac869acad030a349/66fe99bae027e906828812ed_21972-312_SOC_NonCPA.png';
        const hipaaPath = 'https://cdn.prod.website-files.com/665ab0daac869acad030a349/674059445b7e5f0567d4aa54_image%20(15).png';
        const isoPath = 'https://cdn.prod.website-files.com/665ab0daac869acad030a349/6703769213e45e2379621c47_ISO%2027001.png';
        const gdprPath = 'https://cdn.prod.website-files.com/665ab0daac869acad030a349/66fe9aa86579ed03ca44fde2_PNG_GDPR-e1672263252689.png';

        // Create footer HTML
        const footerHTML = `
            <section class="section-footer" id="custom-footer">
                <div class="w-layout-blockcontainer container w-container">
                    <div class="strip-wrapper ptblr">
                        <div class="strip-box">
                            <div class="strip-left">
                                <div class="strip-top-row">
                                    <h3 class="h3 dark semibold mb16">Ship your AI agents 5x faster ⚡️</h3>
                                    <div class="benefits-title-subtext">
                                        Get in touch to learn how AI teams are saving 100s of hours of development time<br>
                                    </div>
                                </div>
                                <div class="strip-bottom-row-v2">
                                    <a href="https://app.getmaxim.ai/sign-up" class="button-dark-icon w-button">Get started free</a>
                                    <a href="/demo" class="button-dark-border w-button">Book a demo</a>
                                </div>
                            </div>
                        </div>
                        <div class="footer-wrapper">
                            <div class="footer-left">
                                <div class="footer-left-top">
                                    <img src="https://cdn.prod.website-files.com/665ab0daac869acad030a349/666c450d9d94389d4219bf75_logo-white.svg" loading="lazy" alt="" class="footer-logo">
                                    <div class="copyright-text">
                                        © Copyright H3 Labs Inc, <br>All rights reserved.
                                    </div>
                                </div>
                                <div class="footer-badge-box">
                                    <img src="${socPath}" loading="lazy" width="45" alt="SOC Compliance" class="compliance-logo">
                                    <img src="${hipaaPath}" loading="lazy" width="45" alt="HIPAA Compliance" class="compliance-logo">
                                    <img src="${isoPath}" loading="lazy" width="45" alt="ISO Compliance" class="compliance-logo">
                                    <img src="${gdprPath}" loading="lazy" width="45" alt="GDPR Compliance" class="compliance-logo">
                                </div>
                                <div class="footer-left-bottom">
                                    <a href="https://x.com/getmaximai" target="_blank" rel="noopener noreferrer" class="footer-social-link twitter w-inline-block"></a>
                                    <a href="https://www.linkedin.com/company/maxim-ai" target="_blank" rel="noopener noreferrer" class="footer-social-link linkedin w-inline-block"></a>
                                    <a href="https://github.com/maximhq" target="_blank" rel="noopener noreferrer" class="footer-social-link github w-inline-block"></a>
                                    <a href="https://discord.gg/WJzTeWDEsX" target="_blank" rel="noopener noreferrer" class="footer-social-link discord w-inline-block"></a>
                                </div>
                                <div class="footer-left-bottom-betterstack">
                                    <div class="w-embed w-iframe">
                                        <iframe src="https://status.getmaxim.ai/badge?theme=dark" width="250" height="30" frameborder="0" scrolling="no" title="Status"></iframe>
                                    </div>
                                </div>
                            </div>
                            <div class="footer-right">
                                <div class="footer-link-box">
                                    <div class="footer-link-title">Integrations</div>
                                    <a href="https://www.getmaxim.ai/docs/sdk/python/integrations/langchain/langchain" target="_blank" rel="noopener noreferrer" class="footer-link">Langchain</a>
                                    <a href="https://www.getmaxim.ai/docs/sdk/python/integrations/langgraph/langgraph-without-decorator" target="_blank" rel="noopener noreferrer" class="footer-link">LangGraph</a>
                                    <a href="https://www.getmaxim.ai/docs/sdk/python/integrations/openai/one-line-integration" target="_blank" rel="noopener noreferrer" class="footer-link">OpenAI</a>
                                    <a href="https://www.getmaxim.ai/docs/sdk/python/integrations/openai/agents-sdk" target="_blank" rel="noopener noreferrer" class="footer-link">OpenAI&nbsp;Agents</a>
                                    <a href="https://www.getmaxim.ai/docs/sdk/python/integrations/livekit/livekit" class="footer-link">LiveKit</a>
                                    <a href="https://www.getmaxim.ai/docs/sdk/python/integrations/crewai/crewai" target="_blank" rel="noopener noreferrer" class="footer-link">Crew&nbsp;AI</a>
                                    <a href="https://www.getmaxim.ai/docs/sdk/python/integrations/agno/agno" target="_blank" rel="noopener noreferrer" class="footer-link">Agno</a>
                                    <a href="https://www.getmaxim.ai/docs/sdk/python/integrations/litellm/litellm-sdk" target="_blank" rel="noopener noreferrer" class="footer-link">LiteLLM</a>
                                    <a href="https://www.getmaxim.ai/docs/sdk/python/integrations/litellm/litellm-proxy" target="_blank" rel="noopener noreferrer" class="footer-link">LiteLLM Proxy</a>
                                    <a href="https://www.getmaxim.ai/docs/sdk/python/integrations/litellm/litellm-proxy" target="_blank" rel="noopener noreferrer" class="footer-link">Anthropic</a>
                                    <a href="https://github.com/maximhq/maxim-cookbooks/blob/main/python/observability-online-eval/bedrock/single-line-integration.ipynb" target="_blank" rel="noopener noreferrer" class="footer-link">Bedrock</a>
                                    <a href="https://www.getmaxim.ai/docs/sdk/python/integrations/mistral/mistral" target="_blank" rel="noopener noreferrer" class="footer-link">Mistral</a>
                                </div>
                                <div class="footer-link-box">
                                    <div class="footer-link-title">Product</div>
                                    <a href="/products/experimentation" class="footer-link">Experimentation</a>
                                    <a href="/products/agent-simulation-evaluation" class="footer-link">Agent simulation &amp; evaluations</a>
                                    <a href="/products/agent-observability" class="footer-link">Agent observability</a>
                                    <a href="https://www.getmaxim.ai/bifrost" target="_blank" rel="noopener noreferrer" class="footer-link">Bifrost LLM gateway</a>
                                </div>
                                <div class="footer-link-box">
                                    <div class="footer-link-title">Platform</div>
                                    <a href="https://getmaxim.ai/docs" class="footer-link">Docs</a>
                                    <a href="/pricing" class="footer-link">Pricing</a>
                                    <a href="https://status.getmaxim.ai/" target="_blank" rel="noopener noreferrer" class="footer-link">Status</a>
                                    <a href="https://trust.getmaxim.ai/" target="_blank" rel="noopener noreferrer" class="footer-link">Trust center</a>
                                    <a href="https://www.getmaxim.ai/bifrost/oss-friends" target="_blank" rel="noopener noreferrer" class="footer-link">OSS&nbsp;friends</a>
                                </div>
                                <div class="footer-link-box">
                                    <div class="footer-link-title">Company</div>
                                    <a href="/about-us" class="footer-link">About us</a>
                                    <a href="/careers" class="footer-link">Careers</a>
                                    <a href="https://www.getmaxim.ai/blog" class="footer-link">Blog</a>
                                    <a href="/contact" class="footer-link">Contact us</a>
                                    <a href="https://www.getmaxim.ai/llms.txt" class="footer-link">LLMs.txt</a>
                                </div>
                                <div class="footer-link-box">
                                    <div class="footer-link-title">Legal</div>
                                    <a href="/terms-of-service" class="footer-link">Terms</a>
                                    <a href="/privacy-policy" class="footer-link">Privacy</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;

        // Append footer to the very end of the body (site-wide footer)
        if (document.body) {
            // Create a container for the footer
            const footerContainer = document.createElement('div');
            footerContainer.innerHTML = footerHTML;
            
            // Append footer to the end of the body (bottom of entire site)
            document.body.appendChild(footerContainer.firstElementChild);
        }
    }

    // Inject footer when DOM is ready (only once)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectFooter);
    } else {
        injectFooter();
    }
})();

