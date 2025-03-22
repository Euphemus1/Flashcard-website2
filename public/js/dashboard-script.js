// dashboard-script.js
//        let currentDeck = 'Microbiología';
//        let flashcards = [
//            {
//                question: "What is the cause of Necrotizing Fasciitis?",
//                answer: "Streptococcus pyogenes and Staphylococcus aureus",
//                interval: 1,
//                lastReview: new Date().getTime(),
//                deck: 'Microbiología',
//                subdeck: 'Bacterias'
//            },
//            {
//                question: "What is the most common cause of bacterial pneumonia?",
//                answer: "Streptococcus pneumoniae",
//                interval: 1,
//                lastReview: new Date().getTime(),
//                deck: 'Microbiología',
//                subdeck: 'Bacterias'
//            }
//        ];

// Define global variables
let currentDeck = 'Microbiología';
let flashcards = []; // Initialize empty array for flashcards
let currentCardIndex = 0;

// Display username immediately when page loads
function displayUsername() {
    console.log('CHECKING LOCALSTORAGE...');
    const userData = localStorage.getItem('currentUser');
    console.log('RAW STORAGE DATA:', userData);
    
    try {
      if (userData) {
        const user = JSON.parse(userData);
        console.log('PARSED USER:', user);
        const usernameElement = document.getElementById('username-display');
        console.log('USERNAME ELEMENT EXISTS?', !!usernameElement);
        if (usernameElement && user.email) {
          usernameElement.textContent = `Hola, ${user.email.split('@')[0]}`;
          
          isAdmin = user.isAdmin;
          if (isAdmin) {
            const adminModal = document.getElementById('admin-modal'); // 1. Store element reference
            if (adminModal) { // 2. Check if element exists
              adminModal.classList.remove('hidden'); // 3. Only modify if element exists
            }
          }
          
          console.log('USERNAME SHOULD BE VISIBLE NOW');
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    displayUsername();
    
    // Setup deck button navigation
    setupDeckButtonNavigation();
    
    // Add event listener for test dynamic deck button
    const testDynamicDeckBtn = document.getElementById('test-dynamic-deck-btn');
    if (testDynamicDeckBtn) {
        testDynamicDeckBtn.addEventListener('click', () => {
            console.log('Test button clicked - navigating to Microbiología dynamic deck page');
            window.location.href = '/deck/Microbiología';
        });
    }
    
    // Add contact button functionality
    document.getElementById('contact-button')?.addEventListener('click', showContact);
});

// Function to set up deck button navigation to dynamic pages
function setupDeckButtonNavigation() {
    // Get all deck buttons
    const deckButtons = document.querySelectorAll('.deck-btn');
    
    deckButtons.forEach(button => {
        // First remove any existing click listeners by cloning
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Create a span for the deck name text if it doesn't exist
        let deckNameSpan = newButton.querySelector('.deck-name');
        if (!deckNameSpan) {
            // Extract the text content and + symbol
            const buttonText = newButton.textContent.trim();
            const plusSymbol = buttonText.includes('+') ? '+' : '-';
            const deckNameText = buttonText.replace('+', '').replace('-', '').trim();
            
            // Clear the button's content
            newButton.innerHTML = '';
            
            // Add a span for the deck name FIRST
            deckNameSpan = document.createElement('span');
            deckNameSpan.className = 'deck-name';
            deckNameSpan.textContent = deckNameText;
            newButton.appendChild(deckNameSpan);
            
            // Add a span for the plus/minus symbol SECOND
            const plusSpan = document.createElement('span');
            plusSpan.className = 'plus';
            plusSpan.textContent = plusSymbol;
            newButton.appendChild(plusSpan);
        }
        
        // Now add our click listener for toggling subdecks
        newButton.addEventListener('click', function(e) {
            const plusSymbol = this.querySelector('.plus');
            const subdeckList = this.nextElementSibling;
            
            // Only toggle if we're clicking the plus/minus symbol or if there's no subdeck list
            if (e.target === plusSymbol || !subdeckList || !subdeckList.classList.contains('subdeck-list')) {
                if (subdeckList && subdeckList.classList.contains('subdeck-list')) {
                    e.preventDefault();
                    if (subdeckList.style.display === 'block') {
                        subdeckList.style.display = 'none';
                        plusSymbol.textContent = '+';
                    } else {
                        subdeckList.style.display = 'block';
                        plusSymbol.textContent = '-';
                    }
                }
            }
        });
        
        // Add click handler for the deck name span to navigate to the deck page
        deckNameSpan.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent the parent's click event from firing
            
            const deckName = this.textContent.trim().split(' ')[0];
            console.log('Clicked on deck name:', deckName);
            navigateToDeckPage(deckName);
        });
    });
}

// Function to navigate to a dynamic deck page
function navigateToDeckPage(deckName) {
    console.log('Navigating to deck page for:', deckName);
    
    // Navigate to the dynamic deck page
    const url = `/deck/${encodeURIComponent(deckName)}`;
    console.log('Redirecting to:', url);
    window.location.href = url;
}

// Modified toggleSubdecks function that works with the new click handlers
function toggleSubdecks(event) {
    // This function is now handled inside setupDeckButtonNavigation
    // Keeping it for backward compatibility
}

// Modified addToggleListeners function
function addToggleListeners() {
    // This function is now handled inside setupDeckButtonNavigation
    // Don't need to do anything here as setupDeckButtonNavigation will handle it all
    console.log('Deck button navigation set up');
}

// Function to show the main content (flashcard system)
function showMainContent() {
    const mainContent = document.getElementById('main-content');
    const overviewSection = document.getElementById('overview-section');
    const flashcardSystem = document.getElementById('flashcard-system');
    const updatesDropdown = document.querySelector('.updates-dropdown');
    const calendar = document.getElementById('study-calendar');

    mainContent?.classList?.remove('hidden');
    overviewSection?.classList?.add('hidden');
    updatesDropdown?.classList?.add('hidden');
    calendar?.classList?.add('hidden');
    flashcardSystem?.classList?.remove('hidden');
}

// Add event listener for the overview button
document.getElementById('overview-button')?.addEventListener('click', () => {
    if (!window.location.pathname.includes('dashboard.html')) {
        window.location.href = '/dashboard.html';
    } else {
        showOverview();
    }
});

// Load the overview section by default when the page loads
window.onload = function() {
    // Only show overview if section exists
    if (document.getElementById('overview-section')) {
        showOverview();
    }
};

// Existing functions for flashcard functionality
function flipCard() {
    const questionCard = document.querySelector('.question');
    const answerCard = document.querySelector('.answer');
    const reviewActions = document.getElementById('review-actions');
    const srsControls = document.querySelector('.srs-controls');

    console.log("Flipping card...");

    // Hide the question card and show the answer card
    questionCard.classList.add('hidden');
    answerCard.classList.remove('hidden');

    // Hide the Skip and Revisar buttons
    reviewActions.classList.add('hidden');

    // Show the review options
    srsControls.classList.remove('hidden');
}

function rateCard(minutes) {
    const currentCard = flashcards[currentCardIndex];
    const newReviewTime = new Date().getTime() + minutes * 60000;
    currentCard.lastReview = newReviewTime;
    currentCard.interval *= 1.5;
    showStatus('¡Tarjeta actualizada!');
    setTimeout(() => loadNextCard(), 1000);
}

function showStatus(status) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = status;
}

function skipCard() {
    showStatus('Tarjeta saltada.');
    loadNextCard();
}

// Add this function to inject CSS styles once at the beginning
function addCustomStyles() {
    // This function is no longer needed since we added the styles directly to the CSS file
    // Keeping this as an empty function for backward compatibility
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', addCustomStyles);

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
    const shuffled = [...array]; // Create a copy of the array
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }
    return shuffled;
}

