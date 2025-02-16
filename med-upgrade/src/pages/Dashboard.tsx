import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Calendar from '../components/Calendar';
import 'C:/Users/julia/Projects/Website/Flashcard-website2/public/css/dashboard-style.css';
export default function Dashboard() {
  const [showFlashcards, setShowFlashcards] = useState(false);

  return (
    <div className="dashboard-container">
      {/* Top Navigation - Keep original IDs/classes */}
      <div id="top-nav" className="top-navigation">
        <button id="sidebar-toggle" className="nav-btn">
          <i className="fas fa-bars"></i>
        </button>
        <div className="logo">Med Memory</div>
        <div className="nav-buttons">
          <span id="username-display" style={{ color: 'white', marginRight: '15px' }}></span>
          <button id="overview-button">General</button>
          <button id="faq-button" aria-label="Frequently Asked Questions">Ayuda</button>
          <button id="contact-button">Contacto</button>
          <button className="nav-btn" id="logout">Cerrar sesión</button>
        </div>
      </div>

      <div className="main-content-wrapper">
        <Sidebar />
        
        <div id="main-content" className="main-content-area">
          {/* Updates Section - Preserve original structure */}
          <div className="updates-dropdown">
            <button className="dropdown-toggle">
              Noticias y Actualizaciones ▼
            </button>
            <div className="dropdown-content">
              <div className="update-item">
                <h4>Última Actualización - 15/07/2024</h4>
                <p>• Nuevo contenido de Microbiología agregado</p>
                <p>• Mejoras en el sistema de repetición espaciada</p>
              </div>
              <div className="update-item">
                <h4>Próximas Novedades</h4>
                <p>• Contenido MIR en desarrollo (¡muy pronto!)</p>
                <p>• Nuevo diseño de tarjetas interactivas</p>
              </div>
            </div>
          </div>

          {/* Overview Table - Keep original IDs */}
          <div id="overview-section" className="overview-table">
            <table>
              <thead>
                <tr>
                  <th>Mazo</th>
                  <th>Nuevas</th>
                  <th>Pendientes</th>
                </tr>
              </thead>
              <tbody id="overview-table-body"></tbody>
            </table>
          </div>

          {/* Calendar Component */}
          <Calendar />

          {/* Flashcard System - Toggle visibility */}
          {showFlashcards && (
            <div id="flashcard-system" className="flashcard-container">
              {/* We'll convert this separately */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}