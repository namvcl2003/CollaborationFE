
const StatusBadge = ({ status, priority }) => {
  if (status) {
    const statusColors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_REVIEW: 'bg-blue-100 text-blue-800',
      REVISION_REQUESTED: 'bg-orange-100 text-orange-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-green-100 text-green-800',
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
      1: 'bg-red-100 text-red-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-green-100 text-green-800',
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