function loadNextCard() {
    // Check if flashcards array is empty or undefined
    if (!flashcards || flashcards.length === 0) {
        console.warn('No flashcards available to load');
        
        // Display a message to the user
        const questionCard = document.querySelector('.question');
        const answerCard = document.querySelector('.answer');
        
        if (questionCard) {
            questionCard.innerHTML = `
                <h3>No Flashcards Available</h3>
                <p>Please select a deck with flashcards or add new flashcards to this deck.</p>
            `;
        }
        
        if (answerCard) {
            answerCard.innerHTML = `
                <p>No answer available</p>
            `;
        }
        
        return;
    }
    
    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
    const currentCard = flashcards[currentCardIndex];

    // Enhanced logging for debugging
    console.log("Loading card:", currentCard);
    
    // FIX: Validate correctIndex - if it's -1 or invalid, set it to 0 as fallback
    if (currentCard.type === 'multipleChoice') {
        if (currentCard.correctIndex === -1 || 
            currentCard.correctIndex === undefined || 
            currentCard.correctIndex === null || 
            currentCard.correctIndex >= currentCard.options.length) {
            
            console.warn(`Card ${currentCard._id} has invalid correctIndex (${currentCard.correctIndex}), setting to 0 as fallback`);
            currentCard.correctIndex = 0;
        }
    }
    
    // Get card elements
    const questionCard = document.querySelector('.question');
    const answerCard = document.querySelector('.answer');
    const reviewActions = document.getElementById('review-actions');
    const srsControls = document.querySelector('.srs-controls');
    const skipButton = document.getElementById('skip-button');
    const cardPair = document.querySelector('.card-pair');

    // Reset card visibility
    questionCard.classList.remove('hidden');
    if (answerCard) answerCard.classList.add('hidden');
    if (srsControls) srsControls.classList.add('hidden');
    if (reviewActions) reviewActions.classList.remove('hidden');

    if (currentCard.type === 'multipleChoice') {
        // Handle choice card
        const cardFront = document.getElementById('card-front');
        const choiceOptions = document.getElementById('choice-options');
        
        // Add choice-card class to the card-pair element
        if (cardPair) {
            cardPair.classList.add('choice-card');
        }
        
        // Reset the skip button text and remove seguir-button class if it exists
        if (skipButton) {
            skipButton.textContent = 'Saltar';
            skipButton.classList.remove('seguir-button');
        }
        
        if (cardFront && choiceOptions) {
            // Clear previous content
            cardFront.textContent = currentCard.question;
            choiceOptions.innerHTML = '';
            
            console.log('Loading choice card:', currentCard.question);
            console.log('Card Options Array:', JSON.stringify(currentCard.options));
            console.log('Card correctIndex (RAW):', currentCard.correctIndex, typeof currentCard.correctIndex);
            console.log('Card full data:', JSON.stringify(currentCard));
            
            // Validate the current card has options
            if (!currentCard.options || !Array.isArray(currentCard.options) || currentCard.options.length === 0) {
                console.error("Card has no valid options array:", currentCard);
                return;
            }
            
            // Get the correct answer index from the card data
            const correctIndex = currentCard.correctIndex;
            console.log('DEBUG [loadNextCard]: Card data:', {
                question: currentCard.question,
                correctIndex: correctIndex,
                typeOfCorrectIndex: typeof correctIndex,
                options: currentCard.options,
                _id: currentCard._id
            });
            
            // Add detailed logging about the card and options
            console.log('======== CARD DEBUG IN LOAD NEXT CARD ========');
            console.log('Card question:', currentCard.question);
            console.log('Card type:', currentCard.type);
            console.log('Card options:', currentCard.options);
            console.log('Card correctIndex (raw):', currentCard.correctIndex, typeof currentCard.correctIndex);
            console.log('Card correctIndex (as number):', Number(correctIndex), typeof Number(correctIndex));
            
            if (correctIndex !== undefined && currentCard.options && currentCard.options.length > 0) {
                console.log('Correct option text should be:', currentCard.options[Number(correctIndex)]);
            }
            
            // Create shuffled options with tracked original indices
            const optionsWithIndices = currentCard.options.map((option, index) => ({
                option,
                originalIndex: index,
                isCorrect: index === Number(correctIndex)
            }));
            
            console.log('Options with indices (before shuffle):', JSON.stringify(optionsWithIndices));
            
            // Shuffle the options
            const shuffledOptions = shuffleArray(optionsWithIndices);
            
            console.log('Shuffled options (after shuffle):', JSON.stringify(shuffledOptions));
            console.log('======== END CARD DEBUG ========');
            
            // Create and add choice buttons
            shuffledOptions.forEach((item, displayIndex) => {
                // Extract original option and index
                const option = item.option;
                const originalIndex = item.originalIndex;
                const isCorrect = item.isCorrect;
                
                // Create button
                const choiceButton = document.createElement('button');
                
                // Set clean visual text (without the ] marker)
                const displayText = option.replace(/\]$/, '').trim();
                
                // Clean up the display text - remove anything after a slash
                let cleanDisplayText = displayText;
                const slashIndex = displayText.indexOf('/');
                if (slashIndex !== -1) {
                    cleanDisplayText = displayText.substring(0, slashIndex).trim();
                }
                
                // Set basic styling
                choiceButton.className = 'choice';
                choiceButton.style.width = '100%';
                choiceButton.style.padding = '12px 20px';
                choiceButton.style.margin = '8px 0';
                choiceButton.style.border = '2px solid #3498db';
                choiceButton.style.borderRadius = '8px';
                choiceButton.style.backgroundColor = '#fff';
                choiceButton.style.color = '#2c3e50';
                choiceButton.style.fontSize = '16px';
                choiceButton.style.cursor = 'pointer';
                choiceButton.style.position = 'relative';
                
                // Set the display text (without ] and without anything after /)
                choiceButton.textContent = cleanDisplayText;
                choiceButton.disabled = false;
                
                // Add data attributes to track both original index and correctness
                choiceButton.dataset.originalIndex = originalIndex.toString();
                choiceButton.dataset.isCorrect = isCorrect.toString();
                
                // DEBUG START
                console.log(`DEBUG [Button ${displayIndex}]:`, {
                    text: cleanDisplayText,
                    originalIndex: originalIndex,
                    isCorrect: isCorrect,
                    isCorrectCheck: originalIndex === Number(correctIndex)
                });
                // DEBUG END
                
                // Add event listener - pass the original index as a number to maintain correct answer tracking
                choiceButton.addEventListener('click', () => handleChoiceSelection(Number(originalIndex)));
                
                // Log if this is the correct option
                if (originalIndex === correctIndex) {
                    console.log(`Option ${displayIndex} (original ${originalIndex}) is correct:`, option);
                }
                
                // Add button to container
                choiceOptions.appendChild(choiceButton);
            });
        }
    } else {
        // Handle classic card
        const cardFront = document.getElementById('card-front');
        const cardSubtitle = document.getElementById('card-subtitle');
        const choiceOptions = document.getElementById('choice-options');
        
        // Clear any existing choice options from previous cards
        if (choiceOptions) {
            choiceOptions.innerHTML = '';
        }
        
        // Remove choice-card class from the card-pair element
        if (cardPair) {
            cardPair.classList.remove('choice-card');
        }
        
        // Reset the skip button text and remove seguir-button class if it exists
        if (skipButton) {
            skipButton.textContent = 'Saltar';
            skipButton.classList.remove('seguir-button');
        }
        
        if (cardFront) {
            cardFront.textContent = currentCard.question;
            
            if (cardSubtitle) {
                if (currentCard.subtitle) {
                    cardSubtitle.textContent = currentCard.subtitle;
                    cardSubtitle.classList.remove('hidden');
                } else {
                    cardSubtitle.classList.add('hidden');
                }
            }
        }

        if (answerCard) {
            const answerContent = answerCard.querySelector('.card-content');
            if (answerContent) {
                answerContent.innerHTML = `
                    <h3>${currentCard.question}</h3>
                    ${currentCard.subtitle ? `<p class="subtitle">${currentCard.subtitle}</p>` : ''}
                    <div class="answer-text">${currentCard.answer.replace(/\n/g, '<br>')}</div>
                    ${currentCard.extraInfo ? `
                        <div class="notes">
                            <strong>Notas:</strong>
                            ${currentCard.extraInfo.replace(/\n/g, '<br>')}
                        </div>
                    ` : ''}
                `;
            }
        }
    }

    // Ensure skip button has the correct event handler
    updateSkipButtonHandler();

    showStatus(currentCard.interval > 1 ? 'Para repasar' : 'Tarjeta nueva');
}

function switchDeck(deckName) {
    currentDeck = deckName;
    flashcards = getDeckData(deckName);
    loadNextCard();
}

async function getDeckData(deckName, subdeckName = null) {
    try {
      // 1. Create URL parameters
      const params = new URLSearchParams({ deck: deckName });
      if (subdeckName) params.set('subdeck', subdeckName);
  
      // 2. Make API call with both parameters
      console.log(`Fetching cards for deck: ${deckName}${subdeckName ? ', subdeck: ' + subdeckName : ''}`);
      const response = await fetch(`/api/flashcards?${params.toString()}`);
      
      // 3. Handle response
      if (!response.ok) {
        console.warn('⚠️ API response not OK, using default cards');
        return getDefaultCards();
      }
      
      const data = await response.json();
      console.log(`Received ${data.length} cards from server:`, data);
      
      // IMPORTANT: Debug the structure of the cards (especially correctIndex)
      console.log("===== DETAILED CARD DEBUG =====");
      data.forEach((card, i) => {
        console.log(`Card ${i+1}:`);
        console.log(`- question: ${card.question}`);
        console.log(`- type: ${card.type}`);
        console.log(`- correctIndex: ${card.correctIndex} (type: ${typeof card.correctIndex})`);
        console.log(`- options: ${JSON.stringify(card.options)}`);
        
        // If correctIndex is defined, check if it points to a valid option
        if (card.correctIndex !== undefined && card.options && card.options.length > 0) {
          const correctOption = card.options[Number(card.correctIndex)];
          console.log(`- correct option value: ${correctOption}`);
        }
      });
      console.log("===== END DETAILED CARD DEBUG =====");
      
      // Log any cards with extraInfo for debugging
      const cardsWithExtraInfo = data.filter(card => card.extraInfo);
      if (cardsWithExtraInfo.length > 0) {
        console.log(`Found ${cardsWithExtraInfo.length} cards with extraInfo:`, cardsWithExtraInfo);
      } else {
        console.log('No cards with extraInfo found');
      }
      
      return data;
    } catch (error) {
      console.error('Error loading deck:', error);
      return getDefaultCards();
    }
  }

// Add event listeners for dropdown functionality
document.querySelectorAll('.deck-btn').forEach(button => {
    button.addEventListener('click', function() {
        const subdeckList = this.nextElementSibling;
        subdeckList.style.display = subdeckList.style.display === 'block' ? 'none' : 'block';
        
    });
});

