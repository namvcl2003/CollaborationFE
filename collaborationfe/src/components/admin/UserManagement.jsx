// import {
//     ChevronLeft,
//     ChevronRight,
//     Edit2,
//     Loader2,
//     Plus,
//     Search,
//     Trash2,
//     UserCheck,
//     X
// } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import toast from 'react-hot-toast';
// import axiosInstance from '../../api/axios';
// import Button from '../common/Button';

// const UserManagement = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalUsers, setTotalUsers] = useState(0);
//   const pageSize = 10;

//   const [roles, setRoles] = useState([]);
//   const [departments, setDepartments] = useState([]);

//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);

//   const [formData, setFormData] = useState({
//     username: '',
//     password: '',
//     email: '',
//     full_name: '',
//     role_id: '',
//     department_id: '',
//   });

//   // Fetch users
//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       console.log('🔍 Fetching users from API...', {
//         endpoint: '/users/',
//         page: currentPage,
//         pageSize,
//         search: searchTerm
//       });

//       const response = await axiosInstance.get('/users/', {
//         params: {
//           page: currentPage,
//           page_size: pageSize,
//           search: searchTerm || undefined,
//         },
//       });

//       console.log('✅ Users fetched successfully:', {
//         total: response.data.total,
//         count: response.data.users?.length
//       });

//       setUsers(response.data.users || []);
//       setTotalPages(Math.ceil(response.data.total / pageSize));
//       setTotalUsers(response.data.total || 0);
//     } catch (error) {
//       console.error('❌ Error fetching users:', error);
//       console.error('📍 Error details:', {
//         message: error.message,
//         status: error.response?.status,
//         data: error.response?.data,
//         url: error.config?.url,
//         baseURL: error.config?.baseURL
//       });
      
//       if (error.response?.status === 404) {
//         toast.error('❌ Endpoint không tồn tại! Kiểm tra backend.');
//         console.error('🔴 404 - URL được gọi:', error.config?.url);
//       } else if (error.response?.status === 401) {
//         toast.error('❌ Chưa đăng nhập hoặc token hết hạn!');
//       } else if (error.message === 'Network Error') {
//         toast.error('❌ Không kết nối được server! Backend có đang chạy không?');
//         console.error('🔴 Network Error - Backend URL:', error.config?.baseURL);
//       } else {
//         toast.error('❌ Lỗi khi tải danh sách người dùng');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch roles and departments
//   const fetchRolesAndDepartments = async () => {
//     try {
//       console.log('🔍 Fetching roles and departments...');
      
//       const [rolesRes, deptsRes] = await Promise.all([
//         axiosInstance.get('/users/roles/list'),
//         axiosInstance.get('/users/departments/list'),
//       ]);

//       console.log('✅ Roles:', rolesRes.data?.length || 0);
//       console.log('✅ Departments:', deptsRes.data?.length || 0);

//       setRoles(rolesRes.data || []);
//       setDepartments(deptsRes.data || []);
//     } catch (error) {
//       console.error('❌ Error fetching roles/departments:', error);
//       toast.error('Lỗi khi tải danh sách vai trò/phòng ban');
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, [currentPage, searchTerm]);

//   useEffect(() => {
//     fetchRolesAndDepartments();
//   }, []);

//   // Create user
//   const handleCreateUser = async (e) => {
//     e.preventDefault();
    
//     if (!formData.username || !formData.password || !formData.full_name || !formData.role_id) {
//       toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
//       return;
//     }

//     try {
//       console.log('📝 Creating user:', formData.username);
      
//       await axiosInstance.post('/users/', formData);
      
//       toast.success('✅ Tạo người dùng thành công!');
//       setIsCreateModalOpen(false);
//       resetForm();
//       fetchUsers();
//     } catch (error) {
//       console.error('❌ Error creating user:', error.response?.data);
      
//       const errorMsg = error.response?.data?.detail || 'Lỗi khi tạo người dùng';
//       toast.error(`❌ ${errorMsg}`);
//     }
//   };

//   // Update user
//   const handleUpdateUser = async (e) => {
//     e.preventDefault();

//     try {
//       console.log('📝 Updating user ID:', selectedUser.UserId);
      
