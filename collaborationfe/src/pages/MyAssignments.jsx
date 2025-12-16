import { Calendar, CheckSquare, ClipboardList, User, Edit, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { workflowAPI } from '../api/workflow';
import { documentsAPI } from '../api/documents';
import Loading from '../components/common/Loading';
import StatusBadge from '../components/common/StatusBadge';
import Avatar from '../components/common/Avatar';
import { formatRelativeTime } from '../utils/helpers';
import { useAuthStore } from '../store/authStore';

const MyAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'in_review', 'revision'
  const { user } = useAuthStore();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      // Lấy cả assignments và documents mà user liên quan
      const [assignmentsData, documentsData] = await Promise.all([
        workflowAPI.getMyAssignments(),
        documentsAPI.getDocuments({ page: 1, page_size: 100 })
      ]);

      // Lọc documents mà user đang phụ trách HOẶC do user tạo ra
      const myRelatedDocs = documentsData.items.filter(doc =>
        doc.CurrentHandlerUserId === user?.UserId ||
        doc.CreatedByUserId === user?.UserId
      );

      // Chuyển documents thành format giống assignments
      const docsAsAssignments = myRelatedDocs.map(doc => ({
        AssignmentId: `doc-${doc.DocumentId}`,
        DocumentId: doc.DocumentId,
        AssignedToUserId: user?.UserId,
        AssignedByUserId: doc.CreatedByUserId,
        WorkflowLevel: user?.role?.RoleLevel,
        IsActive: true,
        AssignedAt: doc.CreatedAt,
        document: doc
      }));

      // Merge assignments và documents, loại bỏ duplicate
      const documentIds = new Set(assignmentsData.map(a => a.DocumentId));
      const uniqueDocs = docsAsAssignments.filter(d => !documentIds.has(d.DocumentId));
      const allWork = [...assignmentsData, ...uniqueDocs];

      console.log('📋 All work data:', allWork);
      console.log('📊 Status breakdown:', allWork.map(a => ({
        id: a.DocumentId,
        title: a.document?.Title,
        status: a.document?.status?.StatusCode,
        createdBy: a.document?.CreatedByUserId,
        currentHandler: a.document?.CurrentHandlerUserId
      })));

      setAssignments(allWork);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Không thể tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  // Đang xử lý = Tất cả văn bản mà user đang phụ trách (CurrentHandler) và chưa được phê duyệt
  const inReviewCount = assignments.filter(a =>
    a.document?.CurrentHandlerUserId === user?.UserId &&
    a.document?.status?.StatusCode !== 'APPROVED'
  ).length;

  // Chờ xử lý = Văn bản do mình tạo nhưng đang được người khác xử lý và chưa hoàn thành
  const pendingCount = assignments.filter(a =>
    a.document?.CreatedByUserId === user?.UserId &&
    a.document?.CurrentHandlerUserId !== user?.UserId &&
    a.document?.status?.StatusCode !== 'APPROVED' &&
    a.document?.status?.StatusCode !== 'REJECTED'
  ).length;

  // Cần sửa đổi = chỉ REVISION_REQUESTED
  const revisionCount = assignments.filter(a => a.document?.status?.StatusCode === 'REVISION_REQUESTED').length;

  const completedCount = assignments.filter(a => a.document?.status?.StatusCode === 'APPROVED').length;

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'revision') {
      return assignment.document?.status?.StatusCode === 'REVISION_REQUESTED';
    }
    if (filter === 'pending') {
      // Chờ xử lý = Văn bản do mình tạo nhưng đang được người khác xử lý và chưa hoàn thành
      return assignment.document?.CreatedByUserId === user?.UserId &&
             assignment.document?.CurrentHandlerUserId !== user?.UserId &&
             assignment.document?.status?.StatusCode !== 'APPROVED' &&
             assignment.document?.status?.StatusCode !== 'REJECTED';
    }
    if (filter === 'in_review') {
      // Đang xử lý = Văn bản mà user đang phụ trách (CurrentHandler) và chưa được phê duyệt
      return assignment.document?.CurrentHandlerUserId === user?.UserId &&
             assignment.document?.status?.StatusCode !== 'APPROVED';
    }
    return true; // 'all'
  });

  return (
    <div className="space-y-6">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-12 w-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <ClipboardList className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Công việc của tôi</h1>
              <p className="text-primary-100 mt-1">
                Văn bản được giao xử lý, văn bản đang chờ xử lý và văn bản cần sửa đổi
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-3">
            <div className="bg-white bg-opacity-10 rounded-lg px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-5 w-5" />
                <div>
                  <p className="text-sm opacity-90">Tổng số</p>
                  <p className="text-2xl font-bold">{assignments.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <div>
                  <p className="text-sm opacity-90">Chờ xử lý</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-500 bg-opacity-20 rounded-lg px-4 py-3 backdrop-blur-sm border border-blue-300 border-opacity-30">
              <div className="flex items-center space-x-2">
                <ClipboardList className="h-5 w-5" />
                <div>
                  <p className="text-sm opacity-90">Đang xử lý</p>
                  <p className="text-2xl font-bold">{inReviewCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-500 bg-opacity-20 rounded-lg px-4 py-3 backdrop-blur-sm border border-yellow-300 border-opacity-30">
              <div className="flex items-center space-x-2">
                <Edit className="h-5 w-5" />
                <div>
                  <p className="text-sm opacity-90">Cần sửa đổi</p>
                  <p className="text-2xl font-bold">{revisionCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-5 w-5" />
                <div>
                  <p className="text-sm opacity-90">Đã hoàn thành</p>
                  <p className="text-2xl font-bold">{completedCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-white opacity-5"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full bg-white opacity-5"></div>
      </div>

      {/* Filter Tabs */}
      <div className="card">
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Tất cả ({assignments.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Chờ xử lý ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('in_review')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              filter === 'in_review'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-1">
              <ClipboardList className="h-4 w-4" />
              <span>Đang xử lý ({inReviewCount})</span>
            </div>
          </button>
          <button
            onClick={() => setFilter('revision')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              filter === 'revision'
                ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-600 dark:border-yellow-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-1">
              <Edit className="h-4 w-4" />
              <span>Cần sửa đổi ({revisionCount})</span>
            </div>
          </button>
        </div>
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="card text-center py-12">
          <CheckSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {filter === 'all' ? 'Không có công việc nào' :
             filter === 'pending' ? 'Không có công việc chờ xử lý' :
             filter === 'in_review' ? 'Không có văn bản đang xử lý' :
             filter === 'revision' ? 'Không có văn bản cần sửa đổi' :
             'Không có công việc'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filter === 'all' ? 'Bạn đã hoàn thành tất cả công việc được giao' :
             filter === 'pending' ? 'Không có văn bản nào của bạn đang chờ người khác xử lý' :
             filter === 'in_review' ? 'Không có văn bản nào đang được xem xét' :
             filter === 'revision' ? 'Không có văn bản nào cần sửa đổi' :
             'Hãy tiếp tục công việc tốt!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAssignments.map((assignment) => {
            const isRevision = assignment.document?.status?.StatusCode === 'REVISION_REQUESTED';
            return (
            <Link
              key={assignment.AssignmentId}
              to={`/documents/${assignment.document?.DocumentId}`}
              className={`card hover:shadow-md transition-shadow ${
                isRevision ? 'border-l-4 border-yellow-500 dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : ''
              }`}
            >
              {/* Revision Alert Banner */}
              {isRevision && (
                <div className="flex items-center space-x-2 mb-3 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      Văn bản cần chỉnh sửa
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">
                      Cấp trên yêu cầu sửa đổi văn bản này
                    </p>
                  </div>
                  <Edit className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {assignment.document?.Title}
                    </h3>
                    {isRevision && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300">
                        <Edit className="h-3 w-3 mr-1" />
                        Cần sửa
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {assignment.document?.DocumentNumber}
                  </p>
                </div>
                <StatusBadge status={assignment.document?.status?.StatusCode} />
              </div>

              {assignment.document?.Description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {assignment.document?.Description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Avatar user={assignment.assigned_by} size="xs" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {assignment.assigned_by?.FullName}
                    </span>
                  </div>
                  <span className="flex items-center text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatRelativeTime(assignment.AssignedAt)}
                  </span>
                </div>
                <StatusBadge priority={assignment.document?.Priority} />
              </div>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAssignments;