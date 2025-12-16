import { Building2, Edit2, Plus, Search, Trash2, Users, FileText, CheckCircle, Clock, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { departmentsAPI } from '../api/departments';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import UserSelect from '../components/common/UserSelect';
import toastUtil from '../utils/toast.jsx';

const DepartmentManagement = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [formData, setFormData] = useState({
    DepartmentName: '',
    DepartmentCode: '',
    Description: '',
    ManagerUserId: null,
    ViceManagerUserId: null,
    IsActive: true,
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentsAPI.getDepartments({
        search: searchTerm,
        include_inactive: showInactive
      });
      console.log('Departments data:', data);
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      console.error('Error details:', error.response?.data);

      if (error.response?.status === 403) {
        toastUtil.error('Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản Admin!');
      } else if (error.response?.status === 401) {
        toastUtil.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
      } else {
        toastUtil.handleApiError(error, 'Không thể tải danh sách phòng ban');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDepartments();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, showInactive]);

  const handleOpenModal = async (dept = null) => {
    // Load available users
    try {
      const users = await departmentsAPI.getAvailableUsers(dept?.DepartmentId);
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
      toastUtil.error('Không thể tải danh sách người dùng');
    }

    if (dept) {
      setEditingDept(dept);
      setFormData({
        DepartmentName: dept.DepartmentName,
        DepartmentCode: dept.DepartmentCode,
        Description: dept.Description || '',
        ManagerUserId: dept.ManagerUserId || null,
        ViceManagerUserId: dept.ViceManagerUserId || null,
        IsActive: dept.IsActive,
      });
    } else {
      setEditingDept(null);
      setFormData({
        DepartmentName: '',
        DepartmentCode: '',
        Description: '',
        ManagerUserId: null,
        ViceManagerUserId: null,
        IsActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDept(null);
    setAvailableUsers([]);
    setFormData({
      DepartmentName: '',
      DepartmentCode: '',
      Description: '',
      ManagerUserId: null,
      ViceManagerUserId: null,
      IsActive: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.DepartmentName.trim()) {
      toastUtil.validationError('Vui lòng nhập tên phòng ban');
      return;
    }

    if (!formData.DepartmentCode.trim()) {
      toastUtil.validationError('Vui lòng nhập mã phòng ban');
      return;
    }

    if (formData.ManagerUserId && formData.ViceManagerUserId && formData.ManagerUserId === formData.ViceManagerUserId) {
      toastUtil.validationError('Trưởng phòng và Phó phòng không thể là cùng một người');
      return;
    }

    // Warning when deactivating department
    if (editingDept && editingDept.IsActive && !formData.IsActive) {
      try {
        const userCountData = await departmentsAPI.getActiveUsersCount(editingDept.DepartmentId);
        const activeUsersCount = userCountData.active_users_count;

        if (activeUsersCount > 0) {
          const confirmMessage = `⚠️ CẢNH BÁO: Tắt phòng ban sẽ TỰ ĐỘNG TẮT TÀI KHOẢN của ${activeUsersCount} nhân viên trong phòng này.\n\nCác nhân viên sẽ KHÔNG THỂ ĐĂNG NHẬP vào hệ thống nữa.\n\nBạn có chắc chắn muốn tiếp tục?`;

          if (!window.confirm(confirmMessage)) {
            return; // User cancelled
          }
        }
      } catch (error) {
        console.error('Error checking active users:', error);
        // Continue anyway if check fails
      }
    }

    try {
      if (editingDept) {
        await departmentsAPI.updateDepartment(editingDept.DepartmentId, formData);

        // Show different message based on whether department was deactivated
        if (editingDept.IsActive && !formData.IsActive) {
          toastUtil.success('Đã tắt phòng ban và tự động tắt tài khoản các nhân viên!');
        } else {
          toastUtil.success('Cập nhật phòng ban thành công!');
        }
      } else {
        await departmentsAPI.createDepartment(formData);
        toastUtil.success('Tạo phòng ban thành công!');
      }
      handleCloseModal();
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      toastUtil.handleApiError(error, 'Không thể lưu thông tin phòng ban');
    }
  };

  const handleDelete = async (deptId, deptName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phòng ban "${deptName}"?`)) {
      return;
    }

    try {
      await departmentsAPI.deleteDepartment(deptId);
      toast.success('Xóa phòng ban thành công!');
      fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      const message = error.response?.data?.detail || 'Không thể xóa phòng ban';
      toast.error(message);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <Building2 className="h-10 w-10 mr-3" />
                Quản lý Phòng ban
              </h1>
              <p className="text-indigo-100 text-lg">
                Quản lý thông tin và hiệu suất các phòng ban
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="group flex items-center space-x-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Thêm phòng ban</span>
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-white opacity-10"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full bg-white opacity-10"></div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã phòng ban..."
              className="pl-10 input w-full"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showInactive"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <label htmlFor="showInactive" className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Hiển thị phòng ban không hoạt động
            </label>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      {departments.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Chưa có phòng ban</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Bắt đầu bằng cách tạo một phòng ban mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.DepartmentId}
              className={`bg-white dark:bg-gray-800 rounded-xl border p-6 hover:shadow-lg transition-shadow ${
                !dept.IsActive
                  ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 opacity-75'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {dept.DepartmentName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mã: {dept.DepartmentCode}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(dept)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.DepartmentId, dept.DepartmentName)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {dept.Description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {dept.Description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Nhân viên</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{dept.total_users}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Văn bản</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{dept.total_documents}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Đã duyệt</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{dept.approved_documents}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Chờ duyệt</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{dept.pending_documents}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manager Info */}
              {(dept.manager_name || dept.vice_manager_name) && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quản lý:</p>
                  {dept.manager_name && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">TP:</span> {dept.manager_name}
                    </p>
                  )}
                  {dept.vice_manager_name && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">PP:</span> {dept.vice_manager_name}
                    </p>
                  )}
                </div>
              )}

              {/* Status */}
              <div className="mt-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    dept.IsActive
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}
                >
                  {dept.IsActive ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </div>

              {/* View Details Button */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  icon={Eye}
                  onClick={() => navigate(`/admin/departments/${dept.DepartmentId}`)}
                >
                  Xem chi tiết
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingDept ? 'Sửa phòng ban' : 'Thêm phòng ban mới'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">
                  Tên phòng ban <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.DepartmentName}
                  onChange={(e) =>
                    setFormData({ ...formData, DepartmentName: e.target.value })
                  }
                  placeholder="Nhập tên phòng ban"
                />
              </div>

              <div>
                <label className="label">
                  Mã phòng ban <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.DepartmentCode}
                  onChange={(e) =>
                    setFormData({ ...formData, DepartmentCode: e.target.value })
                  }
                  placeholder="Nhập mã phòng ban (ví dụ: HC, KT)"
                />
              </div>

              <div>
                <label className="label">Mô tả</label>
                <textarea
                  className="input"
                  rows="3"
                  value={formData.Description}
                  onChange={(e) =>
                    setFormData({ ...formData, Description: e.target.value })
                  }
                  placeholder="Nhập mô tả về phòng ban"
                />
              </div>

              {/* Manager Selection */}
              <UserSelect
                label="Trưởng phòng"
                value={formData.ManagerUserId}
                onChange={(userId) => setFormData({ ...formData, ManagerUserId: userId })}
                users={availableUsers}
                placeholder="Chọn Trưởng phòng"
                allowClear={true}
              />

              {/* Vice Manager Selection */}
              <UserSelect
                label="Phó phòng"
                value={formData.ViceManagerUserId}
                onChange={(userId) => setFormData({ ...formData, ViceManagerUserId: userId })}
                users={availableUsers}
                placeholder="Chọn Phó phòng"
                allowClear={true}
              />

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.IsActive}
                  onChange={(e) =>
                    setFormData({ ...formData, IsActive: e.target.checked })
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Hoạt động
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingDept ? 'Cập nhật' : 'Tạo mới'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
