// URL base da API do Django.
// Configure REACT_APP_API_URL no arquivo `.env` (veja `.env.example`).
const DEFAULT_API_URL = 'http://127.0.0.1:8000';

export const API_URL = (process.env.REACT_APP_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');

export default API_URL;
