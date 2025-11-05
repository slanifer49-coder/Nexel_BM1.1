const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const CANDIDATE_BASE_URLS = [BASE_URL];

// Force using the first URL for debugging
console.log('[API] Using base URL:', CANDIDATE_BASE_URLS[0]);

async function fetchWithFallback(path: string, init?: RequestInit) {
  let lastError: unknown = null;
  
  // Log the request
  console.log(`[API] Attempting to fetch: ${path}`);
  
  // Get token from localStorage for authenticated requests
  const token = localStorage.getItem('token');
  
  for (const base of CANDIDATE_BASE_URLS) {
    try {
      console.log(`[API] Trying base URL: ${base}`);
      const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
      
      // Merge headers with auth token if available
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(init?.headers || {})
      };
      
      const res = await fetch(url, {
        ...init,
        headers,
        credentials: 'include'
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error(`[API] Error response from ${url}:`, {
          status: res.status,
          statusText: res.statusText,
          error: errorData
        });
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }
      
      console.log(`[API] Successfully fetched from: ${url}`);
      return res;
    } catch (err) {
      console.error(`[API] Error with base ${base}:`, err);
      lastError = err;
      // Try next base URL
    }
  }
  
  // If all failed, log and throw the last error
  console.error('[API] All base URLs failed');
  throw lastError ?? new Error('All API base URLs failed');
}

class ApiService {
  private static getHeaders(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }
  
  // Admin API
  static async getAdminStats(token: string) {
    const response = await fetchWithFallback('/admin/stats', {
      headers: this.getHeaders(token),
    });
    return response.json();
  }
  
  static async getAdminUsers(token: string) {
    const response = await fetchWithFallback('/admin/users', {
      headers: this.getHeaders(token),
    });
    return response.json();
  }
  
  static async updateAdminUser(userId: string, updates: any, token: string) {
    const response = await fetchWithFallback(`/admin/users/${userId}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(updates),
    });
    return response.json();
  }
  
  static async deleteAdminUser(userId: string, token: string) {
    const response = await fetchWithFallback(`/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    return response.json();
  }

  // Assets API
  static async getAssets(params: Record<string, string>, token?: string) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithFallback(`/assets?${queryString}`, {
      headers: this.getHeaders(token),
    });
    return response.json();
  }

  // Library API
  static async getLibraryItems(token: string) {
    const response = await fetchWithFallback('/library', {
      headers: this.getHeaders(token),
    });
    return response.json();
  }

  static async addToLibrary(itemId: string, token: string) {
    const response = await fetchWithFallback(`/library/${itemId}`, {
      method: 'POST',
      headers: this.getHeaders(token),
    });
    return response.json();
  }

  static async removeFromLibrary(itemId: string, token: string) {
    const response = await fetchWithFallback(`/library/${itemId}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    return response.json();
  }

  static async getAssetById(id: string, token?: string) {
    const response = await fetchWithFallback(`/assets/${id}`, {
      headers: this.getHeaders(token),
    });
    return response.json();
  }

  static async createAsset(formData: FormData, token: string) {
    const response = await fetchWithFallback(`/assets`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  }

  static async updateAsset(id: string, updates: any, token: string) {
    const response = await fetchWithFallback(`/assets/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify(updates),
    });
    return response.json();
  }

  static async deleteAsset(id: string, token: string) {
    const response = await fetchWithFallback(`/assets/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    return response.json();
  }

  // Tutorials API
  static async getTutorials(params: Record<string, string>, token?: string) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithFallback(`/tutorials?${queryString}`, {
      headers: this.getHeaders(token),
    });
    return response.json();
  }

  static async getTutorialById(id: string, token?: string) {
    const response = await fetchWithFallback(`/tutorials/${id}`, {
      headers: this.getHeaders(token),
    });
    return response.json();
  }

  static async createTutorial(formData: FormData, token: string) {
    const response = await fetchWithFallback(`/tutorials`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  }

  // Community Posts API
  static async getPosts(params: Record<string, string>, token?: string) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithFallback(`/posts?${queryString}`, {
      headers: this.getHeaders(token),
    });
    return response.json();
  }
  
  // Showcase Games API
  static async getShowcaseGames(token?: string) {
    console.log('[API] Fetching showcase games');
    const response = await fetchWithFallback('/showcase', {
      headers: this.getHeaders(token),
    });
    return response.json();
  }
  
  static async addShowcaseGame(gameData: any, token: string) {
    const response = await fetchWithFallback(`/showcase`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(gameData),
    });
    return response.json();
  }
  
  static async deleteShowcaseGame(id: string, token: string) {
    const response = await fetchWithFallback(`/showcase/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    return response.json();
  }
  
  static async toggleLikeShowcaseGame(id: string, like: boolean, token: string) {
    const response = await fetchWithFallback(`/showcase/${id}/like`, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify({ like }),
    });
    const data = await response.json();
    
    if (!response.ok) {
      // Handle authentication and subscription requirements
      if (data.requiresAuth) {
        throw new Error('Please log in to interact with showcase games');
      }
      if (data.requiresUpgrade) {
        throw new Error('Upgrade your plan to interact with showcase games');
      }
      throw new Error(data.message || 'Failed to update showcase game');
    }
    
    return data;
  }

  static async getPostById(id: string, token?: string) {
    const response = await fetchWithFallback(`/posts/${id}`, {
      headers: this.getHeaders(token),
    });
    return response.json();
  }

  static async createPost(formData: FormData, token: string) {
    const response = await fetchWithFallback(`/posts`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  }

  static async addComment(postId: string, content: string, token: string) {
    const response = await fetchWithFallback(`/posts/${postId}/comments`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ content }),
    });
    return response.json();
  }

  // User Actions
  static async toggleLike(type: 'tutorial' | 'post', id: string, token: string) {
    const response = await fetchWithFallback(`/${type}s/${id}/like`, {
      method: 'POST',
      headers: this.getHeaders(token),
    });
    return response.json();
  }

  static async reportPost(id: string, token: string) {
    const response = await fetchWithFallback(`/posts/${id}/report`, {
      method: 'POST',
      headers: this.getHeaders(token),
    });
    return response.json();
  }

  // Leaderboard API
  static async getLeaderboard() {
    const response = await fetchWithFallback(`/leaderboard`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  // Showcase API
  static async getShowcases() {
    const response = await fetchWithFallback(`/showcase`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  static async likeShowcase(id: string, like: boolean, token?: string) {
    const response = await fetchWithFallback(`/showcase/${id}/like`, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify({ like }),
    });
    return response.json();
  }

  // Progress API
  static async getProgress(userId: string, token: string) {
    const response = await fetchWithFallback(`/progress/${userId}`, {
      headers: this.getHeaders(token),
    });
    return response.json();
  }

  static async updateProgress(userId: string, body: any, token: string) {
    const response = await fetchWithFallback(`/progress/${userId}`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(body),
    });
    return response.json();
  }

  // Auth API
  static async login(email: string, password: string) {
    const response = await fetchWithFallback('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  static async register(username: string, email: string, password: string) {
    const response = await fetchWithFallback('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    return response.json();
  }

  static async getProfile(token: string) {
    const response = await fetchWithFallback('/auth/profile', {
      headers: this.getHeaders(token),
    });
    return response.json();
  }
}

export default ApiService;