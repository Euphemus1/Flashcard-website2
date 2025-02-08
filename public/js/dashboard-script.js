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
    const srsControls = document.querySelector('.srs-controls');

    // Hide the question card and show the answer card
    questionCard.style.display = 'none';
    answerCard.style.display = 'block';
    srsControls.style.display = 'grid';
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
    document.querySelector('.question').style.display = 'block';
    document.querySelector('.answer').style.display = 'none';
    document.querySelector('.srs-controls').style.display = 'none';
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

// Add event listeners for deck switching
document.getElementById('microbiology-btn').addEventListener('click', () => switchDeck('Microbiología'));
document.getElementById('semiology-btn').addEventListener('click', () => switchDeck('Semiología'));
document.getElementById('patología-btn').addEventListener('click', () => switchDeck('Patología'));
document.getElementById('farmacología-btn').addEventListener('click', () => switchDeck('Farmacología'));
document.getElementById('terapéutica1-btn').addEventListener('click', () => switchDeck('Terapéutica 1'));
document.getElementById('medicinainterna1-btn').addEventListener('click', () => switchDeck('Medicina Interna 1'));

// Add event listeners for flashcard actions
document.querySelector('.revisar-btn').addEventListener('click', flipCard);
document.getElementById('skip-button').addEventListener('click', skipCard);
document.querySelector('.denuevo').addEventListener('click', () => rateCard(10));
document.querySelector('.díficil').addEventListener('click', () => rateCard(60));
document.querySelector('.bueno').addEventListener('click', () => rateCard(1440));
document.querySelector('.fácil').addEventListener('click', () => rateCard(2880));

// Load the first card when the page loads
window.onload = loadNextCard;