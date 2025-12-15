import { CheckCircle, RotateCcw, Send, XCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { usersAPI } from '../../api/users';
import { workflowAPI } from '../../api/workflow';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useAuthStore } from '../../store/authStore';

const WorkflowActions = ({ document, onActionComplete }) => {
  const currentUser = useAuthStore((state) => state.user);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if current user is the handler
  const isCurrentHandler = document.CurrentHandlerUserId === currentUser?.UserId;

  // Chỉ hiển thị nút Gửi duyệt nếu:
  // 1. Văn bản ở trạng thái DRAFT hoặc REVISION_REQUESTED
  // 2. User hiện tại là người đang xử lý (CurrentHandler)
  const canSubmit = isCurrentHandler &&
                    (document.status?.StatusCode === 'DRAFT' ||
                     document.status?.StatusCode === 'REVISION_REQUESTED');

  // Chỉ hiển thị nút Phê duyệt/Từ chối nếu:
  // 1. Văn bản ở trạng thái PENDING hoặc IN_REVIEW
  // 2. User hiện tại là người đang xử lý (CurrentHandler)
  const canApprove = isCurrentHandler &&
                     (document.status?.StatusCode === 'PENDING' ||
                      document.status?.StatusCode === 'IN_REVIEW');
  const canReject = canApprove;
  const canRequestRevision = canApprove;

  const handleAction = async () => {
    if (!actionType) return;

    setLoading(true);
    try {
      let result;
      
      switch (actionType) {
        case 'submit':
          if (!selectedUser) {
            toast.error('Vui lòng chọn người nhận');
            return;
          }
          result = await workflowAPI.submitDocument(document.DocumentId, {
            ToUserId: parseInt(selectedUser),
            Comments: comments,
          });
          toast.success('Gửi văn bản thành công!');
          break;

        case 'approve':
          result = await workflowAPI.approveDocument(document.DocumentId, {
            Comments: comments,
            SendToNextLevel: false,
          });
          toast.success('Phê duyệt văn bản thành công!');
          break;

        case 'reject':
          if (!comments.trim()) {
            toast.error('Vui lòng nhập lý do từ chối');
            return;
          }
          result = await workflowAPI.rejectDocument(document.DocumentId, {
            Comments: comments,
          });
          toast.success('Đã từ chối văn bản');
          break;

        case 'revision':
          if (!selectedUser || !comments.trim()) {
            toast.error('Vui lòng chọn người nhận và nhập lý do yêu cầu chỉnh sửa');
            return;
          }
          result = await workflowAPI.requestRevision(document.DocumentId, {
            SendBackToUserId: parseInt(selectedUser),
            Comments: comments,
          });
          toast.success('Đã yêu cầu chỉnh sửa');
          break;

        default:
          break;
      }

      setShowModal(false);
      setComments('');
      setSelectedUser('');
      if (onActionComplete) onActionComplete();
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error(error.response?.data?.detail || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (type) => {
    setActionType(type);
    
    if (type === 'submit') {
      try {
        const data = await usersAPI.getHigherLevelUsers();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Không thể tải danh sách người dùng');
        return;
      }
    } else if (type === 'revision') {
      try {
        const data = await usersAPI.getLowerLevelUsers();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Không thể tải danh sách người dùng');
        return;
      }
    }
    
    setShowModal(true);
  };

  const getModalTitle = () => {
    switch (actionType) {
      case 'submit': return 'Gửi văn bản';
      case 'approve': return 'Phê duyệt văn bản';
      case 'reject': return 'Từ chối văn bản';
      case 'revision': return 'Yêu cầu chỉnh sửa';
      default: return '';
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {canSubmit && (
          <Button
            variant="primary"
            icon={Send}
            onClick={() => openModal('submit')}
          >
            Gửi duyệt
          </Button>
        )}

        {canApprove && (
          <>
            <Button
              variant="success"
              icon={CheckCircle}
              onClick={() => openModal('approve')}
            >
              Phê duyệt
            </Button>

            <Button
              variant="warning"
              icon={RotateCcw}
              onClick={() => openModal('revision')}
            >
              Yêu cầu chỉnh sửa
            </Button>

            <Button
              variant="danger"
              icon={XCircle}
              onClick={() => openModal('reject')}
            >
              Từ chối
            </Button>
          </>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={getModalTitle()}
      >
        <div className="space-y-4">
          {(actionType === 'submit' || actionType === 'revision') && (
            <div>
              <label className="label">
                {actionType === 'submit' ? 'Gửi đến' : 'Gửi lại cho'} *
              </label>
              <select
                className="input"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Chọn người nhận</option>
                {users.map((user) => (
                  <option key={user.UserId} value={user.UserId}>
                    {user.FullName} - {user.role?.RoleName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="label">
              {actionType === 'reject' || actionType === 'revision' 
                ? 'Lý do *' 
                : 'Ghi chú'}
            </label>
            <textarea
              className="input"
              rows={4}
              placeholder={`Nhập ${actionType === 'reject' || actionType === 'revision' ? 'lý do' : 'ghi chú'}...`}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              required={actionType === 'reject' || actionType === 'revision'}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAction}
              loading={loading}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default WorkflowActions;