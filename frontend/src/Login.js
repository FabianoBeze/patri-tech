import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { API_URL } from './api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // O endereço agora é /api/token/ (padrão JWT)
      const response = await axios.post(`${API_URL}/api/token/`, {
        username: username, // O Django espera 'username', não 'email'
        password: password
      });

      // Se deu certo, salva o token
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Manda para o Dashboard
      navigate('/dashboard');
      
    } catch (err) {
      console.error("Erro no login:", err);
      if (err.response && err.response.status === 401) {
        setError('Usuário ou senha incorretos.');
      } else {
        setError('Erro ao conectar com o servidor. Verifique se o Django está rodando.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo" aria-hidden="true">PT</div>
        <h1>PATRI-TECH</h1>
        <h2>Gestão de Patrimônio</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Usuário</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário (ex: admin)"
            />
          </div>
          
          <div className="form-group">
            <label>Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
            />
          </div>
          
          <button type="submit" className="btn-login">Entrar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;