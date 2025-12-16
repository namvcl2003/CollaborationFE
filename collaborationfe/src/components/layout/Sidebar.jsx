import {
    Activity,
    Bell,
    Building2,
    CheckCircle,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    FileText,
    LayoutDashboard,
    Plus,
    Users
} from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const roleLevel = user?.role?.RoleLevel || 0;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: 'Văn bản của tôi',
      href: '/documents',
      icon: FileText,
      show: true,
    },
    {
      name: 'Tạo văn bản',
      href: '/documents/create',
      icon: Plus,
      show: roleLevel === 1, // Chỉ trợ lý
    },
    {
      name: 'Công việc được giao',
      href: '/assignments',
      icon: CheckSquare,
      show: roleLevel <= 2, // Trợ lý và Phó phòng (cấp dưới)
    },
    {
      name: 'VB đã duyệt - Phòng ban',
      href: '/department-approved',
      icon: CheckCircle,
      show: true, // Tất cả mọi người đều xem được
    },
    {
      name: 'Thông báo',
      href: '/notifications',
      icon: Bell,
      show: true,
    },
    {
      name: 'Người dùng',
      href: '/users',
      icon: Users,
      show: roleLevel >= 3, // Trưởng phòng trở lên
    },
    {
      name: 'Mẫu Văn bản',
      href: '/templates',
      icon: FileText,
      show: roleLevel >= 3, // Trưởng phòng trở lên
    },
    // Admin Menu
    {
      name: 'Admin Dashboard',
      href: '/admin/dashboard',
      icon: Activity,
      show: roleLevel >= 4, // Chỉ Admin
      badge: 'Admin',
    },
    {
      name: 'Quản lý Phòng ban',
      href: '/admin/departments',
      icon: Building2,
      show: roleLevel >= 4, // Chỉ Admin
      badge: 'Admin',
    },
  ];

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen transition-all duration-300 relative ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-sm hover:shadow-md transition-shadow z-10"
        title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      <nav className="mt-5 px-2 space-y-1">
        {navigation.map((item) =>
          item.show && (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
              title={isCollapsed ? item.name : ''}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          )
        )}
      </nav>
    </div>
  );
};

export default Sidebar;