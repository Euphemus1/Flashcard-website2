// dashboard-script.js
let currentDeck = 'Microbiología';
let flashcards = [
    {
        question: "What is the cause of Necrotizing Fasciitis?",
        answer: "Streptococcus pyogenes and Staphylococcus aureus",
        interval: 1,
        lastReview: new Date().getTime(),
        deck: 'Microbiología',
        subdeck: 'Bacterias'
    },
    {
        question: "What is the most common cause of bacterial pneumonia?",
        answer: "Streptococcus pneumoniae",
        interval: 1,
        lastReview: new Date().getTime(),
        deck: 'Microbiología',
        subdeck: 'Bacterias'
    }
];

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
    
    // Add contact button functionality
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
document.getElementById('contact-button').addEventListener('click', showContact);

let currentCardIndex = 0;

// Deck and subdeck structure
const decks = {
    'Microbiología': ['Bacterias', 'Hongos', 'Parásitos', 'Virus'],
    'Semiología': ['Historía clínica', 'Piel y faneras', 'Cabeza y cuello', 'Respiratorio', 'Cardiovascular', 'Digestivo', 'Urinario', 'Neurología', 'Osteoarticular'],
    'Patología': ['ERA1', 'ERA2', 'ERA3'],
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
    
    for (const [deckName, subdecks] of Object.entries(decks)) {
        // Main deck row
        const deckStats = await calculateCards(deckName);
        const deckRow = createOverviewRow(deckName, deckStats, false);
        tableBody.appendChild(deckRow);

        // Subdeck rows
        for (const subdeck of subdecks) {
            const subdeckStats = await calculateCards(deckName, subdeck);
            const subdeckRow = createOverviewRow(subdeck, subdeckStats, true);
            tableBody.appendChild(subdeckRow);
        }
    }
    return tableBody;
}

