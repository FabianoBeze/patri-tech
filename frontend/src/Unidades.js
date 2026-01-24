import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout'; // Usaremos o Layout para gerenciar a Sidebar
import './Dashboard.css'; 
import { FaMapMarkerAlt, FaBuilding, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

function Unidades() {
  const navigate = useNavigate();
  const [unidades, setUnidades] = useState([]);

  const getAuthConfig = () => {
    const token = localStorage.getItem('access_token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
  };

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/unidades/', getAuthConfig())
      .then(response => {
        setUnidades(response.data);
      })
      .catch(error => {
        console.error("Erro ao buscar unidades:", error);
      });
  }, []);

  const handleDelete = (e, id) => {
    e.stopPropagation(); 
    if (window.confirm("Tem certeza que deseja excluir esta unidade?")) {
      axios.delete(`http://127.0.0.1:8000/api/unidades/${id}/`, getAuthConfig())
        .then(() => {
          setUnidades(unidades.filter(uni => uni.id !== id));
          alert("Unidade excluída com sucesso!");
        })
        .catch(error => {
          console.error("Erro ao excluir unidade:", error);
          alert("Não foi possível excluir a unidade.");
        });
    }
  };

  return (
    <Layout>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
          <div>
            <h1 style={{fontSize: '28px', color: '#1f2937', marginBottom: '5px'}}>Gerenciar Unidades</h1>
            <p style={{color: '#6b7280'}}>Visualize e cadastre as filiais e sedes da empresa.</p>
          </div>
          
          <button onClick={() => navigate('/add-unidade')} style={{
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: '#10b981', padding: '12px 20px', borderRadius: '8px', border:'none', color:'white', fontWeight:'bold', cursor:'pointer'
          }}>
            <FaPlus /> Nova Unidade
          </button>
      </div>

      <div className="panel table-panel">
        {unidades.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <FaBuilding size={40} style={{marginBottom: '10px', opacity: 0.5}} />
              <p>Nenhuma unidade cadastrada ainda.</p>
          </div>
        ) : (
          <div className="table-responsive"> {/* Adicionado para scroll horizontal no celular */}
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{width: '80px'}}>ID</th>
                  <th style={{width: '30%'}}>Nome da Unidade</th>
                  <th>Endereço Local</th>
                  <th style={{width: '120px', textAlign: 'center'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {unidades.map((uni) => (
                  <tr 
                    key={uni.id} 
                    onClick={() => navigate(`/unidades/${uni.id}`)}
                    className="row-hover"
                    style={{ cursor: 'pointer' }}
                  >
                    <td><span className="id-badge">#{uni.id}</span></td>
                    <td><div className="nome-unidade">{uni.nome}</div></td>
                    <td>
                        <div className="endereco-unidade">
                            <FaMapMarkerAlt style={{color: '#ef4444', marginRight: '5px'}} /> 
                            {uni.endereco || "Endereço não informado"}
                        </div>
                    </td>
                    <td style={{textAlign: 'center'}}>
                      <button 
                        onClick={(e) => {
                            e.stopPropagation(); 
                            navigate(`/edit-unidade/${uni.id}`);
                        }} 
                        style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b' }} 
                        title="Editar"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, uni.id)} 
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
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Unidades;