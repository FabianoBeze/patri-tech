import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import './Dashboard.css';
import './AddBem.css';

function AddBem() {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '', 
    tombo: '',     
    valor: '',     
    categoria: '', 
    unidade: '',
    situacao: 'RECUPERAVEL',     
    estado_conservacao: 'EXCELENTE', 
    origem: 'PROPRIO' 
  });

  const [listaCategorias, setListaCategorias] = useState([]);
  const [listaUnidades, setListaUnidades] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };

    axios.get('http://127.0.0.1:8000/api/categorias/', config)
      .then(response => setListaCategorias(response.data))
      .catch(console.error);

    axios.get('http://127.0.0.1:8000/api/unidades/', config)
      .then(response => setListaUnidades(response.data))
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');

    try {
      await axios.post('http://127.0.0.1:8000/api/bens/', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      alert('Bem cadastrado com sucesso!');
      setFormData({
        nome: '', descricao: '', tombo: '', valor: '', 
        categoria: '', unidade: '',
        situacao: 'RECUPERAVEL', 
        estado_conservacao: 'EXCELENTE', 
        origem: 'PROPRIO'
      });
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar.');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="content">
        <header><h1>Cadastro de Bens</h1></header>

        <div className="panel form-panel">
          <h3>Adicionar Novo Bem</h3>
          <form onSubmit={handleSubmit}>
            
            <div className="form-group">
              <label>Nome do Bem</label>
              <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
            </div>

            {/* --- AQUI ESTÁ A DIFERENÇA: MENU DE SELEÇÃO --- */}
            <div className="form-group">
                <label style={{color: '#2563eb', fontWeight: 'bold'}}>Origem do Bem</label>
                <select 
                    name="origem" 
                    value={formData.origem} 
                    onChange={handleChange} 
                    style={{
                        width: '100%', padding: '10px', 
                        borderColor: '#2563eb', backgroundColor: '#eff6ff', 
                        borderRadius: '5px', fontWeight: 'bold'
                    }}
                >
                    <option value="PROPRIO">Próprio (Patrimônio)</option>
                    <option value="DOACAO">Doação</option>
                    <option value="ALUGADO">Alugado / Terceiros</option>
                </select>
            </div>
            {/* ----------------------------------------------- */}

            <div className="form-row">
              <div className="form-group">
                <label>Nº Patrimônio (Tombo)</label>
                <input type="text" name="tombo" value={formData.tombo} onChange={handleChange} required />
              </div>
              
              <div className="form-group">
                <label>Valor (R$)</label>
                <input type="number" name="valor" value={formData.valor} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Estado de Conservação</label>
                <select name="estado_conservacao" value={formData.estado_conservacao} onChange={handleChange}>
                    <option value="EXCELENTE">Excelente (Nota 10)</option>
                    <option value="BOM">Bom (Nota 8)</option>
                    <option value="REGULAR">Regular (Nota 5)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categoria</label>
                <select name="categoria" value={formData.categoria} onChange={handleChange} required>
                   <option value="">Selecione...</option>
                   {listaCategorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                </select>
              </div>
              
              <div className="form-group">
                <label>Unidade</label>
                <select name="unidade" value={formData.unidade} onChange={handleChange} required>
                   <option value="">Selecione...</option>
                   {listaUnidades.map(uni => <option key={uni.id} value={uni.id}>{uni.nome}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" className="btn-save">Salvar Cadastro</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddBem;