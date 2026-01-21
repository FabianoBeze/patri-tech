import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Certifique-se de que esta linha está presente
import logo from './logo.svg'; // Se tiver logo

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
      const response = await axios.post('http://127.0.0.1:8000/api/token/', {
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
        <img src="/brasao-marica.png" alt="Brasão de Maricá" className="login-logo" />
        <h1>Secretaria de Educação</h1>
        <h2>Gestão Patrimonial</h2>
        
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