import { CheckCircle, FileText, Search, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { documentsAPI } from '../api/documents';
import Loading from '../components/common/Loading';
import Pagination from '../components/common/Pagination';
import StatusBadge from '../components/common/StatusBadge';
import { formatRelativeTime } from '../utils/helpers';
import { useAuthStore } from '../store/authStore';

const DepartmentApprovedDocuments = () => {
  const user = useAuthStore((state) => state.user);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 10,
    search: '',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 0,
  });

  useEffect(() => {
    fetchDocuments();
  }, [filters.page, filters.page_size]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // Lấy tất cả văn bản và lọc những văn bản đã duyệt trong cùng phòng ban
      const data = await documentsAPI.getDocuments({
        page: filters.page,
        page_size: 100, // Lấy nhiều để lọc
        status_filter: 'APPROVED',
      });

      // Lọc chỉ lấy văn bản của phòng ban
      const departmentDocs = data.items.filter(
        (doc) => doc.DepartmentId === user?.DepartmentId
      );

      setDocuments(departmentDocs);
    } catch (error) {
      console.error('Error fetching approved documents:', error);
      toast.error('Không thể tải danh sách văn bản đã duyệt');
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setFilters({ ...filters, page_size: newSize, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  // Lọc theo search term
  const filteredDocuments = documents.filter(doc => {
    if (!filters.search.trim()) return true;

    const searchLower = filters.search.toLowerCase();
    return (
      doc.Title?.toLowerCase().includes(searchLower) ||
      doc.DocumentNumber?.toLowerCase().includes(searchLower) ||
      doc.Description?.toLowerCase().includes(searchLower) ||
      doc.created_by?.FullName?.toLowerCase().includes(searchLower)
    );
  });

  // Phân trang sau khi lọc
  const startIndex = (filters.page - 1) * filters.page_size;
  const endIndex = startIndex + filters.page_size;
  const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-12 w-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Văn bản đã duyệt - Phòng ban</h1>
              <p className="text-green-100 mt-1">
                Danh sách văn bản đã được phê duyệt trong phòng ban của bạn
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white bg-opacity-10 rounded-lg px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <div>
                  <p className="text-sm opacity-90">Tổng số văn bản</p>
                  <p className="text-2xl font-bold">{documents.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <div>
                  <p className="text-sm opacity-90">Phòng ban</p>
                  <p className="text-lg font-bold">{user?.department?.DepartmentName || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-white opacity-5"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full bg-white opacity-5"></div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, số văn bản, mô tả, người tạo..."
            className="pl-10 input"
            value={filters.search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Document List */}
      {paginatedDocuments.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Chưa có văn bản đã duyệt
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Không có văn bản nào đã được phê duyệt trong phòng ban của bạn
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {paginatedDocuments.map((doc) => (
            <Link
              key={doc.DocumentId}
              to={`/documents/${doc.DocumentId}`}
              className="card hover:shadow-md transition-shadow border-l-4 border-green-500 dark:border-green-400"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {doc.Title}
                    </h3>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Đã duyệt
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {doc.DocumentNumber}
                  </p>
                </div>
                <StatusBadge priority={doc.Priority} />
              </div>

              {doc.Description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {doc.Description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Người tạo:</span>{' '}
                    {doc.created_by?.FullName || 'N/A'}
                  </div>
                  {doc.ApprovedAt && (
                    <span className="flex items-center text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Duyệt {formatRelativeTime(doc.ApprovedAt)}
                    </span>
                  )}
                </div>
                <span className="flex items-center text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatRelativeTime(doc.CreatedAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination - Always show if there are documents */}
      {documents.length > 0 && (
        <Pagination
          currentPage={filters.page}
          pageSize={filters.page_size}
          totalItems={documents.length}
          filteredItems={filteredDocuments.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          colorScheme="green"
          showFiltered={!!filters.search}
        />
      )}
    </div>
  );
};

export default DepartmentApprovedDocuments;
