import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Dashboard.css';
import './AddBem.css'; // Reaproveitando o estilo bonito

function AddCategoria() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');

    try {
      await axios.post('http://127.0.0.1:8000/api/categorias/', 
        { nome: nome }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      alert('Categoria cadastrada com sucesso!');
      navigate('/categorias');
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert('Erro ao salvar. Verifique se você está logado.');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="content">
        <header>
          <h1>Nova Categoria</h1>
          <p>Cadastre um novo tipo de bem (ex: Informática, Veículos, Móveis).</p>
        </header>

        <div className="panel form-panel">
          <h3>Cadastrar Categoria</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome da Categoria</label>
              <input 
                type="text" 
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                placeholder="Ex: Eletrônicos" 
                required 
              />
            </div>
            <button type="submit" className="btn-save">Salvar Categoria</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddCategoria;