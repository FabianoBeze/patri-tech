import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaSearch, FaArrowLeft, FaEdit, FaTimes } from 'react-icons/fa';
import './Dashboard.css';

function UnidadeDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  
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

  useEffect(() => {
    carregarBens();
    const token = localStorage.getItem('access_token');
    axios.get(`http://127.0.0.1:8000/api/unidades/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => setNomeUnidade(res.data.nome));
  }, [id]);

  const carregarBens = () => {
    const token = localStorage.getItem('access_token');
    axios.get('http://127.0.0.1:8000/api/bens/', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(response => {
        // Filtra apenas os bens desta unidade
        const bensDaUnidade = response.data.filter(bem => bem.unidade == id);
        setBens(bensDaUnidade);
        console.log("Bens carregados:", bensDaUnidade); // Debug no console
    });
  };

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

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="content" style={{position: 'relative'}}>
        
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
            <button onClick={() => navigate('/unidades')} style={{marginRight: '15px', padding: '8px', cursor: 'pointer', border:'none', background:'#ddd', borderRadius:'5px'}}>
                <FaArrowLeft /> Voltar
            </button>
            <div>
                <h1 style={{margin:0}}>{nomeUnidade}</h1>
            </div>
        </div>

        <div className="panel" style={{marginBottom: '20px', display: 'flex', alignItems: 'center', padding: '15px'}}>
            <FaSearch style={{marginRight: '10px', color: '#666'}} />
            <input 
                type="text" 
                placeholder="Filtrar por nome ou nº de patrimônio..." 
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                style={{border: 'none', width: '100%', outline: 'none', fontSize: '16px'}}
            />
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
                {bensFiltrados.map((bem) => (
                  <tr key={bem.id} style={{ opacity: bem.data_baixa ? 0.6 : 1, background: bem.data_baixa ? '#f8f8f8' : 'white' }}>
                    <td><strong>{bem.tombo}</strong></td>
                    <td>{bem.nome}</td>
                    
                    {/* --- AQUI ESTÁ A CORREÇÃO VISUAL --- */}
                    <td>
                        {/* Verifica ALUGADO ou Alugado */}
                        {(bem.origem === 'ALUGADO' || bem.origem === 'Alugado') && 
                            <span style={{background: '#d97706', color:'white', padding:'4px 10px', borderRadius:'12px', fontSize:'11px', fontWeight:'bold', textTransform:'uppercase'}}>ALUGADO</span>
                        }
                        
                        {(bem.origem === 'DOACAO' || bem.origem === 'Doacao') && 
                            <span style={{background: '#2563eb', color:'white', padding:'4px 10px', borderRadius:'12px', fontSize:'11px', fontWeight:'bold', textTransform:'uppercase'}}>DOAÇÃO</span>
                        }
                        
                        {/* Se não for nenhum dos dois, mostra Próprio */}
                        {(bem.origem !== 'ALUGADO' && bem.origem !== 'Alugado' && bem.origem !== 'DOACAO' && bem.origem !== 'Doacao') && 
                            <span style={{color: '#64748b', fontSize:'12px', fontWeight:'500'}}>Próprio</span>
                        }
                    </td>

                    <td>{bem.situacao}</td>
                    <td>{bem.estado_conservacao}</td>
                    <td>
                        {bem.data_baixa ? 
                            <span style={{color:'red', fontWeight:'bold', fontSize:'12px'}}>BAIXADO</span> 
                            : <span style={{color:'green', fontWeight:'bold', fontSize:'12px'}}>ATIVO</span>}
                    </td>
                    <td>
                        <button 
                            onClick={() => abrirModal(bem)}
                            style={{fontSize: '12px', padding: '5px 10px', cursor:'pointer', background: '#e2e8f0', border:'1px solid #cbd5e1', borderRadius:'4px', display: 'flex', alignItems: 'center', gap: '5px'}}
                        >
                            <FaEdit /> Editar
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>

        {/* MODAL DE EDIÇÃO */}
        {modalAberto && (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}>
                <div style={{
                    background: 'white', padding: '25px', borderRadius: '8px', width: '500px', maxWidth: '90%', boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                }}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                        <h3 style={{margin:0}}>Editar Bem: {bemEditando?.nome}</h3>
                        <button onClick={() => setModalAberto(false)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'20px'}}>
                            <FaTimes />
                        </button>
                    </div>

                    <form onSubmit={salvarEdicao}>
                        {/* Campos de Edição */}
                        <div style={{display:'flex', gap:'15px', marginBottom:'20px'}}>
                            <div style={{flex:1}}>
                                <label style={{display:'block', fontSize:'12px', marginBottom:'5px', fontWeight:'bold'}}>Situação</label>
                                <select 
                                    value={editForm.situacao}
                                    onChange={e => setEditForm({...editForm, situacao: e.target.value})}
                                    style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #ccc'}}
                                >
                                    <option value="RECUPERAVEL">Recuperável</option>
                                    <option value="ANTIECONOMICO">Antieconômico</option>
                                    <option value="IRRECUPERAVEL">Irrecuperável</option>
                                    <option value="OCIOSO">Ocioso</option>
                                </select>
                            </div>
                            <div style={{flex:1}}>
                                <label style={{display:'block', fontSize:'12px', marginBottom:'5px', fontWeight:'bold'}}>Estado de Conservação</label>
                                <select 
                                    value={editForm.estado_conservacao}
                                    onChange={e => setEditForm({...editForm, estado_conservacao: e.target.value})}
                                    style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #ccc'}}
                                >
                                    <option value="EXCELENTE">Excelente (10)</option>
                                    <option value="BOM">Bom (8)</option>
                                    <option value="REGULAR">Regular (5)</option>
                                </select>
                            </div>
                        </div>

                        <hr style={{border:'0', borderTop:'1px solid #eee', margin:'15px 0'}} />
                        
                        <h4 style={{color:'#dc2626', marginBottom:'15px', fontSize:'14px'}}>Registro de Baixa (Saída)</h4>
                        
                        <div style={{marginBottom:'15px'}}>
                            <label style={{display:'block', fontSize:'12px', marginBottom:'5px'}}>Data da Baixa</label>
                            <input 
                                type="date" 
                                value={editForm.data_baixa} 
                                onChange={e => setEditForm({...editForm, data_baixa: e.target.value})}
                                style={{width:'100%', padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}}
                            />
                        </div>

                        <div style={{marginBottom:'20px'}}>
                            <label style={{display:'block', fontSize:'12px', marginBottom:'5px'}}>Motivo / Observação</label>
                            <textarea 
                                rows="3"
                                value={editForm.obs_baixa}
                                onChange={e => setEditForm({...editForm, obs_baixa: e.target.value})}
                                placeholder="Descreva o motivo da baixa..."
                                style={{width:'100%', padding:'8px', border:'1px solid #ccc', borderRadius:'4px', resize:'vertical'}}
                            ></textarea>
                        </div>

                        <div style={{textAlign:'right'}}>
                            <button 
                                type="button" 
                                onClick={() => setModalAberto(false)}
                                style={{marginRight:'10px', padding:'10px 20px', border:'none', background:'#ccc', borderRadius:'4px', cursor:'pointer'}}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                style={{padding:'10px 20px', border:'none', background:'#2563eb', color:'white', borderRadius:'4px', cursor:'pointer', fontWeight:'bold'}}
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