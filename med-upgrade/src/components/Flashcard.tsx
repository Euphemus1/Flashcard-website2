import { useState } from 'react';
import { useFlashcards } from '../contexts/FlashcardsContext';

type FlashcardProps = {
  onCardComplete?: () => void;
};

export default function Flashcard({ onCardComplete }: FlashcardProps) {
  const { currentDeck, currentCardIndex, nextCard, updateCardSchedule } = useFlashcards();
  const [showAnswer, setShowAnswer] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const handleDifficultySelection = (intervalDays: number) => {
    if (currentCardIndex !== null) {
      updateCardSchedule(currentCardIndex, intervalDays);
      nextCard();
      setShowAnswer(false);
      setShowControls(false);
      onCardComplete?.();
    }
  };

  if (!currentDeck.length || currentCardIndex === null) {
    return (
      <div className="flashcard-container">
        <p>No hay tarjetas disponibles en este mazo. 🎉</p>
      </div>
    );
  }

  const currentCard = currentDeck[currentCardIndex];

  return (
    <div id="flashcard-system" className="flashcard-container">
      {/* Question Card */}
      <div 
        className={`card question ${showAnswer ? 'hidden' : ''}`}
        onClick={() => setShowAnswer(true)}
      >
        <div className="card-content">
          <h3 className="card-front">{currentCard.question}</h3>
          <h1 className="mechanism">Mecanismo de acción:</h1>
          <p className="question-look">{currentCard.questionHint}</p>
        </div>
      </div>

      {/* Answer Card */}
      <div className={`card answer ${!showAnswer ? 'hidden' : ''}`}>
        <div className="card-content">
          <h3 className="card-back">{currentCard.answer}</h3>
          <h1 className="mechanism">Mecanismo de acción:</h1>
          <p className="answer-text">{currentCard.answerExplanation}</p>
        </div>
      </div>

      {/* Review Actions */}
      {showAnswer && (
        <div id="review-actions">
          <button 
            id="skip-button" 
            onClick={() => {
              nextCard();
              setShowAnswer(false);
            }}
          >
            Saltar
          </button>
          <button 
            id="revisar-button"
            onClick={() => setShowControls(true)}
          >
            Revisar
          </button>
        </div>
      )}

      {/* SRS Controls */}
      {showControls && (
        <div className="srs-controls">
          <div className="srs-option">
            <button 
              className="difficulty denuevo"
              onClick={() => handleDifficultySelection(1)}
            >
              De nuevo
            </button>
            <span className="interval">1d</span>
          </div>
          <div className="srs-option">
            <button 
              className="difficulty difícil"
              onClick={() => handleDifficultySelection(2)}
            >
              Díficil
            </button>
            <span className="interval">2d</span>
          </div>
          <div className="srs-option">
            <button 
              className="difficulty bueno"
              onClick={() => handleDifficultySelection(4)}
            >
              Bueno
            </button>
            <span className="interval">4d</span>
          </div>
          <div className="srs-option">
            <button 
              className="difficulty fácil"
              onClick={() => handleDifficultySelection(8)}
            >
              Fácil
            </button>
            <span className="interval">8d</span>
          </div>
        </div>
      )}
    </div>
  );
}