import { User, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * UserSelect Component
 * Dropdown select for choosing users (e.g., Manager, ViceManager)
 */
const UserSelect = ({
  label,
  value,
  onChange,
  users = [],
  placeholder = "Chọn người dùng",
  required = false,
  disabled = false,
  allowClear = true,
  error = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedUser = users.find(u => u.UserId === value);

  const filteredUsers = users.filter(user =>
    user.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.Email && user.Email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (userId) => {
    onChange(userId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.user-select-container')) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="user-select-container">
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full px-4 py-2 text-left bg-white border rounded-lg
            flex items-center justify-between
            transition-colors
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${isOpen ? 'border-primary-500 ring-2 ring-primary-200' : ''}
          `}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
            {selectedUser ? (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedUser.FullName}
                </p>
                {selectedUser.role && (
                  <p className="text-xs text-gray-500 truncate">
                    {selectedUser.role.RoleName}
                  </p>
                )}
              </div>
            ) : (
              <span className="text-gray-500 text-sm">{placeholder}</span>
            )}
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
            {allowClear && selectedUser && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* User list */}
            <div className="overflow-y-auto max-h-64">
              {filteredUsers.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  Không tìm thấy người dùng
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.UserId}
                    type="button"
                    onClick={() => handleSelect(user.UserId)}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                      border-b border-gray-100 last:border-b-0
                      ${user.UserId === value ? 'bg-primary-50' : ''}
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${user.UserId === value ? 'text-primary-900' : 'text-gray-900'}`}>
                          {user.FullName}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          {user.role && (
                            <span className="truncate">{user.role.RoleName}</span>
                          )}
                          {user.department && (
                            <>
                              <span>•</span>
                              <span className="truncate">{user.department.DepartmentName}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {user.UserId === value && (
                        <svg className="h-5 w-5 text-primary-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default UserSelect;
