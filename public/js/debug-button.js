// Debug button functionality - CSP compliant version
(function() {
    // Debug function that logs detailed information about the page state
    function logDetailedInfo() {
        // Get page information
        const pathSegments = window.location.pathname.split('/');
        const deckName = pathSegments[pathSegments.length - 1];
        const formattedDeckName = decodeURIComponent(deckName).replace(/-/g, ' ');
        
        // Log diagnostic information
        console.log(`
---- DETAILED DIAGNOSTIC INFO ----
URL Path: ${window.location.pathname}
Extracted Deck Name: ${deckName}
Formatted Deck Name: ${formattedDeckName}
Sidebar Exists: ${!!document.getElementById('sidebar')}
Subdeck Grid Exists: ${!!document.getElementById('subdeck-grid')}
Dynamic Deck Script Loaded: ${typeof window.renderSubdecks === 'function' ? 'Yes' : 'No'}
Deck List Found: ${!!document.getElementById('deck-list')}
CSS Classes Loaded: ${!!document.querySelector('.class-block') ? 'Yes (some found)' : 'Not found'}
`);
        
        // Check for CSS application by creating a test element
        const testBlock = document.createElement('div');
        testBlock.className = 'class-block';
        testBlock.style.position = 'absolute';
        testBlock.style.visibility = 'hidden';
        document.body.appendChild(testBlock);
        const styles = window.getComputedStyle(testBlock);
        console.log(`CSS Test - Background: ${styles.backgroundColor}, Display: ${styles.display}`);
        document.body.removeChild(testBlock);
        
        // Check for jQuery 
        console.log(`jQuery available: ${typeof window.jQuery !== 'undefined' ? 'Yes' : 'No'}`);

        // Check for script sources loaded
        const scripts = document.querySelectorAll('script');
        console.log(`Scripts loaded: ${scripts.length}`);
        scripts.forEach(script => {
            if (script.src) {
                console.log(`Script: ${script.src}`);
            }
        });
    }

    // Initialize the debug button functionality
    function initDebugButton() {
        const debugButton = document.getElementById('debug-button');
        const debugInfo = document.getElementById('debug-info');

        if (!debugButton || !debugInfo) {
            console.error('Debug elements not found in page');
            return;
        }

        // Initially hide the debug panel
        debugInfo.style.display = 'none';
        
        // Add click handler
        debugButton.addEventListener('click', function() {
            if (debugInfo.style.display === 'none') {
                debugInfo.style.display = 'block';
                this.textContent = 'Hide Debug';
                // Log diagnostic info when opened
                logDetailedInfo();
            } else {
                debugInfo.style.display = 'none';
                this.textContent = 'Debug';
            }
        });
        
        console.log("Debug button handler initialized");
    }
    
    // Apply when document is ready
    if (document.readyState === 'complete') {
        initDebugButton();
    } else {
        window.addEventListener('DOMContentLoaded', function() {
            initDebugButton();
            
            // Auto-open debug panel after a short delay
            setTimeout(function() {
                const debugButton = document.getElementById('debug-button');
                if (debugButton) {
                    console.log("Auto-triggering debug info");
                    debugButton.click();
                }
            }, 1000);
        });
    }
})(); 