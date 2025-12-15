import {
  Bell,
  BellOff,
  CheckCheck,
  FileText,
  AlertCircle,
  Filter,
  Inbox,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../api/notifications';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { formatRelativeTime } from '../utils/helpers';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
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

  const handleMarkAsRead = async (id, silent = false) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n =>
        n.NotificationId === id ? { ...n, IsRead: true, ReadAt: new Date().toISOString() } : n
      ));

      // Trigger event để Navbar cập nhật unread count
      window.dispatchEvent(new CustomEvent('notificationRead'));

      if (!silent) {
        toast.success('Đã đánh dấu đã đọc');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      if (!silent) {
        toast.error('Không thể đánh dấu đã đọc');
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, IsRead: true, ReadAt: new Date().toISOString() })));

      // Trigger event để Navbar cập nhật unread count
      window.dispatchEvent(new CustomEvent('notificationRead'));

      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Không thể đánh dấu tất cả');
    }
  };

  const handleNotificationClick = async (notification) => {
    // Tự động đánh dấu đã đọc khi click (không hiển thị toast)
    if (!notification.IsRead) {
      await handleMarkAsRead(notification.NotificationId, true);
    }

    // Chuyển đến trang chi tiết văn bản nếu có DocumentId
    if (notification.DocumentId) {
      navigate(`/documents/${notification.DocumentId}`);
    }
  };

  const getNotificationIcon = (typeCode) => {
    switch (typeCode) {
      case 'DOC_ASSIGNED':
        return {
          icon: <FileText className="h-6 w-6" />,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
        };
      case 'DOC_APPROVED':
        return {
          icon: <CheckCheck className="h-6 w-6" />,
          bgColor: 'bg-green-100',
          textColor: 'text-green-600',
        };
      case 'DOC_REJECTED':
        return {
          icon: <BellOff className="h-6 w-6" />,
          bgColor: 'bg-red-100',
          textColor: 'text-red-600',
        };
      case 'DOC_REVISION_REQUESTED':
        return {
          icon: <AlertCircle className="h-6 w-6" />,
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-600',
        };
      default:
        return {
          icon: <Bell className="h-6 w-6" />,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
        };
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.IsRead;
    if (filter === 'read') return notification.IsRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.IsRead).length;

  if (loading && pagination.page === 1) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-12 w-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Bell className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Thông báo</h1>
                  <p className="text-primary-100 mt-1">
                    Cập nhật mới nhất về hoạt động của bạn
                  </p>
                </div>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="group flex items-center space-x-2 px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
              >
                <CheckCheck className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Đánh dấu tất cả đã đọc</span>
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white bg-opacity-10 rounded-lg px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <Inbox className="h-5 w-5" />
                <div>
                  <p className="text-sm opacity-90">Tổng số</p>
                  <p className="text-2xl font-bold">{pagination.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <div>
                  <p className="text-sm opacity-90">Chưa đọc</p>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <CheckCheck className="h-5 w-5" />
                <div>
                  <p className="text-sm opacity-90">Đã đọc</p>
                  <p className="text-2xl font-bold">{notifications.length - unreadCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-white opacity-5"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full bg-white opacity-5"></div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2 flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            filter === 'all'
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Inbox className="h-5 w-5" />
            <span>Tất cả</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              filter === 'all' ? 'bg-white bg-opacity-20' : 'bg-gray-200'
            }`}>
              {notifications.length}
            </span>
          </div>
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            filter === 'unread'
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Chưa đọc</span>
            {unreadCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filter === 'unread' ? 'bg-white bg-opacity-20' : 'bg-red-100 text-red-600'
              }`}>
                {unreadCount}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            filter === 'read'
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <CheckCheck className="h-5 w-5" />
            <span>Đã đọc</span>
          </div>
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg text-center py-16">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
            <Bell className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'unread' ? 'Không có thông báo chưa đọc' :
             filter === 'read' ? 'Không có thông báo đã đọc' :
             'Không có thông báo'}
          </h3>
          <p className="text-gray-500">
            {filter === 'all' && 'Bạn sẽ nhận được thông báo khi có hoạt động mới'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const iconConfig = getNotificationIcon(notification.TypeCode);
            return (
              <div
                key={notification.NotificationId}
                onClick={() => handleNotificationClick(notification)}
                className={`group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 ${
                  !notification.IsRead
                    ? 'border-primary-500'
                    : 'border-transparent'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 p-3 rounded-xl ${iconConfig.bgColor} ${iconConfig.textColor}`}>
                      {iconConfig.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Title */}
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-base font-semibold ${
                              !notification.IsRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.Title}
                            </h3>
                            {!notification.IsRead && (
                              <span className="flex h-2.5 w-2.5">
                                <span className="animate-ping absolute h-2.5 w-2.5 rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative rounded-full h-2.5 w-2.5 bg-primary-500"></span>
                              </span>
                            )}
                          </div>

                          {/* Message */}
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {notification.Message}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatRelativeTime(notification.CreatedAt)}
                            </div>
                            {notification.DocumentId && (
                              <div className="flex items-center text-primary-600 font-medium">
                                <FileText className="h-4 w-4 mr-1" />
                                Xem văn bản
                                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          {!notification.IsRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.NotificationId);
                              }}
                              className="px-4 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                              title="Đánh dấu đã đọc"
                            >
                              <CheckCheck className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Trang <span className="font-semibold text-gray-900">{pagination.page}</span> / {pagination.total_pages}
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