import { User } from 'lucide-react';
import PropTypes from 'prop-types';

const Avatar = ({ user, size = 'md', className = '' }) => {
  // Lấy chữ cái đầu từ tên
  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    // Lấy chữ cái đầu của từ đầu tiên và từ cuối cùng
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // Tạo màu nền dựa trên tên
  const getBackgroundColor = (name) => {
    if (!name) return 'bg-gray-400';

    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-yellow-500',
      'bg-lime-500',
      'bg-green-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-sky-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-purple-500',
      'bg-fuchsia-500',
      'bg-pink-500',
      'bg-rose-500'
    ];

    // Tạo hash từ tên
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  // Kích thước
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
    '2xl': 'h-20 w-20 text-2xl',
    '3xl': 'h-24 w-24 text-3xl'
  };

  const initials = getInitials(user?.FullName || user?.full_name || user?.Username || user?.username);
  const bgColor = getBackgroundColor(user?.FullName || user?.full_name || user?.Username || user?.username);
  const profilePicture = user?.ProfilePicture || user?.profile_picture;

  // Nếu có ảnh đại diện
  if (profilePicture) {
    const imageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${profilePicture}`;

    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
        <img
          src={imageUrl}
          alt={user?.FullName || user?.full_name || 'User'}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Nếu load ảnh lỗi, hiển thị initials
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `
              <div class="w-full h-full ${bgColor} flex items-center justify-center text-white font-semibold">
                ${initials}
              </div>
            `;
          }}
        />
      </div>
    );
  }

  // Nếu không có ảnh, hiển thị initials
  return (
    <div
      className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
};

Avatar.propTypes = {
  user: PropTypes.object,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']),
  className: PropTypes.string
};

export default Avatar;
