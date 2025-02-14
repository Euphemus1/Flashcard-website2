import { createContext, useContext, useState } from 'react';
import { Deck, Subdeck, Flashcard } from '../data/decks';

type FlashcardsContextType = {
  decks: Deck[];
  currentDeck: Deck | null;
  currentSubdeck: Subdeck | null;
  flashcards: Flashcard[];
  selectDeck: (deck: Deck, subdeck?: Subdeck) => void;
};

const FlashcardsContext = createContext<FlashcardsContextType>({
  decks: [],
  currentDeck: null,
  currentSubdeck: null,
  flashcards: [],
  selectDeck: () => {},
});

export const FlashcardsProvider = ({ children }: { children: React.ReactNode }) => {
  const [decks] = useState(initialDecks);
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [currentSubdeck, setCurrentSubdeck] = useState<Subdeck | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  const selectDeck = (deck: Deck, subdeck?: Subdeck) => {
    setCurrentDeck(deck);
    setCurrentSubdeck(subdeck || null);
    setFlashcards(subdeck ? subdeck.cards : deck.subdecks.flatMap(s => s.cards));
  };

  return (
    <FlashcardsContext.Provider value={{ decks, currentDeck, currentSubdeck, flashcards, selectDeck }}>
      {children}
    </FlashcardsContext.Provider>
  );
};

export const useFlashcards = () => useContext(FlashcardsContext);