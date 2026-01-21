import React from 'react';
import { FaHistory, FaTimes, FaUser } from 'react-icons/fa';

function HistoricoModal({ isOpen, onClose, historico, nomeBem }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '8px', width: '500px', maxWidth: '90%',
        maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}>
        {/* Cabeçalho */}
        <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}>
                <FaHistory /> Histórico: {nomeBem}
            </h3>
            <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}>
                <FaTimes size={18} />
            </button>
        </div>

        {/* Lista de Histórico (Timeline) */}
        <div style={{ padding: '20px' }}>
            {(!historico || historico.length === 0) ? (
                <p style={{ textAlign: 'center', color: '#999' }}>Nenhuma movimentação registrada.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {historico.map((item) => (
                        <li key={item.id} style={{ 
                            borderLeft: '2px solid #007bff', paddingLeft: '15px', marginBottom: '20px', position: 'relative' 
                        }}>
                            {/* Bolinha da timeline */}
                            <div style={{ 
                                position: 'absolute', left: '-6px', top: '0', width: '10px', height: '10px', 
                                borderRadius: '50%', backgroundColor: '#007bff' 
                            }}></div>
                            
                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                                {new Date(item.data).toLocaleString('pt-BR')}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
                                {item.descricao}
                            </div>
                            <div style={{ fontSize: '12px', color: '#555', display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#f0f9ff', padding: '4px 8px', borderRadius: '4px', width: 'fit-content' }}>
                                <FaUser size={10} /> Por: {item.usuario_nome || 'Sistema'}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>
    </div>
  );
}

export default HistoricoModal;