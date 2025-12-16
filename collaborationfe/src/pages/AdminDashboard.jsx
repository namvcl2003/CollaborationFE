import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Clock,
  FileText,
  TrendingDown,
  TrendingUp,
  Users,
  Award,
  Activity
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { adminAPI } from '../api/admin';
import Loading from '../components/common/Loading';
import { formatRelativeTime } from '../utils/helpers';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [departmentsPerformance, setDepartmentsPerformance] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [overdueDocuments, setOverdueDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, performanceData, usersData, overdueData] = await Promise.all([
        adminAPI.getSystemStats(),
        adminAPI.getDepartmentsPerformance(),
        adminAPI.getTopUsers(10),
        adminAPI.getOverdueDocuments(),
      ]);

      console.log('Admin dashboard data loaded:', { statsData, performanceData, usersData, overdueData });

      setStats(statsData);
      setDepartmentsPerformance(performanceData);
      setTopUsers(usersData);
      setOverdueDocuments(overdueData);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      console.error('Error details:', error.response?.data);

      if (error.response?.status === 403) {
        toast.error('Bạn không có quyền truy cập Admin Dashboard!');
      } else if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
      } else {
        toast.error('Không thể tải dữ liệu Admin Dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#6366f1',
    purple: '#8b5cf6',
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, bgColor, trend }) => (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${bgColor} p-6 shadow-lg hover:shadow-xl transition-all`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && (
            <div className="flex items-center space-x-1">
              {trend && (trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              ))}
              <span className="text-sm text-gray-600">{subtitle}</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10`}>
          <Icon className={`h-10 w-10 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <Loading fullScreen />;
  }

  const statusChartData = stats ? [
    { name: 'Đã duyệt', value: stats.approved_documents, color: COLORS.success },
    { name: 'Chờ duyệt', value: stats.pending_documents, color: COLORS.warning },
    { name: 'Bản thảo', value: stats.draft_documents, color: COLORS.info },
    { name: 'Từ chối', value: stats.rejected_documents, color: COLORS.danger },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2 flex items-center">
            <Activity className="h-10 w-10 mr-3" />
            Admin Dashboard
          </h1>
          <p className="text-purple-100 text-lg">
            Tổng quan hệ thống và phân tích hiệu suất
          </p>
        </div>
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-white opacity-10"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full bg-white opacity-10"></div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Building2}
            title="Tổng phòng ban"
            value={stats.total_departments}
            color="text-purple-600"
            bgColor="from-purple-50 to-purple-100"
          />
          <StatCard
            icon={Users}
            title="Người dùng"
            value={stats.total_users}
            subtitle={`${stats.active_users} đang hoạt động`}
            color="text-blue-600"
            bgColor="from-blue-50 to-blue-100"
          />
          <StatCard
            icon={FileText}
            title="Tổng văn bản"
            value={stats.total_documents}
            subtitle={`${stats.trend_percentage > 0 ? '+' : ''}${stats.trend_percentage}% so với tuần trước`}
            trend={stats.trend_percentage}
            color="text-indigo-600"
            bgColor="from-indigo-50 to-indigo-100"
          />
          <StatCard
            icon={CheckCircle}
            title="Đã duyệt"
            value={stats.approved_documents}
            subtitle={`${Math.round((stats.approved_documents / stats.total_documents) * 100) || 0}% tổng số`}
            color="text-green-600"
            bgColor="from-green-50 to-green-100"
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <div className="h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400 mr-2"></div>
            Phân bố trạng thái văn bản
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Department Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <div className="h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400 mr-2"></div>
            Hiệu suất theo phòng ban
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentsPerformance.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="DepartmentName" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_documents" fill={COLORS.primary} name="Tổng VB" radius={[8, 8, 0, 0]} />
              <Bar dataKey="approved_documents" fill={COLORS.success} name="Đã duyệt" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Performance Table & Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <Building2 className="h-6 w-6 mr-2 text-primary-600 dark:text-primary-400" />
              Chi tiết phòng ban
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Phòng ban
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Văn bản
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Tỷ lệ duyệt
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    TB xử lý
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {departmentsPerformance.map((dept) => (
                  <tr key={dept.DepartmentId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {dept.DepartmentName}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                      {dept.total_documents}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`font-medium ${
                        dept.approval_rate >= 80 ? 'text-green-600 dark:text-green-400' :
                        dept.approval_rate >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {dept.approval_rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                      {dept.avg_processing_days} ngày
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <Award className="h-6 w-6 mr-2 text-yellow-600 dark:text-yellow-400" />
              Top người dùng tích cực
            </h3>
          </div>
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <div
                key={user.UserId}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700/50 rounded-lg hover:from-yellow-50 hover:to-yellow-100 dark:hover:from-yellow-900/30 dark:hover:to-yellow-900/20 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-400 text-white' :
                    index === 1 ? 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300' :
                    index === 2 ? 'bg-orange-400 text-white' :
                    'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{user.FullName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.DepartmentName} - {user.RoleName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.documents_created + user.documents_approved} văn bản
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.documents_created} tạo, {user.documents_approved} duyệt
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overdue Documents */}
      {overdueDocuments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-red-600 dark:text-red-400" />
              Văn bản quá hạn ({overdueDocuments.length})
            </h3>
          </div>
          <div className="space-y-3">
            {overdueDocuments.map((doc) => (
              <Link
                key={doc.DocumentId}
                to={`/documents/${doc.DocumentId}`}
                className="block p-4 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all border-l-4 border-red-500 dark:border-red-400"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{doc.Title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {doc.DocumentNumber} - {doc.DepartmentName}
                    </p>
                    {doc.CurrentHandlerName && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Người xử lý: {doc.CurrentHandlerName}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                      Quá hạn {doc.days_overdue} ngày
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Mức độ: {doc.Priority === 1 ? '🔴 Cao' : doc.Priority === 2 ? '🟡 TB' : '🟢 Thấp'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
