import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaBox, FaBuilding, FaTags, FaDoorOpen, FaSignOutAlt, FaUserTie, FaBars, FaTimes } from 'react-icons/fa'; // Importar FaBars e FaTimes
import './Sidebar.css';


// Recebe as props isCollapsed e toggleCollapse (opcionais agora)
function Sidebar({ isCollapsed = false, toggleCollapse }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);


  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };


  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };


  const handleLogout = () => {
    // Remove o token e redireciona para login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };


  // Função para verificar se o link está ativo (para ficar azul)
  const isActive = (path) => location.pathname === path ? 'active' : '';


  // Determina se deve mostrar texto (Desktop expandido ou Mobile aberto)
  // No mobile, sempre mostra texto pois a sidebar ocupa a tela ou está oculta
  const showText = !isCollapsed || mobileOpen;


  return (
    <>
      {/* Botão Hambúrguer para Mobile (Fixo no topo esquerdo) */}
      <button className="mobile-menu-btn" onClick={toggleMobileSidebar}>
        <FaBars />
      </button>


      {/* Overlay Escuro para Mobile */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={closeMobileSidebar}
      ></div>


      {/* Sidebar Principal */}
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h2>{(isCollapsed && !mobileOpen) ? 'PT' : 'Patri-Tech'}</h2>
          
          {/* Botão de Toggle para Desktop */}
          <button onClick={toggleCollapse} className="toggle-btn desktop-only">
            <FaBars />
          </button>


          {/* Botão de Fechar para Mobile */}
          <button onClick={closeMobileSidebar} className="toggle-btn mobile-only">
            <FaTimes />
          </button>
        </div>


        <nav className="sidebar-nav">
          <ul>
            <Link to="/dashboard" className={isActive('/dashboard')} onClick={closeMobileSidebar}>
              <li>
                <FaHome /> <span>{showText && 'Dashboard'}</span>
              </li>
            </Link>


            <Link to="/bens" className={isActive('/bens')} onClick={closeMobileSidebar}>
              <li>
                <FaBox /> <span>{showText && 'Bens'}</span>
              </li>
            </Link>


            <Link to="/unidades" className={isActive('/unidades')} onClick={closeMobileSidebar}>
              <li>
                <FaBuilding /> <span>{showText && 'Unidades'}</span>
              </li>
            </Link>


            <Link to="/categorias" className={isActive('/categorias')} onClick={closeMobileSidebar}>
              <li>
                <FaTags /> <span>{showText && 'Categorias'}</span>
              </li>
            </Link>


            <Link to="/salas" className={isActive('/salas')} onClick={closeMobileSidebar}>
              <li>
                <FaDoorOpen /> <span>{showText && 'Salas'}</span>
              </li>
            </Link>


            {/* --- NOVO ITEM: GESTORES --- */}
            <Link to="/add-gestor" className={isActive('/add-gestor')} onClick={closeMobileSidebar}>
              <li>
                <FaUserTie /> <span>{showText && 'Gestores'}</span>
              </li>
            </Link>


          </ul>
        </nav>


        {/* Botão de Sair (Fica lá embaixo) */}
        <div className="logout-section">
          <button onClick={handleLogout} className="logout-btn">
              <FaSignOutAlt /> <span>{showText && 'Sair'}</span>
          </button>
        </div>
      </div>
    </>
  );
}


export default Sidebar;