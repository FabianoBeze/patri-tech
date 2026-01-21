import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import Dashboard from './Dashboard';
import AddBem from './AddBem';
import Unidades from './Unidades';
import Categorias from './Categorias'; 
import Salas from './Salas'; 
import AddUnidade from './AddUnidade';
import AddCategoria from './AddCategoria';
import UnidadeDetalhes from './UnidadeDetalhes';
import AddGestor from './AddGestor';



// Componente PrivateRoute para proteger rotas que exigem autenticação
const PrivateRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem('access_token');
  return isAuthenticated ? element : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
        <Route path="/bens" element={<PrivateRoute element={<AddBem />} />} />
        <Route path="/unidades" element={<PrivateRoute element={<Unidades />} />} />
        <Route path="/categorias" element={<PrivateRoute element={<Categorias />} />} /> 
        <Route path="/add-unidade" element={<PrivateRoute element={<AddUnidade />} />} />
        <Route path="/salas" element={<PrivateRoute element={<Salas />} />} /> 
        <Route path="/add-categoria" element={<PrivateRoute element={<AddCategoria />} />} />
        <Route path="/unidades/:id" element={<PrivateRoute element={<UnidadeDetalhes />} />} />
        <Route path="/add-gestor" element={<AddGestor />} />


        </Routes>
    </Router>
  );
}

export default App;