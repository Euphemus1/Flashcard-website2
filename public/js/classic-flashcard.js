// Classic flashcard functionality
document.addEventListener("DOMContentLoaded", function() {
    console.log("Classic flashcard page loaded");
    
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const deckParam = urlParams.get('deck');
    const subdeckParam = urlParams.get('subdeck');
    const subsubdeckParam = urlParams.get('subsubdeck');
    const modeParam = urlParams.get('mode') || 'normal';
    
    console.log("Classic flashcard page loaded with parameters:", {
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
            
            // Always set type to classic for this page
            params.set('type', 'classic');
            
            console.log(`Fetching classic flashcards with params: ${params.toString()}`);
            
            // Call the API to get cards
            const response = await fetch(`/api/flashcards?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`Failed to load cards: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`Loaded ${data.length} classic flashcards from API:`, data);
            
            // Store cards in global variable
            window.globalCardData = data;
            window.currentCardIndex = 0;
            
            if (data.length > 0) {
                // Display the first card
                displayClassicCard();
                return true;
            } else {
                console.log("No classic flashcards found");
                showNoCardsMessage("No se encontraron tarjetas clásicas para los criterios seleccionados.");
                return false;
            }
        } catch (error) {
            console.error("Error loading classic flashcards:", error);
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
        console.log("EPOC subsubdeck detected, using direct API loading for classic cards");
        window.loadCardsFromAPI(deckParam, subdeckParam, subsubdeckParam);
    } else {
        // Load cards based on URL parameters
        window.loadCardsFromAPI(deckParam, subdeckParam, subsubdeckParam);
    }
    
    // Set up event listeners for buttons
    setupClassicButtonListeners();
});

/**
 * Set up button event listeners for classic flashcards
 */
function setupClassicButtonListeners() {
    // Review button
    const reviewButton = document.getElementById("revisar-button");
    if (reviewButton) {
        reviewButton.addEventListener("click", function() {
            console.log("Review button clicked");
            
            // Copy question and subtitle to answer card
            const questionTitle = document.getElementById("card-front").textContent;
            const questionSubtitle = document.getElementById("card-subtitle").textContent;
            
            const answerTitle = document.getElementById("card-back");
            const answerSubtitle = document.getElementById("answer-subtitle");
            
            if (answerTitle) answerTitle.textContent = questionTitle;
            if (answerSubtitle) answerSubtitle.textContent = questionSubtitle;
            
            // Show the answer card
            const answerCard = document.querySelector(".card.answer");
            if (answerCard) {
                answerCard.classList.remove("hidden");
            }
            
            // Show the SRS controls
            const srsControls = document.querySelector(".srs-controls");
            if (srsControls) {
                srsControls.classList.remove("hidden");
            }
            
            // Hide the review button
            this.style.display = "none";
        });
    }
    
    // SRS buttons
    const srsButtons = document.querySelectorAll(".difficulty");
    srsButtons.forEach(button => {
        button.addEventListener("click", function() {
            console.log("SRS button clicked:", this.textContent);
            loadNextClassicCard();
        });
    });
    
    // Skip button
    const skipButton = document.getElementById("skip-button");
    if (skipButton) {
        skipButton.addEventListener("click", function() {
            console.log("Skip button clicked");
            loadNextClassicCard();
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
 * Display a classic flashcard
 */
function displayClassicCard() {
    // Get the current card
    const currentIndex = window.currentCardIndex || 0;
    if (!window.globalCardData || currentIndex >= window.globalCardData.length) {
        console.error("No classic flashcards available or index out of bounds");
        return;
    }

    const card = window.globalCardData[currentIndex];
    console.log("Displaying classic flashcard:", card);
    
    // Set question card content
    const cardFront = document.getElementById("card-front");
    if (cardFront) {
        cardFront.textContent = card.question || "No question";
    }
    
    const cardSubtitle = document.getElementById("card-subtitle");
    if (cardSubtitle) {
        cardSubtitle.textContent = card.subtitle || "";
    }
    
    // Set answer content (will be hidden until revealed)
    const answerText = document.getElementById("answer-text");
    if (answerText) {
        answerText.textContent = card.answer || "No answer provided";
    }
    
    // Update card index for next time
    window.currentCardIndex = (currentIndex + 1) % window.globalCardData.length;
}

/**
 * Load the next classic flashcard
 */
function loadNextClassicCard() {
    console.log("Loading next classic flashcard");
    
    // Reset UI state
    const answerCard = document.querySelector(".card.answer");
    if (answerCard) {
        answerCard.classList.add("hidden");
    }
    
    const srsControls = document.querySelector(".srs-controls");
    if (srsControls) {
        srsControls.classList.add("hidden");
    }
    
    const reviewButton = document.getElementById("revisar-button");
    if (reviewButton) {
        reviewButton.style.display = "";
    }
    
    // Display the next card
    displayClassicCard();
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
                // If no subdecks, navigate to the deck page (classic)
                const deckName = this.querySelector('.deck-name').textContent;
                window.location.href = `/classic-flashcard?deck=${encodeURIComponent(deckName)}`;
            }
        });
    });
    
    // Add click handlers for subdeck buttons
    const subdeckButtons = document.querySelectorAll('.subdeck-btn');
    subdeckButtons.forEach(button => {
        button.addEventListener('click', function() {
            const deck = this.dataset.deck;
            const subdeck = this.dataset.subdeck;
            window.location.href = `/classic-flashcard?deck=${encodeURIComponent(deck)}&subdeck=${encodeURIComponent(subdeck)}`;
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
            pageTitle.innerHTML = `${deck} <span style="color:#666; font-size: 0.9em;">›</span> <span style="color:#777;">${subdeck}</span> <span style="color:#666; font-size: 0.9em;">›</span> <span style="color:#777;">${subsubdeck}</span> (Classic)`;
        } else if (subdeck) {
            pageTitle.innerHTML = `${deck} <span style="color:#666; font-size: 0.9em;">›</span> <span style="color:#777;">${subdeck}</span> (Classic)`;
        } else {
            pageTitle.textContent = `${deck || 'Study Page'} (Classic)`;
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