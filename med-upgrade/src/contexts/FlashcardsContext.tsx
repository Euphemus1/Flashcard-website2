import { createContext, useContext, useState, ReactNode } from 'react';

type Flashcard = {
  question: string;
  answer: string;
  questionHint: string;
  answerExplanation: string;
  dueDate: Date;
  interval: number;
};

type Deck = {
  id: string;
  name: string;
  cards: Flashcard[];
};

type FlashcardsContextType = {
  currentDeck: Flashcard[];
  currentCardIndex: number | null;
  loadDeck: (deckId: string) => void;
  nextCard: () => void;
  updateCardSchedule: (cardIndex: number, intervalDays: number) => void;
};

const FlashcardsContext = createContext<FlashcardsContextType | undefined>(undefined);

export function FlashcardsProvider({ children }: { children: ReactNode }) {
  const [currentDeck, setCurrentDeck] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number | null>(null);

  // Mock deck data - replace with actual data loading from your TS decks.ts
  const mockDecks: Deck[] = [
    {
      id: 'microbiología',
      name: 'Microbiología',
      cards: [
        {
          question: 'What is the cause of Necrotizing Fasciitis?',
          answer: 'Streptococcus pyogenes and Staphylococcus aureus',
          questionHint: '[...]',
          answerExplanation: 'Bloquea la actividad catalítica de la integrasa',
          dueDate: new Date(),
          interval: 1
        },
        // Add more mock cards
      ]
    }
  ];

  const loadDeck = (deckId: string) => {
    const selectedDeck = mockDecks.find(deck => deck.id === deckId);
    if (selectedDeck) {
      setCurrentDeck(selectedDeck.cards);
      setCurrentCardIndex(0);
    }
  };

  const nextCard = () => {
    setCurrentCardIndex(prev => {
      if (prev === null || prev >= currentDeck.length - 1) return null;
      return prev + 1;
    });
  };

  const updateCardSchedule = (cardIndex: number, intervalDays: number) => {
    const updatedDeck = [...currentDeck];
    const card = updatedDeck[cardIndex];
    
    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + intervalDays);
    
    updatedDeck[cardIndex] = {
      ...card,
      interval: intervalDays,
      dueDate: newDueDate
    };
    
    setCurrentDeck(updatedDeck);
  };

  return (
    <FlashcardsContext.Provider 
      value={{
        currentDeck,
        currentCardIndex,
        loadDeck,
        nextCard,
        updateCardSchedule
      }}
    >
      {children}
    </FlashcardsContext.Provider>
  );
}

export const useFlashcards = () => {
  const context = useContext(FlashcardsContext);
  if (!context) {
    throw new Error('useFlashcards must be used within a FlashcardsProvider');
  }
  return context;
};