import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importação das Telas
import Login from './Login';
import Dashboard from './Dashboard';
import Unidades from './Unidades';
import Categorias from './Categorias'; 
import Salas from './Salas'; 
import UnidadeDetalhes from './UnidadeDetalhes';
import AddUnidade from './AddUnidade';
import AddCategoria from './AddCategoria';
import AddGestor from './AddGestor';

// Importação das Telas de BENS
import Bens from './Bens';      // A lista (Tabela)
import AddBem from './AddBem';  // O formulário de cadastro
import EditBem from './EditBem'; // A tela de edição/transferência

// Componente PrivateRoute para proteger rotas
const PrivateRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem('access_token');
  return isAuthenticated ? element : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota Pública */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Rotas Protegidas (Dashboard) */}
        <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />

        {/* --- ROTAS DE BENS --- */}
        {/* Lista de Bens */}
        <Route path="/bens" element={<PrivateRoute element={<Bens />} />} />
        
        {/* Adicionar Bem (Rota Nova que faltava) */}
        <Route path="/add-bem" element={<PrivateRoute element={<AddBem />} />} />
        
        {/* Editar Bem (Protegida) */}
        <Route path="/edit-bem/:id" element={<PrivateRoute element={<EditBem />} />} />

        {/* --- OUTRAS ROTAS --- */}
        <Route path="/unidades" element={<PrivateRoute element={<Unidades />} />} />
        <Route path="/unidades/:id" element={<PrivateRoute element={<UnidadeDetalhes />} />} />
        <Route path="/add-unidade" element={<PrivateRoute element={<AddUnidade />} />} />
        
        <Route path="/categorias" element={<PrivateRoute element={<Categorias />} />} /> 
        <Route path="/add-categoria" element={<PrivateRoute element={<AddCategoria />} />} />
        
        <Route path="/salas" element={<PrivateRoute element={<Salas />} />} /> 
        <Route path="/add-gestor" element={<PrivateRoute element={<AddGestor />} />} />


      </Routes>
    </Router>
  );
}

export default App;