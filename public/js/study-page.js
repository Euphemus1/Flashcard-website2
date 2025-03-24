// Main initialization script for the study page
document.addEventListener("DOMContentLoaded", function() {
    console.log("Study page DOM loaded");
    
    // Force styles to ensure visibility
    const style = document.createElement('style');
    style.textContent = `
        #main-content.hidden { display: none !important; }
        #main-content { display: block !important; padding: 20px; width: 100%; }
        .card { border: 1px solid #ddd; margin-bottom: 20px; }
        .card.question { border-top-width: 7px; border-top-color: #3498db; }
        .card.answer { border-top-width: 7px; border-top-color: #2ecc71; }
        .title-container { display: flex; align-items: center; margin-bottom: 20px; }
        .back-btn { background: none; border: none; font-size: 1.5rem; color: #007bff; cursor: pointer; margin-right: 15px; }
        #page-title { margin: 0; font-size: 1.8rem; }
    `;
    document.head.appendChild(style);
    
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const deckParam = urlParams.get('deck');
    const subdeckParam = urlParams.get('subdeck');
    const subsubdeckParam = urlParams.get('subsubdeck');
    const modeParam = urlParams.get('mode') || 'normal';
    
    console.log("Study page loaded, URL Parameters:", {
        deck: deckParam,
        subdeck: subdeckParam,
        subsubdeck: subsubdeckParam,
        mode: modeParam
    });
    
    // Create our own loadCards function to directly fetch from API
    window.loadCardsFromAPI = async function(deck, subdeck, subsubdeck) {
        try {
            // Build query parameters
            const params = new URLSearchParams();
            if (deck) params.set('deck', deck);
            if (subdeck) params.set('subdeck', subdeck);
            if (subsubdeck) params.set('subsubdeck', subsubdeck);
            
            console.log(`Directly fetching cards from API with params: ${params.toString()}`);
            
            // Call the API to get cards
            const response = await fetch(`/api/flashcards?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`Failed to load cards: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`Loaded ${data.length} cards directly from API:`, data);
            
            // Store cards in global variable - ensure it's on window object
            window.globalCardData = data;
            window.currentCardIndex = 0;
            
            if (data.length > 0) {
                // Display the first card
                displayCardFromGlobal();
                return true;
            } else {
                console.log("No cards found for these criteria");
                showNoCardsMessage("No se encontraron tarjetas para los criterios seleccionados.");
                return false;
            }
        } catch (error) {
            console.error("Error directly loading cards from API:", error);
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
    
    // Log SRS controls visibility for debugging
    const srsControls = document.querySelector(".srs-controls");
    console.log("Initial SRS controls:", {
        exists: !!srsControls,
        hidden: srsControls ? srsControls.classList.contains("hidden") : "N/A",
        display: srsControls ? window.getComputedStyle(srsControls).display : "N/A"
    });
    
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
            
            // Also show flashcards if they exist
            const flashcardSystem = document.getElementById("flashcard-system");
            if (flashcardSystem) {
                flashcardSystem.style.display = "flex";
            }
        } else {
            console.error("Main content element not found!");
        }
        
        // Hide loading message
        const loadingMessage = document.getElementById("loading-message");
        if (loadingMessage) {
            loadingMessage.style.display = "none";
        }
    }, 500); // Short delay to ensure DOM is fully loaded
    
    // Custom initialization for EPOC subsubdeck
    if (deckParam === "Patología" && subdeckParam === "Respiratorio" && subsubdeckParam === "EPOC") {
        console.log("EPOC subsubdeck detected, using direct API loading");
        window.loadCardsFromAPI(deckParam, subdeckParam, subsubdeckParam);
    } else {
        // Check if initializeCardsFromUrl function exists
        if (typeof initializeCardsFromUrl === 'function') {
            console.log("initializeCardsFromUrl function found, initializing cards...");
            try {
                initializeCardsFromUrl(deckParam, subdeckParam, subsubdeckParam, modeParam);
                
                // Set a timer to check if globalCardData was populated
                setTimeout(function() {
                    if (!window.globalCardData || window.globalCardData.length === 0) {
                        console.log("No cards found in globalCardData after initialization, trying direct API load");
                        window.loadCardsFromAPI(deckParam, subdeckParam, subsubdeckParam);
                    } else {
                        console.log("Cards successfully loaded by initializeCardsFromUrl");
                    }
                }, 1500);
            } catch (error) {
                console.error("Error initializing cards:", error);
                showErrorMessage("Error initializing cards: " + error.message);
            }
        } else {
            console.error("initializeCardsFromUrl function not found");
            showErrorMessage("Error: Card initialization function not found. Please contact support.");
        }
    }
    
    // Set up event listeners for buttons
    setupButtonListeners();
});

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
                // Replace anchor tag with a button
                const subdeckButton = document.createElement('button');
                subdeckButton.className = 'subdeck-btn';
                subdeckButton.textContent = subdeck;
                // Add data attributes to store the deck and subdeck names
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
                // If no subdecks, navigate to the deck page
                const deckName = this.querySelector('.deck-name').textContent;
                window.location.href = `/study?deck=${encodeURIComponent(deckName)}`;
            }
        });
    });
    
    // Set up click handlers for the deck name spans for navigation
    const deckNameSpans = document.querySelectorAll('.deck-name');
    deckNameSpans.forEach(span => {
        span.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent the parent button click event
            const deckName = this.textContent;
            window.location.href = `/study?deck=${encodeURIComponent(deckName)}`;
        });
    });
    
    // Add click handlers for subdeck buttons
    const subdeckButtons = document.querySelectorAll('.subdeck-btn');
    subdeckButtons.forEach(button => {
        button.addEventListener('click', function() {
            const deck = this.dataset.deck;
            const subdeck = this.dataset.subdeck;
            window.location.href = `/study?deck=${encodeURIComponent(deck)}&subdeck=${encodeURIComponent(subdeck)}`;
        });
    });
}

