import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Loading from './components/common/Loading';
import Layout from './components/layout/Layout';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import './styles/toast.css';

// Chat Components
import ChatButton from './components/chat/ChatButton';
import ChatWindow from './components/chat/ChatWindow';

// Pages
import AdminDashboard from './pages/AdminDashboard';
import CreateDocument from './pages/CreateDocument';
import Dashboard from './pages/Dashboard';
import DepartmentApprovedDocuments from './pages/DepartmentApprovedDocuments';
import DepartmentDetail from './pages/DepartmentDetail';
import DepartmentManagement from './pages/DepartmentManagement';
import DocumentDetails from './pages/DocumentDetails';
import Documents from './pages/Documents';
import Login from './pages/Login';
import MyAssignments from './pages/MyAssignments';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import TemplateManagement from './pages/TemplateManagement';
import Users from './pages/Users';
function App() {
  const { checkAuth, isLoading } = useAuthStore();
  const { initDarkMode } = useThemeStore();

  useEffect(() => {
    checkAuth();
    initDarkMode(); // Initialize dark mode from localStorage
  }, [checkAuth, initDarkMode]);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <Layout>
                  <Documents />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/documents/create"
            element={
              <ProtectedRoute requiredLevel={1}>
                <Layout>
                  <CreateDocument />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/documents/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <DocumentDetails />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyAssignments />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/department-approved"
            element={
              <ProtectedRoute>
                <Layout>
                  <DepartmentApprovedDocuments />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <Notifications />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute requiredLevel={3}>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredLevel={4}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute requiredLevel={4}>
                <Layout>
                  <DepartmentManagement />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/departments/:id"
            element={
              <ProtectedRoute requiredLevel={4}>
                <Layout>
                  <DepartmentDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/templates"
            element={
              <ProtectedRoute requiredLevel={3}>
                <Layout>
                  <TemplateManagement />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
                  <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">Không tìm thấy trang</p>
                  <a href="/dashboard" className="mt-6 inline-block text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                    Quay về trang chủ →
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>

      {/* Modern Toast Notifications */}
      <Toaster
        position="top-center"
        containerClassName="modern-toast-container"
        toastOptions={{
          duration: 3000,
          className: 'modern-toast',
          style: {
            background: '#fff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '0',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
          },
          success: {
            duration: 2500,
            className: 'modern-toast',
          },
          error: {
            duration: 3500,
            className: 'modern-toast',
          },
          loading: {
            className: 'modern-toast modern-toast-loading',
          },
        }}
      />

      {/* AI Chat Components - Available on all pages */}
      <ChatButton />
      <ChatWindow />
    </>
  );
}

export default App;