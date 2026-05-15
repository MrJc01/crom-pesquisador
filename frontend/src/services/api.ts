import type { SearchResponse, LinkDetail, LinkComment } from './types';

const API_BASE = import.meta.env.DEV ? 'http://localhost:8098/api' : '/api';

export async function search(query: string, page = 1): Promise<SearchResponse> {
  const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&page=${page}`);
  if (!response.ok) {
    throw new Error('Failed to fetch search results');
  }
  return response.json();
}

export async function getSuggestions(query: string): Promise<string[]> {
  const response = await fetch(`${API_BASE}/suggest?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export async function chatAI(message: string): Promise<string> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `message=${encodeURIComponent(message)}`,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch chat response');
  }
  return response.json();
}

export async function getLinkDetail(id: string): Promise<LinkDetail> {
  const response = await fetch(`${API_BASE}/link/${encodeURIComponent(id)}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Node not found');
    }
    throw new Error('Failed to fetch link details');
  }
  return response.json();
}

export async function postComment(linkId: string, content: string): Promise<LinkComment> {
  const response = await fetch(`${API_BASE}/link/${encodeURIComponent(linkId)}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to post comment');
  }
  return response.json();
}

// Exportar referência ao API_BASE para uso em outros módulos
export { API_BASE };
