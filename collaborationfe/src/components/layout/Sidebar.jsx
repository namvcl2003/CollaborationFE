import {
    Bell,
    CheckSquare,
    FileText,
    LayoutDashboard,
    Plus,
    Users
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const roleLevel = user?.role?.RoleLevel || 0;

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
      show: roleLevel >= 2, // Phó phòng và trưởng phòng
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
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="mt-5 px-2 space-y-1">
        {navigation.map((item) => 
          item.show && (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          )
        )}
      </nav>
    </div>
  );
};

export default Sidebar;