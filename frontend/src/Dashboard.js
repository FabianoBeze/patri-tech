import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import './Dashboard.css';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FaBox, FaBuilding, FaTags, FaDollarSign } from 'react-icons/fa';

function Dashboard() {
  const [bens, setBens] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [salas, setSalas] = useState([]);
  const [bensPorSala, setBensPorSala] = useState({});
  const [loadingSalas, setLoadingSalas] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showUnidadesModal, setShowUnidadesModal] = useState(false); // Novo estado para controlar a visibilidade do modal
  const [selectedUnidade, setSelectedUnidade] = useState(null); // Novo estado para armazenar a unidade selecionada

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Função para abrir o modal de unidades
  const handleCardClick = async(unidade) => {
    setSelectedUnidade(unidade);
    setShowUnidadesModal(true);
    setLoadingSalas(true);
    setSalas([]);
    setBensPorSala({});

    const token = localStorage.getItem('access_token');

    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/unidades/${unidade?.id || 1}/salas/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSalas(res.data);
    } catch (error) {
      console.error("Erro ao carregar salas", error);
    } finally {
      setLoadingSalas(false);
    }

  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setShowUnidadesModal(false);
    setSelectedUnidade(null);
    setSalas([]);
    setBensPorSala({});
    
  };

  const carregarBensDaSala = async (salaId) => {
    if (bensPorSala[salaId]) return;

    const token = localStorage.getItem('access_token');

    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/salas/${salaId}/bens/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBensPorSala(prev => ({
        ...prev,
        [salaId]: res.data
      }));
    } catch (error) {
      console.error("Erro ao carregar bens da sala", error);
    }
  };

  useEffect(() => {
    axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshToken = localStorage.getItem('refresh_token');

          if (refreshToken) {
            const res = await axios.post(
              'http://127.0.0.1:8000/api/token/refresh/',
              { refresh: refreshToken }
            );
            localStorage.setItem('access_token', res.data.access);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
            originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`;
            return axios(originalRequest);
          }

          window.location.href = '/login';
        }

        return Promise.reject(error);
      }
    );

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    axios.get('http://127.0.0.1:8000/api/bens/', config).then(res => setBens(res.data));
    axios.get('http://127.0.0.1:8000/api/unidades/', config).then(res => setUnidades(res.data));
    axios.get('http://127.0.0.1:8000/api/categorias/', config).then(res => setCategorias(res.data));
  }, []);

  // --- CÁLCULOS ---
  const bensAtivos = bens.filter(bem => !bem.data_baixa);

  const valorTotal = bensAtivos.reduce((acc, bem) => {
      // Trata strings com vírgulas e converte para número válido
      const valorNumerico = bem.valor 
          ? Number(bem.valor.replace(/,/g, '')) 
          : 0;
      // Garante que o valor seja um número válido antes de somar
      return acc + (isNaN(valorNumerico) ? 0 : valorNumerico);
  }, 0);

  const dadosGrafico = categorias.map(cat => ({
    name: cat.nome,
    value: bensAtivos.filter(b => b.categoria === cat.id).length
  })).filter(item => item.value > 0);

  const CORES = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // --- FUNÇÃO PARA FORMATAR DATA (O SEGREDO!) ---
  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR'); // Formata para DD/MM/AAAA
  };

  return (
    <div className={`dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} /> {/* Passa as props */}
      
      <main className={`content ${isSidebarCollapsed ? 'content-expanded' : ''}`}> {/* Aplica classe condicional */}
        
        <div className="page-header">
            <div>
              <h1>Bem-vindo a Gestão Patrimonial</h1>
              <p>Visão geral dos dados do sistema em tempo real.</p>
            </div>
            {/* Botão para Leitura de Código de Barras (futuro) */}
            <button 
              onClick={() => alert('Funcionalidade de leitura de código de barras será implementada aqui!')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                marginLeft: 'auto', /* Para alinhar à direita se o header for flex */
                alignSelf: 'center' /* Para alinhar verticalmente se o header for flex */
              }}
            >
              Leitura de Código de Barras
            </button>
        </div>

        {/* CARDS */}
        <div className="cards-container">
          <div className="card">
            <div className="card-icon" style={{background: '#e0f2fe', color: '#0284c7'}}>
                <FaBox /> 
            </div>
            <div className="card-info">
                <span>Total de Bens</span>
                <h3>{bens.length}</h3>
            </div>
          </div>



          <div className="card" onClick={() => handleCardClick(unidades[0], salas[0])} style={{ cursor: 'pointer' }}> {/* Adicionado onClick e cursor */}
            <div className="card-icon" style={{background: '#dcfce7', color: '#16a34a'}}>
                <FaBuilding />
            </div>
            <div className="card-info">
                <span>Unidades</span>
                <h3>{unidades.length}</h3>
            </div>
          </div>

          <div className="card">
            <div className="card-icon" style={{background: '#ffedd5', color: '#ea580c'}}>
                <FaTags />
            </div>
            <div className="card-info">
                <span>Categorias</span>
                <h3>{categorias.length}</h3>
            </div>
          </div>

          <div className="card">
            <div className="card-icon" style={{background: '#f3e8ff', color: '#9333ea'}}>
                <FaDollarSign />
            </div>
            <div className="card-info">
                <span>Valor Estimado (Ativos)</span>
                <h3 style={{color: '#9333ea'}}>R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
          </div>
        </div>

        {/* PARTE DE BAIXO */}
        <div className="dashboard-bottom">
            
            {/* GRÁFICO */}
            <div className="chart-container">
                <h3>Bens Ativos por Categoria</h3>
                {dadosGrafico.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={dadosGrafico}
                                cx="50%" cy="50%"
                                innerRadius={60} outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {dadosGrafico.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p style={{textAlign:'center', color:'#999', marginTop:'50px'}}>Sem bens ativos para exibir.</p>
                )}
                <div style={{display:'flex', justifyContent:'center', gap:'15px', fontSize:'12px', flexWrap:'wrap'}}>
                    {dadosGrafico.map((entry, index) => (
                        <div key={index} style={{display:'flex', alignItems:'center'}}>
                            <div style={{width:'10px', height:'10px', backgroundColor: CORES[index % CORES.length], marginRight:'5px', borderRadius:'50%'}}></div>
                            {entry.name}: {entry.value}
                        </div>
                    ))}
                </div>
            </div>

            {/* TABELA RECENTES COM DATA */}
            <div className="recent-table">
                <h3>Últimos Bens Cadastrados</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Data</th> {/* Nova Coluna */}
                            <th>Bem</th>
                            <th>Unidade</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bens.slice(-5).reverse().map(bem => (
                            <tr key={bem.id}>
                                {/* Aqui aplicamos a formatação */}
                                <td style={{color:'#666', fontSize:'13px'}}>
                                    {formatarData(bem.criado_em)}
                                </td>
                                <td>{bem.nome}</td>
                                <td>
                                    {unidades.find(u => u.id === bem.unidade)?.nome ||  '...'}
                                </td>
                                <td>
                                    {bem.data_baixa ? 
                                        <span style={{color:'red', fontSize:'11px', fontWeight:'bold', background:'#fee2e2', padding:'2px 6px', borderRadius:'4px'}}>BAIXADO</span> : 
                                        <span style={{color:'green', fontSize:'11px', fontWeight:'bold', background:'#dcfce7', padding:'2px 6px', borderRadius:'4px'}}>ATIVO</span>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
      </main>

      {/* Modal de Detalhes das Unidades (Placeholder) */}
      {showUnidadesModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '80%',
            maxWidth: '600px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            <h2>Detalhes das Unidades</h2>
            {selectedUnidade ? (
              <div>
                <p>Nome da Unidade: {selectedUnidade.nome}</p>
                {/* Aqui você vai carregar e exibir as salas e itens */}
                <p>Conteúdo futuro: Salas e itens por sala.</p>
              </div>
            ) : (
              <div>
                <p>Você clicou no card de unidades. No futuro, ao clicar em uma unidade específica, os detalhes dela aparecerão aqui.</p>
                <p>Por enquanto, este modal serve como um placeholder para a funcionalidade.</p>
              </div>
            )}
            <button onClick={handleCloseModal} style={{ marginTop: '20px', padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;