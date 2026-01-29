import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaSearch, FaArrowLeft, FaEdit, FaTimes, FaBars } from 'react-icons/fa';
import './Dashboard.css';



function UnidadeDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [bens, setBens] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [nomeUnidade, setNomeUnidade] = useState('Carregando...');
  
  const [modalAberto, setModalAberto] = useState(false);
  const [bemEditando, setBemEditando] = useState(null);
  
  const [editForm, setEditForm] = useState({
    situacao: '',
    estado_conservacao: '',
    data_baixa: '',
    obs_baixa: ''
  });

  const [salaSelecionada, setSalaSelecionada] = useState('todas'); // estado para filtrar por sala
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768); // Inicializa recolhido se for mobile

  const toggleSidebar = () => {
    console.log('toggleSidebar called. Current isSidebarCollapsed:', isSidebarCollapsed);
    setIsSidebarCollapsed(prevState => !prevState);
    console.log('toggleSidebar called. New isSidebarCollapsed:', !isSidebarCollapsed);
  };

  useEffect(() => {
    console.log('Location changed in UnidadeDetalhes. Current isSidebarCollapsed:', isSidebarCollapsed);
    // Fecha a sidebar em mobile quando a rota muda
    if (window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
      console.log('Location changed on mobile in UnidadeDetalhes. Setting isSidebarCollapsed to true.');
    }
  }, [location, isSidebarCollapsed]);

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      console.log('handleResize called in UnidadeDetalhes. Current window.innerWidth:', currentWidth);
      if (currentWidth < 768) {
        setIsSidebarCollapsed(true); // Recolhe se for mobile
        console.log('handleResize: Setting isSidebarCollapsed to true for mobile in UnidadeDetalhes.');
      } else {
        setIsSidebarCollapsed(false); // Expande se for desktop
        console.log('handleResize: Setting isSidebarCollapsed to false for desktop in UnidadeDetalhes.');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    console.log('salaSelecionada changed in UnidadeDetalhes. Current salaSelecionada:', salaSelecionada);
    // Recolhe a sidebar em mobile quando a sala selecionada muda
    if (window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
      console.log('salaSelecionada changed on mobile in UnidadeDetalhes. Setting isSidebarCollapsed to true.');
    }
  }, [salaSelecionada]);

  const carregarBens = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error("Token de acesso não encontrado.");
      navigate('/login');
      return;
    }
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/bens/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log("Dados brutos da API de bens:", response.data); // Novo log
      console.log("ID da unidade para filtragem:", id); // Novo log
      response.data.forEach(bem => {
        console.log(`Bem unidade: ${bem.unidade}, Tipo: ${typeof bem.unidade}`);
      });
      console.log(`ID do parâmetro: ${id}, Tipo: ${typeof id}`);
      // Filtra apenas os bens desta unidade
      const bensDaUnidade = response.data.filter(bem => bem.unidade === parseInt(id));
      setBens(bensDaUnidade);
      console.log("Bens carregados:", bensDaUnidade); // Debug no console
    } catch (error) {
      console.error("Erro ao carregar bens:", error);
      // Tratar erro, talvez exibir uma mensagem para o usuário
    }
  }, [id, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get(`http://127.0.0.1:8000/api/unidades/${id}/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      setNomeUnidade(response.data.nome);
    })
    .catch(error => {
      console.error("Erro ao carregar nome da unidade:", error);
      setNomeUnidade('Erro ao carregar');
    });

    carregarBens();
  }, [id, navigate, carregarBens]);

  const abrirModal = (bem) => {
    setBemEditando(bem);
    setEditForm({
        situacao: bem.situacao,
        estado_conservacao: bem.estado_conservacao,
        data_baixa: bem.data_baixa || '',
        obs_baixa: bem.obs_baixa || ''
    });
    setModalAberto(true);
  };

  const salvarEdicao = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error("Token de acesso não encontrado.");
      navigate('/login');
      return;
    }
    
    const dadosParaEnviar = {
        ...editForm,
        data_baixa: editForm.data_baixa === '' ? null : editForm.data_baixa
    };

    try {
        await axios.patch(`http://127.0.0.1:8000/api/bens/${bemEditando.id}/`, dadosParaEnviar, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        alert('Bem atualizado com sucesso!');
        setModalAberto(false);
        carregarBens(); 
    } catch (error) {
        console.error("Erro ao atualizar:", error);
        alert('Erro ao salvar as alterações.');
    }
  };

  const bensFiltrados = bens.filter(bem => 
    bem.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    bem.tombo.includes(filtro)
  );

  // Lista de salas únicas
  const salas = Array.from(new Set(bensFiltrados.map(bem => bem.sala || 'Sem Sala')));

  // Agrupa bens por sala, considerando a sala selecionada
  const bensAgrupados = () => {
    const agrupamento = {};
    console.log('bensAgrupados: salaSelecionada:', salaSelecionada);
    console.log('bensAgrupados: bensFiltrados:', bensFiltrados);

    bensFiltrados.forEach(bem => {
      const bemSala = bem.sala || 'Sem Sala';
      console.log('bensAgrupados: Processando bem:', bem.nome, 'Sala do bem:', bemSala);

      if (salaSelecionada !== 'todas' && bemSala !== salaSelecionada) {
        console.log('bensAgrupados: Bem ignorado devido à sala selecionada.');
        return;
      }

      const nomeSala = bem.sala_nome ? `Sala ${bem.sala_nome}` : 'Sem Sala';
      if (!agrupamento[nomeSala]) {
        agrupamento[nomeSala] = [];
      }
      agrupamento[nomeSala].push(bem);
    });
    console.log('bensAgrupados: Agrupamento final:', agrupamento);
    return agrupamento;
  };

  const bensPorSala = bensAgrupados();

  return (
    <div className={`dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      <main className={`content ${isSidebarCollapsed ? 'content-expanded' : ''}`} style={{position: 'relative'}}>
        {/* Botão de hambúrguer para mobile */}
        {!isSidebarCollapsed && window.innerWidth < 768 && (
          <div className="overlay" onClick={toggleSidebar}></div>
        )}
        {isSidebarCollapsed && window.innerWidth < 768 && (
          <button onClick={toggleSidebar} className="mobile-menu-btn">
            <FaBars />
          </button>
        )}
        
        <div className="header-unidade-detalhes">
            <button onClick={() => navigate('/unidades')} className="btn-voltar">
                <FaArrowLeft /> Voltar
            </button>
            <div>
                <h1 className="titulo-unidade-detalhes">{nomeUnidade}</h1>
            </div>
        </div>

        <div className="panel-busca">
            <FaSearch className="icone-busca" />
            <input 
                type="text" 
                placeholder="Filtrar por nome ou nº de patrimônio..." 
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="input-busca"
            />
        </div>

        {/* Botões de salas */}
        <div className="container-botoes-salas">
          <button
            onClick={() => {
              console.log('Botão "Todas" clicado. Definindo salaSelecionada para:', 'todas');
              setSalaSelecionada('todas');
            }}
            className={`btn-sala ${salaSelecionada === 'todas' ? 'active' : 'inactive'}`}
          >
            Todas
          </button>
          {salas.map((sala, idx) => (
            <button
              key={idx}
              onClick={() => {
                console.log('Botão de sala clicado. Definindo salaSelecionada para:', sala);
                setSalaSelecionada(sala);
              }}
              className={`btn-sala ${salaSelecionada === sala ? 'active' : 'inactive'}`}
            >
              {sala}
            </button>
          ))}
        </div>

        <div className="panel table-panel">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tombo</th>
                  <th>Bem</th>
                  <th>Origem</th>
                  <th>Situação</th>
                  <th>Estado</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(bensPorSala).map((salaNome, indexSala) => (
                  <React.Fragment key={indexSala}>
                    {/* Linha de título da sala */}
                    <tr className="sala-titulo-row"> 
                      <td colSpan="7">{salaNome}</td>
                    </tr>

                    {/* Linhas dos bens dessa sala */}
                    {bensPorSala[salaNome].map(bem => (
                      <tr key={bem.id} className={`bem-row ${bem.data_baixa ? 'bem-inativo' : 'bem-ativo'}`}> 
                        <td><strong>{bem.tombo}</strong></td>
                        <td>{bem.nome}</td>
                        <td>
                          {(bem.origem === 'ALUGADO' || bem.origem === 'Alugado') && 
                              <span className="badge-alugado">ALUGADO</span>
                          }
                          {(bem.origem === 'DOACAO' || bem.origem === 'Doacao') && 
                              <span className="badge-doacao">DOAÇÃO</span>
                          }
                          {(bem.origem !== 'ALUGADO' && bem.origem !== 'Alugado' && bem.origem !== 'DOACAO' && bem.origem !== 'Doacao') && 
                              <span className="badge-proprio">Próprio</span>
                          }
                        </td>
                        <td>{bem.situacao}</td>
                        <td>{bem.estado_conservacao}</td>
                        <td>
                          {bem.data_baixa ? 
                              <span className="status-baixado">BAIXADO</span> 
                              : <span className="status-ativo">ATIVO</span>}
                        </td>
                        <td>
                          <button 
                            onClick={() => abrirModal(bem)}
                            className="btn-editar"
                          >
                            <FaEdit /> Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
        </div>

        {/* MODAL DE EDIÇÃO */}
        {modalAberto && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h3>Editar Bem: {bemEditando?.nome}</h3>
                        <button onClick={() => setModalAberto(false)} className="modal-close-btn">
                            <FaTimes />
                        </button>
                    </div>

                    <form onSubmit={salvarEdicao}>
                        {/* Campos de Edição */}
                        <div className="modal-form-group">
                            <div>
                                <label className="modal-label">Situação</label>
                                <select 
                                    value={editForm.situacao}
                                    onChange={e => setEditForm({...editForm, situacao: e.target.value})}
                                    className="modal-select"
                                >
                                    <option value="RECUPERAVEL">Recuperável</option>
                                    <option value="ANTIECONOMICO">Antieconômico</option>
                                    <option value="IRRECUPERAVEL">Irrecuperável</option>
                                    <option value="OCIOSO">Ocioso</option>
                                </select>
                            </div>
                            <div>
                                <label className="modal-label">Estado de Conservação</label>
                                <select 
                                    value={editForm.estado_conservacao}
                                    onChange={e => setEditForm({...editForm, estado_conservacao: e.target.value})}
                                    className="modal-select"
                                >
                                    <option value="EXCELENTE">Excelente (10)</option>
                                    <option value="BOM">Bom (8)</option>
                                    <option value="REGULAR">Regular (5)</option>
                                </select>
                            </div>
                        </div>

                        <hr className="modal-divider" />
                        
                        <h4 className="modal-subtitle">Registro de Baixa (Saída)</h4>
                        
                        <div className="mb-15">
                            <label className="modal-label">Data da Baixa</label>
                            <input 
                                type="date" 
                                value={editForm.data_baixa} 
                                onChange={e => setEditForm({...editForm, data_baixa: e.target.value})}
                                className="modal-input"
                            />
                        </div>

                        <div className="mb-20">
                            <label className="modal-label">Motivo / Observação</label>
                            <textarea 
                                rows="3"
                                value={editForm.obs_baixa}
                                onChange={e => setEditForm({...editForm, obs_baixa: e.target.value})}
                                placeholder="Descreva o motivo da baixa..."
                                className="modal-textarea"
                            ></textarea>
                        </div>

                        <div className="modal-footer">
                            <button 
                                type="button" 
                                onClick={() => setModalAberto(false)}
                                className="modal-cancel-btn"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="modal-save-btn"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}

export default UnidadeDetalhes;