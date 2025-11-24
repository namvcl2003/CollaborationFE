import { Send, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { usersAPI } from '../../api/users';
import { workflowAPI } from '../../api/workflow';
import Button from '../common/Button';
import Modal from '../common/Modal';

const SubmitModal = ({ isOpen, onClose, document, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHigherLevelUsers();
    }
  }, [isOpen]);

  const fetchHigherLevelUsers = async () => {
    try {
      const data = await usersAPI.getHigherLevelUsers();
      setUsers(data);
      if (data.length > 0) {
        setSelectedUser(data[0].UserId.toString());
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser) {
      toast.error('Vui lòng chọn người nhận');
      return;
    }

    setLoading(true);
    try {
      await workflowAPI.submitDocument(document.DocumentId, {
        ToUserId: parseInt(selectedUser),
        Comments: comments.trim() || undefined,
      });

      toast.success('Gửi văn bản thành công!');
      
      // Reset form
      setSelectedUser('');
      setComments('');
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting document:', error);
      toast.error(error.response?.data?.detail || 'Gửi văn bản thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedUser('');
      setComments('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Gửi văn bản lên cấp trên"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Document Info */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Thông tin văn bản
          </h4>
          <p className="text-sm text-gray-600">
            {document?.Title}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {document?.DocumentNumber}
          </p>
        </div>

        {/* Select User */}
        <div>
          <label className="label">
            <User className="h-4 w-4 inline mr-1" />
            Gửi đến *
          </label>
          <select
            className="input"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            required
            disabled={loading}
          >
            <option value="">-- Chọn người nhận --</option>
            {users.map((user) => (
              <option key={user.UserId} value={user.UserId}>
                {user.FullName} - {user.role?.RoleName} ({user.department?.DepartmentName})
              </option>
            ))}
          </select>
          {users.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Không có người dùng cấp cao hơn để gửi
            </p>
          )}
        </div>

        {/* Comments */}
        <div>
          <label className="label">
            Ghi chú (tùy chọn)
          </label>
          <textarea
            className="input"
            rows={4}
            placeholder="Nhập ghi chú kèm theo văn bản..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Thêm ghi chú để người nhận hiểu rõ hơn về văn bản
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            icon={Send}
            loading={loading}
            disabled={users.length === 0}
          >
            Gửi văn bản
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SubmitModal;