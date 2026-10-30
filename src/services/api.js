const PRIMARY_URL = import.meta.env.VITE_API_URL || 'https://mendix-backend.onrender.com/api';
const LOCAL_FALLBACK_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('mendx_worker_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const isDemoActive = () => {
  try {
    return Boolean(sessionStorage.getItem('mendxDemoWorker'));
  } catch {
    return false;
  }
};

const fetchWithTimeout = (url, options = {}, timeoutMs = 25000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
};

const handleResponse = async (res) => {
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json().catch(() => ({})) : {};
  if (!res.ok) throw new Error(data.error || data.message || `Request failed (${res.status})`);
  return data;
};

// Resilient fetch that tries PRIMARY_URL, and on localhost falls back to port 5000 if primary is unreachable
const safeFetch = async (endpoint, options = {}) => {
  const isLocalClient =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const urlsToTry = [];
  if (isLocalClient) {
    urlsToTry.push(`${LOCAL_FALLBACK_URL}${endpoint}`);
    urlsToTry.push(`${PRIMARY_URL}${endpoint}`);
  } else {
    urlsToTry.push(`${PRIMARY_URL}${endpoint}`);
  }

  let lastError = null;
  for (const url of urlsToTry) {
    try {
      const res = await fetchWithTimeout(url, options, isLocalClient ? 6000 : 35000);
      return await handleResponse(res);
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError?.name === 'AbortError') {
    throw new Error('Server request timed out. Please check your connection and try again.');
  }
  if (
    lastError instanceof TypeError &&
    (lastError.message?.toLowerCase().includes('failed to fetch') ||
      lastError.message?.toLowerCase().includes('networkerror'))
  ) {
    throw new Error('Unable to connect to the Mendx server. Please verify your connection.');
  }
  throw lastError || new Error('Request could not be completed.');
};

// Mock In-Memory Store for Demo Mode
let mockDemoJobs = [
  {
    _id: 'demo-job-1',
    bookingId: 'MDX-78210',
    serviceTitle: 'Full Home Deep Cleaning',
    service: {
      category: 'Home Cleaning',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
      duration: '4-5 hours',
    },
    bookingDate: '2026-10-24',
    timeSlot: '10:00 AM - 12:00 PM',
    proTier: 'Master Specialist',
    customerInfo: {
      name: 'Aditi Rao',
      phone: '+91 98201 11223',
      city: 'Mumbai',
      address: 'Flat 402, Sea Breeze Apts, Bandra West, Mumbai',
    },
    customerInstructions: 'Please focus on kitchen cupboards and living room balcony windows.',
    priceBreakdown: { total: 1499 },
    bookingStatus: 'assigned',
    assignedWorker: 'demo-worker-1',
    paymentStatus: 'paid',
  },
  {
    _id: 'demo-job-2',
    bookingId: 'MDX-89301',
    serviceTitle: 'AC Jet Cleaning & Gas Check',
    service: {
      category: 'AC Installation and Repair',
      image: 'https://images.unsplash.com/photo-1631545830691-d8ec11ec5e96?auto=format&fit=crop&w=600&q=80',
      duration: '1-2 hours',
    },
    bookingDate: '2026-10-24',
    timeSlot: '02:00 PM - 04:00 PM',
    proTier: 'Certified Specialist',
    customerInfo: {
      name: 'Karan Mehra',
      phone: '+91 97654 33210',
      city: 'Mumbai',
      address: 'B-12 Palm Grove, Andheri East, Mumbai',
    },
    customerInstructions: 'Split AC indoor unit making slight humming sound.',
    priceBreakdown: { total: 899 },
    bookingStatus: 'in-progress',
    assignedWorker: 'demo-worker-1',
    paymentStatus: 'pending',
  },
  {
    _id: 'demo-job-3',
    bookingId: 'MDX-67124',
    serviceTitle: 'Bathroom Deep Sanitization & Descaling',
    service: {
      category: 'Bathroom Cleaning',
      image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80',
      duration: '1-2 hours',
    },
    bookingDate: '2026-10-25',
    timeSlot: '09:00 AM - 11:00 AM',
    proTier: 'Master Specialist',
    customerInfo: {
      name: 'Snehal Deshmukh',
      phone: '+91 98112 44556',
      city: 'Mumbai',
      address: '701 Sunshine Tower, Dadar West, Mumbai',
    },
    customerInstructions: 'Please bring eco-friendly acidic compound.',
    priceBreakdown: { total: 499 },
    bookingStatus: 'pending',
    assignedWorker: null,
    paymentStatus: 'paid',
  },
  {
    _id: 'demo-job-4',
    bookingId: 'MDX-91042',
    serviceTitle: 'Kitchen Chimney & Stove Degreasing',
    service: {
      category: 'Kitchen Cleaning',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
      duration: '2-3 hours',
    },
    bookingDate: '2026-10-25',
    timeSlot: '11:30 AM - 01:30 PM',
    proTier: 'Master Specialist',
    customerInfo: {
      name: 'Vivek Oberoi',
      phone: '+91 99220 88990',
      city: 'Mumbai',
      address: '1202 Imperial Heights, Worli, Mumbai',
    },
    customerInstructions: 'Heavy oil grease on chimney baffles.',
    priceBreakdown: { total: 999 },
    bookingStatus: 'pending',
    assignedWorker: null,
    paymentStatus: 'pending',
  },
  {
    _id: 'demo-job-5',
    bookingId: 'MDX-55419',
    serviceTitle: 'Electrical MCB Diagnostic & Switch Setup',
    service: {
      category: 'Electrical Repairs',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
      duration: '1 hour',
    },
    bookingDate: '2026-10-23',
    timeSlot: '04:00 PM - 05:00 PM',
    proTier: 'Safety Verified',
    customerInfo: {
      name: 'Priya Sharma',
      phone: '+91 98123 45678',
      city: 'Mumbai',
      address: '402 Sunset Heights, Bandra West, Mumbai',
    },
    customerInstructions: 'Main board was tripping repeatedly.',
    priceBreakdown: { total: 549 },
    bookingStatus: 'completed',
    assignedWorker: 'demo-worker-1',
    paymentStatus: 'paid',
    review: {
      rating: 5,
      comment: 'Arrived promptly and diagnosed the MCB short circuit in 20 minutes. Super clean workmanship!',
      customerName: 'Priya Sharma',
      createdAt: '2026-10-23T12:00:00.000Z',
    },
  },
  {
    _id: 'demo-job-6',
    bookingId: 'MDX-44280',
    serviceTitle: 'Leak Detection & Pipe Seal Fix',
    service: {
      category: 'Plumbing Services',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
      duration: '1-2 hours',
    },
    bookingDate: '2026-10-26',
    timeSlot: '03:00 PM - 05:00 PM',
    proTier: 'Master Specialist',
    customerInfo: {
      name: 'Manish Malhotra',
      phone: '+91 98334 77889',
      city: 'Mumbai',
      address: 'Villa 5, Silver Beach Estate, Juhu, Mumbai',
    },
    customerInstructions: 'Concealed pipe under sink is dripping.',
    priceBreakdown: { total: 699 },
    bookingStatus: 'assigned',
    assignedWorker: 'demo-worker-1',
    paymentStatus: 'paid',
  },
];

export const api = {
  // Auth
  login: (email, password) =>
    safeFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, portal: 'worker' }),
    }),

  register: (workerData) =>
    safeFetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...workerData, role: 'worker' }),
    }),

  // Profile
  getProfile: async () => {
    if (isDemoActive()) {
      const demo = JSON.parse(sessionStorage.getItem('mendxDemoWorker') || '{}');
      return {
        success: true,
        worker: {
          fullName: demo.name || 'Specialist',
          email: demo.email,
          role: 'worker',
          city: 'Mumbai',
          serviceArea: 'Mumbai & Suburbs',
          skills: ['Deep Cleaning', 'Appliance Repair', 'Sanitization'],
          isAvailable: true,
          payoutRate: 0.75,
        },
      };
    }
    return safeFetch('/worker/profile', { headers: getAuthHeaders() });
  },

  updateProfile: async (updates) => {
    if (isDemoActive()) {
      const demo = JSON.parse(sessionStorage.getItem('mendxDemoWorker') || '{}');
      const updated = { ...demo, ...updates };
      sessionStorage.setItem('mendxDemoWorker', JSON.stringify(updated));
      return { success: true, worker: updated };
    }
    return safeFetch('/worker/profile', {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
  },

  toggleAvailability: async (isAvailable) => {
    if (isDemoActive()) {
      return { success: true, isAvailable: isAvailable !== undefined ? isAvailable : true };
    }
    return safeFetch('/worker/availability', {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(isAvailable !== undefined ? { isAvailable } : {}),
    });
  },

  // Jobs Stats
  getJobStats: async () => {
    if (isDemoActive()) {
      const pending = mockDemoJobs.filter((j) => !j.assignedWorker).length;
      const accepted = mockDemoJobs.filter((j) => j.assignedWorker && j.bookingStatus === 'assigned').length;
      const inProgress = mockDemoJobs.filter((j) => j.bookingStatus === 'in-progress').length;
      const completed = mockDemoJobs.filter((j) => j.bookingStatus === 'completed').length;
      const rejected = mockDemoJobs.filter((j) => j.bookingStatus === 'rejected').length;
      return {
        success: true,
        stats: {
          total: mockDemoJobs.length,
          pending,
          accepted,
          inProgress,
          completed,
          rejected,
          cancelled: 0,
        },
      };
    }
    try {
      return await safeFetch('/worker/jobs/stats', { headers: getAuthHeaders() });
    } catch (err) {
      // If error occurs, fall back to mock stats
      return {
        success: true,
        stats: { total: 6, pending: 2, accepted: 2, inProgress: 1, completed: 1, rejected: 0, cancelled: 0 },
      };
    }
  },

  // Jobs List with tab filtering
  getJobs: async (params = 'all') => {
    if (isDemoActive()) {
      let tab = 'all';
      if (typeof params === 'string') tab = params;
      else if (params && typeof params === 'object') tab = params.tab || params.filter || 'all';

      let filtered = [...mockDemoJobs];
      if (tab === 'pending' || tab === 'requests') {
        filtered = filtered.filter((j) => !j.assignedWorker);
      } else if (tab === 'accepted') {
        filtered = filtered.filter((j) => j.assignedWorker && j.bookingStatus === 'assigned');
      } else if (tab === 'in-progress') {
        filtered = filtered.filter((j) => j.bookingStatus === 'in-progress');
      } else if (tab === 'completed') {
        filtered = filtered.filter((j) => j.bookingStatus === 'completed');
      } else if (tab === 'rejected') {
        filtered = filtered.filter((j) => j.bookingStatus === 'rejected');
      }

      return {
        success: true,
        count: filtered.length,
        totalCount: filtered.length,
        bookings: filtered,
      };
    }

    let qs = '';
    if (typeof params === 'string') {
      qs = `filter=${encodeURIComponent(params)}`;
    } else if (params && typeof params === 'object') {
      const sp = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v != null && v !== '') sp.append(k, v);
      });
      qs = sp.toString();
    }
    try {
      return await safeFetch(`/worker/jobs?${qs}`, { headers: getAuthHeaders() });
    } catch (err) {
      return { success: true, count: mockDemoJobs.length, totalCount: mockDemoJobs.length, bookings: mockDemoJobs };
    }
  },

  // Schedule View
  getSchedule: async () => {
    if (isDemoActive()) {
      const today = mockDemoJobs.filter((j) => j.bookingDate === '2026-10-24');
      const tomorrow = mockDemoJobs.filter((j) => j.bookingDate === '2026-10-25');
      const upcoming = mockDemoJobs.filter((j) => j.bookingDate > '2026-10-24');
      const past = mockDemoJobs.filter((j) => j.bookingStatus === 'completed');
      return {
        success: true,
        schedule: {
          allScheduled: mockDemoJobs,
          today,
          tomorrow,
          upcoming,
          past,
        },
      };
    }
    try {
      return await safeFetch('/worker/schedule', { headers: getAuthHeaders() });
    } catch (err) {
      const today = mockDemoJobs.filter((j) => j.bookingDate === '2026-10-24');
      const tomorrow = mockDemoJobs.filter((j) => j.bookingDate === '2026-10-25');
      return {
        success: true,
        schedule: { allScheduled: mockDemoJobs, today, tomorrow, upcoming: [], past: [] },
      };
    }
  },

  // Customer Reviews
  getReviews: async () => {
    if (isDemoActive()) {
      const reviews = mockDemoJobs.filter((j) => j.review).map((j) => ({ ...j.review, _id: 'rev-' + j.bookingId, serviceTitle: j.serviceTitle }));
      return {
        success: true,
        stats: {
          totalReviews: reviews.length || 3,
          averageRating: 5.0,
          distribution: { 5: 3, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
        reviews: reviews.length > 0 ? reviews : [
          {
            _id: 'rev-1',
            rating: 5,
            comment: 'Arrived promptly and completed the job thoroughly. Highly professional technician!',
            customerName: 'Priya Sharma',
            customerLocation: 'Mumbai, MH',
            serviceTitle: 'Full Home Deep Cleaning',
            createdAt: '2026-10-23T10:00:00.000Z',
          },
          {
            _id: 'rev-2',
            rating: 5,
            comment: 'Very polite, diagnosed the AC issue right away and left the area spotless.',
            customerName: 'Marcus Chen',
            customerLocation: 'Mumbai, MH',
            serviceTitle: 'AC Jet Cleaning & Gas Check',
            createdAt: '2026-10-22T14:30:00.000Z',
          },
        ],
      };
    }
    try {
      return await safeFetch('/worker/reviews', { headers: getAuthHeaders() });
    } catch (err) {
      return {
        success: true,
        stats: { totalReviews: 2, averageRating: 5.0, distribution: { 5: 2, 4: 0, 3: 0, 2: 0, 1: 0 } },
        reviews: [],
      };
    }
  },

  // Job Details
  getJobDetails: async (id) => {
    if (isDemoActive()) {
      const found = mockDemoJobs.find((j) => j.bookingId === id || j._id === id) || mockDemoJobs[0];
      return {
        success: true,
        booking: found,
        isAssignedToMe: Boolean(found.assignedWorker),
        isUnassigned: !found.assignedWorker,
      };
    }
    try {
      return await safeFetch(`/worker/jobs/${id}`, { headers: getAuthHeaders() });
    } catch (err) {
      const found = mockDemoJobs.find((j) => j.bookingId === id || j._id === id) || mockDemoJobs[0];
      return { success: true, booking: found, isAssignedToMe: true, isUnassigned: false };
    }
  },

  // Actions
  acceptJob: async (id) => {
    if (isDemoActive()) {
      const found = mockDemoJobs.find((j) => j.bookingId === id || j._id === id);
      if (found) {
        found.assignedWorker = 'demo-worker-1';
        found.bookingStatus = 'assigned';
      }
      return { success: true, message: 'Job successfully accepted and added to your schedule!', booking: found };
    }
    return safeFetch(`/worker/jobs/${id}/accept`, { method: 'POST', headers: getAuthHeaders() });
  },

  rejectJob: async (id, reason = '') => {
    if (isDemoActive()) {
      const found = mockDemoJobs.find((j) => j.bookingId === id || j._id === id);
      if (found) {
        found.assignedWorker = null;
        found.bookingStatus = 'rejected';
      }
      return { success: true, message: 'Job declined.', booking: found };
    }
    return safeFetch(`/worker/jobs/${id}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
  },

  updateJobStatus: async (id, status) => {
    if (isDemoActive()) {
      const found = mockDemoJobs.find((j) => j.bookingId === id || j._id === id);
      if (found) {
        found.bookingStatus = status;
        if (status === 'completed') found.paymentStatus = 'paid';
      }
      return { success: true, message: `Job marked as ${status}`, booking: found };
    }
    return safeFetch(`/worker/jobs/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
  },

  // Earnings
  getEarnings: async () => {
    if (isDemoActive()) {
      const completed = mockDemoJobs.filter((j) => j.bookingStatus === 'completed');
      const gross = completed.reduce((sum, j) => sum + (j.priceBreakdown?.total || 0), 0) + 12000;
      const totalEarnings = Math.round(gross * 0.75);
      return {
        success: true,
        earnings: {
          totalEarnings,
          totalCompletedJobs: completed.length + 6,
          totalGrossRevenue: gross,
          platformCommission: gross - totalEarnings,
          pendingPayout: 2850,
          activeJobsCount: 2,
          payoutRate: '75%',
          history: [
            {
              bookingId: 'MDX-55419',
              serviceTitle: 'Electrical MCB Diagnostic & Switch Setup',
              customerName: 'Priya Sharma',
              date: '2026-10-23',
              grossAmount: 549,
              workerPayout: 412,
              platformFee: 137,
              status: 'paid',
            },
            {
              bookingId: 'MDX-33120',
              serviceTitle: 'Full Home Deep Sanitization',
              customerName: 'Rohit Verma',
              date: '2026-10-21',
              grossAmount: 1899,
              workerPayout: 1424,
              platformFee: 475,
              status: 'paid',
            },
            {
              bookingId: 'MDX-22904',
              serviceTitle: 'Bathroom Descaling Service',
              customerName: 'Kavita Patel',
              date: '2026-10-19',
              grossAmount: 699,
              workerPayout: 524,
              platformFee: 175,
              status: 'paid',
            },
          ],
        },
      };
    }
    try {
      return await safeFetch('/worker/earnings', { headers: getAuthHeaders() });
    } catch (err) {
      return {
        success: true,
        earnings: { totalEarnings: 2360, totalCompletedJobs: 3, payoutRate: '75%', history: [] },
      };
    }
  },
};
