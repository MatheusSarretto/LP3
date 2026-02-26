import { jwtDecode } from "jwt-decode";

export const API_URL = 'http://localhost:8080/api';

export const parseJwt = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Erro ao decodificar token", error);
    return null;
  }
};

export const fetchWithAuth = async (url, method = 'GET', body = null, token) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const config = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  };

  const response = await fetch(`${API_URL}${url}`, config);
  
  const contentType = response.headers.get("content-type");
  if (contentType && (contentType.includes("application/pdf") || contentType.includes("spreadsheet"))) {
      if (!response.ok) throw new Error('Erro ao baixar arquivo');
      return response.blob();
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error('Sessão expirada ou sem permissão.');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro na requisição');
  }

  if (response.status === 204) return null;
  return response.json();
};