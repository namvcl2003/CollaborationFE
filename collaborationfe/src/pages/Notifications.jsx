// import { Bell, BellOff, CheckCheck, FileText } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import toast from 'react-hot-toast';
// import { Link } from 'react-router-dom';
// import { notificationsAPI } from '../api/notifications';
// import Loading from '../common/Loading';
// import Button from '../components/common/Button';
// import { formatRelativeTime } from '../utils/helpers';
import { Bell, BellOff, CheckCheck, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { notificationsAPI } from '../api/notifications';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading'; // FIX: Thêm ../components/
import { formatRelativeTime } from '../utils/helpers';

// ... phần còn lại giữ nguyên

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0,
  });

  useEffect(() => {
    fetchNotifications();
  }, [pagination.page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationsAPI.getNotifications({
        page: pagination.page,
        page_size: pagination.page_size,
      });
      setNotifications(data.items);
      setPagination({
        ...pagination,
        total: data.total,
        total_pages: data.total_pages,
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.NotificationId === id ? { ...n, IsRead: true, ReadAt: new Date().toISOString() } : n
      ));
      toast.success('Đã đánh dấu đã đọc');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, IsRead: true, ReadAt: new Date().toISOString() })));
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Không thể đánh dấu tất cả');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'DOCUMENT_ASSIGNED':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'DOCUMENT_APPROVED':
        return <CheckCheck className="h-5 w-5 text-green-600" />;
      case 'DOCUMENT_REJECTED':
        return <BellOff className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading && pagination.page === 1) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
          <p className="mt-2 text-gray-600">
            Tất cả thông báo của bạn ({pagination.total})
          </p>
        </div>
        {notifications.some(n => !n.IsRead) && (
          <Button
            variant="outline"
            icon={CheckCheck}
            onClick={handleMarkAllAsRead}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="card text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Không có thông báo
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Bạn sẽ nhận được thông báo khi có hoạt động mới
          </p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-200">
          {notifications.map((notification) => (
            <div
              key={notification.NotificationId}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                !notification.IsRead ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.NotificationType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.Title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.Message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatRelativeTime(notification.CreatedAt)}
                      </p>
                    </div>
                    
                    {!notification.IsRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.NotificationId)}
                        className="ml-4 text-xs text-primary-600 hover:text-primary-700"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>

                  {notification.RelatedDocumentId && (
                    <Link
                      to={`/documents/${notification.RelatedDocumentId}`}
                      className="inline-flex items-center mt-2 text-xs text-primary-600 hover:text-primary-700"
                    >
                      Xem văn bản →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between card">
          <div className="text-sm text-gray-700">
            Trang {pagination.page} / {pagination.total_pages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
            >
              Trước
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.total_pages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;