/**
 * Set up all button event listeners for the study page
 */
function setupButtonListeners() {
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
            } else {
                console.error("Answer card not found");
            }
            
            // Show the SRS controls
            const srsControls = document.querySelector(".srs-controls");
            if (srsControls) {
                srsControls.classList.remove("hidden");
                console.log("SRS controls should now be visible");
            } else {
                console.error("SRS controls element not found");
            }
            
            // Hide the review button
            this.style.display = "none";
        });
    } else {
        console.error("Review button not found");
    }
    
    // SRS buttons
    const srsButtons = document.querySelectorAll(".difficulty");
    srsButtons.forEach(button => {
        button.addEventListener("click", function() {
            console.log("SRS button clicked:", this.textContent);
            // In the future, this will handle spaced repetition
            loadNextCard();
        });
    });
    
    // Skip button
    const skipButton = document.getElementById("skip-button");
    if (skipButton) {
        skipButton.addEventListener("click", function() {
            console.log("Skip button clicked");
            loadNextCard();
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
 * Function to show main content and hide loading/error messages
 */
function showMainContent() {
    console.log("Showing main content");
    document.getElementById("loading-message").style.display = "none";
    document.getElementById("error-message").style.display = "none";
    document.getElementById("no-cards-message").style.display = "none";
    
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
        mainContent.classList.remove("hidden");
        mainContent.style.display = "block";
    } else {
        console.error("Main content element not found");
    }
}

/**
 * Function to show error message
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
    document.getElementById("loading-message").style.display = "none";
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
    document.getElementById("loading-message").style.display = "none";
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
            pageTitle.innerHTML = `${deck} <span style="color:#666; font-size: 0.9em;">›</span> <span style="color:#777;">${subdeck}</span> <span style="color:#666; font-size: 0.9em;">›</span> <span style="color:#777;">${subsubdeck}</span>`;
        } else if (subdeck) {
            pageTitle.innerHTML = `${deck} <span style="color:#666; font-size: 0.9em;">›</span> <span style="color:#777;">${subdeck}</span>`;
        } else {
            pageTitle.textContent = deck || 'Study Page';
        }
    }
    
    // Update breadcrumb navigation
    const deckCrumb = document.getElementById('deck-crumb');
    const subdeckCrumb = document.getElementById('subdeck-crumb');
    const subsubdeckCrumb = document.getElementById('subsubdeck-crumb');
    const subdeckSeparator = document.getElementById('subdeck-separator');
    const subsubdeckSeparator = document.getElementById('subsubdeck-separator');
    
    if (deckCrumb && deck) {
        deckCrumb.textContent = deck;
        deckCrumb.href = `/study?deck=${encodeURIComponent(deck)}`;
        
        if (subdeckCrumb && subdeck) {
            subdeckCrumb.textContent = subdeck;
            subdeckSeparator.classList.remove('hidden');
            
            if (subsubdeckCrumb && subsubdeck) {
                subsubdeckCrumb.textContent = subsubdeck;
                subsubdeckSeparator.classList.remove('hidden');
            } else {
                subsubdeckSeparator.classList.add('hidden');
            }
        } else {
            subdeckSeparator.classList.add('hidden');
            subsubdeckSeparator.classList.add('hidden');
        }
    }
}

/**
 * Test function to manually toggle SRS controls visibility
 * Can be called from console for debugging
 */
function testToggleSRS() {
    const answerCard = document.querySelector(".card.answer");
    if (answerCard) {
        answerCard.classList.toggle("hidden");
        console.log("Answer card visibility toggled:", !answerCard.classList.contains("hidden"));
    } else {
        console.error("Answer card not found");
    }
    
    const srsControls = document.querySelector(".srs-controls");
    if (srsControls) {
        srsControls.classList.toggle("hidden");
        console.log("SRS controls visibility toggled:", !srsControls.classList.contains("hidden"));
    } else {
        console.error("SRS controls element not found");
    }
    
    const reviewButton = document.getElementById("revisar-button");
    if (reviewButton) {
        reviewButton.style.display = reviewButton.style.display === "none" ? "" : "none";
        console.log("Review button visibility toggled:", reviewButton.style.display !== "none");
    } else {
        console.error("Review button not found");
    }
}

// Make test function globally available
window.testToggleSRS = testToggleSRS;

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
            // If we're viewing a subsubdeck (like EPOC), go back to subdeck VIEW page
            // Not another study page - go to the actual subdeck page
            console.log(`Navigating from subsubdeck (${subsubdeck}) to subdeck page: ${deck}/${subdeck}`);
            window.location.href = `/deck/${encodeURIComponent(deck)}?subdeck=${encodeURIComponent(subdeck)}`;
        } else if (subdeck) {
            // If we're viewing a subdeck (like Respiratorio), go back to deck page
            console.log(`Navigating from subdeck (${subdeck}) to deck page: ${deck}`);
            window.location.href = `/deck/${encodeURIComponent(deck)}`;
        } else {
            // If we're viewing a deck, go back to dashboard
            window.location.href = '/dashboard';
        }
    });
}

