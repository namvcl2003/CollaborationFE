
const StatusBadge = ({ status, priority }) => {
  if (status) {
    const statusColors = {
      DRAFT: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
      PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
      IN_REVIEW: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
      REVISION_REQUESTED: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
      APPROVED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
      REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
      COMPLETED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    };

    const statusNames = {
      DRAFT: 'Bản thảo',
      PENDING: 'Chờ duyệt',
      IN_REVIEW: 'Đang xem xét',
      REVISION_REQUESTED: 'Yêu cầu chỉnh sửa',
      APPROVED: 'Đã phê duyệt',
      REJECTED: 'Từ chối',
      COMPLETED: 'Hoàn thành',
    };

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {statusNames[status] || status}
      </span>
    );
  }

  if (priority) {
    const priorityColors = {
      1: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
      2: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
      3: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    };

    const priorityNames = {
      1: 'Cao',
      2: 'Trung bình',
      3: 'Thấp',
    };

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[priority]}`}>
        {priorityNames[priority] || priority}
      </span>
    );
  }

  return null;
};

export default StatusBadge;