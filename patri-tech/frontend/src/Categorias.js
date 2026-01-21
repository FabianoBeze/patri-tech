import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Dashboard.css'; // Garante o estilo padrão
import { FaEdit, FaTrash, FaPlus, FaArrowLeft, FaSave, FaTimes, FaTags } from 'react-icons/fa';

function Categorias() {
  const navigate = useNavigate();
  
  // Estados para dados
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para controle do formulário (Adicionar/Editar)
  const [showForm, setShowForm] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null); // Se null, é adição. Se tiver objeto, é edição.
  const [nomeCategoria, setNomeCategoria] = useState('');

  // Carregar dados iniciais
  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    
    axios.get('http://127.0.0.1:8000/api/categorias/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      setCategorias(response.data);
      setLoading(false);
    })
    .catch(error => {
      console.error("Erro ao buscar categorias:", error);
      setLoading(false);
    });
  };

  // Preparar para Adicionar
  const handleClickNew = () => {
    setEditingCategoria(null);
    setNomeCategoria('');
    setShowForm(true);
  };

  // Preparar para Editar
  const handleClickEdit = (categoria) => {
    setEditingCategoria(categoria);
    setNomeCategoria(categoria.nome);
    setShowForm(true);
  };

  // Salvar (POST ou PUT)
  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    try {
        if (editingCategoria) {
            // EDITA (PUT)
            await axios.put(`http://127.0.0.1:8000/api/categorias/${editingCategoria.id}/`, 
                { nome: nomeCategoria }, 
                { headers }
            );
            alert("Categoria atualizada com sucesso!");
        } else {
            // CRIA (POST)
            await axios.post('http://127.0.0.1:8000/api/categorias/', 
                { nome: nomeCategoria }, 
                { headers }
            );
            alert("Categoria criada com sucesso!");
        }
        
        // Limpeza e Refresh
        setShowForm(false);
        setEditingCategoria(null);
        setNomeCategoria('');
        fetchCategorias();

    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar categoria.");
    }
  };

  // Excluir
  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
        const token = localStorage.getItem('access_token');
        try {
            await axios.delete(`http://127.0.0.1:8000/api/categorias/${id}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchCategorias();
        } catch (error) {
            alert("Erro ao excluir. Verifique se existem bens vinculados a esta categoria.");
        }
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="content">
        {/* CABEÇALHO */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
                <h1>Gerenciar Categorias</h1>
                <p>Lista de categorias de bens cadastradas.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                    onClick={() => navigate('/dashboard')} 
                    className="btn-secondary"
                    style={{ padding: '10px 15px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', background: 'white' }}
                >
                    <FaArrowLeft /> Voltar
                </button>
                
                {!showForm && (
                    <button 
                        onClick={handleClickNew}
                        className="btn-primary"
                        style={{ padding: '10px 15px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <FaPlus /> Nova Categoria
                    </button>
                )}
            </div>
        </div>

        {/* FORMULÁRIO (Aparece condicionalmente) */}
        {showForm && (
            <div className="panel" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3>{editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                <form onSubmit={handleSave} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginTop: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nome da Categoria</label>
                        <input 
                            type="text" 
                            value={nomeCategoria}
                            onChange={(e) => setNomeCategoria(e.target.value)}
                            required
                            className="form-control"
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            placeholder="Ex: Informática, Mobília..."
                        />
                    </div>
                    <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaSave /> Salvar
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setShowForm(false)}
                        style={{ padding: '10px 20px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <FaTimes /> Cancelar
                    </button>
                </form>
            </div>
        )}

        {/* TABELA DE LISTAGEM */}
        <div className="panel" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {loading ? (
             <p>Carregando categorias...</p>
          ) : categorias.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <FaTags size={40} style={{ marginBottom: '10px', color: '#ccc' }} />
              <p>Nenhuma categoria encontrada.</p>
              <span>Clique em "Nova Categoria" para começar.</span>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '15px', color: '#555', width: '80px' }}>ID</th>
                  <th style={{ padding: '15px', color: '#555' }}>Nome da Categoria</th>
                  <th style={{ padding: '15px', color: '#555', textAlign: 'center', width: '150px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((cat) => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px', color: '#888' }}>#{cat.id}</td>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#333' }}>{cat.nome}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                        <button 
                            onClick={() => handleClickEdit(cat)}
                            style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b' }}
                            title="Editar"
                        >
                            <FaEdit size={18} />
                        </button>
                        <button 
                            onClick={() => handleDelete(cat.id)}
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

export default Categorias;