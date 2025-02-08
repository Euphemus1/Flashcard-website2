document.addEventListener('DOMContentLoaded', function () {
    // Your existing JavaScript code goes here
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
        if (card) {
            card.classList.toggle('flipped');
        }
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
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    function showReviewOptions() {
        const reviewButtons = document.getElementById('review-buttons');
        const reviewActions = document.getElementById('review-actions');
        if (reviewButtons && reviewActions) {
            reviewButtons.style.display = 'flex';
            reviewActions.style.display = 'none';
        }
    }

    function skipCard() {
        showStatus('Card skipped.');
        loadNextCard();
    }

    function loadNextCard() {
        currentCardIndex = (currentCardIndex + 1) % flashcards.length;
        const currentCard = flashcards[currentCardIndex];
        const cardFront = document.getElementById('card-front');
        const cardBack = document.getElementById('card-back');
        if (cardFront && cardBack) {
            cardFront.innerHTML = currentCard.question;
            cardBack.innerHTML = currentCard.answer;
        }
        showStatus(currentCard.interval > 1 ? 'Due card' : 'New card');
        const reviewButtons = document.getElementById('review-buttons');
        const reviewActions = document.getElementById('review-actions');
        if (reviewButtons && reviewActions) {
            reviewButtons.style.display = 'none';
            reviewActions.style.display = 'flex';
        }
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
            if (subdeckList) {
                subdeckList.style.display = subdeckList.style.display === 'block' ? 'none' : 'block';
            }
        });
    });

    // Add event listeners for deck switching
    const microbiologyBtn = document.getElementById('microbiology-btn');
    if (microbiologyBtn) {
        microbiologyBtn.addEventListener('click', () => switchDeck('Microbiología'));
    }

    const semiologyBtn = document.getElementById('semiology-btn');
    if (semiologyBtn) {
        semiologyBtn.addEventListener('click', () => switchDeck('Semiología'));
    }

    const patologiaBtn = document.getElementById('patología-btn');
    if (patologiaBtn) {
        patologiaBtn.addEventListener('click', () => switchDeck('Patología'));
    }

    const farmacologiaBtn = document.getElementById('farmacología-btn');
    if (farmacologiaBtn) {
        farmacologiaBtn.addEventListener('click', () => switchDeck('Farmacoíalogía'));
    }

    const terapéutica1Btn = document.getElementById('terapéutica1-btn');
    if (terapéutica1Btn) {
        terapéutica1Btn.addEventListener('click', () => switchDeck('Terapéutica 1'));
    }

    const medicinaInterna1Btn = document.getElementById('medicinainterna1-btn');
    if (medicinaInterna1Btn) {
        medicinaInterna1Btn.addEventListener('click', () => switchDeck('Medicina Interna 1'));
    }

    const flashcard = document.getElementById('flashcard');
    if (flashcard) {
        flashcard.addEventListener('click', flipCard);
    }

    const reviewButton = document.getElementById('review-button');
    if (reviewButton) {
        reviewButton.addEventListener('click', showReviewOptions);
    }

    const skipButton = document.getElementById('skip-button');
    if (skipButton) {
        skipButton.addEventListener('click', skipCard);
    }

    const tenMinBtn = document.getElementById('10-min-btn');
    if (tenMinBtn) {
        tenMinBtn.addEventListener('click', () => rateCard(10));
    }

    const oneHourBtn = document.getElementById('1-hour-btn');
    if (oneHourBtn) {
        oneHourBtn.addEventListener('click', () => rateCard(60));
    }

    const oneDayBtn = document.getElementById('1-day-btn');
    if (oneDayBtn) {
        oneDayBtn.addEventListener('click', () => rateCard(1440));
    }

    const twoDaysBtn = document.getElementById('2-days-btn');
    if (twoDaysBtn) {
        twoDaysBtn.addEventListener('click', () => rateCard(2880));
    }

    // Load the first card when the page loads
    loadNextCard();
});