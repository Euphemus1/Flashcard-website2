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
            
            // Automatically show debug panel on error
            const debugInfo = document.getElementById('debug-info');
            if (debugInfo) {
                debugInfo.style.display = 'block';
            }
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
                            message += JSON.stringify(arg, null, 2) + ' ';
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
                logEntry.style.fontFamily = 'monospace';
                logEntry.style.padding = '3px 5px';
                logEntry.style.marginBottom = '2px';
                logEntry.style.borderLeft = `4px solid ${type === 'error' ? '#dc3545' : type === 'warn' ? '#ffc107' : '#6c757d'}`;
                
                // Format timestamp
                const timeSpan = document.createElement('span');
                timeSpan.style.color = '#6c757d';
                timeSpan.textContent = `[${timestamp}] `;
                
                // Format message
                const messageSpan = document.createElement('span');
                if (type === 'error') {
                    messageSpan.style.color = '#dc3545';
                    messageSpan.style.fontWeight = 'bold';
                } else if (type === 'warn') {
                    messageSpan.style.color = '#ffc107';
                } else {
                    messageSpan.style.color = '#333';
                }
                messageSpan.textContent = message;
                
                // Assemble log entry
                logEntry.appendChild(timeSpan);
                logEntry.appendChild(messageSpan);
                
                // Add to debug panel
                debugInfo.appendChild(logEntry);
                
                // Scroll to bottom
                debugInfo.scrollTop = debugInfo.scrollHeight;
                
                // If not already visible, show the debug panel
                if (type === 'error' && debugInfo.style.display === 'none') {
                    debugInfo.style.display = 'block';
                }
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