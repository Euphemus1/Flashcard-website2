import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars,
  faPlus,
  faMinus,
  faEnvelope,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { 
  faWhatsapp,
  faInstagram
} from '@fortawesome/free-brands-svg-icons';

type Deck = {
  name: string;
  subdecks: string[];
  comingSoon?: boolean;
};

export default function Sidebar() {
  const [expandedDecks, setExpandedDecks] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);

  const decks: Deck[] = [
    { 
      name: 'Microbiología',
      subdecks: ['Bacterias', 'Hongos', 'Parásitos', 'Virus']
    },
    {
      name: 'Semiología',
      subdecks: [
        'Historía clínica', 'Piel y faneras', 'Cabeza y cuello',
        'Respiratorio', 'Cardiovascular', 'Digestivo', 'Urinario',
        'Neurología', 'Osteoarticular'
      ]
    },
    {
      name: 'Revalida',
      subdecks: ['Bling', 'Blang', 'Blong'],
      comingSoon: true
    },
    // Add other decks following the same structure
  ];

  const toggleDeck = (deckName: string) => {
    setExpandedDecks(prev => {
      const newSet = new Set(prev);
      newSet.has(deckName) ? newSet.delete(deckName) : newSet.add(deckName);
      return newSet;
    });
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div 
      id="sidebar"
      className={`
        fixed top-0 left-0 h-screen w-64 bg-primary text-white
        transform transition-transform duration-300 z-50
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
      `}
    >
      {/* Collapse Button */}
      <button
        className="absolute -right-4 top-4 bg-primary p-2 rounded-r-lg hover:bg-secondary"
        onClick={toggleSidebar}
      >
        <FontAwesomeIcon 
          icon={faChevronRight}
          className={`text-white transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Header */}
      <h2 className="text-2xl font-bold p-6 border-b border-white/20">
        Mis Mazos
      </h2>

      {/* Deck List */}
      <ul className="overflow-y-auto h-[calc(100vh-160px)] p-4">
        {decks.map((deck) => (
          <li key={deck.name} className="mb-3">
            <button
              className={`
                deck-btn w-full flex justify-between items-center p-3
                bg-secondary rounded-lg hover:bg-accent transition-colors
                ${deck.comingSoon ? 'opacity-75 cursor-not-allowed' : ''}
              `}
              onClick={() => !deck.comingSoon && toggleDeck(deck.name)}
              disabled={deck.comingSoon}
            >
              <div className="flex items-center">
                <span>{deck.name}</span>
                {deck.comingSoon && (
                  <span className="ml-2 text-yellow-400 text-sm">
                    (en breve!)
                  </span>
                )}
              </div>
              {!deck.comingSoon && (
                <FontAwesomeIcon 
                  icon={expandedDecks.has(deck.name) ? faMinus : faPlus} 
                  className="text-sm"
                />
              )}
            </button>

            <ul
              className={`
                subdeck-list pl-4 overflow-hidden
                transition-all duration-300
                ${expandedDecks.has(deck.name) ? 'max-h-96' : 'max-h-0'}
              `}
            >
              {deck.subdecks.map((subdeck) => (
                <li key={subdeck} className="my-2">
                  <button
                    className="
                      subdeck-btn w-full p-2 pl-4 bg-blue-700 rounded
                      hover:bg-blue-600 transition-colors text-left
                    "
                  >
                    {subdeck}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {/* Social Footer */}
      <div className="
        absolute bottom-0 w-full p-4 border-t border-white/20
        bg-primary flex justify-center space-x-5
      ">
        <a
          href="https://wa.me/+5547988336792"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon hover:text-accent transition-colors"
        >
          <FontAwesomeIcon icon={faWhatsapp} size="lg" />
        </a>
        <a
          href="https://instagram.com/medmemory.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon hover:text-accent transition-colors"
        >
          <FontAwesomeIcon icon={faInstagram} size="lg" />
        </a>
        <a
          href="mailto:medmemory@outlook.com"
          className="social-icon hover:text-accent transition-colors"
        >
          <FontAwesomeIcon icon={faEnvelope} size="lg" />
        </a>
      </div>
    </div>
  );
}