//       const updateData = {
//         email: formData.email,
//         full_name: formData.full_name,
//         role_id: formData.role_id,
//         department_id: formData.department_id,
//       };

//       if (formData.password) {
//         updateData.password = formData.password;
//       }

//       await axiosInstance.put(`/users/${selectedUser.UserId}`, updateData);
      
//       toast.success('✅ Cập nhật người dùng thành công!');
//       setIsEditModalOpen(false);
//       resetForm();
//       fetchUsers();
//     } catch (error) {
//       console.error('❌ Error updating user:', error.response?.data);
      
//       const errorMsg = error.response?.data?.detail || 'Lỗi khi cập nhật người dùng';
//       toast.error(`❌ ${errorMsg}`);
//     }
//   };

//   // Delete user
//   const handleDeleteUser = async (userId) => {
//     if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
//       return;
//     }

//     try {
//       console.log('🗑️ Deleting user ID:', userId);
      
//       await axiosInstance.delete(`/users/${userId}`);
      
//       toast.success('✅ Xóa người dùng thành công!');
//       fetchUsers();
//     } catch (error) {
//       console.error('❌ Error deleting user:', error);
//       toast.error('❌ Lỗi khi xóa người dùng');
//     }
//   };

//   // Activate user
//   const handleActivateUser = async (userId) => {
//     try {
//       console.log('✅ Activating user ID:', userId);
      
//       await axiosInstance.patch(`/users/${userId}/activate`);
      
//       toast.success('✅ Kích hoạt người dùng thành công!');
//       fetchUsers();
//     } catch (error) {
//       console.error('❌ Error activating user:', error);
//       toast.error('❌ Lỗi khi kích hoạt người dùng');
//     }
//   };

//   // Helpers
//   const resetForm = () => {
//     setFormData({
//       username: '',
//       password: '',
//       email: '',
//       full_name: '',
//       role_id: '',
//       department_id: '',
//     });
//     setSelectedUser(null);
//   };

//   const openEditModal = (user) => {
//     setSelectedUser(user);
//     setFormData({
//       username: user.Username,
//       password: '',
//       email: user.Email || '',
//       full_name: user.FullName || '',
//       role_id: user.RoleId || '',
//       department_id: user.DepartmentId || '',
//     });
//     setIsEditModalOpen(true);
//   };

//   const handleSearch = (value) => {
//     setSearchTerm(value);
//     setCurrentPage(1);
//   };

//   const getRoleBadgeColor = (roleLevel) => {
//     switch (roleLevel) {
//       case 3: return 'bg-purple-100 text-purple-800';
//       case 2: return 'bg-blue-100 text-blue-800';
//       case 1: return 'bg-green-100 text-green-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // Pagination
//   const renderPagination = () => {
//     const pages = [];
//     const showEllipsisStart = currentPage > 3;
//     const showEllipsisEnd = currentPage < totalPages - 2;

//     if (totalPages > 0) {
//       pages.push(
//         <button
//           key={1}
//           onClick={() => setCurrentPage(1)}
//           className={`px-3 py-1 rounded ${
//             currentPage === 1
//               ? 'bg-primary-600 text-white'
//               : 'bg-white text-gray-700 hover:bg-gray-100'
//           }`}
//         >
//           1
//         </button>
//       );
//     }

//     if (showEllipsisStart) {
//       pages.push(<span key="ellipsis-start" className="px-2">...</span>);
//     }

//     for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
//       pages.push(
//         <button
//           key={i}
//           onClick={() => setCurrentPage(i)}
//           className={`px-3 py-1 rounded ${
//             currentPage === i
//               ? 'bg-primary-600 text-white'
//               : 'bg-white text-gray-700 hover:bg-gray-100'
//           }`}
//         >
//           {i}
//         </button>
//       );
//     }

//     if (showEllipsisEnd) {
//       pages.push(<span key="ellipsis-end" className="px-2">...</span>);
//     }

//     if (totalPages > 1) {
//       pages.push(
//         <button
//           key={totalPages}
//           onClick={() => setCurrentPage(totalPages)}
//           className={`px-3 py-1 rounded ${
//             currentPage === totalPages
//               ? 'bg-primary-600 text-white'
//               : 'bg-white text-gray-700 hover:bg-gray-100'
//           }`}
//         >
//           {totalPages}
//         </button>
//       );
//     }

