// Função para decodificar o token JWT e verificar a expiração
export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000; // tempo atual em segundos
        return decodedToken.exp < currentTime;
    } catch (e) {
        console.error("Erro ao decodificar token:", e);
        return true; // Token malformado ou outro erro
    }
};

// Função para renovar o token de acesso
const refreshAccessToken = async (refreshToken, navigate) => {
    try {
        const response = await fetch('http://localhost:8000/api/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            // Se a renovação falhar, o refresh token também pode estar expirado ou inválido
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            navigate('/login');
            throw new Error('Falha ao renovar o token. Faça login novamente.');
        }

        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        return data.access; // Retorna o novo token de acesso
    } catch (error) {
        console.error("Erro ao renovar token:", error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
        throw error;
    }
};

// Função de fetch autenticada que lida com a renovação do token
export const authenticatedFetch = async (url, options = {}, navigate) => {
    console.log(`authenticatedFetch: Attempting to fetch ${url}`);
    let token = localStorage.getItem('access_token');
    let refreshToken = localStorage.getItem('refresh_token');

    if (!token || isTokenExpired(token)) {
        if (refreshToken) {
            try {
                token = await refreshAccessToken(refreshToken, navigate);
            } catch (error) {
                // Se a renovação falhar, o erro já foi tratado e o usuário redirecionado
                throw error;
            }
        } else {
            // Não há refresh token, força o login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            navigate('/login');
            throw new Error('Token de acesso expirado e sem token de refresh. Faça login novamente.');
        }
    }

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
    };

    // Tenta a requisição com o token (novo ou existente)
    const response = await fetch(url, { ...options, headers });

    // Se a resposta for 401, pode ser que o token tenha expirado entre a verificação e a requisição
    // ou que o refresh token também tenha expirado. Força o re-login.
    if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
        throw new Error('Sessão expirada. Faça login novamente.');
    }

    return response;
};