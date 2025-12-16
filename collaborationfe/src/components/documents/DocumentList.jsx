import { FileText, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { documentsAPI } from '../../api/documents';
import Loading from '../common/Loading';
import Pagination from '../common/Pagination';
import DocumentCard from './DocumentCard';
import { usePinnedStore } from '../../store/pinnedStore';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 10,
    status_filter: '',
    priority_filter: '',
    search: '',
  });

  const { loadPinnedIds } = usePinnedStore();

  const handlePageSizeChange = (newSize) => {
    setFilters({ ...filters, page_size: newSize, page: 1 });
  };
  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 0,
  });

  // Debounce search input
  useEffect(() => {
    if (searchInput !== filters.search) {
      setSearching(true);
    }

    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
      setSearching(false);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput]);

  useEffect(() => {
    fetchDocuments();
  }, [filters.page, filters.status_filter, filters.priority_filter, filters.page_size, filters.search]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await documentsAPI.getDocuments({
        page: filters.page,
        page_size: filters.page_size,
        status_filter: filters.status_filter || undefined,
        priority_filter: filters.priority_filter || undefined,
        search: filters.search || undefined,
      });

      // Sort documents: pinned ones first, then by creation date
      const sortedDocuments = [...data.items].sort((a, b) => {
        // If one is pinned and the other is not, pinned comes first
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        // If both have same pinned status, maintain original order
        return 0;
      });

      setDocuments(sortedDocuments);
      setPagination({
        total: data.total,
        total_pages: data.total_pages,
      });
      // Load pinned IDs from all documents
      if (data.items && data.items.length > 0) {
        loadPinnedIds(data.items);
      }
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

  const handlePriorityFilter = (priority) => {
    setFilters({ ...filters, priority_filter: priority, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                searching ? 'text-primary-500 dark:text-primary-400 animate-pulse' : 'text-gray-400 dark:text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề, số văn bản..."
                className="pl-10 input"
                value={searchInput}
                onChange={handleSearch}
              />
              {searching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex gap-3 items-end">
            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleStatusFilter('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.status_filter === ''
                    ? 'bg-primary-600 dark:bg-primary-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => handleStatusFilter('DRAFT')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.status_filter === 'DRAFT'
                    ? 'bg-primary-600 dark:bg-primary-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Bản thảo
              </button>
              <button
                onClick={() => handleStatusFilter('PENDING')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.status_filter === 'PENDING'
                    ? 'bg-primary-600 dark:bg-primary-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Chờ duyệt
              </button>
              <button
                onClick={() => handleStatusFilter('APPROVED')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.status_filter === 'APPROVED'
                    ? 'bg-primary-600 dark:bg-primary-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Đã duyệt
              </button>
            </div>

            {/* Priority Filter Dropdown */}
            <div className="min-w-[160px]">
              <select
                value={filters.priority_filter}
                onChange={(e) => handlePriorityFilter(e.target.value)}
                className="w-full h-[37px] px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
                style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
              >
                <option value="">Tất cả mức độ</option>
                <option value="1">🔴 Cao</option>
                <option value="2">🟡 Trung bình</option>
                <option value="3">🟢 Thấp</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Document List Header */}
      {documents.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Văn bản của tôi
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {pagination.total} văn bản
          </span>
        </div>
      )}

      {/* Document List */}
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Chưa có văn bản</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Bắt đầu bằng cách tạo một văn bản mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {documents.map((doc) => (
            <DocumentCard key={doc.DocumentId} document={doc} onPinChange={fetchDocuments} />
          ))}
        </div>
      )}

      {/* Pagination - Always show if there are documents */}
      {documents.length > 0 && (
        <Pagination
          currentPage={filters.page}
          totalPages={pagination.total_pages}
          pageSize={filters.page_size}
          totalItems={pagination.total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          colorScheme="primary"
        />
      )}
    </div>
  );
};

export default DocumentList;