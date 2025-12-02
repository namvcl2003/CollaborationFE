// import { Mail, Shield, User, Users as UsersIcon } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import toast from 'react-hot-toast';
// import { usersAPI } from '../api/users';
// import Loading from '../components/common/Loading';

// const Users = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       const data = await usersAPI.getDepartmentUsers();
//       setUsers(data);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       toast.error('Không thể tải danh sách người dùng');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return <Loading fullScreen />;
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
//         <p className="mt-2 text-gray-600">
//           Danh sách người dùng trong phòng ban ({users.length})
//         </p>
//       </div>

//       {users.length === 0 ? (
//         <div className="card text-center py-12">
//           <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
//           <h3 className="mt-2 text-sm font-medium text-gray-900">
//             Không có người dùng
//           </h3>
//           <p className="mt-1 text-sm text-gray-500">
//             Chưa có người dùng nào trong hệ thống
//           </p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {users.map((user) => (
//             <div key={user.UserId} className="card">
//               <div className="flex items-start space-x-4">
//                 <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
//                   <User className="h-6 w-6 text-primary-600" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <h3 className="text-lg font-semibold text-gray-900 truncate">
//                     {user.FullName}
//                   </h3>
//                   <p className="text-sm text-gray-600 truncate">
//                     @{user.Username}
//                   </p>
//                 </div>
//               </div>

//               <div className="mt-4 space-y-2">
//                 <div className="flex items-center text-sm text-gray-600">
//                   <Shield className="h-4 w-4 mr-2 text-gray-400" />
//                   <span>{user.role?.RoleName}</span>
//                 </div>

//                 {user.Email && (
//                   <div className="flex items-center text-sm text-gray-600">
//                     <Mail className="h-4 w-4 mr-2 text-gray-400" />
//                     <span className="truncate">{user.Email}</span>
//                   </div>
//                 )}

//                 {user.department && (
//                   <div className="mt-2">
//                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                       {user.department.DepartmentName}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Users;


import UserManagement from '../components/admin/UserManagement';

const Users = () => {
  return <UserManagement />;
};

export default Users;