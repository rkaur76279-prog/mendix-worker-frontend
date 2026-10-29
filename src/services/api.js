const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('mendx_worker_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }
  return data;
};

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async verifyOtp(challengeId, otp) {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, otp }),
    });
    return handleResponse(res);
  },

  async resendOtp(challengeId) {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId }),
    });
    return handleResponse(res);
  },

  async register(workerData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...workerData, role: 'worker' }),
    });
    return handleResponse(res);
  },

  // Worker Profile
  async getProfile() {
    const res = await fetch(`${API_BASE}/worker/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateProfile(updates) {
    const res = await fetch(`${API_BASE}/worker/profile`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  async toggleAvailability(isAvailable) {
    const res = await fetch(`${API_BASE}/worker/availability`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(isAvailable !== undefined ? { isAvailable } : {}),
    });
    return handleResponse(res);
  },

  // Jobs
  async getJobStats() {
    const res = await fetch(`${API_BASE}/worker/jobs/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getJobs(params = 'all') {
    let queryStr = '';
    if (typeof params === 'string') {
      queryStr = `filter=${encodeURIComponent(params)}`;
    } else if (typeof params === 'object' && params !== null) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, val);
        }
      });
      queryStr = searchParams.toString();
    }
    const res = await fetch(`${API_BASE}/worker/jobs?${queryStr}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getSchedule() {
    const res = await fetch(`${API_BASE}/worker/schedule`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getReviews() {
    const res = await fetch(`${API_BASE}/worker/reviews`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getJobDetails(id) {
    const res = await fetch(`${API_BASE}/worker/jobs/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async acceptJob(id) {
    const res = await fetch(`${API_BASE}/worker/jobs/${id}/accept`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async rejectJob(id, reason = '') {
    const res = await fetch(`${API_BASE}/worker/jobs/${id}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  async updateJobStatus(id, status) {
    const res = await fetch(`${API_BASE}/worker/jobs/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  // Earnings
  async getEarnings() {
    const res = await fetch(`${API_BASE}/worker/earnings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
