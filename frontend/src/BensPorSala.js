import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authenticatedFetch } from './auth';
import Sidebar from './Sidebar';
import './Dashboard.css'; // Ou um CSS específico para bens
import { FaArrowLeft } from 'react-icons/fa';

function BensPorSala() {
  const { salaId } = useParams(); // Pega o ID da sala da URL
  const navigate = useNavigate();

  const [bens, setBens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salaNome, setSalaNome] = useState(''); // Para exibir o nome da sala

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const fetchBensPorSala = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Primeiro, busca os detalhes da sala para pegar o nome
      const salaResponse = await authenticatedFetch(`http://localhost:8000/api/salas/${salaId}/`, {}, navigate);
      const salaData = await salaResponse.json();
      setSalaNome(salaData.nome);

      // Em seguida, busca os bens filtrados pela sala
      const bensResponse = await authenticatedFetch(`http://localhost:8000/api/bens/?sala=${salaId}`, {}, navigate);
      const bensData = await bensResponse.json();
      setBens(bensData);
    } catch (err) {
      console.error("Failed to fetch bens for sala:", err);
      setError("Erro ao carregar bens para esta sala.");
    } finally {
      setLoading(false);
    }
  }, [salaId, navigate]);

  useEffect(() => {
    fetchBensPorSala();
  }, [fetchBensPorSala]);

  return (
    <div className="dashboard-container">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      <main className="content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1>Bens da Sala: {salaNome}</h1>
            <p>Lista de bens localizados nesta sala.</p>
          </div>
          <button 
            onClick={() => navigate(-1)} // Volta para a página anterior
            className="btn-secondary"
            style={{ padding: '10px 15px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', background:'white' }}
          >
            <FaArrowLeft /> Voltar
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <div className="panel" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {loading ? (
            <p>Carregando bens...</p>
          ) : bens.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Nenhum bem encontrado nesta sala.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '12px', color: '#555' }}>Nome do Bem</th>
                  <th style={{ padding: '12px', color: '#555' }}>Descrição</th>
                  <th style={{ padding: '12px', color: '#555' }}>Número de Série</th> {/* <--- Este cabeçalho */}
                  <th style={{ padding: '12px', color: '#555' }}>Valor</th>
                  {/* Adicione mais colunas conforme necessário */}
                </tr>
              </thead>
              <tbody>
                {bens.map(bem => (
                  <tr key={bem.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{bem.nome}</td>
                    <td style={{ padding: '12px' }}>{bem.status}</td>
                    <td style={{ padding: '12px' }}>{bem.tombo}</td> {/* <--- E este dado */}
                    <td style={{ padding: '12px' }}>R$ {parseFloat(bem.valor).toFixed(2)}</td>
                    {/* Renderize mais dados do bem aqui */}
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

export default BensPorSala;