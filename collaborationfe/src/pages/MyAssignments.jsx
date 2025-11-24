import { Calendar, CheckSquare, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { workflowAPI } from '../api/workflow';
import Loading from '../components/common/Loading';
import StatusBadge from '../components/common/StatusBadge';
import { formatRelativeTime } from '../utils/helpers';

const MyAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await workflowAPI.getMyAssignments();
      setAssignments(data);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Công việc được giao</h1>
        <p className="mt-2 text-gray-600">
          Danh sách văn bản cần xử lý ({assignments.length})
        </p>
      </div>

      {assignments.length === 0 ? (
        <div className="card text-center py-12">
          <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Không có công việc nào
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Bạn đã hoàn thành tất cả công việc được giao
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {assignments.map((assignment) => (
            <Link
              key={assignment.AssignmentId}
              to={`/documents/${assignment.document?.DocumentId}`}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {assignment.document?.Title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {assignment.document?.DocumentNumber}
                  </p>
                </div>
                <StatusBadge status={assignment.document?.status?.StatusCode} />
              </div>

              {assignment.document?.Description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {assignment.document?.Description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {assignment.assigned_by?.FullName}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatRelativeTime(assignment.AssignedAt)}
                  </span>
                </div>
                <StatusBadge priority={assignment.document?.Priority} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAssignments;