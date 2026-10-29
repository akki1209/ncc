import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, Protected } from './auth';
import { Layout } from './components/layout';
import { Login, PasswordPage, PublicPage } from './pages';
import { AdminDashboard, StudentDashboardPage } from './dashboard';
import {
  CertificatesPage,
  EnrollmentsPage,
  ProgramDetail,
  ProgramsPage,
  SettingsPage,
  StudentDetail,
  StudentsPage,
} from './admin';
import { ProfilePage, StudentProgramDetail, StudentPrograms } from './student';
import './styles.css';
import { MilitaryHome } from './military-home';
import { AcademyAbout } from './about';
const client = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1, refetchOnWindowFocus: false },
  },
});
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<MilitaryHome />} />
            <Route path="/home-military" element={<MilitaryHome />} />
            <Route path="/home-classic" element={<PublicPage />} />
            <Route path="/about" element={<AcademyAbout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<PasswordPage />} />
            <Route path="/reset-password" element={<PasswordPage />} />
            <Route
              path="/admin"
              element={
                <Protected role="admin">
                  <Layout />
                </Protected>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="students/:id" element={<StudentDetail />} />
              <Route path="programs" element={<ProgramsPage />} />
              <Route path="programs/:id" element={<ProgramDetail />} />
              <Route path="enrollments" element={<EnrollmentsPage />} />
              <Route path="certificates" element={<CertificatesPage />} />
              <Route path="reports" element={<AdminDashboard reports />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route
              path="/student"
              element={
                <Protected role="student">
                  <Layout />
                </Protected>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="programs" element={<StudentPrograms />} />
              <Route path="programs/:id" element={<StudentProgramDetail />} />
              <Route
                path="certificates"
                element={<CertificatesPage student />}
              />
            </Route>
            <Route
              path="*"
              element={
                <div className="empty">
                  <h1>Page not found</h1>
                  <Link to="/">Return home →</Link>
                </div>
              }
            />
          </Routes>
          <Toaster position="bottom-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
