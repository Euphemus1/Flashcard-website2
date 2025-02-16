import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FlashcardsProvider } from './contexts/FlashcardsContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Flashcard from './components/Flashcard';

function App() {
  return (
    <BrowserRouter>
      <FlashcardsProvider>
        <Routes>
          <Route element={<Layout />}>
            {/* Dashboard Route */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Flashcard System Routes */}
            <Route path="/decks/:deckId" element={<Flashcard />} />
            <Route path="/decks/:deckId/:subdeckId" element={<Flashcard />} />
            
            {/* Add more routes as needed */}
          </Route>
        </Routes>
      </FlashcardsProvider>
    </BrowserRouter>
  );
}

export default App;