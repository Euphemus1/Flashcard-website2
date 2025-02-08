// dashboard-script.js
let currentDeck = 'Microbiología';
let flashcards = [
    {
        question: "What is the cause of Necrotizing Fasciitis?",
        answer: "Streptococcus pyogenes and Staphylococcus aureus",
        interval: 1,
        lastReview: new Date().getTime()
    },
    {
        question: "What is the most common cause of bacterial pneumonia?",
        answer: "Streptococcus pneumoniae",
        interval: 1,
        lastReview: new Date().getTime()
    }
];

let currentCardIndex = 0;

function flipCard() {
    const questionCard = document.querySelector('.question');
    const answerCard = document.querySelector('.answer');
    const reviewActions = document.getElementById('review-actions');
    const srsControls = document.querySelector('.srs-controls');

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
    showStatus('Due card updated!');
    setTimeout(() => loadNextCard(), 1000);
}

function showStatus(status) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = status;
}

function skipCard() {
    showStatus('Card skipped.');
    loadNextCard();
}

function loadNextCard() {
    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
    const currentCard = flashcards[currentCardIndex];
    document.getElementById('card-front').textContent = currentCard.question;
    document.getElementById('card-back').textContent = currentCard.answer;
    showStatus(currentCard.interval > 1 ? 'Due card' : 'New card');

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

// Show the main content when a deck or subdeck is clicked
function showMainContent() {
    const mainContent = document.getElementById('main-content');
    mainContent.classList.remove('hidden');
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
    alert("FAQ content goes here.");
});