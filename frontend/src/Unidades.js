import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Dashboard.css'; 
import { FaMapMarkerAlt, FaBuilding, FaPlus } from 'react-icons/fa'; // Ícones

function Unidades() {
  const navigate = useNavigate();
  const [unidades, setUnidades] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };

    axios.get('http://127.0.0.1:8000/api/unidades/', config)
      .then(response => {
        setUnidades(response.data);
      })
      .catch(error => {
        console.error("Erro ao buscar unidades:", error);
      });
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="content">
        
        {/* Título e Botão Verde */}
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

        {/* A Tabela Nova */}
        <div className="panel table-panel">
          {unidades.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                <FaBuilding size={40} style={{marginBottom: '10px', opacity: 0.5}} />
                <p>Nenhuma unidade cadastrada ainda.</p>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{width: '80px'}}>ID</th>
                  <th style={{width: '30%'}}>Nome da Unidade</th>
                  <th>Endereço Local</th>
                </tr>
              </thead>
              <tbody>
                {unidades.map((uni) => (
                  <tr 
                    key={uni.id} 
                    onClick={() => navigate(`/unidades/${uni.id}`)}
                    className="row-hover"
                    title="Clique para ver detalhes"
                  >
                    {/* Coluna 1: ID azulzinho */}
                    <td>
                        <span className="id-badge">#{uni.id}</span>
                    </td>
                    
                    {/* Coluna 2: Nome em destaque */}
                    <td>
                        <div className="nome-unidade">{uni.nome}</div>
                    </td>
                    
                    {/* Coluna 3: Endereço com ícone de mapa */}
                    <td>
                        <div className="endereco-unidade">
                            <FaMapMarkerAlt style={{color: '#ef4444'}} /> 
                            {uni.endereco || "Endereço não informado"}
                        </div>
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

export default Unidades;