// awd
document.querySelectorAll('.deck-btn, .subdeck-btn').forEach(button => {
    button.addEventListener('click', function() {
        if (this.classList.contains('subdeck-btn')) {
            const subdeckName = this.textContent.trim();
            const deckButton = this.closest('ul.subdeck-list').previousElementSibling;
            const deckName = deckButton.textContent
                .replace('+', '')
                .trim()
                .replace(/\s*\(en breve!\)$/, '');

            // Modified section starts here
            if (deckName === 'Patología') {
                if (subdeckName === 'ERA1') {
                    window.location.href = '/protected/patologia-era1.html';
                } else if (subdeckName === 'ERA2') {
                    window.location.href = '/protected/patologia-era2.html';
                } else if (subdeckName === 'ERA3') {
                    window.location.href = '/protected/patologia-era3.html';
                }
                getDeckData('Patología', subdeckName).then(data => {
                    flashcards = data;
                    loadNextCard();
                });
                return;
            }
        }
        showMainContent();
        loadNextCard();
    });
});

// Add event listeners for flashcard actions
const revisarButton = document.getElementById('revisar-button');
const skipButton = document.getElementById('skip-button');

// Only add event listeners if elements exist
revisarButton?.addEventListener('click', flipCard);
skipButton?.addEventListener('click', skipCard);

// Add optional chaining for difficulty buttons
document.querySelector('.denuevo')?.addEventListener('click', () => rateCard(10));
document.querySelector('.díficil')?.addEventListener('click', () => rateCard(60));
document.querySelector('.bueno')?.addEventListener('click', () => rateCard(1440));
document.querySelector('.fácil')?.addEventListener('click', () => rateCard(2880));

// Admin pannel
document.addEventListener('DOMContentLoaded', () => {
    // Existing initializations
    displayUsername();
    initializeERA1Cards();
    initializeERA2Cards();
    document.getElementById('contact-button')?.addEventListener('click', showContact);
    
    // Calendar initialization
    if (document.getElementById('study-calendar')) {
        generateCalendar();
    }

    // Admin panel initialization
    const adminModal = document.getElementById('admin-modal');
    const openAdminBtn = document.getElementById('open-admin-btn');
    const closeAdminBtn = document.querySelector('.admin-close-btn');

    // Open/close admin panel
    openAdminBtn?.addEventListener('click', () => {
        adminModal.classList.remove('hidden');
        
        // Initialize UI for the currently selected card type
        const selectedCardType = document.querySelector('input[name="card-type"]:checked')?.value || 'Clasic';
        updateCardTypeUI(selectedCardType);

        // Populate deck select
        populateDeckSelect();
    });
    
    closeAdminBtn?.addEventListener('click', () => {
        adminModal.classList.add('hidden');
    });

    // Populate the deck select dropdown
    function populateDeckSelect() {
        const deckSelect = document.getElementById('deck-select');
        if (!deckSelect) return;

        // Clear existing options
        deckSelect.innerHTML = '';

        // Get the available decks
        const deckData = window.globalDecks || {
            'Microbiología': ['Bacterias', 'Hongos', 'Parásitos', 'Virus'],
            'Semiología': ['Historía clínica', 'Piel y faneras', 'Cabeza y cuello', 'Respiratorio', 'Cardiovascular', 'Digestivo', 'Urinario', 'Neurología', 'Osteoarticular'],
            'Patología': ['Metabolopatías', 'Inflamación', 'Neoplasias', 'Cardiovascular', 'Respiratorio', 'Digestivo', 'Aparato urinario', 'Aparato reproductor', 'Piel', 'Huesos y articulaciones', 'Sistema endocrino', 'Otros'],
            'Farmacología': ['ERA1', 'ERA2'],
            'Terapéutica 1': ['ERA1', 'ERA2', 'ERA3'],
            'Medicina Interna 1': ['Neumonología', 'Cardiovascular', 'Tubo Digestivo', 'Neurología', 'Anexos'],
            'Revalida': ['Bling', 'Blang', 'Blong'],
            'MIR': ['Bling', 'Blang', 'Blong']
        };

        // Add options for each deck
        Object.keys(deckData).forEach(deckName => {
            const option = document.createElement('option');
            option.value = deckName;
            option.textContent = deckName;
            deckSelect.appendChild(option);
        });

        // Set up event listener for deck changes
        deckSelect.addEventListener('change', updateSubdeckInput);

        // Initialize subdeck input with the current selection
        updateSubdeckInput();
    }

    // Update the subdeck input based on the selected deck
    function updateSubdeckInput() {
        const deckSelect = document.getElementById('deck-select');
        const subdeckInput = document.getElementById('subdeck');
        const subsubdeckInput = document.getElementById('subsubdeck');
        const subdeckLabel = subdeckInput?.previousElementSibling;
        const subsubdeckContainer = subsubdeckInput?.parentElement;

        if (!deckSelect || !subdeckInput || !subsubdeckInput) return;

        const selectedDeck = deckSelect.value;
        const deckData = window.globalDecks || {};
        const subdecks = deckData[selectedDeck] || [];

        // Convert the input to a datalist with suggestions
        let datalistId = 'subdeck-list';
        let datalist = document.getElementById(datalistId);

        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = datalistId;
            document.body.appendChild(datalist);
            subdeckInput.setAttribute('list', datalistId);
        }

        // Clear existing options
        datalist.innerHTML = '';

        // Add options for each subdeck
        subdecks.forEach(subdeckName => {
            const option = document.createElement('option');
            option.value = subdeckName;
            datalist.appendChild(option);
        });

        // Update the label to indicate it's a selection
        if (subdeckLabel) {
            if (subdecks.length > 0) {
                subdeckLabel.textContent = 'Subdeck (select from list or type new):';
            } else {
                subdeckLabel.textContent = 'Subdeck:';
            }
        }

        // Set up event listener for subdeck changes
        subdeckInput.addEventListener('change', updateSubsubdeckInput);
        subdeckInput.addEventListener('input', updateSubsubdeckInput);

        // Initialize subsubdeck input
        updateSubsubdeckInput();
    }

    // Update the subsubdeck input based on the selected deck and subdeck
    function updateSubsubdeckInput() {
        const deckSelect = document.getElementById('deck-select');
        const subdeckInput = document.getElementById('subdeck');
        const subsubdeckInput = document.getElementById('subsubdeck');
        const subsubdeckLabel = subsubdeckInput?.previousElementSibling;
        const subsubdeckContainer = subsubdeckInput?.parentElement;

        if (!deckSelect || !subdeckInput || !subsubdeckInput || !subsubdeckLabel) return;

        const selectedDeck = deckSelect.value;
        const selectedSubdeck = subdeckInput.value;
        
        // Check if this subdeck has subsubdecks
        const hasSubsubdecks = window.globalSubsubdecks && 
                            window.globalSubsubdecks[selectedDeck] && 
                            window.globalSubsubdecks[selectedDeck][selectedSubdeck];

        // Get subsubdecks if they exist
        const subsubdecks = hasSubsubdecks ? window.globalSubsubdecks[selectedDeck][selectedSubdeck] : [];

        // Use a datalist for subsubdeck suggestions
        let datalistId = 'subsubdeck-list';
        let datalist = document.getElementById(datalistId);

        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = datalistId;
            document.body.appendChild(datalist);
            subsubdeckInput.setAttribute('list', datalistId);
        }

        // Clear existing options
        datalist.innerHTML = '';

        // Add options for each subsubdeck if they exist
        if (hasSubsubdecks) {
            subsubdecks.forEach(subsubdeckName => {
                const option = document.createElement('option');
                option.value = subsubdeckName;
                datalist.appendChild(option);
            });

            // Update the label and show field
            subsubdeckLabel.textContent = 'Subsubdeck (select from list or type new):';
            subsubdeckLabel.style.color = '#007bff'; // Highlight to show it's important
            subsubdeckInput.style.borderColor = '#007bff';
            subsubdeckContainer.style.display = 'block';
                } else {
            // Reset styling and show as optional
            subsubdeckLabel.textContent = 'Subsubdeck (optional):';
            subsubdeckLabel.style.color = '';
            subsubdeckInput.style.borderColor = '';
            subsubdeckContainer.style.display = 'block';
        }
    }

    // Form submission handler
    document.getElementById('add-flashcard-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Adding...';
        
        // Get form values
        const cardType = document.querySelector('input[name="cardType"]:checked')?.value || 'classic';
        const questionInput = document.getElementById('questionInput')?.value;
        const deck = document.getElementById('deckSelect')?.value;
        const subdeck = document.getElementById('subdeckSelect')?.value;
        const subsubdeck = document.getElementById('subsubdeckSelect')?.value;
        const tags = document.getElementById('tagsInput')?.value;
        
        // Validate required fields
        if (!questionInput || !deck || !subdeck) {
            alert('Please fill out all required fields (question, deck, and subdeck)');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Add Flashcard';
            return;
        }
        
        // Parse the question input based on card type
        try {
            let formData = {};
            
            if (cardType === 'classic') {
                const { question, subtitle, answer, extraInfo } = parseClassicCard(questionInput);
                formData = {
                    type: 'classic',
                    question,
                    subtitle: subtitle || '',
                    answer,
                    extraInfo: extraInfo || '',
                    deck,
                    subdeck,
                    tags: tags ? tags.split(',').map(tag => tag.trim()) : []
                };
                
                // Add subsubdeck if it exists
                if (subsubdeck) {
                    formData.subsubdeck = subsubdeck;
                }
            } else if (cardType === 'multipleChoice') {
                const { question, options, correctIndex, explanation } = parseMultipleChoiceQuestions(questionInput);
                
                // Validate that we have options and a correct answer
                if (!options || options.length === 0) {
                    throw new Error('Multiple choice cards must have options. Please add at least 2 options.');
                }
                
                if (correctIndex === -1) {
                    throw new Error('Please specify a correct answer using "Correct: [option text]"');
                }
                
                formData = {
                    type: 'multipleChoice',
                    question,
                    options,
                    correctIndex,
                    extraInfo: explanation || '', // Use explanation as extraInfo for database compatibility
                    deck,
                    subdeck,
                    tags: tags ? tags.split(',').map(tag => tag.trim()) : []
                };
                
                // Add subsubdeck if it exists
                if (subsubdeck) {
                    formData.subsubdeck = subsubdeck;
                }
            }
            
            console.log('Form data to be submitted:', formData);
            
            // Send the data to the server
            const response = await fetch('/api/flashcards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                console.log('Flashcard added successfully:', result);
                // Clear form fields
                document.getElementById('questionInput').value = '';
                document.getElementById('tagsInput').value = '';
                
                // Show success message
                alert('Flashcard added successfully!');
            } else {
                console.error('Error adding flashcard:', result);
                alert(`Error: ${result.error || 'Failed to add flashcard'}`);
            }
        } catch (error) {
            console.error('Error processing form:', error);
            alert(`Error: ${error.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Add Flashcard';
        }
    });

    // Other existing initializations
    populateDeckDropdown();
    if (document.querySelector('.class-grid')) {
        updateClassBlockCounts();
    }
    
    // Set up the enhanced live preview functionality
    setupLivePreview();
    
    // Preview button has been removed from HTML, so no event listener needed
    // document.getElementById('preview-btn')?.addEventListener('click', updatePreview);
    
    // Toggle answer preview
    document.querySelector('.toggle-preview')?.addEventListener('click', function() {
        const answer = document.querySelector('.preview-answer');
        answer.classList.toggle('hidden');
        this.textContent = answer.classList.contains('hidden') ? 'Show Answer' : 'Hide Answer';
    });
});

// FAQ Button
document.getElementById('faq-button').addEventListener('click', () => {
    showFAQ();
});

function showFAQ() {
    const faqContent = `
        <div class="faq-modal">
            <div class="faq-header">
                <h2>Preguntas Frecuentes</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="faq-content">
                <div class="faq-item">
                    <div class="question">📘 ¿Cómo funciona la repetición espaciada?</div>
                    <div class="answer">
                        El sistema usa un algoritmo inteligente:
                        <ul>
                            <li>🔵 <strong>Cartas nuevas</strong>: Las que nunca viste</li>
                            <li>🟢 <strong>Cartas pendientes</strong>: Para repasar según tu progreso</li>
                            <li>⏱️ Cuanto mejor recuerdes, más se espaciarán los repasos</li>
                        </ul>
                    </div>
                </div>

                <div class="faq-item">
                    <div class="question">🎯 ¿Cómo calificar mis respuestas?</div>
                    <div class="answer">
                        Usá las 4 opciones:
                        <ul>
                            <li><span class="denuevo">De nuevo</span>: No lo recordé - Se repite en 10 min</li>
                            <li><span class="díficil">Difícil</span>: Costó recordar - 1 día</li>
                            <li><span class="bueno">Bueno</span>: Lo sabía bien - 4 días</li>
                            <li><span class="fácil">Fácil</span>: Automático - 8 días</li>
                        </ul>
                    </div>
                </div>

                <div class="faq-item">
                    <div class="question">📊 ¿Qué significan los números?</div>
                    <div class="answer">
                        <ul>
                            <li><strong>Nuevas</strong> (azul): Cartas nunca vistas</li>
                            <li><strong>Pendientes</strong>: Cartas para repasar</li>
                            <li>Hacé clic en los mazos (➕) para ver sub-mazos</li>
                        </ul>
                    </div>
                </div>

                <div class="faq-item">
                    <div class="question">💡 Consejos de estudio</div>
                    <div class="answer">
                        Buenas prácticas:
                        <ul>
                            <li>📅 Estudiá 15-30 minutos por día</li>
                            <li>🧠 Enfocate en entender, no en memorizar</li>
                            <li>🔄 Repasá cartas viejas regularmente</li>
                            <li>⏸️ Tomate pausas entre sesiones</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    const faqOverlay = document.createElement('div');
    faqOverlay.className = 'faq-overlay';
    faqOverlay.innerHTML = faqContent;
    document.body.appendChild(faqOverlay);

    // Add event listeners
    faqOverlay.querySelector('.close-btn').addEventListener('click', () => {
        faqOverlay.remove();
    });

    faqOverlay.addEventListener('click', (e) => {
        if(e.target === faqOverlay) faqOverlay.remove();
    });

    // Add toggle functionality for questions
    document.querySelectorAll('.faq-item .question').forEach(question => {
        question.addEventListener('click', () => {
            question.nextElementSibling.classList.toggle('show');
            question.classList.toggle('active');
        });
    });
}

document.getElementById('logout').addEventListener('click', () => {
    // currentUser = null;
    localStorage.removeItem('currentUser');
    // alert('You have been logged out due to inactivity.');
    // re=route to /
    window.location.href = "/";
    
});

// Sidebar Toggle Button
document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const topNav = document.getElementById('top-nav');
    const mainContent = document.getElementById('main-content');

    console.log("Toggling sidebar...");

    sidebar.classList.toggle('collapsed');
    topNav.classList.toggle('collapsed');
    mainContent.classList.toggle('full-width');
}

// Add this to your existing JavaScript
document.querySelector('.dropdown-toggle')?.addEventListener('click', function() {
    this.classList.toggle('active');
    const content = this.nextElementSibling;
    if (content) content.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.querySelector('.updates-dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
        dropdown.querySelector('.dropdown-content').classList.remove('show');
        dropdown.querySelector('.dropdown-toggle').classList.remove('active');
    }
});

// Add this to generateCalendar function
function generateCalendar() {
    const calendarContainer = document.getElementById('study-calendar');
    if (!calendarContainer) return; // Exit if element doesn't exist

    // Create all 12 months
    for (let month = 0; month < 12; month++) {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'month-container';
        
        // Month header
        const monthName = new Date(2025, month, 1).toLocaleDateString('es-ES', {month: 'long'});
        monthDiv.innerHTML = `<div class="month-header">${monthName.toUpperCase()}</div>`;
        
        // Create day grid
        const grid = document.createElement('div');
        grid.className = 'calendar-grid';
        
   

        // Calculate days
        const start = new Date(2025, month, 1);
        const end = new Date(2025, month + 1, 0);
        const startDay = (start.getDay() + 6) % 7; // Convert to Mon-Sun week
        
        // Add empty blocks
        for (let i = 0; i < startDay; i++) {
            grid.appendChild(createDayElement('', false, true));
        }

        // Add actual days
        for (let d = 1; d <= end.getDate(); d++) {
            const date = new Date(2025, month, d);
            grid.appendChild(createDayElement(d, false, false, date));
        }

        monthDiv.appendChild(grid);
        calendarContainer.appendChild(monthDiv);
    }
}

function createDayElement(day, isLabel, isEmpty, date) {
    const dayEl = document.createElement('div');
    dayEl.className = `calendar-day ${isLabel ? 'day-label' : ''} ${isEmpty ? 'empty' : ''}`;
    
    if (date) {
        dayEl.dataset.date = date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        dayEl.dataset.day = day;
    }
    
    return dayEl;
}

// Call this in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('study-calendar')) {
    generateCalendar();
}

