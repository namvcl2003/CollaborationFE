import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import DocumentList from '../components/documents/DocumentList';
import { useAuthStore } from '../store/authStore';

const Documents = () => {
  const user = useAuthStore((state) => state.user);
  const canCreate = user?.role?.RoleLevel === 1; // Only assistants can create

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Văn bản của tôi</h1>
          <p className="mt-2 text-gray-600">
            Quản lý và theo dõi các văn bản của bạn
          </p>
        </div>
        {canCreate && (
          <Link to="/documents/create">
            <Button icon={Plus}>Tạo văn bản mới</Button>
          </Link>
        )}
      </div>

      <DocumentList />
    </div>
  );
};

export default Documents;