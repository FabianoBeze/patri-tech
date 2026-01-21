import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from './auth';
import './Salas.css'; // Assumindo que você terá um arquivo CSS para Salas

function Salas() {
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSalaNome, setNewSalaNome] = useState('');
  const [editingSala, setEditingSala] = useState(null);
  const [editedSalaNome, setEditedSalaNome] = useState('');
  const [unidades, setUnidades] = useState([]); // Novo estado para armazenar as unidades
  const [selectedUnidade, setSelectedUnidade] = useState(''); // Novo estado para a unidade selecionada
  const navigate = useNavigate();

  const fetchSalas = useCallback(async () => {
    console.log("Attempting to fetch rooms...");
    setError(null); // Limpa erros anteriores
    setLoading(true); // Inicia o carregamento
    try {
      const response = await authenticatedFetch('http://localhost:8000/api/salas/', {}, navigate);
      const data = await response.json();
      setSalas(data);
      console.log("Rooms fetched successfully:", data);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      setError("Erro ao carregar salas. Por favor, tente novamente.");
    } finally {
      setLoading(false); // Finaliza o carregamento, independentemente do sucesso ou falha
    }
  }, [navigate]);

  const fetchUnidades = useCallback(async () => {
    try {
      const response = await authenticatedFetch('http://localhost:8000/api/unidades/', {}, navigate);
      const data = await response.json();
      setUnidades(data);
      if (data.length > 0) {
        setSelectedUnidade(data[0].id); // Seleciona a primeira unidade por padrão
      }
    } catch (err) {
      console.error("Failed to fetch unidades:", err);
      setError("Erro ao carregar unidades. Por favor, tente novamente.");
    }
  }, [navigate]);

  useEffect(() => {
    fetchSalas();
    fetchUnidades(); // Chama a função para buscar unidades
  }, [fetchSalas, fetchUnidades]);

  const handleAddSala = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await authenticatedFetch('http://localhost:8000/api/salas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome: newSalaNome, unidade: selectedUnidade }), // Inclui a unidade selecionada
      }, navigate);

      if (!response.ok) {
        const errorData = await response.json();
        // Melhorar a exibição de erros específicos do backend
        const errorMessage = errorData.unidade ? errorData.unidade[0] :
                             errorData.nome ? errorData.nome[0] :
                             'Falha ao adicionar sala.';
        throw new Error(errorMessage);
      }

      setNewSalaNome('');
      setSelectedUnidade(unidades.length > 0 ? unidades[0].id : ''); // Reseta para a primeira unidade ou vazio
      setShowAddForm(false);
      fetchSalas(); // Recarrega a lista de salas
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClick = (sala) => {
    setEditingSala(sala);
    setEditedSalaNome(sala.nome);
  };

  const handleUpdateSala = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await authenticatedFetch(`http://localhost:8000/api/salas/${editingSala.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome: editedSalaNome }),
      }, navigate);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.nome ? errorData.nome[0] : 'Falha ao atualizar sala.');
      }

      setEditingSala(null);
      setEditedSalaNome('');
      fetchSalas(); // Recarrega a lista de salas
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSala = async (id) => {
    setError(null);
    if (window.confirm('Tem certeza que deseja excluir esta sala?')) {
      try {
        const response = await authenticatedFetch(`http://localhost:8000/api/salas/${id}/`, {
          method: 'DELETE',
        }, navigate);

        if (!response.ok) {
          throw new Error('Falha ao excluir sala.');
        }

        fetchSalas(); // Recarrega a lista de salas
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return <div className="salas-container">Carregando salas...</div>;
  }

  if (error) {
    return (
      <div className="salas-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/login')} className="back-to-dashboard-button">
          Ir para Login
        </button>
      </div>
    );
  }

  return (
    <div className="salas-container">
      <h1>Lista de Salas</h1>

      {error && <p className="error-message">{error}</p>}

      <button onClick={() => setShowAddForm(!showAddForm)} className="add-button">
        {showAddForm ? 'Cancelar Adição' : 'Adicionar Nova Sala'}
      </button>

      {showAddForm && (
        <form onSubmit={handleAddSala} className="add-edit-form">
          <input
            type="text"
            placeholder="Nome da Sala"
            value={newSalaNome}
            onChange={(e) => setNewSalaNome(e.target.value)}
            required
          />
          <select
            value={selectedUnidade}
            onChange={(e) => setSelectedUnidade(e.target.value)}
            required
          >
            <option value="">Selecione uma Unidade</option>
            {unidades.map(unidade => (
              <option key={unidade.id} value={unidade.id}>
                {unidade.nome}
              </option>
            ))}
          </select>
          <button type="submit">Salvar Sala</button>
        </form>
      )}

      {editingSala && (
        <form onSubmit={handleUpdateSala} className="add-edit-form">
          <h2>Editar Sala</h2>
          <input
            type="text"
            value={editedSalaNome}
            onChange={(e) => setEditedSalaNome(e.target.value)}
            required
          />
          <button type="submit">Atualizar Sala</button>
          <button type="button" onClick={() => setEditingSala(null)}>Cancelar</button>
        </form>
      )}

      {salas.length === 0 ? (
        <p>Nenhuma sala encontrada.</p>
      ) : (
        <ul className="salas-list">
          {salas.map(sala => (
            <li key={sala.id} className="sala-item">
              {sala.nome}
              <div>
                <button onClick={() => handleEditClick(sala)} className="edit-button">Editar</button>
                <button onClick={() => handleDeleteSala(sala.id)} className="delete-button">Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => navigate('/dashboard')} className="back-to-dashboard-button">
        Voltar ao Dashboard
      </button>
    </div>
  );
}

export default Salas;