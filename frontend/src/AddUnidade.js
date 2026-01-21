import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Dashboard.css';
import './AddBem.css';

function AddUnidade() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nome: '',
    endereco: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Recupera o token salvo no navegador (o seu "crachá")
    const token = localStorage.getItem('access_token');

    try {
      // 2. Envia o token no cabeçalho (headers) da requisição
      await axios.post('http://127.0.0.1:8000/api/unidades/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`, // Importante: Bearer + token
          'Content-Type': 'application/json'
        }
      });

      alert('Unidade cadastrada com sucesso!');
      navigate('/unidades'); 
    } catch (error) {
      console.error('Erro ao cadastrar unidade:', error);
      // Mostra uma mensagem mais clara se for erro de permissão
      if (error.response && error.response.status === 401) {
        alert('Erro de Permissão: Seu login expirou ou não foi enviado. Tente logar novamente.');
      } else {
        alert('Erro ao salvar. Verifique o console para mais detalhes.');
      }
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="content">
        <header>
          <h1>Nova Unidade</h1>
          <p>Preencha os dados abaixo para cadastrar uma nova filial.</p>
        </header>

        <div className="panel form-panel">
          <h3>Cadastrar Unidade</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome da Unidade</label>
              <input 
                type="text" 
                name="nome" 
                value={formData.nome} 
                onChange={handleChange} 
                placeholder="Ex: Matriz - São Paulo" 
                required 
              />
            </div>

            <div className="form-group">
              <label>Endereço</label>
              <input 
                type="text" 
                name="endereco" 
                value={formData.endereco} 
                onChange={handleChange} 
                placeholder="Ex: Av. Paulista, 1000" 
                required 
              />
            </div>

            <button type="submit" className="btn-save">Salvar Unidade</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddUnidade;