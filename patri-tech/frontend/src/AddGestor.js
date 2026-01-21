import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Dashboard.css'; 
import { FaEdit, FaTrash, FaPlus, FaArrowLeft, FaSave, FaTimes, FaUserTie, FaCheckSquare } from 'react-icons/fa';

function Gestores() {
  const navigate = useNavigate();

  // Estados
  const [gestores, setGestores] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    endereco: '',
    unidade: '',
    password: '',
    // Permissões
    pode_cadastrar: false,
    pode_editar: false,
    pode_dar_baixa: false,
    pode_cadastrar_unidade: false,
    pode_cadastrar_categoria: false,
    pode_cadastrar_sala: false,
    pode_cadastrar_gestor: false
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };

    try {
      const [resGestores, resUnidades] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/gestores/', config),
        axios.get('http://127.0.0.1:8000/api/unidades/', config)
      ]);
      setGestores(resGestores.data);
      setUnidades(resUnidades.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const abrirNovoCadastro = () => {
    setEditingId(null);
    setFormData({
      nome: '', cpf: '', telefone: '', endereco: '', unidade: '', password: '',
      pode_cadastrar: false, pode_editar: false, pode_dar_baixa: false,
      pode_cadastrar_unidade: false, pode_cadastrar_categoria: false, 
      pode_cadastrar_sala: false, pode_cadastrar_gestor: false
    });
    setShowForm(true);
  };

  const abrirEdicao = (gestor) => {
    setEditingId(gestor.id);
    setFormData({
      nome: gestor.nome,
      cpf: gestor.cpf,
      telefone: gestor.telefone,
      endereco: gestor.endereco,
      unidade: gestor.unidade,
      password: '', 
      pode_cadastrar: gestor.pode_cadastrar,
      pode_editar: gestor.pode_editar,
      pode_dar_baixa: gestor.pode_dar_baixa,
      pode_cadastrar_unidade: gestor.pode_cadastrar_unidade,
      pode_cadastrar_categoria: gestor.pode_cadastrar_categoria,
      pode_cadastrar_sala: gestor.pode_cadastrar_sala,
      pode_cadastrar_gestor: gestor.pode_cadastrar_gestor
    });
    setShowForm(true);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };

    try {
      if (editingId) {
        await axios.put(`http://127.0.0.1:8000/api/gestores/${editingId}/`, formData, config);
        alert('Gestor atualizado com sucesso!');
      } else {
        await axios.post('http://127.0.0.1:8000/api/gestores/', formData, config);
        alert('Gestor cadastrado com sucesso!');
      }
      setShowForm(false);
      carregarDados();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar. Verifique o CPF e campos obrigatórios.");
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este gestor?")) {
      const token = localStorage.getItem('access_token');
      try {
        await axios.delete(`http://127.0.0.1:8000/api/gestores/${id}/`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        carregarDados();
      } catch (error) {
        alert("Erro ao excluir gestor.");
      }
    }
  };

  const getUnidadeNome = (id) => {
    const u = unidades.find(item => item.id === id);
    return u ? u.nome : 'N/A';
  };

  // --- ESTILO PARA OS CHECKBOXES ---
  const checkboxContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
    padding: '8px',
    backgroundColor: '#fff',
    borderRadius: '4px',
    border: '1px solid #dee2e6',
    cursor: 'pointer'
  };

  const checkboxInputStyle = {
    width: '18px',
    height: '18px',
    marginRight: '10px',
    cursor: 'pointer'
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="content">
        
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
                <h1>Gestão de Pessoas</h1>
                <p>Gerencie os usuários e suas permissões no sistema.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ padding: '10px 15px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', background:'white' }}>
                    <FaArrowLeft /> Voltar
                </button>
                {!showForm && (
                    <button onClick={abrirNovoCadastro} className="btn-primary" style={{ padding: '10px 15px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaPlus /> Novo Gestor
                    </button>
                )}
            </div>
        </div>

        {/* FORMULÁRIO */}
        {showForm && (
          <div className="panel" style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
                {editingId ? 'Editar Gestor' : 'Cadastrar Novo Gestor'}
            </h3>
            
            <form onSubmit={handleSalvar}>
                {/* Linha 1 */}
                <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Nome Completo *</label>
                    <input type="text" name="nome" value={formData.nome} onChange={handleInputChange} required className="form-control" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>

                {/* Linha 2 */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>CPF *</label>
                        <input type="text" name="cpf" value={formData.cpf} onChange={handleInputChange} required placeholder="000.000.000-00" className="form-control" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Telefone *</label>
                        <input type="text" name="telefone" value={formData.telefone} onChange={handleInputChange} required className="form-control" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                </div>

                {/* Linha 3 */}
                <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Endereço Completo *</label>
                    <input type="text" name="endereco" value={formData.endereco} onChange={handleInputChange} required className="form-control" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>

                {/* Linha 4 */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Senha (Opcional na edição)</label>
                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="******" className="form-control" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Vincular à Unidade *</label>
                        <select name="unidade" value={formData.unidade} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                            <option value="">Selecione a Unidade...</option>
                            {unidades.map(u => (
                                <option key={u.id} value={u.id}>{u.nome}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ÁREA DE PERMISSÕES CORRIGIDA */}
                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #e9ecef' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '10px', display:'flex', alignItems:'center' }}>
                        <FaCheckSquare style={{ marginRight:'8px' }} /> Permissões de Acesso
                    </h4>
                    
                    {/* Grid de 2 colunas para alinhar bem */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
                        
                        <label style={checkboxContainerStyle}>
                            <input type="checkbox" name="pode_cadastrar" checked={formData.pode_cadastrar} onChange={handleInputChange} style={checkboxInputStyle} /> 
                            <span>Cadastrar Bens</span>
                        </label>
                        
                        <label style={checkboxContainerStyle}>
                            <input type="checkbox" name="pode_editar" checked={formData.pode_editar} onChange={handleInputChange} style={checkboxInputStyle} /> 
                            <span>Editar Bens</span>
                        </label>

                        <label style={checkboxContainerStyle}>
                            <input type="checkbox" name="pode_dar_baixa" checked={formData.pode_dar_baixa} onChange={handleInputChange} style={checkboxInputStyle} /> 
                            <span>Dar Baixa em Bens</span>
                        </label>

                        <label style={checkboxContainerStyle}>
                            <input type="checkbox" name="pode_cadastrar_unidade" checked={formData.pode_cadastrar_unidade} onChange={handleInputChange} style={checkboxInputStyle} /> 
                            <span>Gerir Unidades</span>
                        </label>

                        <label style={checkboxContainerStyle}>
                            <input type="checkbox" name="pode_cadastrar_categoria" checked={formData.pode_cadastrar_categoria} onChange={handleInputChange} style={checkboxInputStyle} /> 
                            <span>Gerir Categorias</span>
                        </label>

                        <label style={checkboxContainerStyle}>
                            <input type="checkbox" name="pode_cadastrar_sala" checked={formData.pode_cadastrar_sala} onChange={handleInputChange} style={checkboxInputStyle} /> 
                            <span>Gerir Salas</span>
                        </label>

                        <label style={checkboxContainerStyle}>
                            <input type="checkbox" name="pode_cadastrar_gestor" checked={formData.pode_cadastrar_gestor} onChange={handleInputChange} style={checkboxInputStyle} /> 
                            <span>Gerir Gestores (Admin)</span>
                        </label>

                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaTimes /> Cancelar
                    </button>
                    <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaSave /> Salvar
                    </button>
                </div>
            </form>
          </div>
        )}

        {/* LISTAGEM */}
        <div className="panel" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {loading ? (
                <p>Carregando gestores...</p>
            ) : gestores.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <FaUserTie size={40} style={{ marginBottom: '10px', color: '#ccc' }} />
                    <p>Nenhum gestor cadastrado.</p>
                </div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', backgroundColor: '#f9fafb' }}>
                            <th style={{ padding: '12px' }}>Nome</th>
                            <th style={{ padding: '12px' }}>CPF</th>
                            <th style={{ padding: '12px' }}>Unidade</th>
                            <th style={{ padding: '12px' }}>Telefone</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gestores.map(g => (
                            <tr key={g.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px', fontWeight: 'bold' }}>{g.nome}</td>
                                <td style={{ padding: '12px', color: '#666' }}>{g.cpf}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                                        {getUnidadeNome(g.unidade)}
                                    </span>
                                </td>
                                <td style={{ padding: '12px', color: '#666' }}>{g.telefone}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <button onClick={() => abrirEdicao(g)} style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b' }} title="Editar">
                                        <FaEdit size={18} />
                                    </button>
                                    <button onClick={() => handleExcluir(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Excluir">
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

export default Gestores;