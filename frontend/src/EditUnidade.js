import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Dashboard.css'; // Reutilizar o CSS do Dashboard
import { FaBuilding, FaSave, FaTimes } from 'react-icons/fa';

function EditUnidade() {
  const navigate = useNavigate();
  const { id } = useParams(); // Pega o ID da unidade da URL
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUnidade = async () => {
      const token = localStorage.getItem('access_token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/unidades/${id}/`, config);
        setNome(response.data.nome);
        setEndereco(response.data.endereco || '');
      } catch (err) {
        console.error("Erro ao buscar unidade:", err);
        setError("Não foi possível carregar os dados da unidade.");
      } finally {
        setLoading(false);
      }
    };

    fetchUnidade();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    try {
      await axios.put(`http://127.0.0.1:8000/api/unidades/${id}/`, { nome, endereco }, config);
      alert("Unidade atualizada com sucesso!");
      navigate('/unidades'); // Volta para a lista de unidades
    } catch (err) {
      console.error("Erro ao atualizar unidade:", err);
      alert("Erro ao atualizar unidade. Verifique os dados e tente novamente.");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="content">
          <p>Carregando unidade...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="content">
          <p style={{ color: 'red' }}>{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '28px', color: '#1f2937', marginBottom: '5px' }}>
              <FaBuilding style={{ marginRight: '10px' }} /> Editar Unidade
            </h1>
            <p style={{ color: '#6b7280' }}>Atualize as informações da unidade.</p>
          </div>
        </div>

        <div className="panel" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="nome" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Nome da Unidade:</label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="endereco" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Endereço:</label>
              <input
                type="text"
                id="endereco"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  background: '#007bff', padding: '10px 15px', borderRadius: '5px', border:'none', color:'white', fontWeight:'bold', cursor:'pointer'
              }}>
                <FaSave /> Salvar Alterações
              </button>
              <button type="button" onClick={() => navigate('/unidades')} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  background: '#6c757d', padding: '10px 15px', borderRadius: '5px', border:'none', color:'white', fontWeight:'bold', cursor:'pointer'
              }}>
                <FaTimes /> Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditUnidade;