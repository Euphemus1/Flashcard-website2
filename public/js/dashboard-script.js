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

let currentCardIndex = 0;

// Deck and subdeck structure
const decks = {
    'Microbiología': ['Bacterias', 'Hongos', 'Parásitos', 'Virus'],
    'Semiología': ['Historía clínica', 'Piel y faneras', 'Cabeza y cuello', 'Respiratorio', 'Cardiovascular', 'Digestivo', 'Urinario', 'Neurología', 'Osteoarticular'],
    'Patología': ['ERA1', 'ERA2', 'ERA3'],
    'Farmacología': ['ERA1', 'ERA2'],
    'Terapéutica 1': ['ERA1', 'ERA2', 'ERA3'],
    'Medicina Interna 1': ['Neumonología', 'Cardiovascular', 'Tubo digestivo', 'Neurología', 'Anexos']
};

// Function to calculate new and due cards for a deck or subdeck
function calculateCards(deckName, subdeckName = null) {
    const now = new Date().getTime();
    let newCards = 0;
    let dueCards = 0;

    flashcards.forEach(card => {
        if (subdeckName) {
            // Check if the card belongs to the subdeck
            if (card.subdeck === subdeckName) {
                if (card.interval === 1) newCards++;
                if (card.lastReview + card.interval * 60000 < now) dueCards++;
            }
        } else {
            // Check if the card belongs to the deck
            if (card.deck === deckName) {
                if (card.interval === 1) newCards++;
                if (card.lastReview + card.interval * 60000 < now) dueCards++;
            }
        }
    });

    return { newCards, dueCards };
}

// Function to generate the overview table
function generateOverviewTable() {
    const tableBody = document.createElement('tbody');
    for (const [deckName, subdecks] of Object.entries(decks)) {
        // Add row for the main deck
        const deckStats = calculateCards(deckName);
        const deckRow = document.createElement('tr');
        deckRow.innerHTML = `
            <td><span class="toggle-deck">+</span> ${deckName}</td>
            <td class="${deckStats.newCards > 0 ? 'new-positive' : ''}">${deckStats.newCards}</td>
            <td class="${deckStats.dueCards > 0 ? 'due-positive' : ''}">${deckStats.dueCards}</td>
        `;
        tableBody.appendChild(deckRow);

        // Add rows for subdecks (hidden by default)
        subdecks.forEach(subdeck => {
            const subdeckStats = calculateCards(deckName, subdeck);
            const subdeckRow = document.createElement('tr');
            subdeckRow.classList.add('subdeck-row', 'hidden');
            subdeckRow.innerHTML = `
                <td style="padding-left: 30px">${subdeck}</td>
                <td class="${subdeckStats.newCards > 0 ? 'new-positive' : ''}">${subdeckStats.newCards}</td>
                <td class="${subdeckStats.dueCards > 0 ? 'due-positive' : ''}">${subdeckStats.dueCards}</td>
            `;
            tableBody.appendChild(subdeckRow);
        });
    }
    return tableBody;
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

// Function to show the overview section
function showOverview() {
    const overviewSection = document.getElementById('overview-section');
    const flashcardSystem = document.getElementById('flashcard-system');

    // Clear existing table content
    const tableBody = overviewSection.querySelector('tbody');
    if (tableBody) tableBody.remove();

    // Generate and append the new table content
    const newTableBody = generateOverviewTable();
    overviewSection.querySelector('table').appendChild(newTableBody);

    // Add event listeners for toggle buttons
    addToggleListeners();

    // Show the overview section and hide the flashcard system
    overviewSection.classList.remove('hidden');
    flashcardSystem.classList.add('hidden');

    // Update the status
    showStatus('Overview');
}

// Function to show the main content (flashcard system)
function showMainContent() {
    const mainContent = document.getElementById('main-content');
    const overviewSection = document.getElementById('overview-section');
    const flashcardSystem = document.getElementById('flashcard-system');

    mainContent.classList.remove('hidden');
    overviewSection.classList.add('hidden');
    flashcardSystem.classList.remove('hidden');
}

// Add event listener for the overview button
document.getElementById('overview-button').addEventListener('click', showOverview);

// Load the overview section by default when the page loads
window.onload = function() {
    showOverview();
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

function getDeckData(deckName) {
    return [
        { question: "Sample question", answer: "Sample answer", interval: 1, lastReview: new Date().getTime() }
    ];
}

// Add event listeners for dropdown functionality
document.querySelectorAll('.deck-btn').forEach(button => {
    button.addEventListener('click', function() {
        const subdeckList = this.nextElementSibling;
        subdeckList.style.display = subdeckList.style.display === 'block' ? 'none' : 'block';
    });
});

// Add event listeners for deck and subdeck buttons
document.querySelectorAll('.deck-btn, .subdeck-btn').forEach(button => {
    button.addEventListener('click', () => {
        showMainContent();
        loadNextCard();
    });
});

// Add event listeners for flashcard actions
document.getElementById('revisar-button').addEventListener('click', flipCard);
document.getElementById('skip-button').addEventListener('click', skipCard);
document.querySelector('.denuevo').addEventListener('click', () => rateCard(10));
document.querySelector('.díficil').addEventListener('click', () => rateCard(60));
document.querySelector('.bueno').addEventListener('click', () => rateCard(1440));
document.querySelector('.fácil').addEventListener('click', () => rateCard(2880));

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