export interface StatsSummary {
  totalReports: number;
  criticalReports: number;
  pendingReports: number;
  resolvedReports: number;
  categoryBreakdown: Record<string, number>;
  urgencyBreakdown: Record<string, number>;
}

export interface Report {
  _id: string;
  description: string;
  location: string;
  name?: string;
  contact?: string;
  language: 'bn' | 'en' | 'unknown';
  category: 'medical' | 'fire' | 'accident' | 'crime' | 'flood' | 'utility' | 'public_service' | 'infrastructure' | 'other' | null;
  urgency: 'low' | 'medium' | 'high' | 'critical' | null;
  summary: string | null;
  suggestedAction: string | null;
  citizenAdvice: string | null;
  confidence: number | null;
  possibleDuplicate: boolean;
  matchedReportId: string | null;
  status: 'pending' | 'in_review' | 'assigned' | 'resolved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ReportsFilter {
  category?: string;
  urgency?: string;
  status?: string;
  search?: string;
  contact?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface ReportsResponse {
  reports: Report[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const BASE_URL = '';

function getHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  let activeToken = token;
  if (!activeToken && typeof window !== 'undefined') {
    activeToken = localStorage.getItem('crisisdesk_admin_token') || undefined;
  }

  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  return data.data; // Standard ApiResponse structure wraps payload in .data
}

export const api = {
  // 0. Create Report (Citizen submission)
  async createReport(reportData: {
    description: string;
    location: string;
    name?: string;
    contact?: string;
    language?: string;
  }): Promise<Report> {
    const res = await fetch(`${BASE_URL}/api/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });
    return handleResponse<Report>(res);
  },

  // 1. Get Stats Summary
  async getStatsSummary(): Promise<StatsSummary> {
    const res = await fetch(`${BASE_URL}/api/reports/stats/summary`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<StatsSummary>(res);
  },

  // 2. Get Reports List
  async getReports(filters: ReportsFilter = {}): Promise<ReportsResponse> {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });

    const queryString = query.toString();
    const url = `${BASE_URL}/api/reports${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<ReportsResponse>(res);
  },

  // 3. Get Report by ID
  async getReportById(id: string): Promise<Report> {
    const res = await fetch(`${BASE_URL}/api/reports/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Report>(res);
  },

  // 4. Update Report Status
  async updateReportStatus(id: string, status: string): Promise<Report> {
    const res = await fetch(`${BASE_URL}/api/reports/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<Report>(res);
  },

  // 5. Delete Report
  async deleteReport(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/api/reports/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `HTTP error! status: ${res.status}`);
    }
    return data.data;
  },

  // 6. Admin Login
  async adminLogin(credentials: { username: string; password: string }): Promise<{ token: string }> {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `HTTP error! status: ${res.status}`);
    }
    const tokenData = data.data;
    if (tokenData && tokenData.token && typeof window !== 'undefined') {
      localStorage.setItem('crisisdesk_admin_token', tokenData.token);
    }
    return tokenData;
  },
};