/**
 * Loads the next flashcard, or resets the current one if no more cards
 */
function loadNextCard() {
    console.log("Study page loadNextCard called");
    
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
    
    // Log the current state of globalCardData
    console.log("Current globalCardData state:", {
        exists: !!window.globalCardData,
        length: window.globalCardData ? window.globalCardData.length : 0,
        currentIndex: window.currentCardIndex
    });
    
    // First check if we have cards loaded in globalCardData
    if (window.globalCardData && window.globalCardData.length > 0) {
        try {
            console.log("Using cards from globalCardData");
            displayCardFromGlobal();
            return;
        } catch (error) {
            console.error("Error displaying card from globalCardData:", error);
        }
    } else {
        // Try to reload cards from API if no globalCardData
        const urlParams = new URLSearchParams(window.location.search);
        const deckParam = urlParams.get('deck');
        const subdeckParam = urlParams.get('subdeck');
        const subsubdeckParam = urlParams.get('subsubdeck');
        
        if (deckParam) {
            console.log("No cards in globalCardData, attempting to reload from API");
            if (typeof window.loadCardsFromAPI === 'function') {
                window.loadCardsFromAPI(deckParam, subdeckParam, subsubdeckParam);
                return;
            }
        }
    }
    
    // If globalCardData didn't work, try the dashboard script's loadNextCard
    if (typeof window.loadNextCard === 'function' && window.loadNextCard !== loadNextCard) {
        // Store reference to this function to avoid recursion
        const originalLoadNextCard = window.loadNextCard;
        window.originalLoadNextCard = originalLoadNextCard;
        
        // Call the dashboard script's function
        console.log("Calling dashboard's loadNextCard function");
        
        // We need to adapt element IDs to match what dashboard script expects
        adaptElementIdsForDashboardScript();
        
        try {
            originalLoadNextCard();
        } catch (error) {
            console.error("Error calling original loadNextCard:", error);
            fallbackLoadNextCard();
        }
    } else {
        fallbackLoadNextCard();
    }
}

