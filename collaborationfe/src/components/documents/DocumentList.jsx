import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { documentsAPI } from '../../api/documents';
import Loading from '../common/Loading';
import DocumentCard from './DocumentCard';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 10,
    status_filter: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 0,
  });

  useEffect(() => {
    fetchDocuments();
  }, [filters.page, filters.status_filter]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await documentsAPI.getDocuments({
        page: filters.page,
        page_size: filters.page_size,
        status_filter: filters.status_filter || undefined,
      });
      setDocuments(data.items);
      setPagination({
        total: data.total,
        total_pages: data.total_pages,
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Không thể tải danh sách văn bản');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status) => {
    setFilters({ ...filters, status_filter: status, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm văn bản..."
                className="pl-10 input"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleStatusFilter('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.status_filter === ''
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => handleStatusFilter('DRAFT')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.status_filter === 'DRAFT'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bản thảo
            </button>
            <button
              onClick={() => handleStatusFilter('PENDING')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.status_filter === 'PENDING'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Chờ duyệt
            </button>
            <button
              onClick={() => handleStatusFilter('APPROVED')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.status_filter === 'APPROVED'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đã duyệt
            </button>
          </div>
        </div>
      </div>

      {/* Document List */}
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có văn bản</h3>
          <p className="mt-1 text-sm text-gray-500">
            Bắt đầu bằng cách tạo một văn bản mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {documents.map((doc) => (
            <DocumentCard key={doc.DocumentId} document={doc} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">{documents.length}</span> trong tổng số{' '}
            <span className="font-medium">{pagination.total}</span> văn bản
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Trước
            </button>
            <span className="px-3 py-1 text-sm">
              Trang {filters.page} / {pagination.total_pages}
            </span>
            <button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page === pagination.total_pages}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;