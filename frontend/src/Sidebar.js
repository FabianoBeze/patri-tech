import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaBox, FaBuilding, FaTags, FaDoorOpen, FaSignOutAlt, FaUserTie, FaBars } from 'react-icons/fa';
import './Sidebar.css';

function Sidebar({ isCollapsed, toggleCollapse }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  // --- NOVA FUNÇÃO: Fecha a barra ao clicar em um link no Mobile ---
  const handleLinkClick = () => {
    // Se a largura da tela for menor que 768px e a barra NÃO estiver colapsada, a gente fecha ela
    if (window.innerWidth <= 768 && !isCollapsed) {
      toggleCollapse();
    }
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>{isCollapsed ? 'PT' : 'Patri-Tech'}</h2>
        <button onClick={toggleCollapse} className="toggle-btn">
          <FaBars />
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {/* Adicionamos o onClick={handleLinkClick} em todos os Links */}
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

          <Link to="/add-gestor" className={isActive('/add-gestor')} onClick={handleLinkClick}>
            <li>
              <FaUserTie /> <span>{!isCollapsed && 'Gestores'}</span>
            </li>
          </Link>
        </ul>
      </nav>

      <div className="logout-section">
        <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt /> <span>{!isCollapsed && 'Sair'}</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;