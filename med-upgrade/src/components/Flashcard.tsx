// src/components/Flashcard.tsx
import { useParams } from 'react-router-dom';

export default function FlashcardSystem() {
  const { deckId, subdeckId } = useParams();
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Estudiando: {subdeckId || deckId}
      </h2>
      {/* Add your flashcard component logic here */}
    </div>
  );
}