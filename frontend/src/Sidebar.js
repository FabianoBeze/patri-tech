import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaBox, FaBuilding, FaTags, FaDoorOpen, FaSignOutAlt, FaUserTie, FaBars } from 'react-icons/fa'; // Importar FaBars
import './Sidebar.css';

// Recebe as props isCollapsed e toggleCollapse
function Sidebar({ isCollapsed, toggleCollapse }) {
  const location = useLocation();
  const navigate = useNavigate();
  // Removido o estado isMobile e o useEffect associado, pois isCollapsed já reflete o estado mobile do Dashboard.js

  console.log('Sidebar rendered. isCollapsed:', isCollapsed);
  const handleLogout = () => {
    // Remove o token e redireciona para login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  // Função para verificar se o link está ativo (para ficar azul)
  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLinkClick = () => {
    // Em dispositivos móveis (largura da janela < 768px), a barra lateral deve sempre recolher ao clicar num link.
    // Em desktop, a lógica de recolher/expandir é controlada pelo botão de toggle.
    if (window.innerWidth < 768 && !isCollapsed) {
      toggleCollapse();
      console.log('handleLinkClick: Toggling sidebar on mobile.');
    }
  };

  return (
    // Aplica a classe 'collapsed' se isCollapsed for true
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>{isCollapsed ? 'PT' : 'Patri-Tech'}</h2> {/* Mostra "PT" quando colapsado */}
        <button onClick={toggleCollapse} className="toggle-btn"> {/* Botão para recolher/expandir */}
          <FaBars />
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <Link to="/dashboard" className={isActive('/dashboard')} onClick={handleLinkClick}>
            <li>
              <FaHome /> <span>{!isCollapsed && 'Dashboard'}</span>
            </li>
          </Link>

          <Link to="/bens" className={isActive('/bens')} onClick={handleLinkClick}>
            <li>
              <FaBox /> <span>{!isCollapsed && 'Bens'}</span>
            </li>
          </Link>

          <Link to="/unidades" className={isActive('/unidades')} onClick={handleLinkClick}>
            <li>
              <FaBuilding /> <span>{!isCollapsed && 'Unidades'}</span>
            </li>
          </Link>

          <Link to="/categorias" className={isActive('/categorias')} onClick={handleLinkClick}>
            <li>
              <FaTags /> <span>{!isCollapsed && 'Categorias'}</span>
            </li>
          </Link>

          <Link to="/salas" className={isActive('/salas')} onClick={handleLinkClick}>
            <li>
              <FaDoorOpen /> <span>{!isCollapsed && 'Salas'}</span>
            </li>
          </Link>

          {/* --- NOVO ITEM: GESTORES --- */}
          <Link to="/add-gestor" className={isActive('/add-gestor')} onClick={handleLinkClick}>
            <li>
              <FaUserTie /> <span>{!isCollapsed && 'Gestores'}</span>
            </li>
          </Link>

        </ul>
      </nav>

      {/* Botão de Sair (Fica lá embaixo) */}
      <div className="logout-section">
        <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt /> <span>{!isCollapsed && 'Sair'}</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;