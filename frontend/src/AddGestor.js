import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import './Dashboard.css';

function AddGestor() {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    endereco: '',
    unidade: '',
    password: '',
    pode_cadastrar: false, // Nova permissão
    pode_editar: false,    // Nova permissão
    pode_dar_baixa: false, // Nova permissão
    pode_cadastrar_unidade: false, // Nova permissão
    pode_cadastrar_categoria: false, // Nova permissão
        pode_cadastrar_sala: false, // Nova permissão
    pode_cadastrar_gestor: false, // Nova permissão
  });

  const [listaUnidades, setListaUnidades] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };

    axios.get('http://127.0.0.1:8000/api/unidades/', config)
      .then(response => setListaUnidades(response.data))
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');

    try {
      await axios.post('http://127.0.0.1:8000/api/gestores/', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Gestor cadastrado com sucesso!');
      setFormData({
        nome: '',
        cpf: '',
        telefone: '',
        endereco: '',
        unidade: '',
        password: '',
        pode_cadastrar: false,
        pode_editar: false,
        pode_dar_baixa: false,
        pode_cadastrar_unidade: false,
        pode_cadastrar_categoria: false,
        pode_cadastrar_sala: false,
        pode_cadastrar_gestor: false,
      });
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
              <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
            </div>

            <div className="form-row">
                <div className="form-group">
                <label>CPF *</label>
                <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} required placeholder="000.000.000-00" />
                </div>

                <div className="form-group">
                <label>Telefone *</label>
                <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} required />
                </div>
            </div>

            <div className="form-group">
              <label>Endereço Completo *</label>
              <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} required />
            </div>

            {/* Novo campo para a senha */}
            <div className="form-group">
              <label>Senha (opcional)</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} />
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

            {/* Novas caixas de opções para permissões */}
            <div className="form-group">
              <label>Permissões:</label>
              <div>
                <input type="checkbox" name="pode_cadastrar" checked={formData.pode_cadastrar} onChange={handleChange} />
                <label htmlFor="pode_cadastrar">Pode Cadastrar Bens</label>
              </div>
              <div>
                <input type="checkbox" name="pode_editar" checked={formData.pode_editar} onChange={handleChange} />
                <label htmlFor="pode_editar">Pode Editar Bens</label>
              </div>
              <div>
                <input type="checkbox" name="pode_dar_baixa" checked={formData.pode_dar_baixa} onChange={handleChange} />
                <label htmlFor="pode_dar_baixa">Pode Dar Baixa em Bens</label>
              </div>
              <div>
                <input type="checkbox" name="pode_cadastrar_unidade" checked={formData.pode_cadastrar_unidade} onChange={handleChange} />
                <label htmlFor="pode_cadastrar_unidade">Pode Cadastrar Unidades</label>
              </div>
              <div>
                <input type="checkbox" name="pode_cadastrar_categoria" checked={formData.pode_cadastrar_categoria} onChange={handleChange} />
                <label htmlFor="pode_cadastrar_categoria">Pode Cadastrar Categorias</label>
              </div>
              <div>
                <input type="checkbox" name="pode_cadastrar_sala" checked={formData.pode_cadastrar_sala} onChange={handleChange} />
                <label htmlFor="pode_cadastrar_sala">Pode Cadastrar Salas</label>
              </div>
              <div>
                <input type="checkbox" name="pode_cadastrar_gestor" checked={formData.pode_cadastrar_gestor} onChange={handleChange} />
                <label htmlFor="pode_cadastrar_gestor">Pode Cadastrar Gestores</label>
              </div>
            </div>

            <button type="submit" className="btn-save" style={{background: '#2563eb'}}>Confirmar Cadastro</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddGestor;