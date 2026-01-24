import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import HistoricoModal from './HistoricoModal';
import './Dashboard.css';
import { FaEdit, FaTrash, FaPlus, FaHistory, FaSearch, FaBox, FaArrowLeft } from 'react-icons/fa';

function Bens() {
  const navigate = useNavigate();
  const [bens, setBens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Adicionar estado para o sidebar
  
  const [showHistorico, setShowHistorico] = useState(false);
  const [historicoSelecionado, setHistoricoSelecionado] = useState([]);
  const [bemSelecionadoNome, setBemSelecionadoNome] = useState('');
  

  useEffect(() => {
    fetchBens();
  }, []);

  const fetchBens = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/bens/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBens(response.data);
    } catch (error) {
      console.error("Erro ao buscar bens:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este bem?")) {
      const token = localStorage.getItem('access_token');
      try {
        await axios.delete(`http://127.0.0.1:8000/api/bens/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchBens();
      } catch (error) {
        alert("Erro ao excluir bem.");
      }
    }
  };

  const handleVerHistorico = async (bem) => {
    setBemSelecionadoNome(bem.nome);
    
    if (bem.historico) {
        setHistoricoSelecionado(bem.historico);
        setShowHistorico(true);
    } else {
        const token = localStorage.getItem('access_token');
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/bens/${bem.id}/historico/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistoricoSelecionado(res.data);
            setShowHistorico(true);
        } catch (error) {
            alert("Erro ao carregar histórico.");
        }
    }
  };

  const filteredBens = bens.filter(bem => 
    bem.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bem.tombo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para alternar o estado do sidebar
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="dashboard-container">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      <main className="content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1>Gerenciar Patrimônio</h1>
            <p>Listagem geral de bens móveis.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ padding: '10px 15px', borderRadius: '5px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaArrowLeft /> Voltar ao Dashboard
            </button>
            <button onClick={() => navigate('/add-bem')} className="btn-primary" style={{ padding: '10px 15px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaPlus /> Novo Bem
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <FaSearch style={{ color: '#ccc', marginRight: '10px' }} />
            <input type="text" placeholder="Buscar por nome ou tombo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontSize: '16px' }} />
        </div>

        <div className="panel" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {loading ? <p>Carregando...</p> : filteredBens.length === 0 ? <p>Nenhum bem encontrado.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '12px' }}>Número de série</th>
                  <th style={{ padding: '12px' }}>Nome</th>
                  <th style={{ padding: '12px' }}>Localização</th>
                  <th style={{ padding: '12px' }}>Situação</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
                </tr>
      </thead>
      <tbody>
        {filteredBens.map((bem) => (
          <tr key={bem.id} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '12px', fontWeight: 'bold', color: '#555' }}>{bem.tombo}</td>
            <td style={{ padding: '12px' }}>{bem.nome}</td>
            <td style={{ padding: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{bem.sala_nome || 'Sem Sala'}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{bem.unidade_nome}</div>
            </td>
            <td style={{ padding: '12px' }}>{bem.situacao}</td>
            <td style={{ padding: '12px', textAlign: 'center' }}>
              <button onClick={() => handleVerHistorico(bem)} style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#007bff' }} title="Histórico">
                <FaHistory size={18} />
              </button>
              <button onClick={() => navigate(`/edit-bem/${bem.id}`)} style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b' }} title="Editar">
                <FaEdit size={18} />
              </button>
              <button onClick={() => handleDelete(bem.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Excluir">
                <FaTrash size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
        <HistoricoModal isOpen={showHistorico} onClose={() => setShowHistorico(false)} historico={historicoSelecionado} nomeBem={bemSelecionadoNome} />
      </main>
    </div>
  );
}

export default Bens;