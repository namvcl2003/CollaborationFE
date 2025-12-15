import { FileText, Search } from 'lucide-react';
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

  const handlePageSizeChange = (newSize) => {
    setFilters({ ...filters, page_size: newSize, page: 1 });
  };
  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 0,
  });

  useEffect(() => {
    fetchDocuments();
  }, [filters.page, filters.status_filter, filters.page_size]);

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

      {/* Pagination - Always show if there are documents */}
      {documents.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Top row: Info and Page Size Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Info */}
              <div className="text-sm text-gray-700">
                Hiển thị{' '}
                <span className="font-semibold text-primary-600">
                  {((filters.page - 1) * filters.page_size) + 1}
                </span>
                {' '}-{' '}
                <span className="font-semibold text-primary-600">
                  {Math.min(filters.page * filters.page_size, pagination.total)}
                </span>
                {' '}trong tổng số{' '}
                <span className="font-semibold text-primary-600">{pagination.total}</span> văn bản
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Hiển thị:</label>
                <select
                  value={filters.page_size}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={5}>5 / trang</option>
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>
              </div>
            </div>

            {/* Page navigation - Only show if multiple pages */}
            {pagination.total_pages > 1 && (
            <div className="flex items-center justify-center gap-1">
              {/* Previous button */}
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                ← Trước
              </button>

              {/* Page numbers */}
              <div className="flex gap-1">
                {(() => {
                  const pages = [];
                  const totalPages = pagination.total_pages;
                  const current = filters.page;

                  // Luôn hiển thị trang đầu
                  pages.push(1);

                  // Thêm ... nếu cần
                  if (current > 3) {
                    pages.push('...');
                  }

                  // Hiển thị các trang xung quanh trang hiện tại
                  for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
                    if (!pages.includes(i)) {
                      pages.push(i);
                    }
                  }

                  // Thêm ... nếu cần
                  if (current < totalPages - 2) {
                    pages.push('...');
                  }

                  // Luôn hiển thị trang cuối
                  if (totalPages > 1 && !pages.includes(totalPages)) {
                    pages.push(totalPages);
                  }

                  return pages.map((page, index) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                          ...
                        </span>
                      );
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          page === current
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Next button */}
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === pagination.total_pages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Sau →
              </button>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;