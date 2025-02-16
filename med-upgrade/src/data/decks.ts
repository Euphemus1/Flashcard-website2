// src/data/decks.ts
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  lastReviewed: Date;
  interval: number;
}

export interface Subdeck {
  id: string;
  name: string;
  cards: Flashcard[];
}

export interface Deck {
  id: string;
  name: string;
  subdecks: Subdeck[];
}

export const initialDecks: Deck[] = [
  {
    id: 'micro',
    name: 'Microbiología',
    subdecks: [
      {
        id: 'bacterias',
        name: 'Bacterias',
        cards: [
          {
            id: '1',
            question: "What is the cause of Necrotizing Fasciitis?",
            answer: "Streptococcus pyogenes and Staphylococcus aureus",
            lastReviewed: new Date(),
            interval: 1
          }
        ]
      }
    ]
  }
];