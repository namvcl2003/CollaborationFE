import {
    AlertCircle,
    CheckCircle,
    Clock,
    FileText,
    Plus
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { documentsAPI } from '../api/documents';
import { workflowAPI } from '../api/workflow';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import { useAuthStore } from '../store/authStore';
import { formatRelativeTime } from '../utils/helpers';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pending: 0,
    approved: 0,
  });
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch documents
      const docsData = await documentsAPI.getDocuments({ page: 1, page_size: 5 });
      setRecentDocuments(docsData.items);

      // Calculate stats
      const allDocs = await documentsAPI.getDocuments({ page: 1, page_size: 100 });
      const statsCounts = {
        total: allDocs.total,
        draft: allDocs.items.filter(d => d.status?.StatusCode === 'DRAFT').length,
        pending: allDocs.items.filter(d => d.status?.StatusCode === 'PENDING').length,
        approved: allDocs.items.filter(d => d.status?.StatusCode === 'APPROVED').length,
      };
      setStats(statsCounts);

      // Fetch assignments if user is manager level
      if (user?.role?.RoleLevel >= 2) {
        const assignmentsData = await workflowAPI.getMyAssignments();
        setAssignments(assignmentsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Chào mừng, {user?.FullName}!
        </h1>
        <p className="mt-2 text-gray-600">
          {user?.role?.RoleName} - {user?.department?.DepartmentName}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileText}
          title="Tổng văn bản"
          value={stats.total}
          color="text-primary-600"
          bgColor="bg-primary-50"
        />
        <StatCard
          icon={Clock}
          title="Bản thảo"
          value={stats.draft}
          color="text-gray-600"
          bgColor="bg-gray-50"
        />
        <StatCard
          icon={AlertCircle}
          title="Chờ duyệt"
          value={stats.pending}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <StatCard
          icon={CheckCircle}
          title="Đã duyệt"
          value={stats.approved}
          color="text-green-600"
          bgColor="bg-green-50"
        />
      </div>

      {/* Quick Actions */}
      {user?.role?.RoleLevel === 1 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
          <Link to="/documents/create">
            <Button icon={Plus}>Tạo văn bản mới</Button>
          </Link>
        </div>
      )}

      {/* Assignments for managers */}
      {user?.role?.RoleLevel >= 2 && assignments.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Công việc cần xử lý ({assignments.length})
            </h2>
            <Link to="/assignments" className="text-sm text-primary-600 hover:text-primary-700">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-3">
            {assignments.slice(0, 5).map((assignment) => (
              <Link
                key={assignment.AssignmentId}
                to={`/documents/${assignment.document?.DocumentId}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {assignment.document?.Title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {assignment.document?.DocumentNumber}
                    </p>
                  </div>
                  <StatusBadge status={assignment.document?.status?.StatusCode} />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Giao bởi: {assignment.assigned_by?.FullName} • {formatRelativeTime(assignment.AssignedAt)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Documents */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Văn bản gần đây</h2>
          <Link to="/documents" className="text-sm text-primary-600 hover:text-primary-700">
            Xem tất cả →
          </Link>
        </div>
        <div className="space-y-3">
          {recentDocuments.length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có văn bản nào</p>
          ) : (
            recentDocuments.map((doc) => (
              <Link
                key={doc.DocumentId}
                to={`/documents/${doc.DocumentId}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{doc.Title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {doc.DocumentNumber}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <StatusBadge status={doc.status?.StatusCode} />
                    <StatusBadge priority={doc.Priority} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {formatRelativeTime(doc.CreatedAt)}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;