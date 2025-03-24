// Choice flashcard functionality
document.addEventListener("DOMContentLoaded", function() {
    console.log("Choice flashcard page loaded");
    
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const deckParam = urlParams.get('deck');
    const subdeckParam = urlParams.get('subdeck');
    const subsubdeckParam = urlParams.get('subsubdeck');
    const modeParam = urlParams.get('mode') || 'normal';
    
    console.log("Choice flashcard page loaded with parameters:", {
        deck: deckParam,
        subdeck: subdeckParam,
        subsubdeck: subsubdeckParam,
        mode: modeParam
    });
    
    // Load cards from API
    window.loadCardsFromAPI = async function(deck, subdeck, subsubdeck) {
        try {
            // Build query parameters
            const params = new URLSearchParams();
            if (deck) params.set('deck', deck);
            if (subdeck) params.set('subdeck', subdeck);
            if (subsubdeck) params.set('subsubdeck', subsubdeck);
            
            // Always set type to multipleChoice for this page
            params.set('type', 'multipleChoice');
            
            console.log(`Fetching choice flashcards with params: ${params.toString()}`);
            
            // Call the API to get cards
            const response = await fetch(`/api/flashcards?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`Failed to load cards: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`Loaded ${data.length} choice flashcards from API:`, data);
            
            // Store cards in global variable
            window.globalCardData = data;
            window.currentCardIndex = 0;
            
            if (data.length > 0) {
                // Display the first card
                displayChoiceCard();
                updateCardStatus();
                return true;
            } else {
                console.log("No choice flashcards found");
                showNoCardsMessage("No se encontraron tarjetas de opción múltiple para los criterios seleccionados.");
                return false;
            }
        } catch (error) {
            console.error("Error loading choice flashcards:", error);
            showErrorMessage(`Error al cargar las tarjetas: ${error.message}`);
            return false;
        }
    };
    
    // Make sure globalCardData exists
    if (typeof window.globalCardData === 'undefined') {
        window.globalCardData = [];
    }
    
    // Ensure currentCardIndex is initialized
    if (typeof window.currentCardIndex === 'undefined') {
        window.currentCardIndex = 0;
    }
    
    // Populate the sidebar with decks
    populateSidebar();
    
    // Update page title and breadcrumbs
    updatePageTitle(deckParam, subdeckParam, subsubdeckParam);
    
    // Set up back button
    setupBackButton(deckParam, subdeckParam, subsubdeckParam);
    
    // Ensure the main content div is visible
    setTimeout(function() {
        const mainContent = document.getElementById("main-content");
        if (mainContent) {
            console.log("Forcing main content visibility");
            mainContent.classList.remove("hidden");
            mainContent.style.display = "block";
        }
        
        // Hide loading message
        const loadingMessage = document.getElementById("loading-message");
        if (loadingMessage) {
            loadingMessage.style.display = "none";
        }
    }, 500); // Short delay
    
    // Initialize the cards
    if (deckParam === "Patología" && subdeckParam === "Respiratorio" && subsubdeckParam === "EPOC") {
        console.log("EPOC subsubdeck detected, using direct API loading for choice cards");
        window.loadCardsFromAPI(deckParam, subdeckParam, subsubdeckParam);
    } else {
        // Load cards based on URL parameters
        window.loadCardsFromAPI(deckParam, subdeckParam, subsubdeckParam);
    }
    
    // Set up event listeners for buttons
    setupChoiceButtonListeners();
});

/**
 * Set up button event listeners for choice flashcards
 */
function setupChoiceButtonListeners() {
    // SRS buttons
    const srsButtons = document.querySelectorAll(".difficulty");
    srsButtons.forEach(button => {
        button.addEventListener("click", function() {
            console.log("SRS button clicked:", this.textContent);
            loadNextChoiceCard();
        });
    });
    
    // Skip button
    const skipButton = document.getElementById("skip-button");
    if (skipButton) {
        skipButton.addEventListener("click", function() {
            console.log("Skip button clicked");
            loadNextChoiceCard();
        });
    }
    
    // Navigation buttons
    const overviewButton = document.getElementById("overview-button");
    if (overviewButton) {
        overviewButton.addEventListener("click", function() {
            window.location.href = "/dashboard";
        });
    }
}

/**
 * Display a choice flashcard
 */
