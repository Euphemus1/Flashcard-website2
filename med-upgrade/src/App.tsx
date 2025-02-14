// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FlashcardSystem from './components/FlashcardSystem';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/decks/:deckId" element={<FlashcardSystem />} />
          <Route path="/decks/:deckId/:subdeckId" element={<FlashcardSystem />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;