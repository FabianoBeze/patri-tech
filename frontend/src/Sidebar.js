import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaBox, FaBuilding, FaTags, FaDoorOpen, FaSignOutAlt, FaUserTie, FaBars } from 'react-icons/fa'; // Importar FaBars
import './Sidebar.css';

// Recebe as props isCollapsed e toggleCollapse
function Sidebar({ isCollapsed, toggleCollapse }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove o token e redireciona para login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  // Função para verificar se o link está ativo (para ficar azul)
  const isActive = (path) => location.pathname === path ? 'active' : '';

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
          <Link to="/dashboard" className={isActive('/dashboard')}>
            <li>
              <FaHome /> <span>{!isCollapsed && 'Dashboard'}</span> {/* Esconde o texto quando colapsado */}
            </li>
          </Link>

          <Link to="/bens" className={isActive('/bens')}>
            <li>
              <FaBox /> <span>{!isCollapsed && 'Bens'}</span>
            </li>
          </Link>

          <Link to="/unidades" className={isActive('/unidades')}>
            <li>
              <FaBuilding /> <span>{!isCollapsed && 'Unidades'}</span>
            </li>
          </Link>

          <Link to="/categorias" className={isActive('/categorias')}>
            <li>
              <FaTags /> <span>{!isCollapsed && 'Categorias'}</span>
            </li>
          </Link>

          <Link to="/salas" className={isActive('/salas')}>
            <li>
              <FaDoorOpen /> <span>{!isCollapsed && 'Salas'}</span>
            </li>
          </Link>

          {/* --- NOVO ITEM: GESTORES --- */}
          <Link to="/add-gestor" className={isActive('/add-gestor')}>
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