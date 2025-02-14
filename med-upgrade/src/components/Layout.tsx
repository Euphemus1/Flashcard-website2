// src/components/Layout.tsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import DeckList from './DeckList';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Persistent Sidebar */}
      <div className="w-64 bg-white border-r p-4">
        <DeckList />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <Outlet /> {/* This will render Dashboard or Flashcards */}
        </main>
      </div>
    </div>
  );
}