import { Clock, MessageSquare, User, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { workflowAPI } from '../../api/workflow';
import { formatDate } from '../../utils/helpers';
import Loading from '../common/Loading';
import Avatar from '../common/Avatar';

const WorkflowHistory = ({ documentId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [documentId]);

  const fetchHistory = async () => {
    try {
      const data = await workflowAPI.getWorkflowHistory(documentId);
      setHistory(data);
    } catch (error) {
      console.error('Error fetching workflow history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  const getActionColor = (action) => {
    const colors = {
      SUBMIT: 'bg-blue-100 text-blue-800',
      APPROVE: 'bg-green-100 text-green-800',
      REJECT: 'bg-red-100 text-red-800',
      REVISION_REQUEST: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const getActionName = (action) => {
    const names = {
      SUBMIT: 'Gửi duyệt',
      APPROVE: 'Phê duyệt',
      REJECT: 'Từ chối',
      REVISION_REQUEST: 'Yêu cầu chỉnh sửa',
      COMPLETED: 'Hoàn thành',
    };
    return names[action] || action;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Lịch sử xử lý</h3>

      {history.length === 0 ? (
        <p className="text-gray-500 text-sm">Chưa có lịch sử xử lý</p>
      ) : (
        <div className="flow-root">
          <ul className="-mb-8">
            {history.map((item, index) => (
              <li key={item.HistoryId}>
                <div className="relative pb-8">
                  {index !== history.length - 1 && (
                    <span
                      className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex items-start space-x-3">
                    <div>
                      <div className="relative px-1">
                        <div className="ring-8 ring-white rounded-full">
                          <Avatar user={item.from_user} size="md" />
                        </div>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {item.from_user?.FullName}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getActionColor(item.Action)}`}>
                            {getActionName(item.Action)}
                          </span>
                        </div>
                        {item.to_user && (
                          <div className="flex items-center space-x-2 mt-1">
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <Avatar user={item.to_user} size="xs" />
                            <p className="text-sm text-gray-600">
                              {item.to_user.FullName}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(item.CreatedAt)}
                        </p>
                      </div>
                      {item.Comments && (
                        <div className="mt-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <MessageSquare className="h-4 w-4 inline mr-1 text-gray-400" />
                          {item.Comments}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WorkflowHistory;