displayUsername();
document.getElementById('contact-button')?.addEventListener('click', showContact);
});

// Admin Panel Functionality - REMOVED DUPLICATE CODE
// The admin panel initialization is already handled in the DOMContentLoaded event listener at lines 570-590

// Enhanced card preview functionality - Make it actually look like the real cards
function updatePreview() {
    console.log('Updating preview');
    
    // Get card type from radio buttons
    const cardTypeInput = document.querySelector('input[name="cardType"]:checked');
    if (!cardTypeInput) {
        console.error('No card type selected!');
        return;
    }
    
    const type = cardTypeInput.value;
    console.log('Card type:', type);
    
    // Get question text from textarea
    const questionInput = document.getElementById('questionInput');
    if (!questionInput) {
        console.error('Question input element not found!');
        return;
    }
    
    const content = questionInput.value;
    
    // Get preview container
    const previewContainer = document.querySelector('.card-preview');
    if (!previewContainer) {
        console.error('Preview container not found!');
        return;
    }
    
    console.log('Generating preview for content of length:', content.length);
    
    const lines = content.split('\n').filter(line => line.trim() !== '');

    // Clear previous content
    previewContainer.innerHTML = '';
    
    // Default content for empty preview
    if (lines.length === 0) {
        previewContainer.innerHTML = '<div class="empty-preview">Your card preview will appear here as you type...</div>';
        return;
    }

    if (type === 'multipleChoice') {
        try {
            // Create a realistic multiple choice card preview
            const parsedQuestion = parseMultipleChoiceQuestions(content);
            
            if (parsedQuestion.question) {
                // Create the card structure similar to the actual card
                previewContainer.innerHTML = `
                    <div class="card question" style="min-height: unset; min-width: unset; width: 100%;">
                        <div class="card-content">
                            <h3 id="card-front">${parsedQuestion.question}</h3>
                            <div id="choice-options" class="choice-options"></div>
                        </div>
                    </div>
                `;
                
                // Get choice options container
                const choiceOptions = previewContainer.querySelector('#choice-options');
                
                // Add choice buttons exactly as they would appear in the app
                parsedQuestion.options.forEach((option, index) => {
                    // Create button with the same styling as in the actual card
                    const choiceButton = document.createElement('button');
                    choiceButton.className = 'choice';
                    choiceButton.textContent = option;
                    choiceButton.style.position = 'relative';
                    choiceButton.style.paddingRight = '30px';
                    
                    // Mark the correct answer - always show a checkmark indicator
                    if (index === parsedQuestion.correctIndex) {
                        choiceButton.dataset.correct = 'true';
                        
                        // Make the correct answer visually identifiable
                        const correctIndicator = document.createElement('span');
                        correctIndicator.style.color = '#4caf50';
                        correctIndicator.style.fontSize = '16px';
                        correctIndicator.style.fontWeight = 'bold';
                        correctIndicator.style.position = 'absolute';
                        correctIndicator.style.right = '10px';
                        correctIndicator.style.top = '50%';
                        correctIndicator.style.transform = 'translateY(-50%)';
                        correctIndicator.innerHTML = '✓';
                        choiceButton.appendChild(correctIndicator);
                        
                        // Add a subtle background to indicate this is correct
                        choiceButton.style.backgroundColor = '#e8f5e9';
                        choiceButton.style.borderLeft = '3px solid #4caf50';
                    }
                    
                    choiceOptions.appendChild(choiceButton);
                });
                
                // Show the explanation if available
                if (parsedQuestion.explanation) {
                    previewContainer.innerHTML += `
                        <div class="explanation-container" style="margin-top: 1rem;">
                            <div class="explanation-text">
                                <strong>Explanation:</strong>
                                ${parsedQuestion.explanation.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    `;
                }
                
                // Add event listeners to buttons to simulate selection
                previewContainer.querySelectorAll('.choice').forEach(button => {
                    button.addEventListener('click', function() {
                        // Reset all buttons
                        previewContainer.querySelectorAll('.choice').forEach(btn => {
                            btn.classList.remove('correct', 'wrong');
                            
                            // Preserve the checkmark and styling on correct answer
                            if (!btn.dataset.correct) {
                                btn.style.backgroundColor = '';
                                btn.style.color = '';
                                btn.style.borderLeft = '';
                            } else {
                                btn.style.backgroundColor = '#e8f5e9';
                                btn.style.borderLeft = '3px solid #4caf50';
                            }
                        });
                        
                        // Show the button as correct or wrong
                        if (this.dataset.correct === 'true') {
                            this.classList.add('correct');
                            this.style.backgroundColor = '#4caf50';
                            this.style.color = 'white';
                            this.style.borderLeft = '3px solid #2e7d32';
                        } else {
                            this.classList.add('wrong');
                            this.style.backgroundColor = '#f44336';
                            this.style.color = 'white';
                            this.style.borderLeft = '3px solid #d32f2f';
                            
                            // Highlight the correct answer even more
                            const correctButton = previewContainer.querySelector('[data-correct="true"]');
                            if (correctButton) {
                                correctButton.classList.add('correct');
                                correctButton.style.backgroundColor = '#4caf50';
                                correctButton.style.color = 'white';
                                correctButton.style.borderLeft = '3px solid #2e7d32';
                                correctButton.style.fontWeight = 'bold';
                            }
                        }
                    });
                });
            } else {
                // No valid question found
                previewContainer.innerHTML = '<div class="empty-preview">Enter a question and options. Add ] at the end of the correct option.</div>';
            }
        } catch (error) {
            console.error('Error generating multiple choice preview:', error);
            // Show a helpful message
            previewContainer.innerHTML = '<div class="empty-preview">Error parsing multiple choice card. Mark the correct answer with ] at the end.</div>';
        }
    }
    else {
        // Create a realistic classic card preview
        // First show the question card
        let question = '';
        let subtitle = '';
        
        if (lines.length > 0) {
            question = lines[0];
        }
        
        if (lines.length > 1) {
            subtitle = lines[1];
        }
        
        // Create card structure exactly as in the actual app
        previewContainer.innerHTML = `
            <div class="card question" style="min-height: unset; min-width: unset; width: 100%;">
                <div class="card-content">
                    <h3 id="card-front">${question}</h3>
                    ${subtitle ? `<p class="subtitle" id="card-subtitle">${subtitle}</p>` : ''}
                    <p class="question-look">[...]</p>
                </div>
            </div>
            <button id="preview-flip-btn" class="btn" style="margin-top: 1rem; background-color: #429edb; color: white; width: 100%;">Show Answer</button>
            <div class="card answer hidden" style="min-height: unset; min-width: unset; width: 100%; margin-top: 1rem;">
                <div class="card-content">
                    <h3>${question}</h3>
                    ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
                    <div class="answer-text"></div>
                </div>
            </div>
        `;
        
        // Add content to the answer card
        const answerTextDiv = previewContainer.querySelector('.answer-text');
        if (answerTextDiv && lines.length > 2) {
            const answerContent = lines.slice(2).join('<br>');
            answerTextDiv.innerHTML = answerContent;
        }
        
        // Add functionality to the flip button
        const flipButton = document.getElementById('preview-flip-btn');
        if (flipButton) {
            flipButton.addEventListener('click', function() {
                const answerCard = previewContainer.querySelector('.card.answer');
                if (answerCard) {
                    answerCard.classList.toggle('hidden');
                    this.textContent = answerCard.classList.contains('hidden') ? 'Show Answer' : 'Hide Answer';
                }
            });
        }
    }
    
    console.log('Preview updated successfully');
}

// Function to set up live preview
function setupLivePreview() {
    console.log('Setting up live preview');
    
    // Get question textarea and card type inputs
    const questionTextarea = document.getElementById('questionInput');
    const cardTypeInputs = document.querySelectorAll('input[name="cardType"]');
    const expandButton = document.getElementById('expand-preview-btn');
    const closeXButton = document.getElementById('preview-close-x');
    const returnButton = document.getElementById('preview-return-btn');
    const previewOverlay = document.querySelector('.preview-overlay');
    
    if (!questionTextarea) {
        console.error('Question textarea not found!');
        return;
    }
    
    console.log('Question textarea found:', questionTextarea);
    
    // Update preview when textarea input changes - use debounce
    questionTextarea.addEventListener('input', debounce(function() {
        console.log('Textarea input detected, updating preview');
        updatePreview();
    }, 300));
    
    // Update preview when card type changes
    cardTypeInputs.forEach(input => {
        input.addEventListener('change', function() {
            console.log('Card type changed to:', this.value);
            updateCardTypeUI(this.value);
            updatePreview();
        });
    });
    
    // Set up expand button
    if (expandButton) {
        console.log('Setting up expand button');
        expandButton.addEventListener('click', toggleExpandedPreview);
    } else {
        console.error('Expand button not found!');
    }
    
    // Set up close X button
    if (closeXButton) {
        console.log('Setting up close X button');
        closeXButton.addEventListener('click', toggleExpandedPreview);
    }
    
    // Set up return button
    if (returnButton) {
        console.log('Setting up return button');
        returnButton.addEventListener('click', toggleExpandedPreview);
    }
    
    // Set up overlay click to close
    if (previewOverlay) {
        console.log('Setting up overlay click');
        previewOverlay.addEventListener('click', function(e) {
            if (e.target === previewOverlay) {
                toggleExpandedPreview();
            }
        });
    }
    
    // Initial preview update
    setTimeout(() => {
        console.log('Initial preview update');
        updatePreview();
        updateExpandedPreview();
    }, 300);
    
    console.log('Live preview setup complete');
}

// Function to toggle expanded preview
function toggleExpandedPreview() {
    console.log('Toggling expanded preview');
    
    const expandButton = document.getElementById('expand-preview-btn');
    const expandedPreview = document.querySelector('.expanded-preview');
    const regularPreview = document.querySelector('.card-preview');
    const previewOverlay = document.querySelector('.preview-overlay');
    const closeXButton = document.getElementById('preview-close-x');
    const returnButton = document.getElementById('preview-return-btn');
    
    if (!expandButton || !expandedPreview || !regularPreview) {
        console.error('Missing required elements for toggle expanded preview!');
        return;
    }
    
    // Check if preview is currently visible
    const isExpanded = expandedPreview.style.display === 'block';
    
    if (isExpanded) {
        // Hide expanded preview
        expandedPreview.style.display = 'none';
        regularPreview.style.display = 'block';
        if (previewOverlay) previewOverlay.style.display = 'none';
        if (closeXButton) closeXButton.style.display = 'none';
        if (returnButton) returnButton.style.display = 'none';
        expandButton.textContent = 'Show All Cards';
        console.log('Expanded preview hidden');
    } else {
        // Show expanded preview
        expandedPreview.style.display = 'block';
        regularPreview.style.display = 'none';
        if (previewOverlay) previewOverlay.style.display = 'block';
        if (closeXButton) closeXButton.style.display = 'block';
        if (returnButton) returnButton.style.display = 'block';
        expandButton.textContent = 'Hide All Cards';
        
        // Position the expanded preview in fullscreen
        expandedPreview.style.position = 'fixed';
        expandedPreview.style.top = '50%';
        expandedPreview.style.left = '50%';
        expandedPreview.style.transform = 'translate(-50%, -50%)';
        expandedPreview.style.width = '90vw';
        expandedPreview.style.height = '85vh';
        expandedPreview.style.backgroundColor = 'white';
        expandedPreview.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
        expandedPreview.style.zIndex = '1000';
        expandedPreview.style.padding = '20px';
        expandedPreview.style.overflowY = 'auto';
        
        // Style the overlay
        if (previewOverlay) {
            previewOverlay.style.position = 'fixed';
            previewOverlay.style.top = '0';
            previewOverlay.style.left = '0';
            previewOverlay.style.width = '100%';
            previewOverlay.style.height = '100%';
            previewOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            previewOverlay.style.zIndex = '999';
        }
        
        // Update the expanded preview content
        updateExpandedPreview();
        console.log('Expanded preview shown');
    }
}

