import { Building2, Calendar, Mail, Phone, Shield, User, Edit2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { formatDate } from '../utils/helpers';

const Profile = () => {
  const { user } = useAuthStore();

  const InfoCard = ({ icon: Icon, label, value, bgColor = "bg-gray-50" }) => (
    <div className={`${bgColor} rounded-xl p-6 hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <p className="text-lg font-semibold text-gray-900">{value || 'Chưa cập nhật'}</p>
        </div>
      </div>
    </div>
  );

  const getRoleLevelName = (level) => {
    switch (level) {
      case 1:
        return 'Cấp 1 - Nhân viên';
      case 2:
        return 'Cấp 2 - Quản lý';
      case 3:
        return 'Cấp 3 - Quản trị viên';
      default:
        return 'Không xác định';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                <User className="h-12 w-12 text-primary-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{user?.FullName}</h1>
                <div className="flex items-center space-x-4">
                  <span className="px-4 py-2 bg-white bg-opacity-20 rounded-lg font-medium">
                    {user?.role?.RoleName}
                  </span>
                  <span className="px-4 py-2 bg-white bg-opacity-20 rounded-lg font-medium">
                    {user?.department?.DepartmentName}
                  </span>
                </div>
              </div>
            </div>
            <button className="group flex items-center space-x-2 px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:shadow-xl transition-all duration-300">
              <Edit2 className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              <span>Chỉnh sửa</span>
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-white opacity-5"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full bg-white opacity-5"></div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard
          icon={User}
          label="Họ và tên"
          value={user?.FullName}
          bgColor="bg-blue-50"
        />
        <InfoCard
          icon={Mail}
          label="Email"
          value={user?.Email}
          bgColor="bg-green-50"
        />
        <InfoCard
          icon={Phone}
          label="Số điện thoại"
          value={user?.Phone}
          bgColor="bg-purple-50"
        />
        <InfoCard
          icon={Building2}
          label="Phòng ban"
          value={user?.department?.DepartmentName}
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Role & Permissions Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
            <Shield className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Vai trò & Quyền hạn</h2>
            <p className="text-sm text-gray-500">Thông tin về vai trò và cấp độ truy cập</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Vai trò</p>
            <p className="text-2xl font-bold text-gray-900 mb-3">{user?.role?.RoleName}</p>
            <p className="text-sm text-gray-600">{user?.role?.Description || 'Không có mô tả'}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Cấp độ</p>
            <p className="text-2xl font-bold text-gray-900 mb-3">
              {getRoleLevelName(user?.role?.RoleLevel)}
            </p>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-white rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(user?.role?.RoleLevel / 3) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {user?.role?.RoleLevel}/3
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Thông tin tài khoản</h2>
            <p className="text-sm text-gray-500">Chi tiết về tài khoản của bạn</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-500">Tên đăng nhập</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{user?.Username}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-500">ID người dùng</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{user?.UserId}</p>
            </div>
          </div>

          {user?.CreatedAt && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-500">Ngày tạo tài khoản</p>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {formatDate(user.CreatedAt)}
                </p>
              </div>
            </div>
          )}

          {user?.UpdatedAt && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-500">Cập nhật lần cuối</p>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {formatDate(user.UpdatedAt)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium opacity-90">Văn bản đã tạo</h4>
            <User className="h-6 w-6 opacity-80" />
          </div>
          <p className="text-4xl font-bold">-</p>
          <p className="text-sm opacity-80 mt-2">Đang cập nhật</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium opacity-90">Văn bản đã duyệt</h4>
            <Shield className="h-6 w-6 opacity-80" />
          </div>
          <p className="text-4xl font-bold">-</p>
          <p className="text-sm opacity-80 mt-2">Đang cập nhật</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium opacity-90">Hoạt động</h4>
            <Calendar className="h-6 w-6 opacity-80" />
          </div>
          <p className="text-4xl font-bold">Tốt</p>
          <p className="text-sm opacity-80 mt-2">Tích cực</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
