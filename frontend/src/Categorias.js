import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Dashboard.css';
import './Unidades.css'; // Vamos usar o mesmo estilo de tabela das Unidades

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    axios.get('http://127.0.0.1:8000/api/categorias/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      setCategorias(response.data);
    })
    .catch(error => {
      console.error("Erro ao buscar categorias:", error);
    });
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="content">
        <div className="page-header-row">
          <div>
            <h1>Gerenciar Categorias</h1>
            <p>Lista de categorias de bens cadastradas.</p>
          </div>
          <button className="btn-add" onClick={() => navigate('/add-categoria')}>
            + Nova Categoria
          </button>
        </div>

        <div className="panel table-panel">
          {categorias.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma categoria encontrada.</p>
              <span>Clique no botão acima para cadastrar a primeira.</span>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome da Categoria</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((cat) => (
                  <tr key={cat.id}>
                    <td style={{ width: '80px' }}>#{cat.id}</td>
                    <td><strong>{cat.nome}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default Categorias;