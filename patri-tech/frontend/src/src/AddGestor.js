import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import './Dashboard.css'; // Usando o mesmo CSS para manter o padrão

function AddGestor() {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    endereco: '',
    unidade: ''
  });

  const [listaUnidades, setListaUnidades] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };

    // Busca as unidades para preencher o dropdown
    axios.get('http://127.0.0.1:8000/api/unidades/', config)
      .then(response => setListaUnidades(response.data))
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');

    try {
      await axios.post('http://127.0.0.1:8000/api/gestores/', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Gestor cadastrado com sucesso!');
      setFormData({ nome: '', cpf: '', telefone: '', endereco: '', unidade: '' });
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao cadastrar. Verifique se o CPF já existe.');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="content">
        <header><h1>Gestão de Pessoas</h1></header>

        <div className="panel form-panel">
          <h3>Cadastrar Novo Gestor Patrimonial</h3>
          <form onSubmit={handleSubmit}>
            
            <div className="form-group">
              <label>Nome Completo *</label>
              <input type="text" name="nome" value={formData.nome} onChange={handleChange} required placeholder="Ex: João da Silva" />
            </div>

            <div className="form-row">
                <div className="form-group">
                <label>CPF *</label>
                <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} required placeholder="000.000.000-00" />
                </div>

                <div className="form-group">
                <label>Telefone *</label>
                <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} required placeholder="(00) 90000-0000" />
                </div>
            </div>

            <div className="form-group">
              <label>Endereço Completo *</label>
              <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} required placeholder="Rua, Número, Bairro..." />
            </div>

            <div className="form-group">
              <label>Vincular à Unidade *</label>
              <select name="unidade" value={formData.unidade} onChange={handleChange} required>
                  <option value="">Selecione a Unidade...</option>
                  {listaUnidades.map(uni => (
                      <option key={uni.id} value={uni.id}>{uni.nome}</option>
                  ))}
              </select>
            </div>

            <button type="submit" className="btn-save" style={{background: '#2563eb'}}>Confirmar Cadastro</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddGestor;