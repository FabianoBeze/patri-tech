import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Dashboard.css';
import { FaArrowLeft, FaSave, FaPlusCircle } from 'react-icons/fa';

function AddBem() {
  const navigate = useNavigate();
  
  // Listas para os selects
  const [unidades, setUnidades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [salas, setSalas] = useState([]);

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '', descricao: '', tombo: '', valor: '',
    situacao: 'RECUPERAVEL', estado_conservacao: 'EXCELENTE',
    origem: 'PROPRIO', categoria: '', unidade: '', sala: ''
  });

  useEffect(() => {
    carregarDadosAuxiliares();
  }, []);

  // Efeito cascata: Quando escolhe a unidade, busca as salas dela
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
    } catch (error) { console.error("Erro ao carregar listas", error); }
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

  const handleChange = (e) => {
      const { name, value } = e.target;
      if (name === 'unidade') {
          // Limpa a sala se trocar de unidade
          setFormData(prev => ({ ...prev, [name]: value, sala: '' }));
      } else {
          setFormData(prev => ({ ...prev, [name]: value }));
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    
    // Tratamento para enviar null se a sala for vazia
    const payload = { ...formData, sala: formData.sala === '' ? null : formData.sala };

    try {
      await axios.post('http://127.0.0.1:8000/api/bens/', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Bem cadastrado com sucesso!');
      navigate('/bens');
    } catch (error) {
        console.error("Erro detalhado:", error);
        
        // CÓDIGO NOVO: Exibe a mensagem real do Back-end
        if (error.response && error.response.data) {
            // Transforma o objeto de erro {"tombo": ["erro..."], "valor": ["erro..."]} em texto
            const mensagens = Object.entries(error.response.data)
                .map(([campo, msgs]) => `${campo.toUpperCase()}: ${msgs}`)
                .join('\n');
            
            alert(`Erro ao salvar:\n${mensagens}`);
        } else {
            alert('Erro desconhecido ao cadastrar. Verifique o console.'); 
        }
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="content">
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <button onClick={() => navigate('/bens')} style={{ border:'none', background:'none', cursor:'pointer', fontSize:'20px' }}><FaArrowLeft /></button>
             <h1>Cadastrar Novo Bem</h1>
        </div>

        <div className="panel" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px' }}>
            <form onSubmit={handleSubmit}>
                {/* Linha 1 */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                    <div style={{ flex: 2 }}>
                        <label>Nome do Bem</label>
                        <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="form-control" required style={{ width: '100%', padding: '10px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Tombo (Único)</label>
                        <input type="text" name="tombo" value={formData.tombo} onChange={handleChange} className="form-control" required style={{ width: '100%', padding: '10px' }} />
                    </div>
                </div>

                {/* Localização */}
                <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #eee' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#555' }}>Localização Inicial</h4>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label>Unidade</label>
                            <select name="unidade" value={formData.unidade} onChange={handleChange} className="form-control" required style={{ width: '100%', padding: '10px' }}>
                                <option value="">Selecione...</option>
                                {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Sala</label>
                            <select name="sala" value={formData.sala} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px' }} disabled={!formData.unidade}>
                                <option value="">Selecione...</option>
                                {salas.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Detalhes */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label>Categoria</label>
                        <select name="categoria" value={formData.categoria} onChange={handleChange} className="form-control" required style={{ width: '100%', padding: '10px' }}>
                            <option value="">Selecione...</option>
                            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                         <label>Valor (R$)</label>
                         <input type="number" step="0.01" name="valor" value={formData.valor} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px' }} />
                    </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn-primary" style={{ padding: '12px 25px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaPlusCircle /> Cadastrar Bem
                    </button>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
}

export default AddBem;