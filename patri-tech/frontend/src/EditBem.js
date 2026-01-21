import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Dashboard.css';
import { FaArrowLeft, FaSave, FaBuilding, FaExchangeAlt, FaInfoCircle } from 'react-icons/fa';

function EditBem() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [unidades, setUnidades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [salas, setSalas] = useState([]);

  // Estado com todos os campos do Bem
  const [formData, setFormData] = useState({
    nome: '', descricao: '', tombo: '', valor: '',
    situacao: 'RECUPERAVEL', estado_conservacao: 'EXCELENTE',
    origem: 'PROPRIO', categoria: '', unidade: '', sala: ''
  });

  useEffect(() => {
    carregarDadosAuxiliares();
    carregarBem();
  }, [id]);

  // Efeito cascata: Quando muda a Unidade, busca as Salas dela
  useEffect(() => {
    if (formData.unidade) {
        fetchSalas(formData.unidade);
    } else {
        setSalas([]);
    }
  }, [formData.unidade]);

  const carregarDadosAuxiliares = async () => {
    const token = localStorage.getItem('access_token');
    try {
        const [resUnidades, resCats] = await Promise.all([
            axios.get('http://127.0.0.1:8000/api/unidades/', { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('http://127.0.0.1:8000/api/categorias/', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setUnidades(resUnidades.data);
        setCategorias(resCats.data);
    } catch (error) { console.error("Erro", error); }
  };

  const fetchSalas = async (unidadeId) => {
      const token = localStorage.getItem('access_token');
      try {
          const response = await axios.get(`http://127.0.0.1:8000/api/salas/?unidade=${unidadeId}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setSalas(response.data);
      } catch (error) { console.error("Erro salas", error); }
  };

  const carregarBem = async () => {
      const token = localStorage.getItem('access_token');
      try {
          const response = await axios.get(`http://127.0.0.1:8000/api/bens/${id}/`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          const bem = response.data;
          setFormData({
              nome: bem.nome, descricao: bem.descricao || '', tombo: bem.tombo, valor: bem.valor || '',
              situacao: bem.situacao, estado_conservacao: bem.estado_conservacao, origem: bem.origem,
              categoria: bem.categoria, unidade: bem.unidade, sala: bem.sala || ''
          });
      } catch (error) { alert("Erro ao carregar bem"); navigate('/bens'); }
  };

  const handleChange = (e) => {
      const { name, value } = e.target;
      if (name === 'unidade') {
          // Lógica de Segurança: Mudou a unidade? Limpa a sala para evitar inconsistência.
          setFormData(prev => ({ ...prev, [name]: value, sala: '' }));
      } else {
          setFormData(prev => ({ ...prev, [name]: value }));
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    // Envia null se a sala for vazia
    const payload = { ...formData, sala: formData.sala === '' ? null : formData.sala };

    try {
      await axios.put(`http://127.0.0.1:8000/api/bens/${id}/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Bem atualizado/movimentado com sucesso!');
      navigate('/bens');
    } catch (error) { alert('Erro ao atualizar bem.'); }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="content">
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <button onClick={() => navigate('/bens')} style={{ border:'none', background:'none', cursor:'pointer', fontSize:'20px' }}><FaArrowLeft /></button>
             <h1>Editar / Transferir Bem</h1>
        </div>

        <div className="panel" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px' }}>
            <form onSubmit={handleSubmit}>
                
                {/* Linha 1: Identificação Básica */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                    <div style={{ flex: 2 }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Nome do Bem</label>
                        <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="form-control" required style={{ width: '100%', padding: '10px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tombo (Fixo)</label>
                        <input type="text" name="tombo" value={formData.tombo} readOnly className="form-control" style={{ width: '100%', padding: '10px', backgroundColor: '#e9ecef', color: '#666' }} />
                    </div>
                </div>

                {/* ÁREA DE TRANSFERÊNCIA (Destacada) */}
                <div style={{ backgroundColor: '#f0f9ff', padding: '20px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #bae6fd' }}>
                    <h4 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#0369a1' }}>
                        <FaExchangeAlt /> Movimentação do Bem (Transferência)
                    </h4>
                    <p style={{ fontSize: '13px', color: '#555', marginBottom: '15px' }}>
                        Para transferir o bem, selecione a nova Unidade. As salas serão atualizadas automaticamente.
                    </p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: 'bold' }}>Unidade de Destino</label>
                            <select name="unidade" value={formData.unidade} onChange={handleChange} className="form-control" required style={{ width: '100%', padding: '10px' }}>
                                <option value="">Selecione...</option>
                                {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: 'bold' }}>Nova Sala</label>
                            <select name="sala" value={formData.sala} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px' }} disabled={!formData.unidade}>
                                <option value="">Selecione...</option>
                                {salas.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Linha 3: Detalhes Técnicos */}
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', marginTop: '0' }}><FaInfoCircle /> Detalhes do Bem</h4>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label>Categoria</label>
                        <select name="categoria" value={formData.categoria} onChange={handleChange} className="form-control" required style={{ width: '100%', padding: '10px' }}>
                            <option value="">Selecione...</option>
                            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Situação</label>
                        <select name="situacao" value={formData.situacao} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px' }}>
                            <option value="RECUPERAVEL">Recuperável</option>
                            <option value="ANTIECONOMICO">Antieconômico</option>
                            <option value="IRRECUPERAVEL">Irrecuperável</option>
                            <option value="OCIOSO">Ocioso</option>
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                         <label>Origem</label>
                         <select name="origem" value={formData.origem} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px' }}>
                            <option value="PROPRIO">Próprio</option>
                            <option value="DOACAO">Doação</option>
                            <option value="ALUGADO">Alugado</option>
                        </select>
                    </div>
                </div>

                {/* Linha 4: Valor e Descrição */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label>Valor (R$)</label>
                        <input type="number" step="0.01" name="valor" value={formData.valor} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px' }} />
                    </div>
                    <div style={{ flex: 2 }}>
                        <label>Descrição Detalhada</label>
                        <input type="text" name="descricao" value={formData.descricao} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px' }} />
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn-primary" style={{ padding: '12px 25px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                        <FaSave /> Salvar Alterações
                    </button>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
}

export default EditBem;