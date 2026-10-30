import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { WorkerLayout } from './components/Layout/WorkerLayout';
import WorkerLogin from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { JobRequestsPage } from './pages/JobRequestsPage';
import { MyJobsPage } from './pages/MyJobsPage';
import { JobsSchedulePage } from './pages/JobsSchedulePage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { EarningsPage } from './pages/EarningsPage';
import { ProfilePage } from './pages/ProfilePage';

// Automatically scroll to the top of the page when navigating between routes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<WorkerLogin />} />

          {/* Protected Worker Portal Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <WorkerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="requests" element={<JobRequestsPage />} />
            <Route path="jobs" element={<JobsSchedulePage />} />
            <Route path="schedule" element={<JobsSchedulePage />} />
            <Route path="reviews" element={<JobsSchedulePage />} />
            <Route path="jobs/:id" element={<JobDetailsPage />} />
            <Route path="earnings" element={<EarningsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