/**
 * Update the UI based on the selected card type
 * @param {string} cardType - The selected card type ('classic' or 'multipleChoice')
 */
function updateCardTypeUI(cardType) {
    console.log('Updating UI for card type:', cardType);
    
    // Get relevant elements
    const questionInput = document.getElementById('questionInput');
    
    if (!questionInput) {
        console.error('Question input element not found');
        return;
    }
    
    // Update placeholder text based on card type
    if (cardType === 'classic') {
        questionInput.placeholder = `For Classic Cards:
Question on first line
Subtitle on second line (optional)
Answer on third line and beyond
Use /note for additional information`;
    } else if (cardType === 'multipleChoice') {
        questionInput.placeholder = `For Multiple Choice:
Question on first line
Option 1
Option 2
Option 3
Option 4
Correct: Option 3 (use exact text of the option)
Explanation: Additional details (optional)`;
    }
    
    // Update the preview based on the new card type
    updatePreview();
}

  // Expand active subdeck's parent
const activeSubdeck = document.querySelector('.subdeck-btn.active');
if (activeSubdeck) {
  const parentDeck = activeSubdeck.closest('li').previousElementSibling;
  const subdeckList = activeSubdeck.closest('.subdeck-list');
  
  if (parentDeck && subdeckList) {
    // Expand the subdeck list
    subdeckList.style.display = 'block';
    
    // Update the toggle icon
    const toggleIcon = parentDeck.querySelector('.plus');
    if (toggleIcon) {
      toggleIcon.textContent = '-';
    }
  }
}

// Add this to existing DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
    // Expand active subdeck's parent
    const activeSubdeck = document.querySelector('.subdeck-btn.active');
    if (activeSubdeck) {
        const parentDeck = activeSubdeck.closest('li').previousElementSibling;
        const subdeckList = activeSubdeck.closest('.subdeck-list');
        
        if (parentDeck && subdeckList) {
            subdeckList.style.display = 'block';
            const toggleIcon = parentDeck.querySelector('.plus');
            if (toggleIcon) toggleIcon.textContent = '-';
        }
    }
});

// =========================================== CLASSBLOCKS ============================================================

// Add to dashboard-script.js
async function updateClassBlockCounts() {
    const classBlocks = document.querySelectorAll('.class-block');
    
    for (const block of classBlocks) {
        const deck = block.dataset.deck;
        const subdeck = block.dataset.subdeck;
        
        try {
            const response = await fetch(`/api/flashcards/count?deck=${encodeURIComponent(deck)}&subdeck=${encodeURIComponent(subdeck)}`);
            const data = await response.json();
            
            block.querySelector('.new-cards').textContent = data.newCards;
            block.querySelector('.due-cards').textContent = data.dueCards;
        } catch (error) {
            console.error('Error fetching counts:', error);
            block.querySelector('.new-cards').textContent = '0';
            block.querySelector('.due-cards').textContent = '0';
        }
    }
}

// Call this in your DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.class-grid')) {
        updateClassBlockCounts();
    }
});

// ============================ CHOICE toggle for admin form =========================
// Add type toggle functionality
document.getElementById('card-type')?.addEventListener('change', function() {
    updateCardTypeUI(this.value);
});

// Add this function to dashboard-script.js
function populateDeckDropdown() {
    console.log('Populating deck dropdown');
    const deckSelect = document.getElementById('deckSelect');
    if (!deckSelect) {
        console.error('Deck select element not found!');
        return;
    }
    
    deckSelect.innerHTML = '<option value="" disabled selected>Select a deck</option>';
    
    // Add hardcoded decks as backup
    const mainDecks = [
        'Microbiología',
        'Patología',
        'Semiología',
        'Farmacología',
        'Terapéutica',
        'Medicina',
        'Revalida',
        'MIR'
    ];
    
    // Get all deck buttons from the sidebar
    const deckButtons = document.querySelectorAll('.deck-btn');
    console.log(`Found ${deckButtons.length} deck buttons`);
    
    // Track added decks to avoid duplicates
    const addedDecks = new Set();
    
    // First try to add decks from the DOM
    deckButtons.forEach(button => {
        const deckNameEl = button.querySelector('.deck-name');
        if (!deckNameEl) {
            console.warn('Deck name element not found in button:', button);
            return;
        }
        
        const deckName = deckNameEl.textContent.trim();
        // Skip decks marked as "coming soon"
        if (!deckName.includes('en breve')) {
            const option = document.createElement('option');
            option.value = deckName.split(' ')[0]; // Use first word as value (without any badges)
            option.textContent = deckName.split(' ')[0]; // Use first word as display text
            deckSelect.appendChild(option);
            console.log('Added deck option:', option.value);
        }
    });
    
    // Clear the subdeck and subsubdeck dropdowns
    const subdeckSelect = document.getElementById('subdeckSelect');
    const subsubdeckSelect = document.getElementById('subsubdeckSelect');
    
    if (subdeckSelect) {
        subdeckSelect.innerHTML = '<option value="" disabled selected>Select deck first</option>';
    }
    
    if (subsubdeckSelect) {
        subsubdeckSelect.innerHTML = '<option value="" disabled selected>Select subdeck first</option>';
    }
}

/**
 * Populates the subdeck dropdown based on the selected deck
 * @param {string} deckName - The name of the selected deck
 */
function populateSubdeckDropdown(deckName) {
    console.log(`Populating subdecks for deck: ${deckName}`);
    
    const subdeckSelect = document.getElementById('subdeckSelect');
    if (!subdeckSelect) {
        console.error('Subdeck select element not found!');
        return;
    }
    
    // Reset the subdeck select
    subdeckSelect.innerHTML = '<option value="" disabled selected>Select a subdeck</option>';
    subdeckSelect.disabled = true;
    
    if (!deckName) {
        console.log('No deck selected, subdeck dropdown remains disabled');
        return;
    }
    
    // Hardcoded subdeck lists as fallback (add more as needed)
    const hardcodedSubdecks = {
        'Microbiología': ['Bacterias', 'Hongos', 'Parásitos', 'Virus'],
        'Patología': ['Metabolopatías', 'Inflamación', 'Neoplasias', 'Cardiovascular', 
                      'Respiratorio', 'Digestivo', 'Aparato urinario', 'Aparato reproductor', 
                      'Piel', 'Huesos y articulaciones', 'Sistema endocrino', 'Otros', 'ERA1', 'ERA2', 'ERA3'],
        'Semiología': ['Historia clínica', 'Piel y faneras', 'Cabeza y cuello', 'Respiratorio', 
                       'Cardiovascular', 'Digestivo', 'Urinario', 'Neurología', 'Osteoarticular'],
        'Farmacología': ['ERA1', 'ERA2'],
        'Terapéutica': ['ERA1', 'ERA2', 'ERA3'],
        'Medicina': ['Neumonología', 'Cardiovascular', 'Tubo digestivo', 'Neurología', 'Anexos']
    };
    
    // Try to find the deck in the sidebar
    let deckElement = null;
    let subdecks = [];
    
    // First try exact match on the name
    const deckButtons = document.querySelectorAll('.deck-btn');
    
    for (const button of deckButtons) {
        const deckNameEl = button.querySelector('.deck-name');
        if (!deckNameEl) continue;
        
        const fullDeckName = deckNameEl.textContent.trim();
        const buttonDeckName = fullDeckName.split(' ')[0]; // First word of deck name
        
        console.log(`Comparing deck: "${buttonDeckName}" with selected: "${deckName}"`);
        
        if (buttonDeckName === deckName) {
            deckElement = button;
            console.log('Found exact match for deck:', deckName);
            break;
        }
    }
    
    // If exact match not found, try partial match
    if (!deckElement) {
        for (const button of deckButtons) {
            const deckNameEl = button.querySelector('.deck-name');
            if (!deckNameEl) continue;
            
            const fullDeckName = deckNameEl.textContent.trim();
            const buttonDeckName = fullDeckName.split(' ')[0]; // First word of deck name
            
            if (buttonDeckName.includes(deckName) || deckName.includes(buttonDeckName)) {
                deckElement = button;
                console.log('Found partial match for deck:', deckName, 'with', buttonDeckName);
                break;
            }
        }
    }
    
    // Extract subdecks from the DOM if deck element found
    if (deckElement) {
        // Try to find subdeck list in the DOM
        const subdecksList = deckElement.nextElementSibling;
        
        if (subdecksList && subdecksList.classList.contains('subdeck-list')) {
            console.log('Found subdeck list for', deckName);
            
            // Get all subdeck buttons
            const subdeckButtons = subdecksList.querySelectorAll('.subdeck-btn');
            
            // Extract subdeck names
            subdeckButtons.forEach(button => {
                const subdeckNameEl = button.querySelector('.subdeck-name');
                if (subdeckNameEl) {
                    const subdeckName = subdeckNameEl.textContent.trim();
                    subdecks.push(subdeckName);
                    console.log('Added subdeck from DOM:', subdeckName);
                }
            });
        } else {
            console.warn('Could not find subdeck list element for', deckName);
        }
    } else {
        console.log('Could not find deck element for', deckName, 'in the DOM');
    }
    
    // If we couldn't extract subdecks from DOM, use hardcoded list as fallback
    if (subdecks.length === 0 && hardcodedSubdecks[deckName]) {
        console.log('Using hardcoded subdeck list for', deckName);
        subdecks = hardcodedSubdecks[deckName];
    }
    
    // If we have subdecks (either from DOM or hardcoded), populate the dropdown
    if (subdecks.length > 0) {
        subdecks.forEach(subdeckName => {
            const option = document.createElement('option');
            option.value = subdeckName;
            option.textContent = subdeckName;
            subdeckSelect.appendChild(option);
        });
        
        subdeckSelect.disabled = false;
        console.log(`Added ${subdecks.length} subdecks to dropdown`);
    } else {
        console.warn('No subdecks found for deck:', deckName);
        
        // Add a default option to show we tried but found nothing
        const option = document.createElement('option');
        option.value = "default";
        option.textContent = "Default Subdeck";
        subdeckSelect.appendChild(option);
        subdeckSelect.disabled = false;
    }
    
    // Clear the subsubdeck select
    const subsubdeckSelect = document.getElementById('subsubdeckSelect');
    if (subsubdeckSelect) {
        subsubdeckSelect.innerHTML = '<option value="" disabled selected>Select subdeck first</option>';
        subsubdeckSelect.disabled = true;
    }
}

