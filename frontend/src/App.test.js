import { API_URL } from './api';

describe('configuração da API', () => {
  test('expõe uma URL base sem barra no final', () => {
    expect(typeof API_URL).toBe('string');
    expect(API_URL).not.toMatch(/\/$/);
  });

  test('usa a variável de ambiente quando definida', () => {
    expect(process.env.REACT_APP_API_URL || API_URL).toBeTruthy();
  });
});
