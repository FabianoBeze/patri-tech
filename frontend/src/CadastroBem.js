import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import './Dashboard.css';

function CadastroBem() {
  const navigate = useNavigate();
  const [unidades, setUnidades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({ nome: '', patrimonio: '', unidade: '', categoria: '', valor: '', data_aquisicao: new Date().toISOString().split('T')[0] });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Adicionar estado para o sidebar

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    axios.get('http://127.0.0.1:8000/api/unidades/', config).then(res => setUnidades(res.data));
    axios.get('http://127.0.0.1:8000/api/categorias/', config).then(res => setCategorias(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    try {
      await axios.post('http://127.0.0.1:8000/api/bens/', formData, { headers: { Authorization: `Bearer ${token}` } });
      alert('Cadastrado com sucesso!');
      navigate('/bens');
    } catch (err) { alert('Erro ao salvar.'); }
  };

  // Função para alternar o estado do sidebar
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="dashboard-container">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      <main className="content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1>Novo Cadastro</h1>
          <button className="btn-barcode" style={{ background: '#6b7280' }} onClick={() => navigate('/bens')}><FaArrowLeft /> VOLTAR</button>
        </div>
        <div className="recent-table" style={{ maxWidth: '800px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Nome do Bem</label><input type="text" required onChange={e => setFormData({...formData, nome: e.target.value})} /></div>
            <div className="form-group"><label>Patrimônio</label><input type="text" required onChange={e => setFormData({...formData, patrimonio: e.target.value})} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Unidade</label>
                <select required onChange={e => setFormData({...formData, unidade: e.target.value})}>
                  <option value="">Selecione...</option>
                  {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Categoria</label>
                <select required onChange={e => setFormData({...formData, categoria: e.target.value})}>
                  <option value="">Selecione...</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-save"><FaSave /> SALVAR</button>
          </form>
        </div>
      </main>
    </div>
  );
}
export default CadastroBem;