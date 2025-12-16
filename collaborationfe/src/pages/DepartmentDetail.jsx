import { ArrowLeft, Building2, Users, FileText, CheckCircle, Clock, UserPlus, UserMinus, Edit2, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { departmentsAPI } from '../api/departments';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import UserSelect from '../components/common/UserSelect';
import toastUtil from '../utils/toast.jsx';

const DepartmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    fetchDepartmentDetail();
  }, [id]);

  const fetchDepartmentDetail = async () => {
    try {
      setLoading(true);
      const data = await departmentsAPI.getDepartmentDetail(id);
      setDepartment(data);
    } catch (error) {
      console.error('Error fetching department detail:', error);
      toastUtil.handleApiError(error, 'Không thể tải thông tin phòng ban');
      navigate('/admin/departments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddMemberModal = async () => {
    try {
      // Load users who are either not in any department or already in this department
      const users = await departmentsAPI.getAvailableUsers();
      // Filter to only show users not already in this department
      const filteredUsers = users.filter(u => u.DepartmentId !== parseInt(id));
      setAvailableUsers(filteredUsers);
      setIsAddMemberModalOpen(true);
    } catch (error) {
      console.error('Error loading users:', error);
      toastUtil.error('Không thể tải danh sách người dùng');
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) {
      toastUtil.validationError('Vui lòng chọn nhân viên');
      return;
    }

    try {
      await departmentsAPI.assignUserToDepartment(id, selectedUserId);
      toastUtil.success('Thêm nhân viên vào phòng ban thành công!');
      setIsAddMemberModalOpen(false);
      setSelectedUserId(null);
      fetchDepartmentDetail();
    } catch (error) {
      console.error('Error adding member:', error);
      toastUtil.handleApiError(error, 'Không thể thêm nhân viên');
    }
  };

  const handleRemoveMember = async (userId, userName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${userName}" khỏi phòng ban?`)) {
      return;
    }

    try {
      await departmentsAPI.removeUserFromDepartment(id, userId);
      toastUtil.success('Xóa nhân viên khỏi phòng ban thành công!');
      fetchDepartmentDetail();
    } catch (error) {
      console.error('Error removing member:', error);
      toastUtil.handleApiError(error, 'Không thể xóa nhân viên');
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!department) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Inactive Warning Banner */}
      {!department.IsActive && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">
                ⚠️ Phòng ban đã ngưng hoạt động
              </h3>
              <div className="text-sm text-red-700 mt-2 space-y-1">
                <p className="font-medium">Tác động khi tắt phòng ban:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Tất cả nhân viên trong phòng ban này đã bị TẮT TÀI KHOẢN tự động</li>
                  <li>Các nhân viên KHÔNG THỂ ĐĂNG NHẬP vào hệ thống</li>
                  <li>Không thể thêm nhân viên mới vào phòng ban này</li>
                </ul>
                <p className="mt-2 font-medium text-red-800">
                  💡 Để khôi phục: Vào "Quản lý Phòng ban" → Sửa → Bật "Hoạt động" → Sau đó kích hoạt lại từng tài khoản nhân viên
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/admin/departments')}
            className="mb-4 bg-white/20 text-white hover:bg-white/30 border-0"
          >
            Quay lại
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <Building2 className="h-10 w-10 mr-3" />
                {department.DepartmentName}
              </h1>
              <p className="text-indigo-100 text-lg">
                Mã: {department.DepartmentCode}
              </p>
              {department.Description && (
                <p className="text-indigo-100 mt-2">
                  {department.Description}
                </p>
              )}
            </div>
            <div>
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  department.IsActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {department.IsActive ? 'Hoạt động' : 'Không hoạt động'}
              </span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-white opacity-10"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full bg-white opacity-10"></div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Nhân viên</p>
              <p className="text-3xl font-bold text-gray-900">{department.total_users}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Văn bản</p>
              <p className="text-3xl font-bold text-gray-900">{department.total_documents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đã duyệt</p>
              <p className="text-3xl font-bold text-gray-900">{department.approved_documents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Chờ duyệt</p>
              <p className="text-3xl font-bold text-gray-900">{department.pending_documents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Manager Information */}
      {(department.manager_name || department.vice_manager_name) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý phòng ban</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {department.manager_name && (
              <div className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trưởng phòng</p>
                  <p className="text-base font-semibold text-gray-900">{department.manager_name}</p>
                </div>
              </div>
            )}
            {department.vice_manager_name && (
              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phó phòng</p>
                  <p className="text-base font-semibold text-gray-900">{department.vice_manager_name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Danh sách nhân viên ({department.members?.length || 0})
          </h3>
          <Button
            icon={UserPlus}
            onClick={handleOpenAddMemberModal}
            size="sm"
            disabled={!department.IsActive}
            title={!department.IsActive ? 'Không thể thêm nhân viên vào phòng ban không hoạt động' : ''}
          >
            Thêm nhân viên
          </Button>
        </div>

        {!department.members || department.members.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có nhân viên</h3>
            <p className="mt-1 text-sm text-gray-500">
              Bắt đầu bằng cách thêm nhân viên vào phòng ban.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhân viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chức vụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {department.members.map((member) => (
                  <tr key={member.UserId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-indigo-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.FullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.Username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {member.role?.RoleName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.Email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.IsActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.IsActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveMember(member.UserId, member.FullName)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Thêm nhân viên vào phòng ban
            </h2>

            <div className="space-y-4">
              <UserSelect
                label="Chọn nhân viên"
                value={selectedUserId}
                onChange={setSelectedUserId}
                users={availableUsers}
                placeholder="Chọn nhân viên cần thêm"
                required
              />

              <div className="flex space-x-3 pt-4">
                <Button onClick={handleAddMember} className="flex-1">
                  Thêm
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsAddMemberModalOpen(false);
                    setSelectedUserId(null);
                  }}
                  className="flex-1"
                >
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDetail;