//     return pages;
//   };

//   if (loading && users.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
//         <p className="text-gray-600 mt-1">
//           Quản lý tài khoản và phân quyền người dùng trong hệ thống
//         </p>
//       </div>

//       {/* Actions Bar */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div className="relative flex-1 max-w-md">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Tìm kiếm theo tên, email..."
//               value={searchTerm}
//               onChange={(e) => handleSearch(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//             />
//           </div>

//           <Button
//             onClick={() => setIsCreateModalOpen(true)}
//             className="flex items-center gap-2"
//           >
//             <Plus className="h-5 w-5" />
//             Thêm người dùng
//           </Button>
//         </div>
//       </div>

//       {/* Users Table */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Người dùng
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Email
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Vai trò
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Phòng ban
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Trạng thái
//                 </th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Thao tác
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {users.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
//                     Không tìm thấy người dùng nào
//                   </td>
//                 </tr>
//               ) : (
//                 users.map((user) => (
//                   <tr key={user.UserId} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <div className="h-10 w-10 flex-shrink-0">
//                           <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
//                             {user.FullName?.charAt(0)?.toUpperCase() || 'U'}
//                           </div>
//                         </div>
//                         <div className="ml-4">
//                           <div className="text-sm font-medium text-gray-900">{user.FullName}</div>
//                           <div className="text-sm text-gray-500">@{user.Username}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">{user.Email || '-'}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.RoleLevel)}`}>
//                         {user.RoleName}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {user.DepartmentName || '-'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                         user.IsActive
//                           ? 'bg-green-100 text-green-800'
//                           : 'bg-red-100 text-red-800'
//                       }`}>
//                         {user.IsActive ? 'Hoạt động' : 'Vô hiệu'}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                       <div className="flex items-center justify-end gap-2">
//                         <button
//                           onClick={() => openEditModal(user)}
//                           className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
//                           title="Chỉnh sửa"
//                         >
//                           <Edit2 className="h-4 w-4" />
//                         </button>
//                         {user.IsActive ? (
//                           <button
//                             onClick={() => handleDeleteUser(user.UserId)}
//                             className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
//                             title="Xóa"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         ) : (
//                           <button
//                             onClick={() => handleActivateUser(user.UserId)}
//                             className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
//                             title="Kích hoạt lại"
//                           >
//                             <UserCheck className="h-4 w-4" />
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
//             <div className="flex items-center justify-between">
//               <div className="text-sm text-gray-700">
//                 Hiển thị <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> đến{' '}
//                 <span className="font-medium">{Math.min(currentPage * pageSize, totalUsers)}</span> trong tổng số{' '}
//                 <span className="font-medium">{totalUsers}</span> người dùng
//               </div>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setCurrentPage(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <ChevronLeft className="h-5 w-5" />
//                 </button>
//                 {renderPagination()}
//                 <button
//                   onClick={() => setCurrentPage(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <ChevronRight className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Create Modal */}
//       {isCreateModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//             <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-white">Thêm người dùng mới</h3>
//               <button
//                 onClick={() => {
//                   setIsCreateModalOpen(false);
//                   resetForm();
//                 }}
//                 className="text-white hover:bg-white/20 p-1 rounded transition-colors"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
//             <form onSubmit={handleCreateUser} className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Tên đăng nhập <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.username}
//                   onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//                   placeholder="username"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Mật khẩu <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="password"
//                   required
//                   value={formData.password}
//                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//                   placeholder="••••••••"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Họ và tên <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.full_name}
//                   onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//                   placeholder="Nguyễn Văn A"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//                   placeholder="user@example.com"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Vai trò <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   required
//                   value={formData.role_id}
//                   onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//                 >
//                   <option value="">Chọn vai trò</option>
//                   {roles.map((role) => (
//                     <option key={role.RoleId} value={role.RoleId}>
//                       {role.RoleName}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
//                 <select
//                   value={formData.department_id}
//                   onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//                 >
//                   <option value="">Chọn phòng ban</option>
//                   {departments.map((dept) => (
//                     <option key={dept.DepartmentId} value={dept.DepartmentId}>
//                       {dept.DepartmentName}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="flex justify-end gap-3 pt-4">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => {
//                     setIsCreateModalOpen(false);
//                     resetForm();
//                   }}
//                 >
//                   Hủy
//                 </Button>
//                 <Button type="submit">
//                   Tạo người dùng
//                 </Button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Edit Modal */}
//       {isEditModalOpen && selectedUser && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//             <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-white">Chỉnh sửa người dùng</h3>
//               <button
//                 onClick={() => {
//                   setIsEditModalOpen(false);
//                   resetForm();
//                 }}
//                 className="text-white hover:bg-white/20 p-1 rounded transition-colors"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
//             <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
//                 <input
//                   type="text"
//                   value={formData.username}
//                   disabled
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
//                 />
//                 <p className="mt-1 text-xs text-gray-500">Không thể thay đổi tên đăng nhập</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Mật khẩu mới
//                 </label>
//                 <input
//                   type="password"
//                   value={formData.password}
//                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Để trống nếu không đổi"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Họ và tên <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.full_name}
//                   onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Vai trò <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   required
//                   value={formData.role_id}
//                   onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="">Chọn vai trò</option>
//                   {roles.map((role) => (
//                     <option key={role.RoleId} value={role.RoleId}>
//                       {role.RoleName}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
//                 <select
//                   value={formData.department_id}
//                   onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="">Chọn phòng ban</option>
//                   {departments.map((dept) => (
//                     <option key={dept.DepartmentId} value={dept.DepartmentId}>
//                       {dept.DepartmentName}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="flex justify-end gap-3 pt-4">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => {
//                     setIsEditModalOpen(false);
//                     resetForm();
//                   }}
//                 >
//                   Hủy
//                 </Button>
//                 <Button type="submit">
//                   Cập nhật
//                 </Button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserManagement;


import {
    ChevronLeft,
    ChevronRight,
    Edit2,
    Loader2,
    Plus,
    Search,
    Trash2,
    UserCheck,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { usersAPI } from '../../api/users';
import Button from '../common/Button';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const pageSize = 10;

  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
    role_id: '',
    department_id: '',
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching users from API...', {
        page: currentPage,
        pageSize,
        search: searchTerm
      });

      const data = await usersAPI.getAllUsers(currentPage, pageSize, searchTerm);

      console.log('✅ Users fetched successfully:', {
        total: data.total,
        count: data.users?.length
      });

      setUsers(data.users || []);
      setTotalPages(Math.ceil(data.total / pageSize));
      setTotalUsers(data.total || 0);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      console.error('📍 Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 404) {
        toast.error('❌ Endpoint không tồn tại! Kiểm tra backend.');
      } else if (error.response?.status === 401) {
        toast.error('❌ Chưa đăng nhập hoặc token hết hạn!');
      } else if (error.message === 'Network Error') {
        toast.error('❌ Không kết nối được server! Backend có đang chạy không?');
      } else {
        toast.error('❌ Lỗi khi tải danh sách người dùng');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles and departments
  const fetchRolesAndDepartments = async () => {
    try {
      console.log('🔍 Fetching roles and departments...');
      
      const [rolesData, deptsData] = await Promise.all([
        usersAPI.getRoles(),
        usersAPI.getDepartments(),
      ]);

      console.log('✅ Roles:', rolesData?.length || 0);
      console.log('✅ Departments:', deptsData?.length || 0);

      setRoles(rolesData || []);
      setDepartments(deptsData || []);
    } catch (error) {
      console.error('❌ Error fetching roles/departments:', error);
      toast.error('Lỗi khi tải danh sách vai trò/phòng ban');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchRolesAndDepartments();
  }, []);

  // Create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password || !formData.full_name || !formData.role_id) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    try {
      console.log('📝 Creating user:', formData.username);
      
      await usersAPI.createUser(formData);
      
      toast.success('✅ Tạo người dùng thành công!');
      setIsCreateModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('❌ Error creating user:', error.response?.data);
      
      const errorMsg = error.response?.data?.detail || 'Lỗi khi tạo người dùng';
      toast.error(`❌ ${errorMsg}`);
    }
  };

  // Update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();

    try {
      console.log('📝 Updating user ID:', selectedUser.UserId);
      
      const updateData = {
        email: formData.email,
        full_name: formData.full_name,
        role_id: formData.role_id,
        department_id: formData.department_id,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await usersAPI.updateUser(selectedUser.UserId, updateData);
      
      toast.success('✅ Cập nhật người dùng thành công!');
      setIsEditModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('❌ Error updating user:', error.response?.data);
      
      const errorMsg = error.response?.data?.detail || 'Lỗi khi cập nhật người dùng';
      toast.error(`❌ ${errorMsg}`);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting user ID:', userId);
      
      await usersAPI.deleteUser(userId);
      
      toast.success('✅ Xóa người dùng thành công!');
      fetchUsers();
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      toast.error('❌ Lỗi khi xóa người dùng');
    }
  };

  // Activate user
  const handleActivateUser = async (userId) => {
    try {
      console.log('✅ Activating user ID:', userId);
      
      await usersAPI.activateUser(userId);
      
      toast.success('✅ Kích hoạt người dùng thành công!');
      fetchUsers();
    } catch (error) {
      console.error('❌ Error activating user:', error);
      toast.error('❌ Lỗi khi kích hoạt người dùng');
    }
  };

  // Helpers
  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
      full_name: '',
      role_id: '',
      department_id: '',
    });
    setSelectedUser(null);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.Username,
      password: '',
      email: user.Email || '',
      full_name: user.FullName || '',
      role_id: user.RoleId || '',
      department_id: user.DepartmentId || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const getRoleBadgeColor = (roleLevel) => {
    switch (roleLevel) {
      case 3: return 'bg-purple-100 text-purple-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 1: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination
  const renderPagination = () => {
    const pages = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    if (totalPages > 0) {
      pages.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className={`px-3 py-1 rounded ${
            currentPage === 1
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          1
        </button>
      );
    }

    if (showEllipsisStart) {
      pages.push(<span key="ellipsis-start" className="px-2">...</span>);
    }

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }

    if (showEllipsisEnd) {
      pages.push(<span key="ellipsis-end" className="px-2">...</span>);
    }

    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p className="text-gray-600 mt-1">
          Quản lý tài khoản và phân quyền người dùng trong hệ thống
        </p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng ban
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
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.UserId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                            {user.FullName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.FullName}</div>
                          <div className="text-sm text-gray-500">@{user.Username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.Email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.RoleLevel)}`}>
                        {user.RoleName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.DepartmentName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.IsActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.IsActive ? 'Hoạt động' : 'Vô hiệu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {user.IsActive ? (
                          <button
                            onClick={() => handleDeleteUser(user.UserId)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(user.UserId)}
                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                            title="Kích hoạt lại"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> đến{' '}
                <span className="font-medium">{Math.min(currentPage * pageSize, totalUsers)}</span> trong tổng số{' '}
                <span className="font-medium">{totalUsers}</span> người dùng
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {renderPagination()}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Thêm người dùng mới</h3>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}
                className="text-white hover:bg-white/20 p-1 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Chọn vai trò</option>
                  {roles.map((role) => (
                    <option key={role.RoleId} value={role.RoleId}>
                      {role.RoleName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Chọn phòng ban</option>
                  {departments.map((dept) => (
                    <option key={dept.DepartmentId} value={dept.DepartmentId}>
                      {dept.DepartmentName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit">
                  Tạo người dùng
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Chỉnh sửa người dùng</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetForm();
                }}
                className="text-white hover:bg-white/20 p-1 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                <input
                  type="text"
                  value={formData.username}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Không thể thay đổi tên đăng nhập</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Để trống nếu không đổi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn vai trò</option>
                  {roles.map((role) => (
                    <option key={role.RoleId} value={role.RoleId}>
                      {role.RoleName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn phòng ban</option>
                  {departments.map((dept) => (
                    <option key={dept.DepartmentId} value={dept.DepartmentId}>
                      {dept.DepartmentName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit">
                  Cập nhật
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;