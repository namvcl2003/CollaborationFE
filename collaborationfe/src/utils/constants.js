export const ROLES = {
  ASSISTANT: { id: 1, name: 'Trợ lý', level: 1 },
  VICE_MANAGER: { id: 2, name: 'Phó phòng', level: 2 },
  MANAGER: { id: 3, name: 'Trưởng phòng', level: 3 },
  ADMIN: { id: 4, name: 'Quản trị viên', level: 4 },
};

export const DOCUMENT_STATUS = {
  DRAFT: { code: 'DRAFT', name: 'Bản thảo', color: 'gray' },
  PENDING: { code: 'PENDING', name: 'Chờ duyệt', color: 'yellow' },
  IN_REVIEW: { code: 'IN_REVIEW', name: 'Đang xem xét', color: 'blue' },
  REVISION_REQUESTED: { code: 'REVISION_REQUESTED', name: 'Yêu cầu chỉnh sửa', color: 'orange' },
  APPROVED: { code: 'APPROVED', name: 'Đã phê duyệt', color: 'green' },
  REJECTED: { code: 'REJECTED', name: 'Từ chối', color: 'red' },
  COMPLETED: { code: 'COMPLETED', name: 'Hoàn thành', color: 'green' },
};

export const PRIORITY = {
  HIGH: { value: 1, name: 'Cao', color: 'red' },
  MEDIUM: { value: 2, name: 'Trung bình', color: 'yellow' },
  LOW: { value: 3, name: 'Thấp', color: 'green' },
};