/**
 * Displays a card from the globalCardData array
 */
function displayCardFromGlobal() {
    // Get the current card
    const currentIndex = window.currentCardIndex || 0;
    if (!window.globalCardData || currentIndex >= window.globalCardData.length) {
        console.error("No cards available in globalCardData or index out of bounds");
        fallbackLoadNextCard();
        return;
    }

    const card = window.globalCardData[currentIndex];
    console.log("Displaying card:", card);
    
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
    
    // If this is a multiple-choice card, show options if applicable
    if (card.type === 'multipleChoice' && card.options && card.options.length > 0) {
        const questionLook = document.querySelector(".question-look");
        if (questionLook) {
            let optionsHtml = '<ul class="options-list">';
            card.options.forEach((option, index) => {
                optionsHtml += `<li>${option}</li>`;
            });
            optionsHtml += '</ul>';
            questionLook.innerHTML = optionsHtml;
        }
    } else {
        // For classic cards, just show placeholder or any custom content
        const questionLook = document.querySelector(".question-look");
        if (questionLook) {
            questionLook.textContent = "...";
        }
    }
    
    // Update card index for next time
    window.currentCardIndex = (currentIndex + 1) % window.globalCardData.length;
}

/**
 * Adapts our element IDs to match what the dashboard script expects
 * This is needed for compatibility between the study page and dashboard script
 */
function adaptElementIdsForDashboardScript() {
    console.log("Adapting element IDs for dashboard script compatibility");
    
    // Check if our question elements exist and dashboard's don't
    const cardFront = document.getElementById("card-front");
    const cardSubtitle = document.getElementById("card-subtitle");
    const questionLook = document.querySelector(".question-look");
    
    // Check if dashboard script's elements don't exist
    const questionTitle = document.getElementById("question-title");
    const questionSubtitle = document.getElementById("question-subtitle");
    const questionText = document.getElementById("question-text");
    
    // If we need to adapt elements
    if (cardFront && !questionTitle) {
        // Create a hidden question-title element that dashboard script can use
        const questionTitleElement = document.createElement("div");
        questionTitleElement.id = "question-title";
        questionTitleElement.style.display = "none";
        document.body.appendChild(questionTitleElement);
        
        // Set up mutation observer to sync card-front with question-title
        const observer = new MutationObserver(function(mutations) {
            const questionTitle = document.getElementById("question-title");
            if (questionTitle) {
                cardFront.textContent = questionTitle.textContent;
            }
        });
        
        observer.observe(questionTitleElement, { 
            characterData: true,
            childList: true,
            subtree: true
        });
    }
    
    // Do the same for subtitle if needed
    if (cardSubtitle && !questionSubtitle) {
        const questionSubtitleElement = document.createElement("div");
        questionSubtitleElement.id = "question-subtitle";
        questionSubtitleElement.style.display = "none";
        document.body.appendChild(questionSubtitleElement);
        
        const observer = new MutationObserver(function(mutations) {
            cardSubtitle.textContent = questionSubtitleElement.textContent;
        });
        
        observer.observe(questionSubtitleElement, { 
            characterData: true,
            childList: true,
            subtree: true
        });
    }
    
    // Set up question-text element if needed
    if (questionLook && !questionText) {
        const questionTextElement = document.createElement("div");
        questionTextElement.id = "question-text";
        questionTextElement.style.display = "none";
        document.body.appendChild(questionTextElement);
    }
}

/**
 * Fallback function to load a sample card when the real function isn't available
 */
function fallbackLoadNextCard() {
    console.log("Using fallback card loading function");
    
    // Set question card content
    const cardFront = document.getElementById("card-front");
    if (cardFront) {
        cardFront.textContent = "Sample Question";
    }
    
    const cardSubtitle = document.getElementById("card-subtitle");
    if (cardSubtitle) {
        cardSubtitle.textContent = "Sample Subtitle";
    }
    
    // Set placeholder text
    const questionLook = document.querySelector(".question-look");
    if (questionLook) {
        questionLook.textContent = "[...]";
    }
    
    // Update the answer text 
    const answerText = document.getElementById("answer-text");
    if (answerText) {
        answerText.textContent = "This is a sample answer.";
    }
} 