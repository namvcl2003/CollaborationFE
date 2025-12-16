import { FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import DocumentList from '../components/documents/DocumentList';
import { useAuthStore } from '../store/authStore';

const Documents = () => {
  const user = useAuthStore((state) => state.user);
  const canCreate = user?.role?.RoleLevel === 1; // Only assistants can create

  return (
    <div className="space-y-6">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-12 w-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FileText className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Văn bản của tôi</h1>
                  <p className="text-primary-100 mt-1">
                    Quản lý và theo dõi các văn bản của bạn
                  </p>
                </div>
              </div>
            </div>
            {canCreate && (
              <Link to="/documents/create">
                <button className="group flex items-center space-x-2 px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:shadow-xl transition-all duration-300">
                  <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Tạo văn bản mới</span>
                </button>
              </Link>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-white opacity-5"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full bg-white opacity-5"></div>
      </div>

      <DocumentList />
    </div>
  );
};

export default Documents;