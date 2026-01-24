import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import './Dashboard.css';

function AddSala() {
  const navigate = useNavigate();
  const [unidades, setUnidades] = useState([]);
  const [nome, setNome] = useState('');
  const [unidadeId, setUnidadeId] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Adicionar estado para o sidebar

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // Precisamos carregar as unidades para vincular a sala a uma delas
    axios.get('http://127.0.0.1:8000/api/unidades/', config)
      .then(res => setUnidades(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.post('http://127.0.0.1:8000/api/salas/', {
        nome: nome,
        unidade: unidadeId
      }, config);
      alert('Sala cadastrada com sucesso!');
      navigate('/salas');
    } catch (err) {
      alert('Erro ao cadastrar sala. Verifique se o backend está ativo.');
    }
  };

  // Função para alternar o estado do sidebar
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="dashboard-container">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      <main className="content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1>Cadastrar Sala</h1>
          <button className="btn-barcode" style={{ background: '#6b7280' }} onClick={() => navigate('/salas')}>
            <FaArrowLeft /> VOLTAR
          </button>
        </div>

        <div className="recent-table" style={{ maxWidth: '600px' }}>
          <form onSubmit={handleSubmit} className="form-cadastro">
            <div className="form-group">
              <label>Nome da Sala</label>
              <input type="text" required value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Sala de Reuniões 01" />
            </div>

            <div className="form-group">
              <label>Unidade Pertencente</label>
              <select required value={unidadeId} onChange={e => setUnidadeId(e.target.value)}>
                <option value="">Selecione uma unidade...</option>
                {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
            </div>

            <button type="submit" className="btn-save">
              <FaSave /> SALVAR SALA
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddSala;