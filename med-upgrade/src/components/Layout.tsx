import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import DeckList from './DeckList';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto sticky top-0 h-screen">
        <DeckList />
      </aside>

      {/* Scrollable Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}