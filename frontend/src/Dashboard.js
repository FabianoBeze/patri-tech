import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Dashboard.css';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FaBox, FaBuilding, FaTags, FaDollarSign, FaBarcode } from 'react-icons/fa'; // <--- Adicionei FaBarcode aqui

function Dashboard() {
  const navigate = useNavigate();
  const [bens, setBens] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Inicializa sempre recolhido

  console.log('Dashboard rendered. isSidebarCollapsed state:', isSidebarCollapsed);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    console.log('toggleSidebar called. New isSidebarCollapsed:', !isSidebarCollapsed);
  };

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      console.log('handleResize called. Current window width:', currentWidth);
      if (currentWidth < 768) {
        setIsSidebarCollapsed(true); // Recolhe se for mobile
        console.log('Setting isSidebarCollapsed to true (mobile)');
      } else {
        setIsSidebarCollapsed(false); // Expande se for desktop
        console.log('Setting isSidebarCollapsed to false (desktop)');
      }
    };

    handleResize(); // Chama a função uma vez na montagem do componente
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    // Interceptor para renovar token se expirar
    axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
                const res = await axios.post(
                'http://127.0.0.1:8000/api/token/refresh/',
                { refresh: refreshToken }
                );
                localStorage.setItem('access_token', res.data.access);
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
                originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`;
                return axios(originalRequest);
            } catch (err) {
                console.error("Erro ao renovar token", err);
                window.location.href = '/login';
            }
          } else {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    axios.get('http://127.0.0.1:8000/api/bens/', config).then(res => setBens(res.data)).catch(console.error);
    axios.get('http://127.0.0.1:8000/api/unidades/', config).then(res => setUnidades(res.data)).catch(console.error);
    axios.get('http://127.0.0.1:8000/api/categorias/', config).then(res => setCategorias(res.data)).catch(console.error);
  }, []); // Este useEffect é para a busca de dados e o interceptor

  // --- CÁLCULOS ---
  const bensAtivos = bens.filter(bem => !bem.data_baixa);

  const valorTotal = bensAtivos.reduce((acc, bem) => {
      const valorNumerico = bem.valor ? Number(bem.valor.replace(/,/g, '')) : 0;
      return acc + (isNaN(valorNumerico) ? 0 : valorNumerico);
  }, 0);

  const dadosGrafico = categorias.map(cat => ({
    name: cat.nome,
    value: bensAtivos.filter(b => b.categoria === cat.id).length
  })).filter(item => item.value > 0);

  const CORES = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <div className={`dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {console.log('Dashboard rendering Sidebar. isSidebarCollapsed:', isSidebarCollapsed)}
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      
      <main className={`content ${isSidebarCollapsed ? 'content-expanded' : ''}`}>
        
        {/* CABEÇALHO COM O NOVO BOTÃO */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>Bem-vindo a Gestão Patrimonial</h1>
              <p>Visão geral dos dados do sistema em tempo real.</p>
            </div>
            
            {/* BOTÃO NOVO AQUI 👇 */}
            <button 
              className="btn-barcode"
              onClick={() => alert('Funcionalidade de leitura de código de barras será implementada aqui!')}
            >
              <FaBarcode size={20} />
              Ler Código de Barras
            </button>
        </div>

        {/* CARDS COM NAVEGAÇÃO */}
        <div className="cards-container">
          
          {/* CARD 1: TOTAL DE BENS -> Vai para /bens */}
          <div 
            className="card" 
            onClick={() => navigate('/bens')} 
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div className="card-icon" style={{background: '#e0f2fe', color: '#0284c7'}}>
                <FaBox /> 
            </div>
            <div className="card-info">
                <span>Total de Bens</span>
                <h3>{bens.length}</h3>
            </div>
          </div>

          {/* CARD 2: UNIDADES -> Vai para /unidades */}
          <div 
            className="card" 
            onClick={() => navigate('/unidades')} 
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div className="card-icon" style={{background: '#dcfce7', color: '#16a34a'}}>
                <FaBuilding />
            </div>
            <div className="card-info">
                <span>Unidades</span>
                <h3>{unidades.length}</h3>
            </div>
          </div>

          {/* CARD 3: CATEGORIAS -> Vai para /categorias */}
          <div 
            className="card" 
            onClick={() => navigate('/categorias')} 
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div className="card-icon" style={{background: '#ffedd5', color: '#ea580c'}}>
                <FaTags />
            </div>
            <div className="card-info">
                <span>Categorias</span>
                <h3>{categorias.length}</h3>
            </div>
          </div>

          {/* CARD 4: VALOR -> Não clica (apenas informativo) */}
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
            <div className="chart-container">
                <h3>Bens Ativos por Categoria</h3>
                {dadosGrafico.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={dadosGrafico} cx="50%" cy="50%"
                                innerRadius={60} outerRadius={80}
                                paddingAngle={5} dataKey="value"
                            >
                                {dadosGrafico.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p style={{textAlign:'center', color:'#999', marginTop:'50px'}}>Sem bens ativos.</p>
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

            <div className="recent-table">
                <h3>Últimos Bens Cadastrados</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Bem</th>
                            <th>Unidade</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bens.slice(-5).reverse().map(bem => (
                            <tr key={bem.id}>
                                <td style={{color:'#666', fontSize:'13px'}}>{formatarData(bem.criado_em)}</td>
                                <td>{bem.nome}</td>
                                <td>{unidades.find(u => u.id === bem.unidade)?.nome || '...'}</td>
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
    </div>
    );
  }
   


  
export default Dashboard;