function displayChoiceCard() {
    // Get the current card
    const currentIndex = window.currentCardIndex || 0;
    if (!window.globalCardData || currentIndex >= window.globalCardData.length) {
        console.error("No choice flashcards available or index out of bounds");
        return;
    }

    const card = window.globalCardData[currentIndex];
    console.log("Displaying choice flashcard:", card);
    
    // Add custom styles for choice options if not already added
    if (!document.getElementById('choice-options-styles')) {
        const styles = document.createElement('style');
        styles.id = 'choice-options-styles';
        styles.textContent = `
            #main-content {
                visibility: visible !important;
                display: block !important;
            }
            .card-pair.choice-card {
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            .title-container {
                display: flex;
                align-items: center;
                margin-bottom: 20px;
            }
            #choice-options {
                display: grid;
                grid-template-columns: 1fr;
                gap: 10px;
                margin-top: 20px;
                width: 100%;
            }
            .choice-option {
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background-color: #f9f9f9;
                cursor: pointer;
                text-align: left;
                font-size: 16px;
                transition: background-color 0.2s;
                position: relative;
            }
            .choice-option:hover {
                background-color: #f0f0f0;
            }
            .choice-option.selected {
                background-color: #d4edda;
                border-color: #c3e6cb;
                font-weight: bold;
            }
            .choice-option.selected:after {
                content: "✓";
                position: absolute;
                right: 15px;
                color: #28a745;
            }
            .srs-controls {
                display: flex;
                justify-content: space-between;
                margin-top: 20px;
                transition: opacity 0.3s;
            }
            .srs-controls.hidden {
                display: none;
                opacity: 0;
            }
            .srs-controls.visible {
                display: flex;
                opacity: 1;
            }
            #card-status {
                margin-top: 20px;
                text-align: center;
                color: #666;
                font-size: 14px;
            }
            #flashcard-system {
                max-width: 800px;
                margin: 0 auto;
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Set question card content
    const cardFront = document.getElementById("card-front");
    if (cardFront) {
        cardFront.textContent = card.question || "No question";
    }
    
    // Set up choice options
    const choiceOptionsContainer = document.getElementById("choice-options");
    if (choiceOptionsContainer) {
        choiceOptionsContainer.innerHTML = "";  // Clear existing options
        
        // Check if we have options in the card data
        if (card.options && Array.isArray(card.options) && card.options.length > 0) {
            console.log("Adding choice options:", card.options);
            
            card.options.forEach((option, index) => {
                const choiceButton = document.createElement("button");
                choiceButton.className = "choice-option";
                choiceButton.textContent = option;
                choiceButton.setAttribute("data-index", index);
                
                // Mark the correct answer for debugging (will be visible in console only)
                if (index === card.correctIndex) {
                    console.log(`Option ${index} is the correct answer: ${option}`);
                }
                
                choiceButton.addEventListener("click", function() {
                    // Mark as selected
                    document.querySelectorAll(".choice-option").forEach(btn => {
                        btn.classList.remove("selected");
                    });
                    this.classList.add("selected");
                    
                    // Check if the answer is correct
                    const selectedIndex = parseInt(this.getAttribute("data-index"), 10);
                    const isCorrect = selectedIndex === card.correctIndex;
                    
                    // Show answer feedback
                    if (isCorrect) {
                        this.style.backgroundColor = "#d4edda"; // Green for correct
                        console.log("Correct answer selected!");
                    } else {
                        this.style.backgroundColor = "#f8d7da"; // Red for incorrect
                        console.log("Incorrect answer selected. The correct answer is:", card.options[card.correctIndex]);
                        
                        // Highlight the correct answer
                        const correctButton = document.querySelector(`.choice-option[data-index="${card.correctIndex}"]`);
                        if (correctButton) {
                            correctButton.style.backgroundColor = "#d4edda";
                            correctButton.style.borderColor = "#c3e6cb";
                        }
                    }
                    
                    // Show SRS controls when a choice is selected
                    const srsControls = document.querySelector(".srs-controls");
                    if (srsControls) {
                        srsControls.classList.remove("hidden");
                        srsControls.classList.add("visible");
                    }
                });
                choiceOptionsContainer.appendChild(choiceButton);
            });
        } else {
            console.error("No options found for choice flashcard:", card);
            const errorMessage = document.createElement("p");
            errorMessage.textContent = "Esta tarjeta no tiene opciones.";
            errorMessage.style.color = "red";
            choiceOptionsContainer.appendChild(errorMessage);
        }
    }
    
    // Add a class to the card-pair to style it as a choice card
    const cardPair = document.querySelector(".card-pair");
    if (cardPair) {
        cardPair.classList.add("choice-card");
    }
    
    // Update the status display
    updateCardStatus();
    
    // Update card index for next time
    window.currentCardIndex = (currentIndex + 1) % window.globalCardData.length;
}

/**
 * Updates the card status display
 */
function updateCardStatus() {
    const statusElement = document.getElementById("status");
    if (statusElement) {
        const totalCards = window.globalCardData ? window.globalCardData.length : 0;
        // Add 1 to currentCardIndex for display since it's 0-based but we want to show 1-based numbering
        const displayIndex = (window.currentCardIndex || 0) + 1;
        statusElement.textContent = `Tarjeta ${displayIndex} de ${totalCards}`;
    }
}

/**
 * Load the next choice flashcard
 */
function loadNextChoiceCard() {
    console.log("Loading next choice flashcard");
    
    // Reset UI state
    const srsControls = document.querySelector(".srs-controls");
    if (srsControls) {
        srsControls.classList.add("hidden");
        srsControls.classList.remove("visible");
    }
    
    // Clear any selected or highlighted options
    const choiceOptions = document.querySelectorAll(".choice-option");
    choiceOptions.forEach(option => {
        option.classList.remove("selected");
        option.style.backgroundColor = "";
        option.style.borderColor = "";
    });
    
    // Display the next card
    displayChoiceCard();
    
    // Update status
    updateCardStatus();
}

/**
 * Populates the sidebar with decks and subdecks
 */
function populateSidebar() {
    console.log("Populating sidebar with decks");
    const deckList = document.getElementById("deck-list");
    
    if (!deckList) {
        console.error("Deck list element not found in sidebar");
        return;
    }
    
    // Get decks from the global variable in dynamic-deck.js
    if (window.globalDecks) {
        console.log("Using global decks from dynamic-deck.js");
        const decks = Object.keys(window.globalDecks);
        renderDeckList(decks);
    } else {
        // Fallback to hardcoded decks if global decks not available
        console.log("Global decks not available, using fallback decks");
        const fallbackDecks = [
            "Patología",
            "Microbiología",
            "Anatomía", 
            "Fisiología",
            "Medicina Interna 1",
            "Revalida",
            "MIR"
        ];
        renderDeckList(fallbackDecks);
    }
}

/**
 * Renders the deck list in the sidebar
 * @param {Array} decks - Array of deck names
 */
function renderDeckList(decks) {
    const deckList = document.getElementById("deck-list");
    if (!deckList) return;
    
    deckList.innerHTML = ''; // Clear existing list
    
    decks.forEach(deck => {
        const listItem = document.createElement('li');
        
        // Create deck button
        const deckButton = document.createElement('button');
        deckButton.className = 'deck-btn';
        
        // Create deck name span
        const deckNameSpan = document.createElement('span');
        deckNameSpan.className = 'deck-name';
        deckNameSpan.textContent = deck;
        
        // Create plus/minus symbol
        const plusSymbol = document.createElement('span');
        plusSymbol.className = 'plus';
        plusSymbol.textContent = '+';
        
        // Assemble deck button
        deckButton.appendChild(deckNameSpan);
        deckButton.appendChild(plusSymbol);
        
        listItem.appendChild(deckButton);
        
        // Add subdeck list if available
        if (window.globalDecks && window.globalDecks[deck]) {
            const subdeckList = document.createElement('ul');
            subdeckList.className = 'subdeck-list';
            subdeckList.style.display = 'none';
            
            window.globalDecks[deck].forEach(subdeck => {
                const subdeckItem = document.createElement('li');
                const subdeckButton = document.createElement('button');
                subdeckButton.className = 'subdeck-btn';
                subdeckButton.textContent = subdeck;
                // Add data attributes
                subdeckButton.dataset.deck = deck;
                subdeckButton.dataset.subdeck = subdeck;
                subdeckItem.appendChild(subdeckButton);
                subdeckList.appendChild(subdeckItem);
            });
            
            listItem.appendChild(subdeckList);
        }
        
        deckList.appendChild(listItem);
    });
    
    // Set up click handlers for the deck buttons
    const deckButtons = document.querySelectorAll('.deck-btn');
    deckButtons.forEach(button => {
        button.addEventListener('click', function() {
            const plusSymbol = this.querySelector('.plus');
            const subdeckList = this.parentElement.querySelector('.subdeck-list');
            
            if (subdeckList) {
                if (subdeckList.style.display === 'none' || !subdeckList.style.display) {
                    subdeckList.style.display = 'block';
                    plusSymbol.textContent = '-';
                } else {
                    subdeckList.style.display = 'none';
                    plusSymbol.textContent = '+';
                }
            } else {
                // If no subdecks, navigate to the deck page (choice)
                const deckName = this.querySelector('.deck-name').textContent;
                window.location.href = `/choice-flashcard?deck=${encodeURIComponent(deckName)}`;
            }
        });
    });
    
    // Add click handlers for subdeck buttons
    const subdeckButtons = document.querySelectorAll('.subdeck-btn');
    subdeckButtons.forEach(button => {
        button.addEventListener('click', function() {
            const deck = this.dataset.deck;
            const subdeck = this.dataset.subdeck;
            window.location.href = `/choice-flashcard?deck=${encodeURIComponent(deck)}&subdeck=${encodeURIComponent(subdeck)}`;
        });
    });
}

/**
 * Function to show error message
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
    document.getElementById("main-content").style.display = "none";
    document.getElementById("no-cards-message").style.display = "none";
    
    const errorElement = document.getElementById("error-message");
    errorElement.style.display = "block";
    errorElement.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <h3>Error</h3>
        <p>${message}</p>
    `;
    console.error("Error displayed:", message);
}

/**
 * Function to show no cards message
 * @param {string} message - The message to display when no cards are found
 */
function showNoCardsMessage(message) {
    document.getElementById("main-content").style.display = "none";
    document.getElementById("error-message").style.display = "none";
    
    const noCardsElement = document.getElementById("no-cards-message");
    noCardsElement.style.display = "block";
    noCardsElement.innerHTML = `
        <i class="fas fa-info-circle" style="font-size: 3rem; margin-bottom: 1rem; color: #17a2b8;"></i>
        <h3>No hay tarjetas</h3>
        <p>${message}</p>
    `;
    console.log("No cards message displayed:", message);
}

/**
 * Updates the page title and breadcrumbs based on URL parameters
 * @param {string} deck - The deck name
 * @param {string} subdeck - The subdeck name (optional)
 * @param {string} subsubdeck - The subsubdeck name (optional)
 */
function updatePageTitle(deck, subdeck, subsubdeck) {
    // Update the main page title
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        if (subsubdeck) {
            pageTitle.innerHTML = `${deck} <span style="color:#666; font-size: 0.9em;">›</span> <span style="color:#777;">${subdeck}</span> <span style="color:#666; font-size: 0.9em;">›</span> <span style="color:#777;">${subsubdeck}</span> (Choice)`;
        } else if (subdeck) {
            pageTitle.innerHTML = `${deck} <span style="color:#666; font-size: 0.9em;">›</span> <span style="color:#777;">${subdeck}</span> (Choice)`;
        } else {
            pageTitle.textContent = `${deck || 'Study Page'} (Choice)`;
        }
    }
}

/**
 * Sets up the back button to navigate to the appropriate page
 * @param {string} deck - The deck name
 * @param {string} subdeck - The subdeck name (optional)
 * @param {string} subsubdeck - The subsubdeck name (optional)
 */
function setupBackButton(deck, subdeck, subsubdeck) {
    const backButton = document.getElementById('back-button');
    if (!backButton) return;
    
    backButton.addEventListener('click', function() {
        console.log(`Back button clicked with deck=${deck}, subdeck=${subdeck}, subsubdeck=${subsubdeck}`);
        
        // Determine where to go back to
        if (subsubdeck && subdeck) {
            console.log(`Navigating from subsubdeck (${subsubdeck}) to subdeck page: ${deck}/${subdeck}`);
            window.location.href = `/deck/${encodeURIComponent(deck)}?subdeck=${encodeURIComponent(subdeck)}`;
        } else if (subdeck) {
            console.log(`Navigating from subdeck (${subdeck}) to deck page: ${deck}`);
            window.location.href = `/deck/${encodeURIComponent(deck)}`;
        } else {
            // If we're viewing a deck, go back to dashboard
            window.location.href = '/dashboard';
        }
    });
} 