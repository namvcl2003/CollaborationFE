import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Loading from '../common/Loading';

const ProtectedRoute = ({ children, requiredLevel }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredLevel && user?.role?.RoleLevel < requiredLevel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
          <p className="text-xl text-gray-600">Bạn không có quyền truy cập trang này</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;