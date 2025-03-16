// Console capture for debugging purposes
(function() {
    // Save the original console methods
    const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn
    };

    // Override console methods to capture output
    function captureConsole() {
        console.log = function() {
            // Call the original first
            originalConsole.log.apply(console, arguments);
            
            // Then capture to debug panel
            updateDebugPanel('log', arguments);
        };

        console.error = function() {
            originalConsole.error.apply(console, arguments);
            updateDebugPanel('error', arguments);
        };

        console.warn = function() {
            originalConsole.warn.apply(console, arguments);
            updateDebugPanel('warn', arguments);
        };
    }

    // Update the debug panel with console output
    function updateDebugPanel(type, args) {
        try {
            const debugInfo = document.getElementById('debug-info');
            if (debugInfo) {
                const timestamp = new Date().toLocaleTimeString();
                let message = '';
                
                // Convert arguments to string
                for (let i = 0; i < args.length; i++) {
                    const arg = args[i];
                    if (typeof arg === 'object') {
                        try {
                            message += JSON.stringify(arg) + ' ';
                        } catch (e) {
                            message += '[Object] ';
                        }
                    } else {
                        message += arg + ' ';
                    }
                }
                
                // Create the log entry
                const logEntry = document.createElement('div');
                logEntry.className = `console-${type}`;
                logEntry.textContent = `[${timestamp}] ${message}`;
                
                // Style based on type
                if (type === 'error') {
                    logEntry.style.color = '#dc3545';
                } else if (type === 'warn') {
                    logEntry.style.color = '#ffc107';
                }
                
                // Add to debug panel
                debugInfo.appendChild(logEntry);
                
                // Scroll to bottom
                debugInfo.scrollTop = debugInfo.scrollHeight;
            }
        } catch (e) {
            // Fall back to original console if we encounter an error
            originalConsole.error('Error updating debug panel:', e);
        }
    }

    // Apply when document is ready
    if (document.readyState === 'complete') {
        captureConsole();
    } else {
        window.addEventListener('DOMContentLoaded', captureConsole);
    }
})(); 