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
    const card = document.getElementById('flashcard');
    card.classList.toggle('flipped');
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

function showReviewOptions() {
    document.getElementById('review-buttons').style.display = 'flex';
    document.getElementById('review-actions').style.display = 'none';
}

function skipCard() {
    showStatus('Card skipped.');
    loadNextCard();
}

function loadNextCard() {
    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
    const currentCard = flashcards[currentCardIndex];
    document.getElementById('card-front').innerHTML = currentCard.question;
    document.getElementById('card-back').innerHTML = currentCard.answer;
    showStatus(currentCard.interval > 1 ? 'Due card' : 'New card');
    document.getElementById('review-buttons').style.display = 'none';
    document.getElementById('review-actions').style.display = 'flex';
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
document.getElementById('farmacología-btn').addEventListener('click', () => switchDeck('Farmacoíalogía'));
document.getElementById('terapéutica 1-btn').addEventListener('click', () => switchDeck('Terapéutica 1'));
document.getElementById('medicina interna 1-btn').addEventListener('click', () => switchDeck('Medicina Interna 1'));
document.getElementById('flashcard').addEventListener('click', flipCard);
document.getElementById('review-button').addEventListener('click', showReviewOptions);
document.getElementById('skip-button').addEventListener('click', skipCard);
document.getElementById('10-min-btn').addEventListener('click', () => rateCard(10));
document.getElementById('1-hour-btn').addEventListener('click', () => rateCard(60));
document.getElementById('1-day-btn').addEventListener('click', () => rateCard(1440));
document.getElementById('2-days-btn').addEventListener('click', () => rateCard(2880));

// Load the first card when the page loads
window.onload = loadNextCard;