// Main dynamic deck handling script - CSP compliant version

// Ensure decks data is globally accessible without redeclaring the variable
(function() {
    // If window.globalDecks doesn't exist yet, create it
    if (typeof window.globalDecks === 'undefined') {
        window.globalDecks = {
            'Microbiología': ['Bacterias', 'Hongos', 'Parásitos', 'Virus'],
            'Semiología': ['Historía clínica', 'Piel y faneras', 'Cabeza y cuello', 'Respiratorio', 'Cardiovascular', 'Digestivo', 'Urinario', 'Neurología', 'Osteoarticular'],
            'Patología': ['Metabolopatías', 'Inflamación', 'Neoplasias', 'Cardiovascular', 'Respiratorio', 'Digestivo', 'Aparato urinario', 'Aparato reproductor', 'Piel', 'Huesos y articulaciones', 'Sistema endocrino', 'Otros'],
            'Farmacología': ['ERA1', 'ERA2'],
            'Terapéutica 1': ['ERA1', 'ERA2', 'ERA3'],
            'Medicina Interna 1': ['Neumonología', 'Cardiovascular', 'Tubo Digestivo', 'Neurología', 'Anexos'],
            'Revalida': ['Bling', 'Blang', 'Blong'],
            'MIR': ['Bling', 'Blang', 'Blong']
        };

        // Define subsubdecks for specific subdecks
        window.globalSubsubdecks = {
            'Patología': {
                'Respiratorio': ['Neumonía', 'Asma y Epoc', 'Cáncer de Pulmón', 'Otros']
            }
        };
    }

    // Don't redeclare decks - either use the existing one or the global one
    // Use decks if it exists, otherwise use window.globalDecks
    // But no const declaration here - that's causing the conflict
})();

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
    'inmuno': 'fas fa-shield-virus',
    'neumonia': 'fas fa-lungs-virus',
    'asma': 'fas fa-wind',
    'cancer': 'fas fa-disease'
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
            'blong': 'neuro',          // Blong (Revalida/MIR)
            'neumonía': 'respiratory', // Specific respiratorio subsubdecks
            'asma': 'respiratory',
            'epoc': 'respiratory',
            'cáncer': 'neuro'
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
                            // Navigate to study page with subdeck parameter
                            window.location.href = `/study?deck=${encodeURIComponent(deckName)}&subdeck=${encodeURIComponent(subdeck)}`;
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
            
            // Check if this subdeck has subsubdecks
            const hasSubsubdecks = window.globalSubsubdecks && 
                                   window.globalSubsubdecks[deckName] && 
                                   window.globalSubsubdecks[deckName][subdeck];

            // Add click event - either navigate to study page or show subsubdecks
            block.addEventListener('click', function() {
                // Special handling for subdecks with subsubdecks
                if (hasSubsubdecks) {
                    logMessage(`Subdeck ${subdeck} has subsubdecks, showing those instead`);
                    renderSubsubdecks(deckName, subdeck, window.globalSubsubdecks[deckName][subdeck]);
                } else {
                    logMessage(`Clicked on subdeck: ${subdeck}, navigating to study page`);
                    window.location.href = `/study?deck=${encodeURIComponent(deckName)}&subdeck=${encodeURIComponent(subdeck)}`;
                }
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

// New function to render subsubdecks
window.renderSubsubdecks = function(deckName, subdeckName, subsubdecks) {
    logMessage(`Rendering subsubdecks for ${deckName} > ${subdeckName}`);
    
    const grid = document.getElementById('subdeck-grid');
    if (!grid) {
        logMessage('Could not find subdeck-grid element', 'error');
        return;
    }
    
    // Update the deck title to reflect navigation
    const deckTitle = document.getElementById('deck-title');
    if (deckTitle) {
        deckTitle.innerHTML = `${deckName} <span style="color:#666; font-size: 0.9em;">›</span> <span style="color:#777;">${subdeckName}</span>`;
    }
    
    // Create a back button to go back to main subdecks
    const backRow = document.createElement('div');
    backRow.className = 'back-navigation';
    backRow.style.gridColumn = '1 / -1';
    backRow.style.margin = '0 0 20px 0';
    
    const backButton = document.createElement('button');
    backButton.className = 'back-btn';
    backButton.innerHTML = `<i class="fas fa-arrow-left"></i> Volver a ${deckName}`;
    backButton.style.padding = '8px 16px';
    backButton.style.backgroundColor = '#f0f0f0';
    backButton.style.border = 'none';
    backButton.style.borderRadius = '4px';
    backButton.style.cursor = 'pointer';
    backButton.style.display = 'inline-flex';
    backButton.style.alignItems = 'center';
    backButton.style.fontWeight = 'bold';
    
    backButton.addEventListener('click', function() {
        logMessage(`Back button clicked, returning to ${deckName} subdecks`);
        // Reset the title
        if (deckTitle) {
            deckTitle.textContent = deckName;
        }
        
        // Re-fetch the subdecks for the parent deck
        const subdecks = window.globalDecks[deckName] || [];
        window.renderSubdecks(deckName, subdecks);
    });
    
    backRow.appendChild(backButton);
    
    // Clear the grid
    grid.innerHTML = '';
    grid.appendChild(backRow);
    
    // Add subsubdeck blocks
    logMessage(`Adding ${subsubdecks.length} subsubdeck blocks`);
    let blockCount = 0;
    
    subsubdecks.forEach(subsubdeck => {
        try {
            logMessage(`Creating block for subsubdeck: ${subsubdeck}`);
            const blockContainer = document.createElement('div');
            blockContainer.className = 'subsubdeck-container';
            blockContainer.style.marginBottom = '25px';
            
            // Create the main block
            const block = document.createElement('div');
            block.className = `class-block ${getColorClass(subsubdeck)}`;
            block.dataset.deck = deckName;
            block.dataset.subdeck = subdeckName;
            block.dataset.subsubdeck = subsubdeck;
            block.style.display = 'flex';
            block.style.flexDirection = 'column';
            block.style.alignItems = 'center';
            block.style.textAlign = 'center';
            block.style.paddingTop = '15px';
            
            // Add title ABOVE the icon (new position)
            const title = document.createElement('h3');
            title.textContent = subsubdeck;
            title.style.marginBottom = '10px';
            title.style.fontSize = '1.2em';
            title.style.fontWeight = 'bold';
            title.style.color = '#333';
            
            // Icon comes after the title now
            const iconDiv = document.createElement('div');
            iconDiv.className = 'class-icon';
            iconDiv.style.margin = '5px 0';
            
            const icon = document.createElement('i');
            icon.className = getIconForSubdeck(subsubdeck);
            
            iconDiv.appendChild(icon);
            
            // Add "Flashcards Clásicos" where the title used to be
            const classicTitle = document.createElement('h3');
            classicTitle.textContent = "Flashcards Clásicos";
            classicTitle.style.margin = '10px 0';
            classicTitle.style.fontSize = '1.1em';
            classicTitle.style.fontWeight = 'normal';
            classicTitle.style.color = '#555';
            
            const cardCounts = document.createElement('div');
            cardCounts.className = 'card-counts';
            cardCounts.style.margin = '5px 0';
            
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
            progress.style.width = '90%';
            progress.style.margin = '5px auto';
            
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar progress-5';
            
            progress.appendChild(progressBar);
            
            // Add dropdown toggle button
            const toggleButton = document.createElement('button');
            toggleButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
            toggleButton.className = 'card-type-toggle';
            toggleButton.style.position = 'absolute';
            toggleButton.style.bottom = '5px';
            toggleButton.style.right = '5px';
            toggleButton.style.background = 'transparent';
            toggleButton.style.border = 'none';
            toggleButton.style.color = '#555';
            toggleButton.style.cursor = 'pointer';
            toggleButton.style.padding = '5px';
            toggleButton.style.fontSize = '12px';
            toggleButton.title = 'Mostrar tipos de flashcards';
            
            // Change the order: title first, then icon, then classicTitle
            block.appendChild(title);
            block.appendChild(iconDiv);
            block.appendChild(classicTitle);
            block.appendChild(cardCounts);
            block.appendChild(progress);
            block.appendChild(toggleButton);
            
            // Add click event to navigate to study page with subsubdeck parameter
            block.addEventListener('click', function(e) {
                // Ignore clicks on the toggle button
                if (e.target === toggleButton || toggleButton.contains(e.target)) {
                    e.stopPropagation();
                    return;
                }
                
                logMessage(`Clicked on subsubdeck: ${subsubdeck}, navigating to study page`);
                window.location.href = `/study?deck=${encodeURIComponent(deckName)}&subdeck=${encodeURIComponent(subdeckName)}&subsubdeck=${encodeURIComponent(subsubdeck)}`;
            });
            
            // Add pointer cursor style to make it clear it's clickable
            block.style.cursor = 'pointer';
            block.style.position = 'relative'; // For positioning the toggle button
            
            // Create card type dropdown
            const cardTypeDropdown = document.createElement('div');
            cardTypeDropdown.className = 'card-type-dropdown';
            cardTypeDropdown.style.display = 'block'; // Open by default
            cardTypeDropdown.style.marginTop = '5px';
            cardTypeDropdown.style.border = '1px solid #ddd';
            cardTypeDropdown.style.borderRadius = '5px';
            cardTypeDropdown.style.overflow = 'hidden';
            cardTypeDropdown.style.backgroundColor = 'white'; // Solid background
            cardTypeDropdown.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'; // Add subtle shadow
            
            // Add classic card type option with "Flashcards Interactivos" text
            const classicOption = createCardTypeOption(
                deckName, 
                subdeckName, 
                subsubdeck, 
                'classic', 
                'Flashcards Interactivos', 
                'fas fa-clone'
            );
            
            // Add multiple choice card type option with renamed text
            const choiceOption = createCardTypeOption(
                deckName, 
                subdeckName, 
                subsubdeck, 
                'multipleChoice', 
                'Flashcards Choice', 
                'fas fa-list-ul'
            );
            
            cardTypeDropdown.appendChild(classicOption);
            cardTypeDropdown.appendChild(choiceOption);
            
            // Toggle dropdown on button click
            toggleButton.addEventListener('click', function(e) {
                e.stopPropagation();
                const isVisible = cardTypeDropdown.style.display === 'block';
                cardTypeDropdown.style.display = isVisible ? 'none' : 'block';
                toggleButton.innerHTML = isVisible ? 
                    '<i class="fas fa-chevron-down"></i>' : 
                    '<i class="fas fa-chevron-up"></i>';
                
                // Update card counts if becoming visible
                if (!isVisible) {
                    updateCardTypeOptionCounts(deckName, subdeckName, subsubdeck);
                }
            });
            
            // Set toggle button to show up arrow since dropdown is open by default
            toggleButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
            
            // Update card counts immediately since dropdown is open by default
            updateCardTypeOptionCounts(deckName, subdeckName, subsubdeck);
            
            // Add block and dropdown to container
            blockContainer.appendChild(block);
            blockContainer.appendChild(cardTypeDropdown);
            
            // Add container to grid
            grid.appendChild(blockContainer);
            blockCount++;
        } catch (e) {
            logMessage(`Error creating block for ${subsubdeck}: ${e.message}`, 'error');
        }
    });
    
    if (blockCount === 0) {
        const errorDiv = document.createElement('div');
        errorDiv.style.gridColumn = '1 / -1';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.padding = '2rem';
        
        const errorTitle = document.createElement('h3');
        errorTitle.textContent = `No subsubdecks could be rendered for ${subdeckName}`;
        
        const errorMsg = document.createElement('p');
        errorMsg.textContent = 'Please check the debug panel for errors.';
        
        errorDiv.appendChild(errorTitle);
        errorDiv.appendChild(errorMsg);
        grid.appendChild(errorDiv);
    } else {
        // Update card counts for all subsubdecks
        updateSubsubdeckCardCounts(deckName, subdeckName, subsubdecks);
    }
    
    logMessage(`Rendered ${blockCount} subsubdecks successfully`);
};

/**
 * Creates a card type option element
 */
function createCardTypeOption(deckName, subdeckName, subsubdeck, type, label, iconClass) {
    const option = document.createElement('div');
    option.className = 'card-type-option';
    option.dataset.type = type;
    option.dataset.deck = deckName;
    option.dataset.subdeck = subdeckName; 
    option.dataset.subsubdeck = subsubdeck;
    option.style.padding = '12px';
    option.style.borderBottom = '1px solid #ddd';
    option.style.display = 'flex';
    option.style.alignItems = 'center';
    option.style.cursor = 'pointer';
    option.style.transition = 'background-color 0.2s';
    option.style.backgroundColor = 'white'; // Solid background
    
    // Add hover effect
    option.addEventListener('mouseover', function() {
        option.style.backgroundColor = '#f0f0f0'; // Darker hover background
    });
    
    option.addEventListener('mouseout', function() {
        option.style.backgroundColor = 'white'; // Return to solid white
    });
    
    // Add icon
    const iconDiv = document.createElement('div');
    iconDiv.style.marginRight = '15px';
    iconDiv.style.width = '30px';
    iconDiv.style.textAlign = 'center';
    iconDiv.style.fontSize = '1.2em';
    
    const icon = document.createElement('i');
    icon.className = iconClass;
    
    iconDiv.appendChild(icon);
    
    // Add label
    const labelDiv = document.createElement('div');
    labelDiv.textContent = label;
    labelDiv.style.flexGrow = '1';
    labelDiv.style.fontWeight = '500';
    
    // Add counts
    const countsDiv = document.createElement('div');
    countsDiv.className = 'card-counts';
    countsDiv.style.marginLeft = 'auto';
    
    const newCards = document.createElement('span');
    newCards.className = 'new-cards';
    newCards.textContent = '...';
    newCards.id = `${type}-${subsubdeck.replace(/\s+/g, '-').toLowerCase()}-new`;
    
    const dueCards = document.createElement('span');
    dueCards.className = 'due-cards';
    dueCards.textContent = '...';
    dueCards.id = `${type}-${subsubdeck.replace(/\s+/g, '-').toLowerCase()}-due`;
    
    countsDiv.appendChild(newCards);
    countsDiv.appendChild(dueCards);
    
    // Assemble option
    option.appendChild(iconDiv);
    option.appendChild(labelDiv);
    option.appendChild(countsDiv);
    
    // Add click event
    option.addEventListener('click', function() {
        logMessage(`Clicked on ${type} cards for ${subsubdeck}, navigating to study page`);
        let url = `/study?deck=${encodeURIComponent(deckName)}&subdeck=${encodeURIComponent(subdeckName)}&type=${encodeURIComponent(type)}`;
        
        if (subsubdeck) {
            url += `&subsubdeck=${encodeURIComponent(subsubdeck)}`;
        }
        
        window.location.href = url;
    });
    
    return option;
}

/**
 * Updates card counts for card type options
 */
async function updateCardTypeOptionCounts(deckName, subdeckName, subsubdeck) {
    try {
        logMessage(`Updating card type counts for ${deckName} > ${subdeckName} > ${subsubdeck}`);
        
        const sanitizedSubsubdeck = subsubdeck.replace(/\s+/g, '-').toLowerCase();
        
        // Fetch classic cards count
        const classicUrl = `/api/flashcards/count?deck=${encodeURIComponent(deckName)}&subdeck=${encodeURIComponent(subdeckName)}&subsubdeck=${encodeURIComponent(subsubdeck)}&type=classic`;
        const choiceUrl = `/api/flashcards/count?deck=${encodeURIComponent(deckName)}&subdeck=${encodeURIComponent(subdeckName)}&subsubdeck=${encodeURIComponent(subsubdeck)}&type=multipleChoice`;
        
        // Fetch both counts in parallel
        const [classicResponse, choiceResponse] = await Promise.all([
            fetch(classicUrl),
            fetch(choiceUrl)
        ]);
        
        // Process classic cards response
        if (classicResponse.ok) {
            const classicData = await classicResponse.json();
            const { newCards, dueCards } = classicData;
            
            // Update UI elements
            const newEl = document.getElementById(`classic-${sanitizedSubsubdeck}-new`);
            const dueEl = document.getElementById(`classic-${sanitizedSubsubdeck}-due`);
            
            if (newEl) newEl.textContent = newCards;
            if (dueEl) dueEl.textContent = dueCards;
            
            logMessage(`Classic cards count updated for ${subsubdeck}: ${newCards} new, ${dueCards} due`);
        } else {
            logMessage(`Error fetching classic cards count for ${subsubdeck}: ${classicResponse.status}`, 'warn');
        }
        
        // Process multiple choice cards response
        if (choiceResponse.ok) {
            const choiceData = await choiceResponse.json();
            const { newCards, dueCards } = choiceData;
            
            // Update UI elements
            const newEl = document.getElementById(`multipleChoice-${sanitizedSubsubdeck}-new`);
            const dueEl = document.getElementById(`multipleChoice-${sanitizedSubsubdeck}-due`);
            
            if (newEl) newEl.textContent = newCards;
            if (dueEl) dueEl.textContent = dueCards;
            
            logMessage(`Multiple choice cards count updated for ${subsubdeck}: ${newCards} new, ${dueCards} due`);
        } else {
            logMessage(`Error fetching multiple choice cards count for ${subsubdeck}: ${choiceResponse.status}`, 'warn');
        }
    } catch (error) {
        logMessage(`Error updating card type counts for ${subsubdeck}: ${error.message}`, 'error');
    }
}

/**
 * Updates card counts for each subsubdeck
 * @param {string} deckName - The main deck name
 * @param {string} subdeckName - The subdeck name
 * @param {Array} subsubdecks - Array of subsubdeck names
 */
async function updateSubsubdeckCardCounts(deckName, subdeckName, subsubdecks) {
    logMessage(`Updating card counts for subsubdecks of ${deckName} > ${subdeckName}`);
    
    for (const subsubdeck of subsubdecks) {
        try {
            const url = `/api/flashcards/count?deck=${encodeURIComponent(deckName)}&subdeck=${encodeURIComponent(subdeckName)}&subsubdeck=${encodeURIComponent(subsubdeck)}`;
            logMessage(`Fetching count from: ${url}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                logMessage(`Failed to get counts for ${subsubdeck}: ${response.status}`, 'warn');
                continue;
            }
            
            const data = await response.json();
            logMessage(`Counts for ${subsubdeck}: ${JSON.stringify(data)}`);
            
            const { newCards, dueCards } = data;
            
            // Find the block for this subsubdeck and update counts
            const blocks = document.querySelectorAll('.class-block');
            let found = false;
            
            for (const block of blocks) {
                if (block.dataset.deck === deckName && 
                    block.dataset.subdeck === subdeckName && 
                    block.dataset.subsubdeck === subsubdeck) {
                    
                    logMessage(`Updating block for ${subsubdeck} with: ${JSON.stringify({ newCards, dueCards })}`);
                    
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
                        
                        logMessage(`Setting progress for ${subsubdeck} to ${progress}% (class: ${progressClass})`);
                        progressBar.className = `progress-bar ${progressClass}`;
                        progressBar.style.width = `${progress}%`;
                    }
                    
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                logMessage(`Could not find block for subsubdeck: ${subsubdeck}`, 'warn');
            }
            
        } catch (error) {
            logMessage(`Error updating card counts for ${subsubdeck}: ${error.message}`, 'error');
        }
    }
}

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