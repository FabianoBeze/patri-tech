import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from './auth';
import Sidebar from './Sidebar'; // Importa a barra lateral
import './Dashboard.css'; // Usa o CSS padrão do painel
import { FaEdit, FaTrash, FaPlus, FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa'; // Ícones

function Salas() {
  // --- SEUS ESTADOS ORIGINAIS ---
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Controle de Edição/Adição
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSalaNome, setNewSalaNome] = useState('');
  const [editingSala, setEditingSala] = useState(null);
  const [editedSalaNome, setEditedSalaNome] = useState('');
  
  // Unidades
  const [unidades, setUnidades] = useState([]);
  const [selectedUnidade, setSelectedUnidade] = useState('');
  
  const navigate = useNavigate();

  // --- SUAS FUNÇÕES (Lógica Mantida) ---

  const fetchSalas = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await authenticatedFetch('http://localhost:8000/api/salas/', {}, navigate);
      const data = await response.json();
      setSalas(data);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      setError("Erro ao carregar salas.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchUnidades = useCallback(async () => {
    try {
      const response = await authenticatedFetch('http://localhost:8000/api/unidades/', {}, navigate);
      const data = await response.json();
      setUnidades(data);
      if (data.length > 0 && !selectedUnidade) {
        setSelectedUnidade(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch unidades:", err);
    }
  }, [navigate, selectedUnidade]);

  useEffect(() => {
    fetchSalas();
    fetchUnidades();
  }, [fetchSalas, fetchUnidades]);

  // Função auxiliar para mostrar o nome da unidade na tabela
  const getNomeUnidade = (id) => {
    const unidade = unidades.find(u => u.id === id);
    return unidade ? unidade.nome : '...';
  };

  const handleAddSala = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await authenticatedFetch('http://localhost:8000/api/salas/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: newSalaNome, unidade: selectedUnidade }),
      }, navigate);

      if (!response.ok) throw new Error('Falha ao adicionar sala.');

      setNewSalaNome('');
      setShowAddForm(false);
      fetchSalas();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClick = (sala) => {
    setEditingSala(sala);
    setEditedSalaNome(sala.nome);
    setShowAddForm(false); // Fecha o form de adicionar se estiver aberto
  };

  const handleUpdateSala = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await authenticatedFetch(`http://localhost:8000/api/salas/${editingSala.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: editedSalaNome }), // Note: Dependendo do backend, pode precisar enviar a unidade também
      }, navigate);

      if (!response.ok) throw new Error('Falha ao atualizar sala.');

      setEditingSala(null);
      setEditedSalaNome('');
      fetchSalas();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSala = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta sala?')) {
      try {
        const response = await authenticatedFetch(`http://localhost:8000/api/salas/${id}/`, {
          method: 'DELETE',
        }, navigate);

        if (!response.ok) throw new Error('Falha ao excluir sala.');
        fetchSalas();
      } catch (err) {
        setError("Erro ao excluir. Verifique se há bens nesta sala.");
      }
    }
  };

  // --- RENDERIZAÇÃO VISUAL (Novo Layout) ---

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="content">
        {/* Cabeçalho da Página */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
                <h1>Gestão de Salas</h1>
                <p>Visualize e gerencie as salas de cada unidade.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                    onClick={() => navigate('/dashboard')} 
                    className="btn-secondary"
                    style={{ padding: '10px 15px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', background:'white' }}
                >
                    <FaArrowLeft /> Voltar
                </button>
                {!showAddForm && !editingSala && (
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="btn-primary"
                        style={{ padding: '10px 15px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <FaPlus /> Nova Sala
                    </button>
                )}
            </div>
        </div>

        {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                {error}
            </div>
        )}

        {/* Formulário de Adição/Edição (Aparece como um cartão no topo se ativo) */}
        {(showAddForm || editingSala) && (
            <div className="panel" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3>{editingSala ? 'Editar Sala' : 'Adicionar Nova Sala'}</h3>
                <form onSubmit={editingSala ? handleUpdateSala : handleAddSala} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nome da Sala</label>
                        <input
                            type="text"
                            value={editingSala ? editedSalaNome : newSalaNome}
                            onChange={(e) => editingSala ? setEditedSalaNome(e.target.value) : setNewSalaNome(e.target.value)}
                            required
                            className="form-control" // Usa estilo do bootstrap se tiver, ou dashboard.css
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    {/* Mostra seletor de unidade apenas ao criar (ou edite a lógica se quiser mudar unidade na edição) */}
                    {!editingSala && (
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Unidade</label>
                            <select
                                value={selectedUnidade}
                                onChange={(e) => setSelectedUnidade(e.target.value)}
                                required
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                {unidades.map(u => (
                                    <option key={u.id} value={u.id}>{u.nome}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display:'flex', alignItems:'center', gap:'5px' }}>
                            <FaSave /> Salvar
                        </button>
                        <button 
                            type="button" 
                            onClick={() => { setShowAddForm(false); setEditingSala(null); }}
                            style={{ padding: '8px 15px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display:'flex', alignItems:'center', gap:'5px' }}
                        >
                            <FaTimes /> Cancelar
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* Tabela de Listagem */}
        <div className="panel" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {loading ? (
                <p>Carregando...</p>
            ) : salas.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Nenhuma sala cadastrada.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', backgroundColor: '#f9fafb' }}>
                            <th style={{ padding: '12px', color: '#555' }}>Nome da Sala</th>
                            <th style={{ padding: '12px', color: '#555' }}>Unidade</th>
                            <th style={{ padding: '12px', color: '#555', textAlign: 'center', width: '150px' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salas.map(sala => (
                            <tr key={sala.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px' }}>{sala.nome}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                                        {getNomeUnidade(sala.unidade)}
                                    </span>
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <button 
                                        onClick={() => handleEditClick(sala)}
                                        style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b' }}
                                        title="Editar"
                                    >
                                        <FaEdit size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteSala(sala.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                        title="Excluir"
                                    >
                                        <FaTrash size={16} />
                                    </button>
                                </td>
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

export default Salas;