// MODIFIED ROW CREATION
function createOverviewRow(name, stats, isSubdeck) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${isSubdeck ? `<span class="subdeck-padding">${name}</span>` : `<span class="toggle-deck">+</span> ${name}`}</td>
        <td class="total-cards">${stats.totalCards}</td>
    `;
    if (isSubdeck) row.classList.add('subdeck-row', 'hidden');
    return row;
}

// NEW VERSION - ASYNC VERSION
async function showOverview() {
    const overviewSection = document.getElementById('overview-section');
    // ... keep existing null checks ...

    // Clear table
    const oldTableBody = overviewSection.querySelector('tbody');
    if (oldTableBody) oldTableBody.remove();

    // Generate new content
    const newTableBody = await generateOverviewTable();
    const table = overviewSection.querySelector('table');
    if (table) table.appendChild(newTableBody);

    // Rest of existing code remains the same...
    addToggleListeners();
    showStatus('Overview');
}

// Function to toggle subdeck visibility
function toggleSubdecks(event) {
    const toggleButton = event.target;
    const deckRow = toggleButton.closest('tr');
    const subdeckRows = [];
    
    // Collect all consecutive subdeck rows
    let nextRow = deckRow.nextElementSibling;
    while (nextRow && nextRow.classList.contains('subdeck-row')) {
        subdeckRows.push(nextRow);
        nextRow = nextRow.nextElementSibling;
    }

    // Toggle visibility
    subdeckRows.forEach(row => row.classList.toggle('hidden'));
    
    // Update toggle icon
    toggleButton.textContent = toggleButton.textContent === '+' ? '-' : '+';
}

// Add event listeners for toggle buttons in the overview table
function addToggleListeners() {
    const toggleButtons = document.querySelectorAll('.toggle-deck');
    toggleButtons.forEach(button => {
        button.addEventListener('click', toggleSubdecks);
    });
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

function loadNextCard() {
    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
    const currentCard = flashcards[currentCardIndex];
    document.getElementById('card-front').textContent = currentCard.question;
    document.getElementById('card-back').textContent = currentCard.answer;
    showStatus(currentCard.interval > 1 ? 'Para repasar' : 'Tarjeta nueva');

    // Reset card display
    document.querySelector('.question').classList.remove('hidden');
    document.querySelector('.answer').classList.add('hidden');
    document.querySelector('.srs-controls').classList.add('hidden');
    document.getElementById('review-actions').classList.remove('hidden');
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
      const response = await fetch(`/api/flashcards?${params.toString()}`);
      
      // 3. Handle response
      if (!response.ok) {
        console.warn('⚠️ API response not OK, using default cards');
        return getDefaultCards();
      }
      
      return await response.json();
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
document.getElementById('add-flashcard-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newCard = {
      question: document.getElementById('question').value,
      answer: document.getElementById('answer').value,
      deck: document.getElementById('deck-select').value,
      subdeck: document.getElementById('subdeck').value,
      references: document.getElementById('references').value.split(',').map(s => s.trim()),
      tags: document.getElementById('tags').value.split(',').map(s => s.trim()),
      extraInfo: document.getElementById('extra-info').value
    };
  
    // Add validation
    if (!newCard.question || !newCard.answer || !newCard.deck) {
      alert('Please fill in all required fields (Question, Answer, Deck)');
      return;
    }
  
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCard)
      });
  
      const data = await response.json();
      
      if(response.ok) {
        alert('Flashcard added successfully!');
        document.getElementById('admin-modal').classList.add('hidden');
        
        if(window.location.pathname.includes('patologia-era1')) {
            getDeckData('Patología', 'ERA1').then(data => {
              flashcards = data;
              currentCardIndex = 0; // Reset to first card
              loadNextCard();
            });
          }
      } else {
        alert(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch(error) {
      console.error('Error adding flashcard:', error);
      alert('Connection error. Please try again.');
    }
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

// Admin Panel Functionality
document.addEventListener('DOMContentLoaded', () => {
    const adminModal = document.getElementById('admin-modal');
    const openAdminBtn = document.getElementById('open-admin-btn'); // Add this button in your UI
    const closeAdminBtn = document.querySelector('.admin-close-btn');
    
    // Open admin panel
    openAdminBtn?.addEventListener('click', () => {
        adminModal.classList.remove('hidden');
    });
    
    // Close admin panel
    closeAdminBtn?.addEventListener('click', () => {
        adminModal.classList.add('hidden');
    });
    
    // Close when clicking outside
    adminModal?.addEventListener('click', (e) => {
        if(e.target === adminModal) adminModal.classList.add('hidden');
    });
    
    // Preview functionality
    document.getElementById('preview-btn')?.addEventListener('click', updatePreview);
    
    // Toggle preview answer
    document.querySelector('.toggle-preview')?.addEventListener('click', function() {
        const answer = document.querySelector('.preview-answer');
        answer.classList.toggle('hidden');
        this.textContent = answer.classList.contains('hidden') ? 'Show Answer' : 'Hide Answer';
    });
});

function updatePreview() {
    const question = document.getElementById('question').value;
    const answer = document.getElementById('answer').value;
    const previewPanel = document.getElementById('preview-panel');
    
    document.querySelector('.preview-question').textContent = question;
    document.querySelector('.preview-answer').textContent = answer;
    previewPanel.classList.remove('hidden');
}

function initializeERA1Cards() {
    if (window.location.pathname.includes('patologia-era1')) {
      console.log('Initializing ERA1 flashcards... 1233445');
      
      // 1. Get both deck and subdeck
      getDeckData('Patología', 'ERA1').then(data => {
        // 2. Directly use server-filtered data
        flashcards = data;
        console.log('Loaded ERA1 cards:', flashcards);
        
        if(flashcards.length > 0) {
          currentCardIndex = 0; // Reset index
          loadNextCard();
        } else {
          showStatus('No hay tarjetas en este mazo');
        }
      }).catch(error => {
        console.error('Error loading ERA1 cards:', error);
        showStatus('Error al cargar las tarjetas');
      });
    }
  }
  
  // Add to existing DOMContentLoaded listener
  document.addEventListener('DOMContentLoaded', () => {
    displayUsername();
    initializeERA1Cards(); 
    // Keep other existing initializations
    document.getElementById('contact-button')?.addEventListener('click', showContact);
  });

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