/**
 * Populates the subsubdeck dropdown based on the selected deck and subdeck
 * @param {string} deckName - The name of the selected deck
 * @param {string} subdeckName - The name of the selected subdeck
 */
function populateSubsubdeckDropdown(deckName, subdeckName) {
    console.log(`Populating subsubdecks for deck: ${deckName}, subdeck: ${subdeckName}`);
    
    const subsubdeckSelect = document.getElementById('subsubdeckSelect');
    if (!subsubdeckSelect) {
        console.error('Subsubdeck select element not found!');
        return;
    }
    
    // Reset the subsubdeck select
    subsubdeckSelect.innerHTML = '<option value="" disabled selected>Select a subsubdeck (optional)</option>';
    subsubdeckSelect.disabled = true;
    
    if (!deckName || !subdeckName) {
        console.log('Deck or subdeck not selected, subsubdeck dropdown remains disabled');
        return;
    }
    
    // Define which subdecks have subsubdecks (can be expanded as needed)
    const subdecksWithSubsubdecks = {
        'Microbiología': {
            'Bacterias': ['Gram positivas', 'Gram negativas', 'Anaerobias', 'Otras'],
            'Virus': ['ADN', 'ARN', 'Retrovirus'],
            'Parásitos': ['Protozoos', 'Helmintos', 'Artrópodos']
        },
        'Patología': {
            'Cardiovascular': ['Cardiopatía isquémica', 'Arritmias', 'Insuficiencia cardíaca', 'Valvulopatías'],
            'Respiratorio': ['Asma', 'EPOC', 'Neumonía', 'Cáncer de pulmón'],
            'Digestivo': ['Hígado', 'Páncreas', 'Intestino', 'Esófago']
        }
    };
    
    // Check if this subdeck has subsubdecks defined
    if (subdecksWithSubsubdecks[deckName] && subdecksWithSubsubdecks[deckName][subdeckName]) {
        const subsubdecks = subdecksWithSubsubdecks[deckName][subdeckName];
        
        // Populate the subsubdeck dropdown
        subsubdecks.forEach(subsubdeckName => {
            const option = document.createElement('option');
            option.value = subsubdeckName;
            option.textContent = subsubdeckName;
            subsubdeckSelect.appendChild(option);
        });
        
        subsubdeckSelect.disabled = false;
        console.log(`Added ${subsubdecks.length} subsubdecks to dropdown`);
    } else {
        console.log(`No subsubdecks defined for ${deckName} > ${subdeckName}`);
        // Leave dropdown disabled with default option
    }
}

// Add event listener for subdeck select to update subsubdeck options
const subdeckSelect = document.getElementById('subdeckSelect');
if (subdeckSelect) {
    subdeckSelect.addEventListener('change', function() {
        const deckSelect = document.getElementById('deckSelect');
        const selectedDeck = deckSelect ? deckSelect.value : '';
        const selectedSubdeck = this.value;
        
        console.log(`Subdeck selection changed to: ${selectedSubdeck}`);
        populateSubsubdeckDropdown(selectedDeck, selectedSubdeck);
    });
}

// Initialize the admin form when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing admin form');
    
    // Initialize the admin form
    setupAdminForm();
    
    // Set up any other necessary initializations
    setupCardTypeToggle();
});

// Setup card type radio button toggling
function setupCardTypeToggle() {
    console.log('Setting up card type toggle');
    
    const cardTypeRadios = document.querySelectorAll('input[name="cardType"]');
    if (cardTypeRadios.length === 0) {
        console.error('Card type radio buttons not found');
        return;
    }
    
    // Add change event listeners to the radio buttons
    cardTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const selectedType = this.value;
            console.log('Card type changed to:', selectedType);
            
            // Update form UI based on selected card type
            updateCardTypeUI(selectedType);
        });
    });
    
    // Initialize the UI for the currently selected card type
    const selectedType = document.querySelector('input[name="cardType"]:checked')?.value || 'classic';
    updateCardTypeUI(selectedType);
}

/**
 * Initialize the admin form and set up event handlers
 */
function setupAdminForm() {
    console.log('Setting up admin form');
    
    // Cache DOM elements
    const adminModal = document.getElementById('admin-modal');
    const adminForm = document.getElementById('add-flashcard-form');
    const openAdminBtn = document.getElementById('open-admin-btn');
    const deckSelect = document.getElementById('deckSelect');
    const subdeckSelect = document.getElementById('subdeckSelect');
    const subsubdeckSelect = document.getElementById('subsubdeckSelect');
    
    // Log what elements we found for debugging
    console.log('Admin form elements:', {
        adminModal: adminModal ? 'found' : 'missing',
        adminForm: adminForm ? 'found' : 'missing',
        openAdminBtn: openAdminBtn ? 'found' : 'missing',
        deckSelect: deckSelect ? 'found' : 'missing',
        subdeckSelect: subdeckSelect ? 'found' : 'missing',
        subsubdeckSelect: subsubdeckSelect ? 'found' : 'missing'
    });
    
    // Set up open button for admin panel
    if (openAdminBtn) {
        openAdminBtn.addEventListener('click', function() {
            console.log('Opening admin panel');
            if (adminModal) {
                adminModal.classList.remove('hidden');
                
                // Initialize dropdowns when opening the modal
                populateDeckDropdown();
                
                // Reset subdeck and subsubdeck dropdowns
                if (subdeckSelect) {
                    subdeckSelect.innerHTML = '<option value="" disabled selected>Select deck first</option>';
                    subdeckSelect.disabled = true;
                }
                
                if (subsubdeckSelect) {
                    subsubdeckSelect.innerHTML = '<option value="" disabled selected>Select subdeck first</option>';
                    subsubdeckSelect.disabled = true;
                }
            } else {
                console.error('Admin modal element not found!');
            }
        });
    }
    
    // Set up form submission handler
    if (adminForm) {
        adminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Admin form submitted');
            
            // Get form values
            const question = document.getElementById('questionInput').value.trim();
            const deck = deckSelect ? deckSelect.value : '';
            const subdeck = subdeckSelect ? subdeckSelect.value : '';
            const subsubdeck = subsubdeckSelect ? subsubdeckSelect.value : '';
            const tags = document.getElementById('tagsInput').value;
            const cardType = document.querySelector('input[name="cardType"]:checked')?.value || 'classic';
            
            console.log('Form values:', { deck, subdeck, subsubdeck, cardType });
            
            // Validate required fields
            if (!question || !deck || !subdeck) {
                alert('Please fill in all required fields (question, deck, and subdeck)');
                return;
            }
            
            // Show processing state
            const submitButton = document.getElementById('addCardSubmit');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Processing...';
            submitButton.disabled = true;
            
            // Create form data object
            const formData = {
                question: question,
                deck: deck,
                subdeck: subdeck,
                tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                type: cardType
            };
            
            // Add subsubdeck if it exists
            if (subsubdeck) {
                formData.subsubdeck = subsubdeck;
            }
            
            console.log('Submitting form data:', formData);
            
            // Submit the form data
            fetch('/api/flashcards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`Server responded with ${response.status}: ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Card added successfully:', data);
                
                // Reset the form
                adminForm.reset();
                
                // Show success message
                alert('Flashcard added successfully!');
                
                // Close the modal
                if (adminModal) {
                    adminModal.classList.add('hidden');
                }
            })
            .catch(error => {
                console.error('Error adding card:', error);
                alert(`Error adding card: ${error.message}`);
            })
            .finally(() => {
                // Reset button state
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            });
        });
    }
    
    // Set up deck change event
    if (deckSelect) {
        deckSelect.addEventListener('change', function() {
            const selectedDeck = this.value;
            console.log('Deck selection changed to:', selectedDeck);
            populateSubdeckDropdown(selectedDeck);
        });
    }
    
    // Set up subdeck change event
    if (subdeckSelect) {
        subdeckSelect.addEventListener('change', function() {
            const selectedDeck = deckSelect ? deckSelect.value : '';
            const selectedSubdeck = this.value;
            console.log('Subdeck selection changed to:', selectedSubdeck);
            populateSubsubdeckDropdown(selectedDeck, selectedSubdeck);
        });
    }
    
    // Initialize the deck dropdown
    populateDeckDropdown();
}

