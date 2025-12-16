import { Building2, Calendar, Mail, Shield, User, Edit2, Save, X, Camera, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import Avatar from '../components/common/Avatar';
import { formatDate } from '../utils/helpers';
import toastUtil from '../utils/toast.jsx';
import axios from 'axios';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.FullName || '',
    email: user?.Email || '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const InfoCard = ({ icon: Icon, label, value, bgColor = "bg-gray-50" }) => (
    <div className={`${bgColor} dark:bg-gray-800 rounded-xl p-6 hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
          <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{value || 'Chưa cập nhật'}</p>
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toastUtil.validationError('Vui lòng chọn file ảnh');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toastUtil.validationError('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.ProfilePicture) {
      toastUtil.error('Không có ảnh đại diện để xóa');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn xóa ảnh đại diện?')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/users/me/profile-picture`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update user in store
      const updatedUser = { ...user, ProfilePicture: null };
      updateUser(updatedUser);

      setPreviewUrl(null);
      setSelectedFile(null);

      toastUtil.success('Đã xóa ảnh đại diện');
    } catch (error) {
      console.error('Error removing avatar:', error);
      toastUtil.handleApiError(error, 'Không thể xóa ảnh đại diện');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (formData.new_password) {
      if (!formData.current_password) {
        toastUtil.validationError('Vui lòng nhập mật khẩu hiện tại');
        return;
      }
      if (formData.new_password !== formData.confirm_password) {
        toastUtil.validationError('Mật khẩu xác nhận không khớp');
        return;
      }
      if (formData.new_password.length < 6) {
        toastUtil.validationError('Mật khẩu mới phải có ít nhất 6 ký tự');
        return;
      }
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const formDataToSend = new FormData();

      // Only append changed fields
      if (formData.full_name !== user?.FullName) {
        formDataToSend.append('full_name', formData.full_name);
      }
      if (formData.email !== user?.Email) {
        formDataToSend.append('email', formData.email);
      }
      if (formData.new_password) {
        formDataToSend.append('current_password', formData.current_password);
        formDataToSend.append('new_password', formData.new_password);
      }
      if (selectedFile) {
        formDataToSend.append('profile_picture', selectedFile);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/users/me/profile`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Update user in store
      const updatedUser = { ...user, ...response.data.user };
      updateUser(updatedUser);

      // Reset form
      setFormData({
        full_name: updatedUser.FullName,
        email: updatedUser.Email,
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsEditing(false);

      toastUtil.success('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toastUtil.handleApiError(error, 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.FullName || '',
      email: user?.Email || '',
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                {isEditing ? (
                  <div className="relative">
                    {previewUrl || user?.ProfilePicture ? (
                      <div className="h-24 w-24 rounded-full overflow-hidden shadow-xl relative">
                        <img
                          src={previewUrl || `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${user?.ProfilePicture}`}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={handleRemoveAvatar}
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-6 w-6 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-24 w-24">
                        <Avatar user={user} size="3xl" />
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Camera className="h-5 w-5 text-primary-600" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 shadow-xl">
                    <Avatar user={user} size="3xl" />
                  </div>
                )}
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
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="group flex items-center space-x-2 px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
              >
                <Edit2 className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                <span>Chỉnh sửa</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                  <span>Hủy</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  <span>{loading ? 'Đang lưu...' : 'Lưu'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-white opacity-5"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full bg-white opacity-5"></div>
      </div>

      {isEditing ? (
        /* Edit Form */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Chỉnh sửa thông tin</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            {/* Change Password Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Đổi mật khẩu (tùy chọn)</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    value={formData.current_password}
                    onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    placeholder="Nhập mật khẩu hiện tại nếu muốn đổi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <>
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
              icon={Building2}
              label="Phòng ban"
              value={user?.department?.DepartmentName}
              bgColor="bg-yellow-50"
            />
            <InfoCard
              icon={User}
              label="Tên đăng nhập"
              value={user?.Username}
              bgColor="bg-purple-50"
            />
          </div>

          {/* Role & Permissions Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mr-3">
                <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vai trò & Quyền hạn</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Thông tin về vai trò và cấp độ truy cập</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Vai trò</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{user?.role?.RoleName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user?.role?.Description || 'Không có mô tả'}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-6">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Cấp độ</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {getRoleLevelName(user?.role?.RoleLevel)}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-white dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(user?.role?.RoleLevel / 3) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {user?.role?.RoleLevel}/3
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Thông tin tài khoản</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Chi tiết về tài khoản của bạn</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ID người dùng</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">{user?.UserId}</p>
                </div>
              </div>

              {user?.CreatedAt && (
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày tạo tài khoản</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                      {formatDate(user.CreatedAt)}
                    </p>
                  </div>
                </div>
              )}

              {user?.UpdatedAt && (
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cập nhật lần cuối</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                      {formatDate(user.UpdatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
