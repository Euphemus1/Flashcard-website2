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
        const cardType = document.querySelector('input[name="card-type"]:checked')?.value || 'classic';
        const questionInput = document.getElementById('question')?.value;
        const deck = document.getElementById('deck-select')?.value;
        const subdeck = document.getElementById('subdeck')?.value;
        const subsubdeck = document.getElementById('subsubdeck')?.value;
        const tags = document.getElementById('tags')?.value;
        
        // Validate required fields
        if (!questionInput || !deck || !subdeck) {
            alert('Please fill out all required fields');
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
                const { question, options, correctIndex, extraInfo } = parseMultipleChoiceCard(questionInput);
                formData = {
                    type: 'multipleChoice',
                    question,
                    options,
                    correctIndex,
                    extraInfo: extraInfo || '',
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
                document.getElementById('question').value = '';
                document.getElementById('tags').value = '';
                
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
    
    // Preview button still useful for manual refresh
    document.getElementById('preview-btn')?.addEventListener('click', updatePreview);
    
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

    calendarContainer.innerHTML = '<h3>Calendario de Estudio 2025</h3>';

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
        
        // Add day labels
        ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach(d => {
            grid.appendChild(createDayElement(d, true));
        });

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
    const type = document.querySelector('input[name="card-type"]:checked').value;
    const content = document.getElementById('question').value;
    const previewContainer = document.querySelector('.card-preview');
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
            const questionBlocks = parseMultipleChoiceQuestions(content, true);
            
            if (questionBlocks.length > 0) {
                const firstBlock = questionBlocks[0];
                
                // Create the card structure similar to the actual card
                previewContainer.innerHTML = `
                    <div class="card question" style="min-height: unset; min-width: unset; width: 100%;">
                        <div class="card-content">
                            <h3 id="card-front">${firstBlock[0]}</h3>
                            <div id="choice-options" class="choice-options"></div>
                        </div>
                    </div>
                `;
                
                // Find the correct option and any extra info
                let correctIndex = -1;
                let extraInfo = '';
                
                for (let i = 1; i < firstBlock.length; i++) {
                    const line = firstBlock[i];
                    
                    if (line.startsWith('/')) {
                        // This is an extra info line
                        extraInfo = line.substring(1).trim();
                    } else if (line.endsWith(']')) {
                        // This is the correct answer
                        correctIndex = i - 1; // Adjust for 0-based index
                    }
                }
                
                // Get choice options container
                const choiceOptions = previewContainer.querySelector('#choice-options');
                
                // Display options (skip the question and any extra info line)
                const options = firstBlock.filter((line, index) => 
                    index > 0 && !line.startsWith('/')
                );
                
                // Add choice buttons exactly as they would appear in the app
            options.forEach((option, index) => {
                const isCorrect = option.trim().endsWith(']');
                    let cleanOption = option.replace(/\]$/, '').trim();
                    
                    // Create button with the same styling as in the actual card
                    const choiceButton = document.createElement('button');
                    choiceButton.className = 'choice';
                    choiceButton.textContent = cleanOption;
                    
                    // Make correct answer visually different
                    if (isCorrect) {
                        choiceButton.dataset.correct = 'true';
                    }
                    
                    choiceOptions.appendChild(choiceButton);
                });
                
                // Show the extra info section if available
                if (extraInfo) {
                    previewContainer.innerHTML += `
                        <div class="explanation-container" style="max-height: unset; margin-top: 1rem;">
                            <div class="explanation-text">
                                <strong>Extra Information:</strong>
                                ${extraInfo.replace(/\n/g, '<br>')}
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
                        });
                        
                        // Show the button as correct or wrong
                        if (this.dataset.correct === 'true') {
                            this.classList.add('correct');
                            
                            // Show any explanation
                            const explanationContainer = previewContainer.querySelector('.explanation-container');
                            if (explanationContainer) {
                                explanationContainer.style.display = 'block';
        }
    } else {
                            this.classList.add('wrong');
                        }
                    });
                });
            } else {
                // No valid question blocks found
                previewContainer.innerHTML = '<div class="empty-preview">Enter a question and at least one option. Mark the correct option with ] at the end.</div>';
            }
        } catch (error) {
            // Show a helpful message about the format
            previewContainer.innerHTML = `
                <div class="empty-preview">
                    <p>Format your multiple choice card like this:</p>
                    <pre style="text-align: left; margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
What is the capital of France?
London
Berlin
Paris]
/Paris is also known as the City of Light</pre>
                    <p style="margin-top: 10px; color: #e74c3c;">${error.message}</p>
                </div>
            `;
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
}

// Function to set up live preview
function setupLivePreview() {
    // Update the preview when the textarea content changes
    const questionTextarea = document.getElementById('question');
    if (questionTextarea) {
        questionTextarea.addEventListener('input', debounce(() => {
            // Update both previews
            updatePreview();
            // Only update expanded preview if it's visible
            if (!document.querySelector('.expanded-preview').classList.contains('hidden')) {
                updateExpandedPreview();
            }
        }, 300));
        
        // Also update preview when card type changes
        const cardTypeInputs = document.querySelectorAll('input[name="card-type"]');
        cardTypeInputs.forEach(input => {
            input.addEventListener('change', function() {
                updateCardTypeUI(this.value);
                updatePreview();
                // Only update expanded preview if it's visible
                if (!document.querySelector('.expanded-preview').classList.contains('hidden')) {
                    updateExpandedPreview();
                }
            });
        });
        
        // Initial preview on modal open
        document.getElementById('open-admin-btn')?.addEventListener('click', function() {
            setTimeout(updatePreview, 100); // Short delay to ensure modal is visible
        });
        
        // Add event listener to expand preview button
        document.getElementById('expand-preview-btn')?.addEventListener('click', toggleExpandedPreview);
    }
}

// Debounce function to limit the rate at which a function can fire
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Unified function to update UI based on card type
function updateCardTypeUI(cardType) {
    const questionLabel = document.querySelector('label[for="question"]');
    const textarea = document.getElementById('question');
    
    if (cardType === 'multipleChoice') {
        questionLabel.textContent = 'Multiple Choice Question Format:';
        // Ensure consistent size for multiple choice
        textarea.style.height = '350px';
        textarea.style.minHeight = '350px';
    } else {
        questionLabel.textContent = 'Content (First line = Question, Second line = Subtitle, Rest = Answer):';
        // Ensure consistent size for classic
        textarea.style.height = '350px';
        textarea.style.minHeight = '350px';
    }
    
    // Update the preview to match the new card type
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
    const deckSelect = document.getElementById('deck-select');
    if (!deckSelect) return;

    // Clear existing options
    deckSelect.innerHTML = '';

    // Add decks from your decks structure
    Object.keys(decks).forEach(deckName => {
        const option = document.createElement('option');
        option.value = deckName;
        option.textContent = deckName;
        deckSelect.appendChild(option);
    });
}

// Call this in your DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
    populateDeckDropdown();
    // ... rest of your existing initialization code ...
});

// Change from dropdown to radio buttons
document.querySelectorAll('input[name="card-type"]').forEach(radio => {
    radio.addEventListener('change', function() {
        updateCardTypeUI(this.value);
    });
});

// Enhanced logging function
function logToConsole(message, data) {
    console.log(`[${new Date().toISOString()}] ${message}`, data);
}

// Add this helper function to apply the right click handler to the skip button
function updateSkipButtonHandler() {
    const skipButton = document.getElementById('skip-button');
    if (skipButton) {
        // Remove any existing event listeners
        const newButton = skipButton.cloneNode(true);
        skipButton.parentNode.replaceChild(newButton, skipButton);
        
        if (newButton.textContent === 'Seguir') {
            // If it's in "Seguir" mode, it should act like the "Good" SRS button
            newButton.addEventListener('click', () => rateCard(1440)); // Same as "Good" button
        } else {
            // Otherwise it's the regular skip button
            newButton.addEventListener('click', skipCard);
        }
    }
}

// Add function to handle choice selection
function handleChoiceSelection(selectedIndex) {
    const currentCard = flashcards[currentCardIndex];
    const choiceButtons = document.querySelectorAll('.choice');
    const srsControls = document.querySelector('.srs-controls');
    const skipButton = document.getElementById('skip-button');
    const reviewActions = document.getElementById('review-actions');
    
    // DEBUG START
    console.log('=================================');
    console.log('DEBUG [handleChoiceSelection]: Selection analysis');
    console.log('Card ID:', currentCard._id);
    console.log('Card question:', currentCard.question);
    console.log('Raw correctIndex from card:', currentCard.correctIndex, typeof currentCard.correctIndex);
    console.log('Selected index (raw):', selectedIndex, typeof selectedIndex);
    // DEBUG END
    
    // Always convert to numbers to ensure proper comparison
    const correctIndex = Number(currentCard.correctIndex);
    const selectedIdxNumber = Number(selectedIndex);
    
    // DEBUG START
    console.log('Converted correctIndex:', correctIndex, typeof correctIndex);
    console.log('Converted selectedIndex:', selectedIdxNumber, typeof selectedIdxNumber);
    console.log('Are they equal?', selectedIdxNumber === correctIndex);
    console.log('=================================');
    // DEBUG END
    
    // Try multiple approaches to determine if the answer is correct
    // 1. Direct number comparison 
    let isCorrect = selectedIdxNumber === correctIndex;
    
    // 2. Try string comparison if number comparison fails
    if (!isCorrect) {
        isCorrect = String(selectedIdxNumber) === String(correctIndex);
    }
    
    // Find the selected button using the original index
    const selectedButton = Array.from(choiceButtons).find(
        button => Number(button.dataset.originalIndex) === selectedIdxNumber
    );
    
    // Find the correct button using the original index
    const correctButton = Array.from(choiceButtons).find(
        button => Number(button.dataset.originalIndex) === correctIndex
    );
    
    // 3. Try comparison using the button's isCorrect attribute
    if (!isCorrect && selectedButton) {
        isCorrect = selectedButton.dataset.isCorrect === "true";
    }
    
    console.log('Final isCorrect determination:', isCorrect);
    
    if (isCorrect) {
        // Handle correct answer selection
        console.log('Correct answer selected!');
        
        // Check all possible variations of the extraInfo property
        const possibleExtraInfoProps = ['extraInfo', 'extrainfo', 'ExtraInfo', 'EXTRAINFO'];
        let extraInfoContent = null;
        
        for (const prop of possibleExtraInfoProps) {
            if (currentCard[prop] && currentCard[prop].trim() !== '') {
                extraInfoContent = currentCard[prop];
                console.log(`Found extraInfo in property "${prop}":`, extraInfoContent);
                break;
            }
        }
        
        console.log('Extra info content found:', extraInfoContent);
        console.log('Full card data:', JSON.stringify(currentCard));
        
        // Apply green color directly to the correct button (which is also the selected button)
        if (selectedButton) {
            selectedButton.style.backgroundColor = '#2ed573';
            selectedButton.style.borderColor = '#2ed573';
            selectedButton.style.color = 'white';
            selectedButton.style.fontWeight = 'bold';
            
            // Add checkmark directly
            const checkmark = document.createElement('span');
            checkmark.textContent = '✓';
            checkmark.style.position = 'absolute';
            checkmark.style.right = '20px';
            checkmark.style.color = 'white';
            checkmark.style.fontWeight = 'bold';
            selectedButton.appendChild(checkmark);
            
            // Also add correct class for CSS styling
            selectedButton.classList.add('correct');
        }
        
        // Hide all incorrect options
        choiceButtons.forEach(button => {
            if (button !== selectedButton) {
                button.style.display = 'none';
            }
            button.disabled = true;
        });
        
        // Display extra information if available
        if (extraInfoContent) {
            console.log('Displaying extra info:', extraInfoContent);
            const choiceOptions = document.getElementById('choice-options');
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'explanation-container visible';
            explanationDiv.style.marginTop = '20px';
            explanationDiv.style.padding = '15px';
            explanationDiv.style.backgroundColor = '#f8f9fa';
            explanationDiv.style.border = '1px solid #dee2e6';
            explanationDiv.style.borderRadius = '5px';
            
            explanationDiv.innerHTML = `
                <div class="notes">
                    <strong>Notas:</strong>
                    ${extraInfoContent.replace(/\n/g, '<br>')}
                </div>
            `;
            
            // Add the explanation after the selected button
            if (choiceOptions) {
                console.log('Appending extra info to choice options');
                choiceOptions.appendChild(explanationDiv);
            } else {
                console.error('Could not find choice-options element');
            }
        } else {
            console.log('No extra info content to display');
        }
        
        // Transform the skip button into a "continue" button
        if (skipButton) {
            skipButton.textContent = 'Seguir';
            skipButton.classList.add('seguir-button');
            
            // Update the button's click handler
            updateSkipButtonHandler();
        }
        
        // Show SRS controls after finding the correct answer (let's hide them for now since we're using the Seguir button)
        if (srsControls) {
            srsControls.classList.add('hidden');
        }
    } else {
        // Handle incorrect answer selection
        console.log('Selected wrong answer at index:', selectedIndex);
        
        // Make sure we found the selected button
        if (selectedButton) {
            // Apply red color directly to ONLY the wrong button that was clicked
            selectedButton.style.backgroundColor = '#ff4757';
            selectedButton.style.borderColor = '#ff4757';
            selectedButton.style.color = 'white';
            selectedButton.style.fontWeight = 'bold';
            
            // Add X mark directly
            const xmark = document.createElement('span');
            xmark.textContent = '✗';
            xmark.style.position = 'absolute';
            xmark.style.right = '20px';
            xmark.style.color = 'white';
            xmark.style.fontWeight = 'bold';
            selectedButton.appendChild(xmark);
            
            // Also add wrong class for CSS styling
            selectedButton.classList.add('wrong');
            
            // Disable ONLY the wrong button that was clicked
            selectedButton.disabled = true;
        } else {
            console.error('Could not find the selected button with index:', selectedIndex);
        }
        
        // Do NOT show SRS controls yet - user should keep trying
    }
}

// Add to existing DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
    displayUsername();
    initializeERA1Cards();
    initializeERA2Cards();
    document.getElementById('contact-button')?.addEventListener('click', showContact);
});

// Add Contact Modal Functionality
function showContact() {
    const contactContent = `
    <div class="faq-overlay">
        <div class="faq-modal">
            <div class="faq-header">
                <h2>Información de Contacto</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="faq-content">
                <div class="faq-item">
                    <div class="answer show">
                        <p><strong>Soporte Técnico:</strong></p>
                        <ul>
                            <li>📧 Email: soporte@medupgrade.com</li>
                            <li>📞 Teléfono: +34 123 456 789</li>
                        </ul>
                        <p class="contact-schedule"><strong>Horario de Atención:</strong></p>
                        <ul>
                            <li>Lunes-Viernes: 9:00 - 18:00</li>
                            <li>Sábados: 10:00 - 14:00</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    const contactOverlay = document.createElement('div');
    contactOverlay.className = 'faq-overlay';
    contactOverlay.innerHTML = contactContent;
    document.body.appendChild(contactOverlay);

    contactOverlay.querySelector('.close-btn').addEventListener('click', () => {
        contactOverlay.remove();
    });

    contactOverlay.addEventListener('click', (e) => {
        if(e.target === contactOverlay) contactOverlay.remove();
    });
}

// Add event listener for contact button
document.getElementById('contact-button')?.addEventListener('click', showContact);

// Deck and subdeck structure
const decks = {
    'Microbiología': ['Bacterias', 'Hongos', 'Parásitos', 'Virus'],
    'Patología': ['Metabolopatías', 'Inflamación', 'Neoplasias', 'Cardiovascular', 'Respiratorio', 'Digestivo', 'Aparato urinario', 'Aparato reproductor', 'Piel', 'Huesos y articulaciones', 'Sistema endocrino', 'Otros'],
    'Semiología': ['Historía clínica', 'Piel y faneras', 'Cabeza y cuello', 'Respiratorio', 'Cardiovascular', 'Digestivo', 'Urinario', 'Neurología', 'Osteoarticular'],
    'Farmacología': ['ERA1', 'ERA2'],
    'Terapéutica 1': ['ERA1', 'ERA2', 'ERA3'],
    'Medicina Interna 1': ['Neumonología', 'Cardiovascular', 'Tubo digestivo', 'Neurología', 'Anexos'],
    'Revalida': ['Bling', 'Blang', 'Blong'],
    'MIR': ['Bling', 'Blang', 'Blong'],
};

// OPTIMIZED VERSION - FETCH ALL CARDS ONCE
let allCardsCache = null; // Add this at the top of your file

// MODIFIED VERSION - SIMPLE COUNTING
async function calculateCards(deckName, subdeckName = null) {
    try {
        const params = new URLSearchParams({ 
            deck: deckName,
            ...(subdeckName && { subdeck: subdeckName })
        });

        const response = await fetch(`/api/flashcards?${params.toString()}`);
        if (!response.ok) return { totalCards: 0 };
        
        const cards = await response.json();
        return { totalCards: cards.length };

    } catch (error) {
        console.error('Error counting cards:', error);
        return { totalCards: 0 };
    }
}

// MODIFIED GENERATE TABLE FUNCTION
async function generateOverviewTable() {
    const tableBody = document.createElement('tbody');
    
    try {
        // Fetch all card counts at once instead of individual calls for each deck/subdeck
        const allCounts = await fetchAllCardCounts();
        
        for (const [deckName, subdecks] of Object.entries(decks)) {
            // Main deck row - use the cached results from our batch call
            const deckStats = allCounts[deckName] || { totalCards: 0 };
            const deckRow = createOverviewRow(deckName, deckStats, false);
            tableBody.appendChild(deckRow);
    
            // Subdeck rows - again, use cached results
            for (const subdeck of subdecks) {
                const subdeckKey = `${deckName}-${subdeck}`;
                const subdeckStats = allCounts[subdeckKey] || { totalCards: 0 };
                const subdeckRow = createOverviewRow(subdeck, subdeckStats, true);
                tableBody.appendChild(subdeckRow);
            }
        }
    } catch (error) {
        console.error('Error generating overview table:', error);
        // Create a fallback row with error message
        const errorRow = document.createElement('tr');
        errorRow.innerHTML = `
            <td colspan="2">Error loading card counts. Please try again later.</td>
        `;
        tableBody.appendChild(errorRow);
    }
    
    return tableBody;
}

// New function to fetch all card counts in one batch to avoid rate limiting
async function fetchAllCardCounts() {
    let counts = {};
    
    try {
        // Create an array of all deck/subdeck combinations we need
        let countRequests = [];
        
        for (const [deckName, subdecks] of Object.entries(decks)) {
            // Add main deck (total across all subdecks)
            countRequests.push({
                key: deckName,
                params: new URLSearchParams({ deck: deckName }).toString()
            });
            
            // Add each subdeck
            for (const subdeck of subdecks) {
                countRequests.push({
                    key: `${deckName}-${subdeck}`,
                    params: new URLSearchParams({ 
                        deck: deckName,
                        subdeck: subdeck 
                    }).toString()
                });
            }
        }
        
        // Use Promise.all to make requests in parallel (but not too many)
        // Only process 5 requests at a time to avoid overwhelming the server
        const batchSize = 5;
        for (let i = 0; i < countRequests.length; i += batchSize) {
            const batch = countRequests.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(async (req) => {
                    try {
                        const response = await fetch(`/api/flashcards?${req.params}`);
                        if (!response.ok) return { key: req.key, totalCards: 0 };
                        
                        const cards = await response.json();
                        return { key: req.key, totalCards: cards.length };
                    } catch (error) {
                        console.error(`Error fetching ${req.key}:`, error);
                        return { key: req.key, totalCards: 0 };
                    }
                })
            );
            
            // Add a short delay between batches
            if (i + batchSize < countRequests.length) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            // Add batch results to our counts object
            batchResults.forEach(result => {
                counts[result.key] = { totalCards: result.totalCards };
            });
        }
    } catch (error) {
        console.error('Error in batch fetching card counts:', error);
    }
    
    return counts;
}

// MODIFIED ROW CREATION
function createOverviewRow(name, stats, isSubdeck) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${isSubdeck ? `<span class="subdeck-padding">${name}</span>` : `<span class="toggle-deck">+</span> ${name}`}</td>
        <td class="total-cards ${stats.totalCards > 0 ? 'new-positive' : ''}">${stats.totalCards}</td>
    `;
    if (isSubdeck) row.classList.add('subdeck-row', 'hidden');
    return row;
}

// NEW VERSION - ASYNC VERSION
async function showOverview() {
    const overviewSection = document.getElementById('overview-section');
    if (!overviewSection) return;

    // Clear table
    const oldTableBody = document.getElementById('overview-table-body');
    if (oldTableBody) {
        oldTableBody.innerHTML = '';
    }

    // Generate new content
    const newTableBody = await generateOverviewTable();
    
    // Replace the table body content with the new rows
    if (oldTableBody) {
        Array.from(newTableBody.children).forEach(row => {
            oldTableBody.appendChild(row);
        });
    }

    // Show overview section and hide other sections
    const mainContent = document.getElementById('main-content');
    const statsContainer = document.querySelector('.stats-container');
    const flashcardSystem = document.getElementById('flashcard-system');
    const calendar = document.getElementById('study-calendar');

    // Show main content and components
    mainContent?.classList?.remove('hidden');
    statsContainer?.classList?.remove('hidden');
    
    // Always make sure calendar is visible
    if (calendar) {
        calendar.classList.remove('hidden');
        
        // Generate calendar if it hasn't been initialized
        if (!calendar.querySelector('.month-container')) {
            generateCalendar();
        }
    }
    
    // Hide flashcard system
    flashcardSystem?.classList?.add('hidden');
    
    addToggleListeners();
    showStatus('Overview');
}

// Call the test function - you can open browser console to see results
// Uncomment this line to run the test
testExtraInfoExtraction();

// Add this at the end of your file
// Test function to validate extraInfo extraction
function testExtraInfoExtraction() {
    console.log("=== TESTING EXTRA INFO EXTRACTION ===");
    
    // Test case 1: Option with / and ]
    const testOption1 = "Strait of Malacca/It's located between Malaysia and Indonesia]";
    let cleanOption1 = testOption1.replace(/\]$/, '').trim();
    const slashIndex1 = cleanOption1.indexOf('/');
    
    if (slashIndex1 !== -1) {
        const cleanOptionText1 = cleanOption1.substring(0, slashIndex1).trim();
        const extraInfoText1 = cleanOption1.substring(slashIndex1 + 1).trim();
        console.log("Test 1 - Option with / and ]:");
        console.log("Original:", testOption1);
        console.log("Clean option:", cleanOptionText1);
        console.log("Extra info:", extraInfoText1);
    }
    
    // Test case 2: Option without /
    const testOption2 = "Strait of Gibraltar]";
    let cleanOption2 = testOption2.replace(/\]$/, '').trim();
    const slashIndex2 = cleanOption2.indexOf('/');
    
    console.log("\nTest 2 - Option without /:");
    console.log("Original:", testOption2);
    if (slashIndex2 !== -1) {
        const cleanOptionText2 = cleanOption2.substring(0, slashIndex2).trim();
        const extraInfoText2 = cleanOption2.substring(slashIndex2 + 1).trim();
        console.log("Clean option:", cleanOptionText2);
        console.log("Extra info:", extraInfoText2);
    } else {
        console.log("No slash found - Clean option:", cleanOption2);
        console.log("Extra info: none");
    }
    
    // Test case 3: Simulated form submission for multiple choice
    console.log("\nTest 3 - Simulated multiple choice card creation:");
    const mockOptions = [
        "Strait of Gibraltar",
        "Bering Strait",
        "Strait of Hormuz",
        "Strait of Malacca/It's located between Malaysia and Indonesia]"
    ];
    
    const mockCard = {
        options: [],
        correctIndex: -1,
        extraInfo: ''
    };
    
    console.log("Mock options:", mockOptions);
    
    for (const [index, option] of mockOptions.entries()) {
        const isCorrect = option.trim().endsWith(']');
        let cleanOption = option.replace(/\]$/, '').trim();
        
        if (isCorrect) {
            mockCard.correctIndex = index;
            
            const slashIndex = cleanOption.indexOf('/');
            if (slashIndex !== -1) {
                const cleanOptionText = cleanOption.substring(0, slashIndex).trim();
                const extraInfoText = cleanOption.substring(slashIndex + 1).trim();
                
                mockCard.extraInfo = extraInfoText;
                mockCard.options.push(cleanOptionText);
                
                console.log("Found correct option at index:", index);
                console.log("Clean option text:", cleanOptionText);
                console.log("Extra info text:", mockCard.extraInfo);
            } else {
                mockCard.options.push(cleanOption);
            }
        } else {
            const slashIndex = cleanOption.indexOf('/');
            if (slashIndex !== -1) {
                cleanOption = cleanOption.substring(0, slashIndex).trim();
            }
            mockCard.options.push(cleanOption);
        }
    }
    
    console.log("Final mock card:", mockCard);
    console.log("=== TEST COMPLETE ===");
}

// Call the test function - you can see results in browser console
testExtraInfoExtraction();

// Function to parse multiple choice questions from text input
function parseMultipleChoiceQuestions(rawContent, isPreview = false) {
    const allLines = rawContent.split('\n').map(line => line.trim()).filter(line => line !== '');
    const questions = [];
    
    let currentBlock = [];
    let foundCorrectAnswer = false;
    let foundExtraInfo = false;
    let inQuestion = true; // Tracks whether we're processing the question or options
    
    console.log('Parsing multiple questions from input with new format...');
    console.log('Raw lines:', allLines);
    
    // If there are no lines, return empty array
    if (allLines.length === 0) {
        return [];
    }
    
    // First line is always a question
    currentBlock.push(allLines[0]);
    inQuestion = false; // Now we're expecting options
    
    // Process each line starting from the second line
    for (let i = 1; i < allLines.length; i++) {
        const line = allLines[i];
        const nextLine = i < allLines.length - 1 ? allLines[i + 1] : null;
        
        // Check if this line is for extra info (starts with /)
        if (!inQuestion && line.startsWith('/')) {
            // This is an extra info line, add it to the current block
            currentBlock.push(line);
            foundExtraInfo = true;
            console.log('Found extra info:', line);
            
            // If this is the last line, we're done with this question
            if (i === allLines.length - 1) {
                questions.push([...currentBlock]);
                console.log('Adding final question block with extra info');
            }
            
            continue;
        }
        
        // FIX: Improved detection of new questions vs complex options
        // Check if this is definitely a correct answer (ends with ])
        const isCorrectAnswer = line.trim().endsWith(']');
        
        // Check if this is the start of a new question
        const isPotentialNewQuestion = 
            currentBlock.length >= 2 && 
            !line.startsWith('/') &&
            !isCorrectAnswer &&  // If it's marked as correct, it's definitely an option, not a question
            nextLine !== null && 
            !nextLine.startsWith('/') &&
            !nextLine.trim().endsWith(']');
        
        // Look for patterns that indicate we're transitioning to a new question:
        if (!inQuestion && isPotentialNewQuestion) {
            // These are stronger indicators that we have a new question:
            const strongQuestionIndicators = [
                line.endsWith('?'),                                   // Ends with question mark
                /^(What|Which|When|Where|Why|How|Is|Are|Can|Do)/i.test(line), // Starts with question word
                currentBlock.length >= 6                              // We already have a full set of options
            ];
            
            // Only consider it a new question if it has strong question indicators
            if (strongQuestionIndicators.some(indicator => indicator === true)) {
                // Save the current block and start a new one
                questions.push([...currentBlock]);
                currentBlock = [line];
                foundCorrectAnswer = false;
                foundExtraInfo = false;
                inQuestion = false; // Now expecting options again
                console.log('Starting new question block with:', line);
                continue;
            }
        }
        
        // Add the current line to the block
        currentBlock.push(line);
        
        // Check if this line is a correct answer (ends with ])
        if (isCorrectAnswer) {
            foundCorrectAnswer = true;
            console.log('Found correct answer:', line);
        }
        
        // If this is the last line, add the final block
        if (i === allLines.length - 1) {
            questions.push([...currentBlock]);
            console.log('Adding final question block');
        }
    }
    
    console.log('Parsed question blocks:', questions);
    
    // For preview mode, or if we're just testing the format, be more lenient
    if (!isPreview) {
        // Add ] to the first option of any question blocks without a marked correct answer
        for (let i = 0; i < questions.length; i++) {
            const block = questions[i];
            // Verify at least one option has the ] marker
            const hasCorrectOption = block.some(line => line.trim().endsWith(']'));
            
            if (!hasCorrectOption && block.length >= 2) {
                // If no correct option is marked and we're in production mode,
                // mark the first option as correct
                console.log(`No correct answer marked in block ${i+1}, automatically marking first option as correct`);
                if (block.length >= 2) {
                    // Replace the first option with a version that has ] at the end
                    block[1] = block[1].trim() + ']';
                }
            }
        }
        
        // Final validation
        questions.forEach((block, index) => {
            if (block.length < 2) {
                throw new Error(`Question block ${index + 1} is invalid. Each question needs at least a question and one option.`);
            }
            
            // Verify at least one option has the ] marker
            const hasCorrectOption = block.some(line => line.trim().endsWith(']'));
            if (!hasCorrectOption) {
                throw new Error(`Question block ${index + 1} has no correct answer marked with ]. Please add ] at the end of the correct option.`);
            }
        });
    }
    
    console.log(`Successfully parsed ${questions.length} questions`);
    return questions;
}

// Function to save a multiple choice card
async function saveMultipleChoiceCard(lines) {
    try {
        // Validate format
        if (lines.length < 2) {
            throw new Error('Multiple choice requires at least 1 question and 1 option');
        }
        if (lines.length > 8) { // Increased to 8 to allow for extra info line
            throw new Error('Maximum 6 options allowed (plus question and extra info)');
        }
        
        // Initialize card object
        const newCard = {
            question: lines[0],
            answer: '',
            deck: document.getElementById('deck-select').value,
            subdeck: document.getElementById('subdeck').value,
            tags: document.getElementById('tags').value.split(',').map(s => s.trim()),
            type: 'multipleChoice',
            options: [],
            correctIndex: -1,
            extraInfo: ''
        };
        
        console.log(`Processing card: ${newCard.question}`);
        console.log('All lines:', lines);
        
        // Extract all options and identify extra info line
        const options = [];
        let extraInfoLine = null;
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('/')) {
                extraInfoLine = line;
            } else {
                options.push({
                    text: line,
                    originalIndex: i - 1,  // -1 because we skip the question line
                    isCorrect: line.trim().endsWith(']')
                });
            }
        }
        
        console.log('Extracted options:', options);
        
        // Find the correct option
        const correctOptionIndex = options.findIndex(opt => opt.isCorrect);
        
        if (correctOptionIndex === -1) {
            throw new Error('No correct answer specified - add ] at end of the correct option');
        }
        
        if (options.filter(opt => opt.isCorrect).length > 1) {
            throw new Error('Only one correct answer allowed (mark with ])');
        }
        
        // Set the correct index in the card object
        newCard.correctIndex = correctOptionIndex;
        
        // VALIDATION: Ensure correctIndex is valid
        if (newCard.correctIndex < 0) {
            console.warn('Invalid correctIndex detected, forcing to 0');
            newCard.correctIndex = 0;
        }
        
        // Clean up options (remove ] marker) and add to card
        for (const option of options) {
            const cleanedText = option.text.replace(/\]$/, '').trim();
            newCard.options.push(cleanedText);
        }
        
        // ADDITIONAL VALIDATION: Ensure correctIndex is within range of options
        if (newCard.correctIndex >= newCard.options.length) {
            console.warn(`correctIndex (${newCard.correctIndex}) out of range, setting to 0`);
            newCard.correctIndex = 0;
        }
        
        // Set the answer to the correct option's text (without ])
        newCard.answer = newCard.options[newCard.correctIndex];
        
        // Extract extra info if present
        if (extraInfoLine) {
            // Remove the starting / character
            newCard.extraInfo = extraInfoLine.substring(1).trim();
            console.log('Extracted extra info:', newCard.extraInfo);
        }
        
        console.log('Multiple choice card to be submitted:', JSON.stringify(newCard));
        
        // Submit the card
        const response = await fetch('/api/flashcards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newCard)
        });
        
        const data = await response.json();
        
        return { 
            success: response.ok,
            data,
            card: newCard.question
        };
    } catch (error) {
        console.error('Error saving multiple choice card:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Function to reload the current deck
function reloadCurrentDeck() {
    // Get the current URL path to determine which deck we're on
    const path = window.location.pathname;
    
    console.log('Reloading deck based on path:', path);
    
    if (path.includes('patologia-era2')) {
        console.log('Reloading ERA2 cards...');
        getDeckData('Patología', 'ERA2').then(data => {
            flashcards = data;
            console.log(`Reloaded ${data.length} ERA2 cards:`, data);
            if (flashcards.length > 0) {
                currentCardIndex = 0;
                loadNextCard();
                showStatus(`${data.length} cards loaded`);
            } else {
                showStatus('No hay tarjetas en este mazo');
            }
        });
    } else if (path.includes('patologia-era1')) {
        console.log('Reloading ERA1 cards...');
        getDeckData('Patología', 'ERA1').then(data => {
            flashcards = data;
            console.log(`Reloaded ${data.length} ERA1 cards`);
            if (flashcards.length > 0) {
                currentCardIndex = 0;
                loadNextCard();
                showStatus(`${data.length} cards loaded`);
            } else {
                showStatus('No hay tarjetas en este mazo');
            }
        });
    } else if (path.includes('patologia-era3')) {
        console.log('Reloading ERA3 cards...');
        getDeckData('Patología', 'ERA3').then(data => {
            flashcards = data;
            console.log(`Reloaded ${data.length} ERA3 cards`);
            if (flashcards.length > 0) {
                currentCardIndex = 0;
                loadNextCard();
                showStatus(`${data.length} cards loaded`);
            } else {
                showStatus('No hay tarjetas en este mazo');
            }
        });
    } else if (path.includes('deck/')) {
        // Handle dynamic deck pages
        const deckName = path.split('/').pop();
        if (deckName) {
            console.log('Reloading deck:', deckName);
            getDeckData(deckName).then(data => {
                flashcards = data;
                console.log(`Reloaded ${data.length} cards for ${deckName}`);
                if (flashcards.length > 0) {
                    currentCardIndex = 0;
                    loadNextCard();
                    showStatus(`${data.length} cards loaded`);
                } else {
                    showStatus('No hay tarjetas en este mazo');
                }
            });
        }
    }
}

// Function to parse multiple classic cards from text input
function parseClassicCards(rawContent) {
    const allLines = rawContent.split('\n').map(line => line.trim());
    const cards = [];
    
    let currentCard = [];
    let extraInfoMode = false;
    
    console.log('Parsing multiple classic cards from input...');
    
    // Process each line
    for (let i = 0; i < allLines.length; i++) {
        const line = allLines[i];
        
        // Empty line indicates a separator between cards
        if (line === '') {
            if (currentCard.length > 0) {
                // Save current card if it has content
                cards.push([...currentCard]);
                currentCard = [];
                extraInfoMode = false;
            }
            continue;
        }
        
        // Add the current line to the card
        currentCard.push(line);
        
        // Check if this line starts the extra info section
        if (line.startsWith('/')) {
            extraInfoMode = true;
        }
        
        // If we've collected 3+ lines and the next line is empty or doesn't exist, save this card
        const nextLine = i < allLines.length - 1 ? allLines[i + 1] : '';
        if (currentCard.length >= 3 && (nextLine === '' || i === allLines.length - 1)) {
            cards.push([...currentCard]);
            currentCard = [];
            extraInfoMode = false;
        }
    }
    
    // If there's a partial card at the end, add it
    if (currentCard.length > 0) {
        cards.push([...currentCard]);
    }
    
    console.log(`Parsed ${cards.length} classic cards`);
    return cards;
}

// Function to process and save a single classic card
async function saveClassicCard(lines) {
    try {
        if (lines.length < 3) {
            throw new Error('Classic cards require at least 3 lines:\n1. Question\n2. Subtitle\n3. Answer');
        }
        
        // Initialize with explicit extraInfo property
        const newCard = {
            question: lines[0],
            subtitle: lines[1],
            answer: '',
            extraInfo: '',
            deck: document.getElementById('deck-select').value,
            subdeck: document.getElementById('subdeck').value,
            tags: document.getElementById('tags').value.split(',').map(s => s.trim()),
            type: 'classic'
        };
        
        // Find the first line that starts with / (if any)
        const extraInfoIndex = lines.findIndex(line => line.startsWith('/'));
        
        if (extraInfoIndex !== -1 && extraInfoIndex >= 3) {
            // Everything from line 2 up to extraInfoIndex is the answer
            newCard.answer = lines.slice(2, extraInfoIndex).join('\n').trim();
            // Everything after extraInfoIndex is extra info (remove the leading /)
            newCard.extraInfo = lines[extraInfoIndex].substring(1).trim();
            
            // If there are more lines after the extraInfoIndex, add them to extraInfo
            if (extraInfoIndex < lines.length - 1) {
                newCard.extraInfo += '\n' + lines.slice(extraInfoIndex + 1).join('\n').trim();
            }
        } else {
            // No extra info line found, everything from line 2 onward is the answer
            newCard.answer = lines.slice(2).join('\n').trim();
        }
        
        // Log the card before submission for debugging
        console.log('Classic card to be submitted:', JSON.stringify(newCard));

        // Submit the classic card
        const response = await fetch('/api/flashcards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newCard)
        });

        const data = await response.json();
        
        return { 
            success: response.ok,
            data,
            card: newCard.question
        };
    } catch(error) {
        console.error('Error saving classic card:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Function to toggle expanded preview
function toggleExpandedPreview() {
    const expandButton = document.getElementById('expand-preview-btn');
    const expandedPreview = document.querySelector('.expanded-preview');
    const regularPreview = document.querySelector('.card-preview');
    const previewOverlay = document.querySelector('.preview-overlay');
    const closeXButton = document.getElementById('preview-close-x');
    const returnButton = document.getElementById('preview-return-btn');
    
    // Check if preview is currently visible
    const isExpanded = expandedPreview.style.display === 'block';
    
    if (isExpanded) {
        // Hide expanded preview
        expandedPreview.style.display = 'none';
        regularPreview.style.display = 'block';
        previewOverlay.style.display = 'none';
        closeXButton.style.display = 'none';
        returnButton.style.display = 'none';
        expandButton.textContent = 'Show All Cards';
    } else {
        // Show expanded preview
        expandedPreview.style.display = 'block';
        regularPreview.style.display = 'none';
        previewOverlay.style.display = 'block';
        closeXButton.style.display = 'block';
        returnButton.style.display = 'block';
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
        previewOverlay.style.position = 'fixed';
        previewOverlay.style.top = '0';
        previewOverlay.style.left = '0';
        previewOverlay.style.width = '100%';
        previewOverlay.style.height = '100%';
        previewOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        previewOverlay.style.zIndex = '999';
        
        // Update the preview content
        updateExpandedPreview();
    }
}

// Add event listeners for the fixed buttons when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners for the close buttons
    document.getElementById('preview-close-x').addEventListener('click', toggleExpandedPreview);
    document.getElementById('preview-return-btn').addEventListener('click', toggleExpandedPreview);
    
    // Set up event listener for overlay
    document.querySelector('.preview-overlay').addEventListener('click', toggleExpandedPreview);
});

// Function to update the expanded preview with all cards
function updateExpandedPreview() {
    const type = document.querySelector('input[name="card-type"]:checked').value;
    const content = document.getElementById('question').value;
    const expandedPreviewContainer = document.querySelector('.expanded-preview');
    
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
    
    // Create loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.style.textAlign = 'center';
    loadingDiv.style.padding = '30px';
    
    const spinner = document.createElement('div');
    spinner.style.border = '4px solid #f3f3f3';
    spinner.style.borderTop = '4px solid #3498db';
    spinner.style.borderRadius = '50%';
    spinner.style.width = '30px';
    spinner.style.height = '30px';
    spinner.style.margin = '0 auto';
    
    const loadingText = document.createElement('p');
    loadingText.style.marginTop = '10px';
    loadingText.textContent = 'Loading card previews...';
    
    loadingDiv.appendChild(spinner);
    loadingDiv.appendChild(loadingText);
    
    // Clear previous content and add header and loading indicator
    expandedPreviewContainer.innerHTML = '';
    expandedPreviewContainer.appendChild(mainHeader);
    expandedPreviewContainer.appendChild(loadingDiv);
    expandedPreviewContainer.style.backgroundColor = 'white';
    
    // Add animation style if it doesn't exist
    if (!document.getElementById('spin-animation')) {
        const style = document.createElement('style');
        style.id = 'spin-animation';
        style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(style);
    }
    
    // Add spinner animation
    spinner.style.animation = 'spin 1s linear infinite';
    
    // Use setTimeout to allow the loading indicator to render
    setTimeout(() => {
        // Clear loading indicator (but keep the header)
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
        
        // Add card type header
        const headerDiv = document.createElement('div');
        headerDiv.style.padding = '10px 0';
        headerDiv.style.marginBottom = '15px';
        headerDiv.style.borderBottom = '1px solid #ddd';
        
        if (type === 'multipleChoice') {
            try {
                // Parse all question blocks
                const questionBlocks = parseMultipleChoiceQuestions(content, true);
                
                if (questionBlocks.length === 0) {
                    const emptyDiv = document.createElement('div');
                    emptyDiv.style.textAlign = 'center';
                    emptyDiv.style.padding = '20px';
                    emptyDiv.style.color = '#777';
                    emptyDiv.textContent = 'No valid multiple choice cards found';
                    expandedPreviewContainer.appendChild(emptyDiv);
                    return;
                }
                
                // Add card count to header
                headerDiv.innerHTML = `<h2 style="font-size:18px; margin:0;">Multiple Choice Cards (${questionBlocks.length})</h2>`;
                expandedPreviewContainer.appendChild(headerDiv);
                
                // Create grid container
                const gridContainer = document.createElement('div');
                gridContainer.style.display = 'grid';
                gridContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
                gridContainer.style.gap = '15px';
                expandedPreviewContainer.appendChild(gridContainer);
                
                // Create preview cards for each block
                questionBlocks.forEach((block, index) => {
                    const cardDiv = document.createElement('div');
                    cardDiv.style.backgroundColor = 'white';
                    cardDiv.style.border = '1px solid #ddd';
                    cardDiv.style.borderRadius = '5px';
                    cardDiv.style.overflow = 'hidden';
                    
                    // Add card header with number
                    const cardHeader = document.createElement('div');
                    cardHeader.style.backgroundColor = '#f5f5f5';
                    cardHeader.style.padding = '5px 10px';
                    cardHeader.style.fontSize = '12px';
                    cardHeader.style.borderBottom = '1px solid #ddd';
                    cardHeader.textContent = `Card ${index + 1}`;
                    cardDiv.appendChild(cardHeader);
                    
                    // Card content container
                    const cardContent = document.createElement('div');
                    cardContent.style.padding = '10px';
                    
                    // Add question
                    const questionEl = document.createElement('h3');
                    questionEl.style.fontSize = '14px';
                    questionEl.style.margin = '0 0 10px 0';
                    questionEl.textContent = block[0];
                    cardContent.appendChild(questionEl);
                    
                    // Find options and correct answer
                    let correctIndex = -1;
                    let extraInfo = '';
                    
                    for (let i = 1; i < block.length; i++) {
                        const line = block[i];
                        
                        if (line.startsWith('/')) {
                            extraInfo = line.substring(1).trim();
                        } else if (line.endsWith(']')) {
                            correctIndex = i - 1;
                        }
                    }
                    
                    // Options container
                    const optionsContainer = document.createElement('div');
                    optionsContainer.style.display = 'flex';
                    optionsContainer.style.flexDirection = 'column';
                    optionsContainer.style.gap = '5px';
                    
                    // Display options
                    const options = block.filter((line, idx) => 
                        idx > 0 && !line.startsWith('/')
                    );
                    
                    options.forEach((option, optIdx) => {
                        const isCorrect = option.trim().endsWith(']');
                        let cleanOption = option.replace(/\]$/, '').trim();
                        
                        // Create option element
                        const optionEl = document.createElement('div');
                        optionEl.style.padding = '5px 8px';
                        optionEl.style.fontSize = '12px';
                        optionEl.style.border = '1px solid #ddd';
                        optionEl.style.borderRadius = '3px';
                        
                        // Style for correct answer
                        if (isCorrect) {
                            optionEl.style.backgroundColor = '#e3fcec';
                            optionEl.style.borderColor = '#2ed573';
                        }
                        
                        optionEl.textContent = cleanOption;
                        optionsContainer.appendChild(optionEl);
                    });
                    
                    cardContent.appendChild(optionsContainer);
                    
                    // Add extra info if available
                    if (extraInfo) {
                        const infoDiv = document.createElement('div');
                        infoDiv.style.marginTop = '10px';
                        infoDiv.style.padding = '5px';
                        infoDiv.style.fontSize = '11px';
                        infoDiv.style.backgroundColor = '#f8f8f8';
                        infoDiv.style.borderRadius = '3px';
                        infoDiv.innerHTML = `<strong>Extra:</strong> ${extraInfo}`;
                        cardContent.appendChild(infoDiv);
                    }
                    
                    cardDiv.appendChild(cardContent);
                    gridContainer.appendChild(cardDiv);
                });
            } catch (error) {
                const errorDiv = document.createElement('div');
                errorDiv.style.textAlign = 'center';
                errorDiv.style.padding = '20px';
                errorDiv.style.color = '#777';
                errorDiv.innerHTML = `
                    <p>Error parsing multiple choice cards:</p>
                    <p style="color: #e74c3c;">${error.message}</p>
                `;
                expandedPreviewContainer.appendChild(errorDiv);
            }
        } else {
            // Classic cards
            try {
                // Parse all classic cards
                const cardBlocks = parseClassicCards(content);
                
                if (cardBlocks.length === 0) {
                    const emptyDiv = document.createElement('div');
                    emptyDiv.style.textAlign = 'center';
                    emptyDiv.style.padding = '20px';
                    emptyDiv.style.color = '#777';
                    emptyDiv.textContent = 'No valid classic cards found';
                    expandedPreviewContainer.appendChild(emptyDiv);
                    return;
                }
                
                // Add card count to header
                headerDiv.innerHTML = `<h2 style="font-size:18px; margin:0;">Classic Cards (${cardBlocks.length})</h2>`;
                expandedPreviewContainer.appendChild(headerDiv);
                
                // Create grid container
                const gridContainer = document.createElement('div');
                gridContainer.style.display = 'grid';
                gridContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
                gridContainer.style.gap = '15px';
                expandedPreviewContainer.appendChild(gridContainer);
                
                // Create preview for each card
                cardBlocks.forEach((block, index) => {
                    const cardDiv = document.createElement('div');
                    cardDiv.style.backgroundColor = 'white';
                    cardDiv.style.border = '1px solid #ddd';
                    cardDiv.style.borderRadius = '5px';
                    cardDiv.style.overflow = 'hidden';
                    
                    // Add card header with number
                    const cardHeader = document.createElement('div');
                    cardHeader.style.backgroundColor = '#f5f5f5';
                    cardHeader.style.padding = '5px 10px';
                    cardHeader.style.fontSize = '12px';
                    cardHeader.style.borderBottom = '1px solid #ddd';
                    cardHeader.textContent = `Card ${index + 1}`;
                    cardDiv.appendChild(cardHeader);
                    
                    // Card content container
                    const cardContent = document.createElement('div');
                    cardContent.style.padding = '10px';
                    
                    let question = '';
                    let subtitle = '';
                    let answer = '';
                    let extraInfo = '';
                    
                    // Parse card content
                    if (block.length > 0) {
                        question = block[0];
                    }
                    
                    if (block.length > 1) {
                        subtitle = block[1];
                    }
                    
                    // Find the extraInfo line (starts with /)
                    const extraInfoIndex = block.findIndex(line => line.startsWith('/'));
                    
                    if (extraInfoIndex !== -1 && extraInfoIndex >= 2) {
                        // Everything from line 2 up to extraInfoIndex is the answer
                        answer = block.slice(2, extraInfoIndex).join('<br>');
                        // Remove the leading slash from extraInfo
                        extraInfo = block[extraInfoIndex].substring(1);
                        
                        // If there are more lines after extraInfoIndex, add them to extraInfo
                        if (extraInfoIndex < block.length - 1) {
                            extraInfo += '<br>' + block.slice(extraInfoIndex + 1).join('<br>');
                        }
                    } else if (block.length > 2) {
                        // No extraInfo found, everything from line 2 onward is the answer
                        answer = block.slice(2).join('<br>');
                    }
                    
                    // Add question
                    const questionEl = document.createElement('h3');
                    questionEl.style.fontSize = '14px';
                    questionEl.style.margin = '0 0 5px 0';
                    questionEl.textContent = question;
                    cardContent.appendChild(questionEl);
                    
                    // Add subtitle if available
                    if (subtitle) {
                        const subtitleEl = document.createElement('p');
                        subtitleEl.style.fontSize = '12px';
                        subtitleEl.style.margin = '0 0 10px 0';
                        subtitleEl.style.color = '#666';
                        subtitleEl.textContent = subtitle;
                        cardContent.appendChild(subtitleEl);
                    }
                    
                    // Add separator
                    const separator = document.createElement('hr');
                    separator.style.margin = '8px 0';
                    separator.style.border = 'none';
                    separator.style.borderTop = '1px dashed #ddd';
                    cardContent.appendChild(separator);
                    
                    // Add answer
                    const answerEl = document.createElement('div');
                    answerEl.style.fontSize = '12px';
                    answerEl.innerHTML = answer;
                    cardContent.appendChild(answerEl);
                    
                    // Add extra info if available
                    if (extraInfo) {
                        const infoDiv = document.createElement('div');
                        infoDiv.style.marginTop = '10px';
                        infoDiv.style.padding = '5px';
                        infoDiv.style.fontSize = '11px';
                        infoDiv.style.backgroundColor = '#f8f8f8';
                        infoDiv.style.borderRadius = '3px';
                        infoDiv.innerHTML = `<strong>Notes:</strong> ${extraInfo}`;
                        cardContent.appendChild(infoDiv);
                    }
                    
                    cardDiv.appendChild(cardContent);
                    gridContainer.appendChild(cardDiv);
                });
            } catch (error) {
                const errorDiv = document.createElement('div');
                errorDiv.style.textAlign = 'center';
                errorDiv.style.padding = '20px';
                errorDiv.style.color = '#777';
                errorDiv.innerHTML = `
                    <p>Error parsing classic cards:</p>
                    <p style="color: #e74c3c;">${error.message}</p>
                `;
                expandedPreviewContainer.appendChild(errorDiv);
            }
        }
    }, 100);
}

// Add this near the openAdminPanel function or event listener
document.getElementById('open-admin-btn').addEventListener('click', function() {
    // Show the admin modal
    document.getElementById('admin-modal').classList.remove('hidden');
    
    // Make sure preview areas are in correct initial state
    const regularPreview = document.querySelector('.card-preview');
    const expandedPreview = document.querySelector('.expanded-preview');
    const closeXButton = document.getElementById('preview-close-x');
    const returnButton = document.getElementById('preview-return-btn');
    
    // Ensure single preview is visible and expanded is hidden
    regularPreview.style.display = 'block';
    expandedPreview.style.display = 'none';
    closeXButton.style.display = 'none';
    returnButton.style.display = 'none';
    
    // Set correct button text
    document.getElementById('expand-preview-btn').textContent = 'Show All Cards';
    
    // Initialize other admin panel elements
    populateDeckDropdown();
});

// ... existing code ...
// Comment out this function since we now have the table hardcoded in HTML
/*
function updateOverview() {
    const overviewSection = document.getElementById('overview-section');
    
    // Clear the section
    overviewSection.innerHTML = '';
    
    // Create table structure
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    
    // Create header row
    const headerRow = document.createElement('tr');
    const deckHeader = document.createElement('th');
    deckHeader.textContent = 'Mazo';
    const newHeader = document.createElement('th');
    newHeader.textContent = 'Nuevas';
    const dueHeader = document.createElement('th');
    dueHeader.textContent = 'Pendientes';
    
    // Append headers
    headerRow.appendChild(deckHeader);
    headerRow.appendChild(newHeader);
    headerRow.appendChild(dueHeader);
    thead.appendChild(headerRow);
    
    // Assemble table
    table.appendChild(thead);
    overviewSection.appendChild(table);
    
    // Call the existing function to populate the table body with data
    generateOverviewTable().then(tableBody => {
        table.appendChild(tableBody);
        addToggleListeners();
    }).catch(error => {
        console.error('Error updating overview:', error);
    });
}
*/
// ... existing code ...

// Function to show calendar
function showCalendar() {
    const mainContent = document.getElementById('main-content');
    const overviewSection = document.getElementById('overview-section');
    const statsContainer = document.querySelector('.stats-container');
    const flashcardSystem = document.getElementById('flashcard-system');
    const calendar = document.getElementById('study-calendar');

    // Show main content
    mainContent?.classList?.remove('hidden');
    
    // Hide other sections
    overviewSection?.parentElement?.classList?.add('hidden');
    statsContainer?.classList?.add('hidden');
    flashcardSystem?.classList?.add('hidden');
    
    // Show calendar
    if (calendar) {
        calendar.classList.remove('hidden');
        
        // Generate calendar if it hasn't been initialized
        if (!calendar.querySelector('.month-container')) {
            generateCalendar();
        }
    }
    
    showStatus('Calendar');
}

// Add event listener for calendar button
document.addEventListener('DOMContentLoaded', () => {
    const calendarButton = document.getElementById('calendar-button');
    if (calendarButton) {
        calendarButton.addEventListener('click', showCalendar);
    }
});

// ... existing code ...

// Profile dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    const profileToggle = document.getElementById('profile-toggle');
    const profileDropdown = document.querySelector('.profile-dropdown-content');
    const profileBtn = document.getElementById('profile-btn');
    const logoutBtn = document.getElementById('logout');
    
    if (profileToggle && profileDropdown) {
        // Toggle dropdown when clicking the profile icon
        profileToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
            
            // Force redraw to ensure visibility
            profileDropdown.style.display = 'none';
            setTimeout(() => {
                profileDropdown.style.display = profileDropdown.classList.contains('show') ? 'block' : 'none';
            }, 0);
        });
        
        // Close dropdown when clicking elsewhere
        document.addEventListener('click', function(e) {
            if (!profileToggle.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('show');
            }
        });
        
        // Handle profile button click (currently does nothing)
        if (profileBtn) {
            profileBtn.addEventListener('click', function() {
                // This is left non-functional as per requirements
                profileDropdown.classList.remove('show');
            });
        }
        
        // Ensure the logout button is visible and styled properly
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
            logoutBtn.style.visibility = 'visible';
            logoutBtn.style.opacity = '1';
        }
    }
});

// Function to parse a classic card from text input
function parseClassicCard(text) {
    // Split text by lines and filter out empty lines
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 2) {
        throw new Error('Classic card must have at least a question and answer');
    }
    
    const question = lines[0];
    let subtitle = '';
    let answer = '';
    let extraInfo = '';
    
    if (lines.length === 2) {
        // Simple question/answer format
        answer = lines[1];
    } else if (lines.length === 3) {
        // Question/subtitle/answer format
        subtitle = lines[1];
        answer = lines[2];
    } else {
        // Question with subtitle and multi-line answer
        subtitle = lines[1];
        
        // Look for notes (lines starting with /note or /nota)
        const noteLines = [];
        const answerLines = [];
        
        for (let i = 2; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('/note ') || line.startsWith('/nota ')) {
                noteLines.push(line.replace(/^\/(note|nota)\s+/, ''));
            } else {
                answerLines.push(line);
            }
        }
        
        answer = answerLines.join('\n');
        extraInfo = noteLines.join('\n');
    }
    
    return { question, subtitle, answer, extraInfo };
}

// Function to parse a multiple choice card from text input
function parseMultipleChoiceCard(text) {
    // Split text by lines and filter out empty lines
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 3) {
        throw new Error('Multiple choice card must have at least a question and 2 options');
    }
    
    const question = lines[0];
    const options = [];
    let correctIndex = -1;
    const commentLines = [];
    
    // Process options and find the correct one
    for (let i = 1; i < lines.length; i++) {
        let line = lines[i];
        
        // Check if this line is a comment
        if (line.startsWith('/')) {
            commentLines.push(line.substring(1).trim());
            continue;
        }
        
        // Check if this option is marked as correct
        if (line.endsWith(']')) {
            correctIndex = options.length;
            line = line.substring(0, line.length - 1);
        }
        
        options.push(line);
    }
    
    if (correctIndex === -1) {
        throw new Error('No correct option marked with ] for multiple choice card');
    }
    
    if (options.length < 2) {
        throw new Error('Multiple choice card must have at least 2 options');
    }
    
    const extraInfo = commentLines.join('\n');
    
    return { question, options, correctIndex, extraInfo };
}

$('#addCardForm').submit(function(e) {
    e.preventDefault();
    
    // Change button state to indicate processing
    const submitButton = $('#addCardSubmit');
    const originalText = submitButton.text();
    submitButton.text('Processing...').prop('disabled', true);
    
    // Get form values
    const question = $('#questionInput').val().trim();
    const deck = $('#deckSelect').val().trim();
    const subdeck = $('#subdeckInput').val().trim();
    const subsubdeck = $('#subsubdeckInput').val().trim();
    const tags = $('#tagsInput').val().trim().split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    const cardType = $('input[name="cardType"]:checked').val();
    
    // Validate required fields
    if (!question || !deck || !subdeck) {
        alert('Please fill in all required fields (Question, Deck, and Subdeck)');
        submitButton.text(originalText).prop('disabled', false);
        return;
    }
    
    try {
        // Parse the card content based on the card type
        let cardData;
        
        if (cardType === 'classic') {
            cardData = parseClassicCard(question);
        } else if (cardType === 'multipleChoice') {
            cardData = parseMultipleChoiceCard(question);
        } else {
            throw new Error('Invalid card type');
        }
        
        // Create the form data object
        const formData = {
            type: cardType,
            deck: deck,
            subdeck: subdeck,
            tags: tags,
            ...cardData
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
            $('#addCardForm')[0].reset();
            
            // Show success message
            alert('Card added successfully!');
            
            // Close the modal
            $('#adminModal').modal('hide');
        })
        .catch(error => {
            console.error('Error adding card:', error);
            alert(`Error adding card: ${error.message}`);
        })
        .finally(() => {
            // Reset button state
            submitButton.text(originalText).prop('disabled', false);
        });
    } catch (error) {
        console.error('Error parsing card:', error);
        alert(`Error parsing card: ${error.message}`);
        submitButton.text(originalText).prop('disabled', false);
    }
});

// ... existing code ...

// Toggle card format help when card type changes
$('input[name="cardType"]').change(function() {
    const cardType = $(this).val();
    
    if (cardType === 'classic') {
        $('#classicFormatHelp').show();
        $('#multipleChoiceFormatHelp').hide();
    } else if (cardType === 'multipleChoice') {
        $('#classicFormatHelp').hide();
        $('#multipleChoiceFormatHelp').show();
    }
});

// ... existing code ...

// Function to set up live preview for the question input
function setupLivePreview() {
    const previewContainer = $('<div>', {
        id: 'livePreviewContainer',
        class: 'card mb-3'
    }).insertAfter('#questionInput');

    const previewHeader = $('<div>', {
        class: 'card-header',
        text: 'Live Preview'
    }).appendTo(previewContainer);

    const previewBody = $('<div>', {
        class: 'card-body',
        id: 'livePreviewBody'
    }).appendTo(previewContainer);

    function updatePreview() {
        const text = $('#questionInput').val();
        const cardType = $('input[name="cardType"]:checked').val();
        const previewBody = $('#livePreviewBody');
        
        previewBody.empty();
        
        try {
            if (cardType === 'classic') {
                const parsed = parseClassicCard(text);
                
                // Add question
                $('<h5>', {
                    class: 'card-title',
                    text: parsed.question
                }).appendTo(previewBody);
                
                // Add subtitle if exists
                if (parsed.subtitle) {
                    $('<h6>', {
                        class: 'card-subtitle mb-2 text-muted',
                        text: parsed.subtitle
                    }).appendTo(previewBody);
                }
                
                // Add answer with collapsible panel
                const answerPanel = $('<div>', {
                    class: 'mt-3'
                }).appendTo(previewBody);
                
                const answerToggle = $('<button>', {
                    class: 'btn btn-outline-primary btn-sm',
                    text: 'Show Answer'
                }).appendTo(answerPanel);
                
                const answerContent = $('<div>', {
                    class: 'mt-2 p-2 border rounded bg-light',
                    style: 'display: none;'
                }).appendTo(answerPanel);
                
                $('<p>', {
                    text: parsed.answer,
                    style: 'white-space: pre-line;'
                }).appendTo(answerContent);
                
                // Show extra info if it exists
                if (parsed.extraInfo) {
                    $('<div>', {
                        class: 'alert alert-info mt-3',
                        html: '<strong>Notes:</strong> ' + parsed.extraInfo
                    }).appendTo(answerContent);
                }
                
                // Set up toggle functionality
                answerToggle.click(function() {
                    answerContent.toggle();
                    answerToggle.text(answerContent.is(':visible') ? 'Hide Answer' : 'Show Answer');
                });
                
            } else if (cardType === 'multipleChoice') {
                const parsed = parseMultipleChoiceCard(text);
                
                // Add question
                $('<h5>', {
                    class: 'card-title',
                    text: parsed.question
                }).appendTo(previewBody);
                
                // Add options
                const optionsContainer = $('<div>', {
                    class: 'mt-3'
                }).appendTo(previewBody);
                
                parsed.options.forEach((option, index) => {
                    const isCorrect = index === parsed.correctIndex;
                    
                    const optionDiv = $('<div>', {
                        class: 'form-check mb-2'
                    }).appendTo(optionsContainer);
                    
                    const optionInput = $('<input>', {
                        class: 'form-check-input option-radio',
                        type: 'radio',
                        name: 'previewOptions',
                        id: `previewOption${index}`,
                        value: index
                    }).appendTo(optionDiv);
                    
                    $('<label>', {
                        class: 'form-check-label',
                        for: `previewOption${index}`,
                        text: option
                    }).appendTo(optionDiv);
                    
                    if (isCorrect) {
                        optionInput.data('correct', true);
                    }
                });
                
                // Add button to check answer
                const checkButton = $('<button>', {
                    class: 'btn btn-outline-primary btn-sm mt-2',
                    text: 'Check Answer'
                }).appendTo(previewBody);
                
                // Add result display
                const resultDisplay = $('<div>', {
                    class: 'mt-2',
                    style: 'display: none;'
                }).appendTo(previewBody);
                
                // Show extra info if it exists
                if (parsed.extraInfo) {
                    $('<div>', {
                        class: 'alert alert-info mt-3',
                        html: '<strong>Notes:</strong> ' + parsed.extraInfo
                    }).appendTo(resultDisplay);
                }
                
                // Set up check functionality
                checkButton.click(function() {
                    const selectedOption = $('input[name="previewOptions"]:checked');
                    
                    if (selectedOption.length === 0) {
                        alert('Please select an option first');
                        return;
                    }
                    
                    resultDisplay.show();
                    
                    if (selectedOption.data('correct')) {
                        resultDisplay.html('<div class="alert alert-success">Correct!</div>');
                    } else {
                        const correctIndex = parsed.correctIndex;
                        resultDisplay.html(`<div class="alert alert-danger">Incorrect! The correct answer is: ${parsed.options[correctIndex]}</div>`);
                    }
                    
                    // Show extra info if it exists
                    if (parsed.extraInfo) {
                        $('<div>', {
                            class: 'alert alert-info mt-3',
                            html: '<strong>Notes:</strong> ' + parsed.extraInfo
                        }).appendTo(resultDisplay);
                    }
                });
            }
        } catch (error) {
            // If there's an error in parsing, show format help
            previewBody.html(`<div class="alert alert-warning">
                <p><strong>Format error:</strong> ${error.message}</p>
                <p>Please check the Card Format Help section below for correct formatting.</p>
            </div>`);
        }
    }
    
    // Update preview when input changes, with debounce
    const debouncedUpdate = debounce(updatePreview, 500);
    $('#questionInput').on('input', debouncedUpdate);
    $('input[name="cardType"]').change(updatePreview);
    
    // Initial update
    updatePreview();
}

// Debounce helper function
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// ... existing code ...

// Initialize the admin panel when document is ready
$(document).ready(function() {
    console.log('Admin panel initializing');
    
    // Populate deck select dropdown
    populateDeckSelect();
    
    // Set up event handlers for the admin form
    setupAdminForm();
    
    // Set up live preview for card creation
    setupLivePreview();
    
    // Add any other admin panel initialization here
});

// Function to set up admin form event handlers
function setupAdminForm() {
    // Admin panel modal open/close events
    $('#openAdminModal').click(function() {
        $('#adminModal').modal('show');
    });
    
    $('#adminModal').on('hidden.bs.modal', function() {
        $('#addCardForm')[0].reset();
    });
    
    // Set up cascading dropdown for deck/subdeck/subsubdeck
    $('#deckSelect').change(function() {
        updateSubdeckInput($(this).val());
    });
    
    $('#subdeckInput').on('input', function() {
        updateSubsubdeckInput($('#deckSelect').val(), $(this).val());
    });
}

// Function to populate the deck select dropdown
function populateDeckSelect() {
    const decks = [
        'Microbiología',
        'Patología',
        'Semiología',
        'Farmacología',
        'Terapéutica 1',
        'Medicina Interna 1',
        'Revalida',
        'MIR'
    ];
    
    const $deckSelect = $('#deckSelect');
    decks.forEach(deck => {
        $deckSelect.append(`<option value="${deck}">${deck}</option>`);
    });
}

// Function to update the subdeck input based on the selected deck
function updateSubdeckInput(deckName) {
    console.log('Updating subdeck options for deck:', deckName);
    
    // Clear current options
    $('#subdeckOptions').empty();
    $('#subdeckInput').val('');
    
    if (!deckName) return;
    
    // Predefined subdecks for each deck
    const subdecks = {
        'Microbiología': ['Bacterias', 'Hongos', 'Parásitos', 'Virus'],
        'Patología': ['Metabolopatías', 'Inflamación', 'Neoplasias', 'Cardiovascular', 'Respiratorio', 'Digestivo', 'Aparato urinario', 'Aparato reproductor', 'Piel', 'Huesos y articulaciones', 'Sistema endocrino', 'Otros'],
        'Semiología': ['Historía clínica', 'Piel y faneras', 'Cabeza y cuello', 'Respiratorio', 'Cardiovascular', 'Digestivo', 'Urinario', 'Neurología', 'Osteoarticular'],
        'Farmacología': ['ERA1', 'ERA2'],
        'Terapéutica 1': ['ERA1', 'ERA2', 'ERA3'],
        'Medicina Interna 1': ['Neumonología', 'Cardiovascular', 'Tubo Digestivo', 'Neurología', 'Anexos'],
        'Revalida': ['Bling', 'Blang', 'Blong'],
        'MIR': ['Bling', 'Blang', 'Blong']
    };
    
    // Add options to the datalist
    if (subdecks[deckName]) {
        const $datalist = $('#subdeckOptions');
        subdecks[deckName].forEach(subdeck => {
            $datalist.append(`<option value="${subdeck}">`);
        });
        
        // Update label to guide user
        const $label = $('label[for="subdeckInput"]');
        $label.text('Subdeck: (select from list or type new)');
    }
}

// Function to update the subsubdeck input based on the selected deck and subdeck
function updateSubsubdeckInput(deckName, subdeckName) {
    console.log('Updating subsubdeck options for:', deckName, subdeckName);
    
    // Clear current options
    $('#subsubdeckOptions').empty();
    $('#subsubdeckInput').val('');
    
    if (!deckName || !subdeckName) return;
    
    // Predefined subsubdecks for certain deck/subdeck combinations
    const subsubdecks = {
        'Patología': {
            'Respiratorio': ['Neumonía', 'Asma y Epoc', 'Cáncer de Pulmón', 'Otros']
        }
    };
    
    // Add options to the datalist if they exist
    if (subsubdecks[deckName] && subsubdecks[deckName][subdeckName]) {
        const $datalist = $('#subsubdeckOptions');
        subsubdecks[deckName][subdeckName].forEach(subsubdeck => {
            $datalist.append(`<option value="${subsubdeck}">`);
        });
        
        // Update label to guide user
        const $label = $('label[for="subsubdeckInput"]');
        $label.text('Subsubdeck: (select from list or type new)');
    }
}