// Function to parse multiple choice questions from text input for the preview
function parseMultipleChoiceQuestions(content) {
    console.log('Parsing multiple choice content:', content);
    if (!content || content.trim() === '') {
        console.warn('No content to parse for multiple choice');
        return { question: '', options: [], correctIndex: -1, explanation: '' };
    }

    // Split by lines and filter out empty lines
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
        console.warn('Not enough content for multiple choice question');
        return { question: content, options: [], correctIndex: -1, explanation: '' };
    }

    // The first line is the question
    const question = lines[0];
    
    // Find the index of the line with ], the "Correct:" line, and "Explanation:" line
    let correctIndex = -1;
    let correctLineIndex = -1;
    let explanationLineIndex = -1;
    
    // First check if any option line ends with "]" (legacy format)
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim().endsWith(']')) {
            correctIndex = i - 1; // adjust for 0-based index and first line being question
            // Remove the ] from the option text
            lines[i] = lines[i].trim().replace(/\]$/, '');
            break;
        }
    }
    
    // Also check for "Correct:" prefix format
    for (let i = 0; i < lines.length; i++) {
        const lowerLine = lines[i].toLowerCase();
        if (lowerLine.startsWith('correct:')) {
            correctLineIndex = i;
        } else if (lowerLine.startsWith('explanation:') || lowerLine.startsWith('explain:')) {
            explanationLineIndex = i;
        }
    }
    
    // Get options end index - where to stop collecting options
    const optionsEndIndex = Math.min(
        ...[correctLineIndex, explanationLineIndex, lines.length]
            .filter(idx => idx !== -1)
    );
    
    // Only include actual options (lines after question, before special lines)
    const options = lines.slice(1, optionsEndIndex).map(line => {
        // Remove any option markers like "A)", "1.", etc.
        return line.replace(/^[A-Za-z0-9]+[\.\)]\s*/, '').trim();
    });
    
    // If we didn't find a correct option with ], try to use the "Correct:" line
    if (correctIndex === -1 && correctLineIndex !== -1) {
        // Extract the correct answer text
        const correctLine = lines[correctLineIndex];
        const correctAnswer = correctLine.substring(correctLine.indexOf(':') + 1).trim();
        
        // Find the matching option
        correctIndex = options.findIndex(option => 
            option.toLowerCase() === correctAnswer.toLowerCase());
    }
    
    // Get the explanation if present
    let explanation = '';
    if (explanationLineIndex !== -1) {
        explanation = lines[explanationLineIndex].substring(lines[explanationLineIndex].indexOf(':') + 1).trim();
        
        // Add subsequent lines to explanation if they exist
        for (let i = explanationLineIndex + 1; i < lines.length; i++) {
            explanation += '\n' + lines[i].trim();
        }
    }
    
    console.log('Parsed question:', { question, options, correctIndex, explanation });
    return { question, options, correctIndex, explanation };
}

// Function to update the expanded preview with all cards
function updateExpandedPreview() {
    console.log('Updating expanded preview');
    
    // Get card type from radio buttons
    const cardTypeInput = document.querySelector('input[name="cardType"]:checked');
    if (!cardTypeInput) {
        console.error('No card type selected for expanded preview!');
        return;
    }
    
    const type = cardTypeInput.value;
    
    // Get question text from textarea
    const questionInput = document.getElementById('questionInput');
    if (!questionInput) {
        console.error('Question input element not found for expanded preview!');
        return;
    }
    
    const content = questionInput.value;
    
    // Get expanded preview container
    const expandedPreviewContainer = document.querySelector('.expanded-preview');
    if (!expandedPreviewContainer) {
        console.error('Expanded preview container not found!');
        return;
    }
    
    // Create main header for expanded preview
    const mainHeader = document.createElement('div');
    mainHeader.style.position = 'sticky';
    mainHeader.style.top = '0';
    mainHeader.style.backgroundColor = '#3498db';
    mainHeader.style.color = 'white';
    mainHeader.style.padding = '15px';
    mainHeader.style.marginBottom = '20px';
    mainHeader.style.borderRadius = '5px';
    mainHeader.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    mainHeader.style.zIndex = '10';
    mainHeader.style.textAlign = 'center';
    mainHeader.innerHTML = '<h1 style="font-size: 20px; margin: 0;">Card Preview</h1><p style="margin: 5px 0 0 0; font-size: 14px;">Use the X button or "Return to Admin Panel" button to go back</p>';
    
    // Clear previous content and add header
    expandedPreviewContainer.innerHTML = '';
    expandedPreviewContainer.appendChild(mainHeader);
    
    if (!content.trim()) {
        const emptyDiv = document.createElement('div');
        emptyDiv.style.textAlign = 'center';
        emptyDiv.style.padding = '20px';
        emptyDiv.style.color = '#777';
        emptyDiv.textContent = 'Enter your cards to see previews';
        expandedPreviewContainer.appendChild(emptyDiv);
        return;
    }
    
    // Add a simple message for now - this is a placeholder for the full implementation
    const previewContent = document.createElement('div');
    previewContent.style.padding = '20px';
    previewContent.style.margin = '10px';
    previewContent.style.backgroundColor = '#f8f9fa';
    previewContent.style.border = '1px solid #ddd';
    previewContent.style.borderRadius = '5px';
    
    if (type === 'multipleChoice') {
        previewContent.innerHTML = `
            <h3>Multiple Choice Card Preview</h3>
            <p>This is a basic preview of your multiple choice card.</p>
            <p>Question: ${content.split('\n')[0]}</p>
            <p>In the full implementation, this would show all of your parsed cards.</p>
        `;
    } else {
        previewContent.innerHTML = `
            <h3>Classic Card Preview</h3>
            <p>This is a basic preview of your classic card.</p>
            <p>Question: ${content.split('\n')[0]}</p>
            <p>In the full implementation, this would show all of your parsed cards.</p>
        `;
    }
    
    expandedPreviewContainer.appendChild(previewContent);
    console.log('Expanded preview updated');
}

// Make sure setupLivePreview is called when admin panel opens
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up admin panel preview');
    
    const openAdminBtn = document.getElementById('open-admin-btn');
    if (openAdminBtn) {
        console.log('Found open admin button, adding click listener');
        openAdminBtn.addEventListener('click', function() {
            console.log('Admin panel opened, setting up preview');
            setTimeout(setupLivePreview, 300); // Allow modal to fully open
        });
    } else {
        console.error('Open admin button not found!');
    }
    
    // Also set up preview when form is reset
    const adminForm = document.getElementById('admin-form');
    if (adminForm) {
        console.log('Found admin form, adding reset listener');
        adminForm.addEventListener('reset', function() {
            console.log('Form reset, updating preview');
            setTimeout(updatePreview, 100);
        });
    }
});

// Debounce function to limit how often a function can be called
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Parse the question input for a classic card
 * @param {string} content - The text content from the textarea
 * @returns {Object} The parsed question, subtitle, answer and extraInfo
 */
function parseClassicCard(content) {
    console.log('Parsing classic card content:', content);
    if (!content || content.trim() === '') {
        console.warn('No content to parse for classic card');
        return { question: '', subtitle: '', answer: '', extraInfo: '' };
    }

    // Split by lines and filter out empty lines
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
        console.warn('No content to parse for classic card');
        return { question: '', subtitle: '', answer: '', extraInfo: '' };
    }

    // First line is always the question
    const question = lines[0].trim();
    
    let subtitle = '';
    let answer = '';
    let extraInfo = '';
    
    // Check if there's a second line for subtitle
    if (lines.length > 1) {
        // Check if the second line starts with a slash (for extra info)
        if (lines[1].startsWith('/')) {
            // No subtitle, second line is extra info
            extraInfo = lines[1].substring(1).trim();
            
            // Answer is everything else, excluding lines that start with slash
            answer = lines.slice(1)
                .filter(line => !line.startsWith('/'))
                .join('\n');
        } else {
            // Second line is subtitle
            subtitle = lines[1].trim();
            
            // Find any lines that start with slash (for extra info)
            const extraInfoLines = lines.slice(2).filter(line => line.startsWith('/'));
            if (extraInfoLines.length > 0) {
                // Remove the slash and join with newlines
                extraInfo = extraInfoLines
                    .map(line => line.substring(1).trim())
                    .join('\n');
            }
            
            // Answer is everything after subtitle, excluding lines that start with slash
            if (lines.length > 2) {
                answer = lines.slice(2)
                    .filter(line => !line.startsWith('/'))
                    .join('\n');
            }
        }
    }
    
    console.log('Parsed classic card:', { question, subtitle, answer, extraInfo });
    return { question, subtitle, answer, extraInfo };
}