const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('libook_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers
  });

  // Handle 204 No Content
  if (response.status === 204) {
    return { success: true };
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error(`Server returned status ${response.status}`);
  }

  if (!response.ok) {
    const errorMsg = data?.message || data?.detail || 'Request failed';
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  login: (username, password) => 
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
  signup: (userData) =>
    apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
  logout: () => 
    apiFetch('/auth/logout', { method: 'POST' }),
  getMe: () => 
    apiFetch('/auth/me')
};

export const booksApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.title) query.append('title', params.title);
    if (params.author) query.append('author', params.author);
    if (params.category) query.append('category', params.category);
    if (params.skip !== undefined) query.append('skip', params.skip);
    if (params.limit !== undefined) query.append('limit', params.limit);
    const qs = query.toString();
    return apiFetch(`/books${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => apiFetch(`/books/${id}`),
  create: (bookData) => 
    apiFetch('/books', {
      method: 'POST',
      body: JSON.stringify(bookData)
    }),
  update: (id, bookData) => 
    apiFetch(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData)
    }),
  delete: (id) => 
    apiFetch(`/books/${id}`, { method: 'DELETE' })
};

export const membersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.skip !== undefined) query.append('skip', params.skip);
    if (params.limit !== undefined) query.append('limit', params.limit);
    const qs = query.toString();
    return apiFetch(`/members${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => apiFetch(`/members/${id}`),
  create: (memberData) => 
    apiFetch('/members', {
      method: 'POST',
      body: JSON.stringify(memberData)
    }),
  update: (id, memberData) => 
    apiFetch(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData)
    }),
  delete: (id) => 
    apiFetch(`/members/${id}`, { method: 'DELETE' }),
  getMyLoans: () => apiFetch('/members/me/loans')
};

export const loansApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.member_id) query.append('member_id', params.member_id);
    if (params.book_id) query.append('book_id', params.book_id);
    if (params.skip !== undefined) query.append('skip', params.skip);
    if (params.limit !== undefined) query.append('limit', params.limit);
    const qs = query.toString();
    return apiFetch(`/loans${qs ? `?${qs}` : ''}`);
  },
  getOverdue: () => apiFetch('/loans/overdue'),
  borrow: (loanData) => 
    apiFetch('/loans', {
      method: 'POST',
      body: JSON.stringify(loanData)
    }),
  returnLoan: (id, returnData = {}) => 
    apiFetch(`/loans/${id}/return`, {
      method: 'PATCH',
      body: JSON.stringify(returnData)
    })
};

export const dashboardApi = {
  getSummary: () => apiFetch('/dashboard/summary')
};
