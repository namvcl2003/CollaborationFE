import {
    Activity,
    AlertCircle,
    ArrowDown,
    ArrowUp,
    CheckCircle,
    Clock,
    FileText,
    Plus,
    TrendingDown,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
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
    rejected: 0,
    inProgress: 0,
  });
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all documents for statistics
      const allDocs = await documentsAPI.getDocuments({ page: 1, page_size: 100 });

      // Calculate stats
      const statsCounts = {
        total: allDocs.total,
        draft: allDocs.items.filter(d => d.status?.StatusCode === 'DRAFT').length,
        pending: allDocs.items.filter(d => d.status?.StatusCode === 'PENDING').length,
        approved: allDocs.items.filter(d => d.status?.StatusCode === 'APPROVED').length,
        rejected: allDocs.items.filter(d => d.status?.StatusCode === 'REJECTED').length,
        inProgress: allDocs.items.filter(d => ['PENDING', 'IN_REVIEW'].includes(d.status?.StatusCode)).length,
      };
      setStats(statsCounts);

      // Calculate trend data from real documents (last 7 days)
      const today = new Date();
      const last7Days = [];
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayName = dayNames[date.getDay()];

        // Count documents created on this day
        const docsOnDay = allDocs.items.filter(doc => {
          const docDate = new Date(doc.CreatedAt);
          return docDate.toDateString() === date.toDateString();
        });

        const approvedOnDay = docsOnDay.filter(doc => doc.status?.StatusCode === 'APPROVED').length;

        last7Days.push({
          name: dayName,
          documents: docsOnDay.length,
          approved: approvedOnDay
        });
      }

      setTrendData(last7Days);

      // Fetch recent documents (limited to 5)
      const recentDocs = await documentsAPI.getDocuments({ page: 1, page_size: 5 });
      setRecentDocuments(recentDocs.items);

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

  // Chart colors
  const COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#6366f1',
    purple: '#8b5cf6',
  };

  const statusChartData = [
    { name: 'Đã duyệt', value: stats.approved, color: COLORS.success },
    { name: 'Chờ duyệt', value: stats.pending, color: COLORS.warning },
    { name: 'Bản thảo', value: stats.draft, color: COLORS.info },
    { name: 'Từ chối', value: stats.rejected, color: COLORS.danger },
  ];

  const priorityData = [
    { name: 'Cao', value: Math.floor(stats.total * 0.2), color: COLORS.danger },
    { name: 'Trung bình', value: Math.floor(stats.total * 0.5), color: COLORS.warning },
    { name: 'Thấp', value: Math.floor(stats.total * 0.3), color: COLORS.info },
  ];

  const StatCard = ({ icon: Icon, title, value, change, color, bgColor, trend }) => (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${bgColor} p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mb-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center space-x-1">
              {trend === 'up' ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">+{change}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">{change}%</span>
                </>
              )}
              <span className="text-sm text-gray-500">so với tuần trước</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10`}>
          <Icon className={`h-10 w-10 ${color}`} />
        </div>
      </div>
      <div className="absolute -right-8 -bottom-8 opacity-10">
        <Icon className="h-32 w-32 text-gray-900" />
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{payload[0].payload.name}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">
            Chào mừng trở lại, {user?.FullName}! 👋
          </h1>
          <p className="text-primary-100 text-lg">
            {user?.role?.RoleName} - {user?.department?.DepartmentName}
          </p>
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <Activity className="h-5 w-5" />
              <span className="font-medium">Hoạt động hôm nay</span>
            </div>
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <Zap className="h-5 w-5" />
              <span className="font-medium">{assignments.length} công việc đang chờ</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-white opacity-5"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full bg-white opacity-5"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileText}
          title="Tổng văn bản"
          value={stats.total}
          change={12}
          trend="up"
          color="text-blue-600"
          bgColor="from-blue-50 to-blue-100"
        />
        <StatCard
          icon={CheckCircle}
          title="Đã duyệt"
          value={stats.approved}
          change={8}
          trend="up"
          color="text-green-600"
          bgColor="from-green-50 to-green-100"
        />
        <StatCard
          icon={Clock}
          title="Đang xử lý"
          value={stats.inProgress}
          change={5}
          trend="down"
          color="text-yellow-600"
          bgColor="from-yellow-50 to-yellow-100"
        />
        <StatCard
          icon={AlertCircle}
          title="Bản thảo"
          value={stats.draft}
          change={3}
          trend="up"
          color="text-purple-600"
          bgColor="from-purple-50 to-purple-100"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <div className="h-2 w-2 rounded-full bg-primary-600 mr-2"></div>
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
                fill="#8884d8"
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <div className="h-2 w-2 rounded-full bg-primary-600 mr-2"></div>
            Phân loại độ ưu tiên
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill={COLORS.primary} radius={[8, 8, 0, 0]}>
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Line Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <div className="h-2 w-2 rounded-full bg-primary-600 mr-2"></div>
          Xu hướng văn bản 7 ngày qua
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="colorDocuments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="documents"
              stroke={COLORS.primary}
              fillOpacity={1}
              fill="url(#colorDocuments)"
              strokeWidth={3}
              name="Tổng văn bản"
            />
            <Area
              type="monotone"
              dataKey="approved"
              stroke={COLORS.success}
              fillOpacity={1}
              fill="url(#colorApproved)"
              strokeWidth={3}
              name="Đã duyệt"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium opacity-90">Tỷ lệ hoàn thành</h4>
            <CheckCircle className="h-6 w-6 opacity-80" />
          </div>
          <p className="text-4xl font-bold mb-2">
            {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
          </p>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-4">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.total > 0 ? (stats.approved / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium opacity-90">Thời gian xử lý TB</h4>
            <Clock className="h-6 w-6 opacity-80" />
          </div>
          <p className="text-4xl font-bold mb-2">2.3 ngày</p>
          <p className="text-sm opacity-80">Giảm 15% so với tháng trước</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium opacity-90">Hiệu suất</h4>
            <Zap className="h-6 w-6 opacity-80" />
          </div>
          <p className="text-4xl font-bold mb-2">Tốt</p>
          <div className="flex items-center space-x-1 mt-2">
            <ArrowUp className="h-4 w-4" />
            <span className="text-sm">+12% hiệu quả</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {user?.role?.RoleLevel === 1 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 shadow-2xl">
          <div className="relative z-10 flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <Plus className="h-8 w-8 mr-3 p-1.5 bg-white bg-opacity-20 rounded-full" />
                Bắt đầu tạo văn bản mới
              </h2>
              <p className="text-white text-opacity-90 text-lg">
                Tạo và quản lý văn bản của bạn một cách dễ dàng và nhanh chóng
              </p>
            </div>
            <Link to="/documents/create">
              <button className="group relative px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3">
                <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                <span>Tạo ngay</span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </Link>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-white opacity-10"></div>
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-48 w-48 rounded-full bg-white opacity-10"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-white opacity-5"></div>
        </div>
      )}

      {/* Assignments for managers */}
      {user?.role?.RoleLevel >= 2 && assignments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Users className="h-6 w-6 mr-2 text-primary-600" />
                  Công việc cần xử lý
                </h2>
                <p className="text-sm text-gray-500 mt-1">{assignments.length} công việc đang chờ</p>
              </div>
              <Link to="/assignments" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Xem tất cả →
              </Link>
            </div>
            <div className="space-y-3">
              {assignments.slice(0, 5).map((assignment) => (
                <Link
                  key={assignment.AssignmentId}
                  to={`/documents/${assignment.document?.DocumentId}`}
                  className="block p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-primary-50 hover:to-primary-100 transition-all duration-200 border border-gray-200 hover:border-primary-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {assignment.document?.Title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {assignment.document?.DocumentNumber}
                      </p>
                    </div>
                    <StatusBadge status={assignment.document?.status?.StatusCode} />
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>Giao bởi: {assignment.assigned_by?.FullName}</span>
                    <span>{formatRelativeTime(assignment.AssignedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Documents - In grid with assignments */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-primary-600" />
                  Văn bản gần đây
                </h2>
                <p className="text-sm text-gray-500 mt-1">Cập nhật mới nhất</p>
              </div>
              <Link to="/documents" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Xem tất cả →
              </Link>
            </div>
            <div className="space-y-3">
              {recentDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">Chưa có văn bản nào</p>
                </div>
              ) : (
                recentDocuments.map((doc) => (
                  <Link
                    key={doc.DocumentId}
                    to={`/documents/${doc.DocumentId}`}
                    className="block p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-primary-50 hover:to-primary-100 transition-all duration-200 border border-gray-200 hover:border-primary-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{doc.Title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {doc.DocumentNumber}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <StatusBadge status={doc.status?.StatusCode} />
                        <StatusBadge priority={doc.Priority} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      {formatRelativeTime(doc.CreatedAt)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Documents - Full width for assistants */}
      {(user?.role?.RoleLevel < 2 || assignments.length === 0) && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FileText className="h-6 w-6 mr-2 text-primary-600" />
                Văn bản gần đây
              </h2>
              <p className="text-sm text-gray-500 mt-1">Cập nhật mới nhất</p>
            </div>
            <Link to="/documents" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentDocuments.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Chưa có văn bản nào</p>
              </div>
            ) : (
              recentDocuments.map((doc) => (
                <Link
                  key={doc.DocumentId}
                  to={`/documents/${doc.DocumentId}`}
                  className="block p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:from-primary-50 hover:to-primary-100 transition-all duration-200 border border-gray-200 hover:border-primary-300 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <FileText className="h-8 w-8 text-primary-600 flex-shrink-0" />
                    <div className="flex flex-col items-end space-y-1.5">
                      <StatusBadge status={doc.status?.StatusCode} />
                      <StatusBadge priority={doc.Priority} />
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{doc.Title}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {doc.DocumentNumber}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                    <span>{formatRelativeTime(doc.CreatedAt)}</span>
                    <span className="text-primary-600 font-medium">Xem chi tiết →</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
