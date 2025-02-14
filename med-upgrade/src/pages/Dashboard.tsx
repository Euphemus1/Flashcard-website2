// src/pages/Dashboard.tsx
import Calendar from '../components/Calendar';
import OverviewTable from '../components/OverviewTable';

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Resumen General</h1>
      <OverviewTable />
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Calendario de Estudio</h2>
        <Calendar />
      </div>
    </div>
  );
}