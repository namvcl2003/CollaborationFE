import { ArrowRight, Calendar, CheckCircle, FileText, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/helpers';
import StatusBadge from '../common/StatusBadge';
import { useAuthStore } from '../../store/authStore';

const DocumentCard = ({ document }) => {
  const currentUser = useAuthStore((state) => state.user);

  // Kiểm tra xem user hiện tại có phải là người đang xử lý không
  const isCurrentHandler = document.CurrentHandlerUserId === currentUser?.UserId;
  const isCreator = document.CreatedByUserId === currentUser?.UserId;

  // Xác định xem văn bản có cần action từ user không
  const needsAction = isCurrentHandler &&
    (document.status?.StatusCode === 'DRAFT' ||
     document.status?.StatusCode === 'PENDING' ||
     document.status?.StatusCode === 'IN_REVIEW' ||
     document.status?.StatusCode === 'REVISION_REQUESTED');

  return (
    <Link
      to={`/documents/${document.DocumentId}`}
      className={`block rounded-lg border p-6 transition-all ${
        needsAction
          ? 'bg-blue-50 border-blue-300 hover:shadow-lg hover:border-blue-400'
          : 'bg-white border-gray-200 hover:shadow-md'
      }`}
    >
      {/* Header với indicator */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`p-2 rounded-lg ${
            needsAction ? 'bg-blue-100' : 'bg-primary-50'
          }`}>
            <FileText className={`h-6 w-6 ${
              needsAction ? 'text-blue-600' : 'text-primary-600'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {document.Title}
              </h3>
              {needsAction && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full whitespace-nowrap">
                  <CheckCircle className="h-3 w-3" />
                  Cần xử lý
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {document.DocumentNumber}
            </p>
          </div>
        </div>
        <ArrowRight className={`h-5 w-5 flex-shrink-0 ml-2 ${
          needsAction ? 'text-blue-600' : 'text-gray-400'
        }`} />
      </div>

      {/* Description */}
      {document.Description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {document.Description}
        </p>
      )}

      {/* Footer với thông tin */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={document.status?.StatusCode} />
          <StatusBadge priority={document.Priority} />

          {/* Hiển thị ai đang xử lý */}
          {document.current_handler && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
              isCurrentHandler
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-600'
            }`}>
              <User className="h-3 w-3" />
              {isCurrentHandler ? 'Bạn đang xử lý' : document.current_handler.FullName}
            </div>
          )}
        </div>

        <div className="text-gray-500 flex items-center whitespace-nowrap">
          <Calendar className="h-4 w-4 mr-1" />
          {formatRelativeTime(document.CreatedAt)}
        </div>
      </div>
    </Link>
  );
};

export default DocumentCard;