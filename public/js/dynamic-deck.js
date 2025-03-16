// Main dynamic deck handling script - CSP compliant version

// Ensure decks data is globally accessible without redeclaring the variable
(function() {
    // If window.globalDecks doesn't exist yet, create it
    if (typeof window.globalDecks === 'undefined') {
        window.globalDecks = {
            'Microbiología': ['Bacterias', 'Hongos', 'Parásitos', 'Virus'],
            'Semiología': ['Historía clínica', 'Piel y faneras', 'Cabeza y cuello', 'Respiratorio', 'Cardiovascular', 'Digestivo', 'Urinario', 'Neurología', 'Osteoarticular'],
            'Patología': ['ERA1', 'ERA2', 'ERA3'],
            'Farmacología': ['ERA1', 'ERA2'],
            'Terapéutica 1': ['ERA1', 'ERA2', 'ERA3'],
            'Medicina Interna 1': ['Neumonología', 'Cardiovascular', 'Tubo Digestivo', 'Neurología', 'Anexos'],
            'Revalida': ['Bling', 'Blang', 'Blong'],
            'MIR': ['Bling', 'Blang', 'Blong']
        };
    }

    // Don't redeclare decks - either use the existing one or the global one
    // Use decks if it exists, otherwise use window.globalDecks
    // But no const declaration here - that's causing the conflict
})();

/**
 * Logs a message to both the console and the debug panel if available
 */
function logMessage(message, type = 'log') {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] ${message}`;
    
    // Always log to console first
    if (type === 'error') {
        console.error(formattedMessage);
    } else if (type === 'warn') {
        console.warn(formattedMessage);
    } else {
        console.log(formattedMessage);
    }
}

// Function to populate the sidebar deck list
function populateDeckList() {
    logMessage('Populating deck list in sidebar...');
    const deckList = document.getElementById('deck-list');
    if (!deckList) {
        logMessage('Could not find deck-list element', 'error');
        return;
    }
    
    // Get deck data - either from existing decks variable or from window.globalDecks
    const deckData = typeof decks !== 'undefined' ? decks : window.globalDecks;
    
    // Clear existing items (except for first item which might be admin panel)
    try {
        const adminItem = deckList.querySelector('li:first-child');
        deckList.innerHTML = '';
        if (adminItem) {
            deckList.appendChild(adminItem);
        }
    } catch (e) {
        logMessage(`Error clearing deck list: ${e.message}`, 'error');
    }
    
    // Extract current deck name from URL to highlight it
    let currentDeckName = '';
    try {
        const pathSegments = window.location.pathname.split('/');
        currentDeckName = decodeURIComponent(pathSegments[pathSegments.length - 1]).replace(/-/g, ' ');
        logMessage('Current deck name for sidebar highlighting: ' + currentDeckName);
    } catch (e) {
        logMessage(`Error extracting current deck name: ${e.message}`, 'error');
    }
    
    // Add each deck to the list
    Object.entries(deckData).forEach(([deckName, subdecks]) => {
        try {
            const li = document.createElement('li');
            
            // Create the deck button
            const button = document.createElement('div'); // Changed to div to avoid button behaviors
            button.id = `${deckName.toLowerCase().replace(/\s+/g, '')}-btn`;
            button.className = 'deck-btn';
            if (deckName === currentDeckName) {
                button.classList.add('active');
                logMessage(`Marked deck ${deckName} as active`);
            }
            
            // Create the plus span
            const plusSpan = document.createElement('span');
            plusSpan.className = 'plus';
            plusSpan.textContent = '+';
            
            // Create the deck name span
            const deckNameSpan = document.createElement('span');
            deckNameSpan.className = 'deck-name';
            deckNameSpan.textContent = deckName;
            
            // Add click event to deck name span
            deckNameSpan.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // Prevent the parent's click event
                logMessage(`Clicked on deck name: ${deckName}`);
                window.location.href = `/deck/${encodeURIComponent(deckName)}`;
            });
            
            // Add click event to plus/minus to toggle subdecks
            plusSpan.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // Prevent the parent's click event
                
                logMessage(`Clicked on plus/minus for deck: ${deckName}`);
                const subdeckList = li.querySelector('.subdeck-list');
                if (subdeckList) {
                    subdeckList.style.display = subdeckList.style.display === 'block' ? 'none' : 'block';
                    this.textContent = subdeckList.style.display === 'block' ? '-' : '+';
                }
            });
            
            // Add soon label for some decks if needed
            if (deckName === 'Revalida' || deckName === 'MIR') {
                const soonLabel = document.createElement('span');
                soonLabel.className = 'soon-label';
                soonLabel.textContent = '(en breve!)';
                deckNameSpan.appendChild(soonLabel);
            }
            
            // Assemble the button
            button.appendChild(deckNameSpan);
            button.appendChild(plusSpan);
            li.appendChild(button);
            
            // Create subdeck list
            const ul = document.createElement('ul');
            ul.className = 'subdeck-list';
            
            // Add each subdeck
            subdecks.forEach(subdeck => {
                try {
                    const subLi = document.createElement('li');
                    const subButton = document.createElement('button');
                    subButton.className = 'subdeck-btn';
                    subButton.textContent = subdeck;
                    
                    // Add click event to subdeck buttons
                    subButton.addEventListener('click', function() {
                        logMessage(`Clicked on subdeck: ${subdeck} in deck ${deckName}`);
                        
                        // Handle special cases like Patología
                        if (deckName === 'Patología') {
                            if (subdeck === 'ERA1') {
                                window.location.href = '/protected/patologia-era1.html';
                            } else if (subdeck === 'ERA2') {
                                window.location.href = '/protected/patologia-era2.html';
                            } else if (subdeck === 'ERA3') {
                                window.location.href = '/protected/patologia-era3.html';
                            }
                            return;
                        }
                        
                        // For other decks, navigate to study page
                        window.location.href = `/study?deck=${encodeURIComponent(deckName)}&subdeck=${encodeURIComponent(subdeck)}`;
                    });
                    
                    subLi.appendChild(subButton);
                    ul.appendChild(subLi);
                } catch (e) {
                    logMessage(`Error adding subdeck ${subdeck}: ${e.message}`, 'error');
                }
            });
            
            // Expand the subdeck list for the current deck
            if (deckName === currentDeckName) {
                ul.style.display = 'block';
                plusSpan.textContent = '-';
            }
            
            li.appendChild(ul);
            deckList.appendChild(li);
        } catch (e) {
            logMessage(`Error adding deck ${deckName}: ${e.message}`, 'error');
        }
    });
    
    logMessage('Deck list population complete');
}

// Define renderSubdecks as a global function on the window object
window.renderSubdecks = function(deckName, subdecks) {
    logMessage('Rendering subdecks for: ' + deckName);
    
    const grid = document.getElementById('subdeck-grid');
    if (!grid) {
        logMessage('Could not find subdeck-grid element', 'error');
        return;
    }
    
    logMessage(`Clearing grid and rendering ${subdecks.length} subdecks`);
    // First ensure we have a backup message in case rendering fails
    const backupMessage = document.createElement('div');
    backupMessage.style.gridColumn = '1 / -1';
    backupMessage.style.textAlign = 'center';
    backupMessage.style.padding = '2rem';
    
    const backupTitle = document.createElement('h3');
    backupTitle.textContent = `Rendering subdecks for ${deckName}...`;
    backupMessage.appendChild(backupTitle);
    
    // Clear the grid
    grid.innerHTML = '';
    grid.appendChild(backupMessage);
    
    // Icon mapping for different subdeck types
    const iconMap = {
        'default': 'fas fa-layer-group',
        'urinario': 'fas fa-faucet',
        'genital': 'fas fa-venus-mars',
        'piel': 'fas fa-hand-sparkles',
        'huesos': 'fas fa-bone',
        'articulaciones': 'fas fa-bone',
        'hematologia': 'fas fa-microscope',
        'hemato': 'fas fa-microscope',
        'leucemia': 'fas fa-tint',
        'sangre': 'fas fa-tint',
        'endocrino': 'fas fa-seedling',
        'neuro': 'fas fa-brain',
        'ocular': 'fas fa-eye',
        'ojo': 'fas fa-eye',
        'respiratorio': 'fas fa-lungs',
        'pulmon': 'fas fa-lungs',
        'cardio': 'fas fa-heartbeat',
        'corazon': 'fas fa-heartbeat',
        'digestivo': 'fas fa-utensils',
        'higado': 'fas fa-pills',
        'inmuno': 'fas fa-shield-virus'
    };
    
    // Get a suitable icon for the subdeck
    function getIconForSubdeck(subdeckName) {
        try {
            const lowerName = subdeckName.toLowerCase();
            
            for (const [key, icon] of Object.entries(iconMap)) {
                if (lowerName.includes(key)) {
                    return icon;
                }
            }
        } catch (e) {
            logMessage(`Error getting icon for ${subdeckName}: ${e.message}`, 'error');
        }
        
        return iconMap.default;
    }
    
    // Generate a CSS class for the block color based on subdeck name for consistency
    function getColorClass(subdeckName) {
        try {
            const colorMap = {
                'urinario': 'urinary',
                'genital': 'genital',
                'piel': 'dermatology',
                'huesos': 'skeletal',
                'articulacion': 'skeletal',
                'hemato': 'hematology',
                'leucemia': 'hematology',
                'sangre': 'hematology',
                'endocrino': 'endocrine',
                'neuro': 'neuro',
                'ocular': 'ocular',
                'ojo': 'ocular',
                'respira': 'respiratory',
                'pulmon': 'respiratory',
                'cardio': 'cardio',
                'corazon': 'cardio',
                'digest': 'digestive',
                'bacteria': 'infectious',
                'viru': 'infectious',
                'hongo': 'infectious',
                'parasit': 'infectious',
                'historia': 'ocular',      // Historia clínica
                'cabeza': 'skeletal',      // Cabeza y cuello
                'cuello': 'skeletal',      // Cabeza y cuello
                'osteoarticular': 'skeletal', // Skeletal system
                'tubo': 'digestive',       // Tubo digestivo
                'anexos': 'ocular',        // Anexos
                'era1': 'hematology',      // ERA1
                'era2': 'respiratory',     // ERA2
                'era3': 'cardio',          // ERA3
                'bling': 'endocrine',      // Bling (Revalida/MIR)
                'blang': 'genital',        // Blang (Revalida/MIR)
                'blong': 'neuro'           // Blong (Revalida/MIR)
            };
            
            const lowerName = subdeckName.toLowerCase();
            
            // First try to match by exact name
            for (const [key, colorClass] of Object.entries(colorMap)) {
                if (lowerName === key) {
                    return colorClass;
                }
            }
            
            // Then try to match by substring
            for (const [key, colorClass] of Object.entries(colorMap)) {
                if (lowerName.includes(key)) {
                    return colorClass;
                }
            }
            
            // If we get here, try to assign a color based on parent deck
            const parentDeckName = document.querySelector('#deck-title')?.textContent?.toLowerCase() || '';
            if (parentDeckName.includes('microbiología')) return 'infectious';
            if (parentDeckName.includes('patología')) return 'cardio';
            if (parentDeckName.includes('semiología')) return 'urinary';
            if (parentDeckName.includes('farmacología')) return 'digestive';
            if (parentDeckName.includes('terapéutica')) return 'dermatology';
            if (parentDeckName.includes('medicina')) return 'endocrine';
        } catch (e) {
            logMessage(`Error getting color class for ${subdeckName}: ${e.message}`, 'error');
        }
        
        // Deterministic random color based on the first character of subdeck name
        const colors = ['urinary', 'genital', 'dermatology', 'skeletal', 'hematology', 
                      'endocrine', 'neuro', 'ocular', 'respiratory', 'cardio', 
                      'digestive', 'infectious'];
        const charCode = (subdeckName.charCodeAt(0) || 0) % colors.length;
        return colors[charCode];
    }
    
    // Clear the grid again before adding blocks
    grid.innerHTML = '';
    
    // Add subdeck blocks
    let blockCount = 0;
    subdecks.forEach(subdeck => {
        try {
            logMessage(`Creating block for subdeck: ${subdeck}`);
            const block = document.createElement('div');
            block.className = `class-block ${getColorClass(subdeck)}`;
            block.dataset.deck = deckName;
            block.dataset.subdeck = subdeck;
            
            const iconDiv = document.createElement('div');
            iconDiv.className = 'class-icon';
            
            const icon = document.createElement('i');
            icon.className = getIconForSubdeck(subdeck);
            
            iconDiv.appendChild(icon);
            
            const title = document.createElement('h3');
            title.textContent = subdeck;
            
            const cardCounts = document.createElement('div');
            cardCounts.className = 'card-counts';
            
            const newCards = document.createElement('span');
            newCards.className = 'new-cards';
            newCards.textContent = '0';
            
            const dueCards = document.createElement('span');
            dueCards.className = 'due-cards';
            dueCards.textContent = '0';
            
            cardCounts.appendChild(newCards);
            cardCounts.appendChild(dueCards);
            
            const progress = document.createElement('div');
            progress.className = 'class-progress';
            
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar progress-5';
            
            progress.appendChild(progressBar);
            
            block.appendChild(iconDiv);
            block.appendChild(title);
            block.appendChild(cardCounts);
            block.appendChild(progress);
            
            // Add click event to navigate to study page
            block.addEventListener('click', function() {
                logMessage(`Clicked on subdeck: ${subdeck}, navigating to study page`);
                window.location.href = `/study?deck=${encodeURIComponent(deckName)}&subdeck=${encodeURIComponent(subdeck)}`;
            });
            
            // Add pointer cursor style to make it clear it's clickable
            block.style.cursor = 'pointer';
            
            grid.appendChild(block);
            blockCount++;
        } catch (e) {
            logMessage(`Error creating block for ${subdeck}: ${e.message}`, 'error');
        }
    });
    
    if (blockCount === 0) {
        const errorDiv = document.createElement('div');
        errorDiv.style.gridColumn = '1 / -1';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.padding = '2rem';
        
        const errorTitle = document.createElement('h3');
        errorTitle.textContent = `No subdecks could be rendered for ${deckName}`;
        
        const errorMsg = document.createElement('p');
        errorMsg.textContent = 'Please check the debug panel for errors.';
        
        errorDiv.appendChild(errorTitle);
        errorDiv.appendChild(errorMsg);
        grid.appendChild(errorDiv);
    }
    
    logMessage(`Rendered ${blockCount} subdecks successfully`);
};

// Process the dynamic deck on page load
document.addEventListener('DOMContentLoaded', async () => {
    logMessage('🚀 dynamic-deck.js loaded and running');
    
    try {
        // Set up back button functionality
        const backButton = document.getElementById('back-to-dashboard');
        if (backButton) {
            backButton.addEventListener('click', () => {
                logMessage("Back button clicked, returning to dashboard");
                window.location.href = '/dashboard.html';
            });
            logMessage("✅ Back button initialized");
        } else {
            logMessage("❌ Could not find back-to-dashboard button", 'warn');
        }
        
        // Populate the sidebar deck list
        populateDeckList();
        logMessage("✅ Sidebar populated successfully");
    } catch (err) {
        logMessage(`❌ Error populating sidebar: ${err.message}`, 'error');
    }
    
    try {
        // Initialize sidebar toggle functionality
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                const sidebar = document.getElementById('sidebar');
                const topNav = document.getElementById('top-nav');
                const mainContent = document.getElementById('main-content');
                
                logMessage("Toggling sidebar...");
                
                sidebar.classList.toggle('collapsed');
                topNav.classList.toggle('collapsed');
                mainContent.classList.toggle('full-width');
            });
            logMessage("✅ Sidebar toggle initialized");
        } else {
            logMessage("❌ Could not find sidebar-toggle button", 'warn');
        }
    } catch (err) {
        logMessage(`❌ Error setting up sidebar toggle: ${err.message}`, 'error');
    }
    
    try {
        // Extract deck name from URL
        const pathSegments = window.location.pathname.split('/');
        const deckName = pathSegments[pathSegments.length - 1];
        
        logMessage(`URL path segments: ${JSON.stringify(pathSegments)}`);
        logMessage(`Extracted deck name: ${deckName}`);
        
        if (!deckName) {
            logMessage('❌ ERROR: No deck name found in URL', 'error');
            showError('Deck not found');
            return;
        }

        // Update page title and deck title
        const formattedDeckName = decodeURIComponent(deckName).replace(/-/g, ' ');
        logMessage(`Formatted deck name: ${formattedDeckName}`);
        
        document.title = `Dashboard - ${formattedDeckName}`;
        const deckTitleElement = document.getElementById('deck-title');
        if (deckTitleElement) {
            deckTitleElement.textContent = formattedDeckName;
            deckTitleElement.classList.add('loading');
            logMessage("Added loading animation to deck title");
        } else {
            logMessage('❌ Could not find deck-title element', 'error');
        }
        
        // Check if subdeck-grid exists
        const grid = document.getElementById('subdeck-grid');
        if (!grid) {
            logMessage('❌ Could not find subdeck-grid element', 'error');
            throw new Error('Could not find subdeck-grid element');
        } else {
            logMessage("✅ Found subdeck-grid element");
        }

        // Get deck data - either from existing decks variable or from window.globalDecks
        const deckData = typeof decks !== 'undefined' ? decks : window.globalDecks;

        // First, show the hardcoded subdecks immediately
        if (deckData[formattedDeckName]) {
            logMessage(`Found hardcoded subdecks for ${formattedDeckName}, rendering immediately`);
            
            // Clear previous loading state
            if (deckTitleElement) {
                deckTitleElement.classList.remove('loading');
            }
            
            // Render hardcoded subdecks
            window.renderSubdecks(formattedDeckName, deckData[formattedDeckName]);
            
            // After rendering, update card counts if possible
            try {
                updateCardCounts(formattedDeckName, deckData[formattedDeckName]);
            } catch (err) {
                logMessage(`Warning: Could not update card counts - ${err.message}`, 'warn');
            }
        } else {
            logMessage(`No hardcoded subdecks found for ${formattedDeckName}`, 'warn');
        }
    } catch (err) {
        logMessage(`❌ Error in main initialization: ${err.message}`, 'error');
        console.error('Error in dynamic-deck.js:', err);
    }
});

/**
 * Updates card counts for each subdeck
 * @param {string} deckName - The main deck name
 * @param {Array} subdecks - Array of subdeck names
 */
async function updateCardCounts(deckName, subdecks) {
    logMessage('Updating card counts for deck: ' + deckName);
    
    for (const subdeck of subdecks) {
        try {
            const url = `/api/flashcards/count?deck=${encodeURIComponent(deckName)}&subdeck=${encodeURIComponent(subdeck)}`;
            logMessage('Fetching count from: ' + url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                logMessage(`Failed to get counts for ${subdeck}: ${response.status}`, 'warn');
                continue;
            }
            
            const data = await response.json();
            logMessage(`Counts for ${subdeck}: ${JSON.stringify(data)}`);
            
            const { newCards, dueCards } = data;
            
            // Find the block for this subdeck and update counts
            const blocks = document.querySelectorAll('.class-block');
            let found = false;
            
            for (const block of blocks) {
                if (block.dataset.deck === deckName && block.dataset.subdeck === subdeck) {
                    logMessage(`Updating block for ${subdeck} with: ${JSON.stringify({ newCards, dueCards })}`);
                    
                    const newCardsEl = block.querySelector('.new-cards');
                    const dueCardsEl = block.querySelector('.due-cards');
                    
                    if (newCardsEl) newCardsEl.textContent = newCards;
                    if (dueCardsEl) dueCardsEl.textContent = dueCards;
                    
                    // Update progress bar based on cards
                    const totalCards = newCards + dueCards;
                    const progressBar = block.querySelector('.progress-bar');
                    
                    if (progressBar && totalCards > 0) {
                        const progress = Math.min(95, Math.round((dueCards / totalCards) * 100));
                        const progressClass = `progress-${Math.ceil(progress / 10) * 10}`;
                        
                        logMessage(`Setting progress for ${subdeck} to ${progress}% (class: ${progressClass})`);
                        progressBar.className = `progress-bar ${progressClass}`;
                        progressBar.style.width = `${progress}%`;
                    }
                    
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                logMessage(`Could not find block for subdeck: ${subdeck}`, 'warn');
            }
            
        } catch (error) {
            logMessage(`Error updating card counts for ${subdeck}: ${error.message}`, 'error');
        }
    }
}

/**
 * Shows an error message
 * @param {string} message - The error message to display
 */
function showError(message) {
    try {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            logMessage('Could not find main-content element to show error', 'error');
            return;
        }
        
        const debug = document.getElementById('debug-info')?.innerHTML || '';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-exclamation-triangle';
        
        const title = document.createElement('h2');
        title.textContent = 'Error';
        
        const text = document.createElement('p');
        text.textContent = message;
        
        const button = document.createElement('button');
        button.textContent = 'Back to Dashboard';
        button.onclick = function() {
            window.location.href = '/dashboard';
        };
        
        const debugDiv = document.createElement('div');
        debugDiv.id = 'debug-info';
        debugDiv.style.display = 'block';
        debugDiv.style.textAlign = 'left';
        debugDiv.style.marginTop = '20px';
        debugDiv.style.background = '#f5f5f5';
        debugDiv.style.padding = '10px';
        debugDiv.style.borderRadius = '4px';
        debugDiv.style.fontFamily = 'monospace';
        debugDiv.style.fontSize = '12px';
        debugDiv.style.whiteSpace = 'pre-wrap';
        debugDiv.style.maxHeight = '300px';
        debugDiv.style.overflow = 'auto';
        debugDiv.innerHTML = debug;
        
        errorDiv.appendChild(icon);
        errorDiv.appendChild(title);
        errorDiv.appendChild(text);
        errorDiv.appendChild(button);
        errorDiv.appendChild(debugDiv);
        
        mainContent.innerHTML = '';
        mainContent.appendChild(errorDiv);
    } catch (error) {
        logMessage(`Error showing error message: ${error.message}`, 'error');
        console.error('Failed to show error:', error);
    }
} 