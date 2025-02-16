// src/components/DeckList.tsx
import { useNavigate } from 'react-router-dom';
import { initialDecks } from '../data/decks';

export default function DeckList() {
  const navigate = useNavigate();

  const handleDeckSelect = (deckId: string, subdeckId?: string) => {
    navigate(subdeckId 
      ? `/decks/${deckId}/${subdeckId}`
      : `/decks/${deckId}`
    );
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Mis Mazos</h2>
      <ul className="space-y-2">
        {initialDecks.map(deck => (
          <li key={deck.id}>
            <button
              onClick={() => handleDeckSelect(deck.id)}
              className="w-full text-left p-2 hover:bg-gray-100 rounded"
            >
              {deck.name}
            </button>
            {deck.subdecks?.map(subdeck => (
              <button
                key={subdeck.id}
                onClick={() => handleDeckSelect(deck.id, subdeck.id)}
                className="w-full text-left pl-6 p-2 text-sm hover:bg-gray-100 rounded"
              >
                {subdeck.name}
              </button>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}