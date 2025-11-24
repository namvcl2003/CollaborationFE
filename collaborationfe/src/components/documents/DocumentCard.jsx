import { ArrowRight, Calendar, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/helpers';
import StatusBadge from '../common/StatusBadge';

const DocumentCard = ({ document }) => {
  return (
    <Link
      to={`/documents/${document.DocumentId}`}
      className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className="p-2 bg-primary-50 rounded-lg">
            <FileText className="h-6 w-6 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {document.Title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {document.DocumentNumber}
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
      </div>

      {document.Description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {document.Description}
        </p>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <StatusBadge status={document.status?.StatusCode} />
          <StatusBadge priority={document.Priority} />
        </div>

        <div className="text-gray-500 flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          {formatRelativeTime(document.CreatedAt)}
        </div>
      </div>
    </Link>
  );
};

export default DocumentCard;