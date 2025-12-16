import { AlertCircle, Lock, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoWeb from '../../../assets/images/logo_web3.png';
import { useAuthStore } from '../../store/authStore';
import Button from '../common/Button';
import toastUtil from '../../utils/toast.jsx';

const LoginForm = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.username.trim()) {
      toastUtil.validationError('Vui lòng nhập tên đăng nhập!');
      return;
    }

    if (!formData.password.trim()) {
      toastUtil.validationError('Vui lòng nhập mật khẩu!');
      return;
    }

    if (formData.password.length < 6) {
      toastUtil.validationError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);

    try {
      await login(formData);
      toastUtil.success('Đăng nhập thành công!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);

      // Xử lý các loại lỗi cụ thể
      const status = error.response?.status;
      const detail = error.response?.data?.detail;

      if (status === 404) {
        toastUtil.accountNotFound(detail);
      } else if (status === 403) {
        toastUtil.accountLocked(detail);
      } else if (status === 401) {
        toastUtil.wrongPassword(detail);
      } else if (status === 422) {
        // Validation error
        const errors = error.response?.data?.detail;
        let errorMessage = 'Thông tin đăng nhập không hợp lệ';

        if (Array.isArray(errors) && errors.length > 0) {
          errorMessage = errors[0].msg || errorMessage;
        }

        toastUtil.validationError(errorMessage);
      } else if (status === 500 || status === 502 || status === 503) {
        toastUtil.serverError(detail);
      } else if (!error.response) {
        toastUtil.networkError();
      } else {
        toastUtil.error(detail || 'Đăng nhập thất bại. Vui lòng thử lại');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto w-32 h-32 flex items-center justify-center">
            <img
              src={logoWeb}
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Hệ thống Soạn thảo Văn bản
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Đăng nhập để tiếp tục
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="label">
                <User className="w-4 h-4 inline mr-1" />
                Tên đăng nhập
              </label>
              <input
                name="username"
                type="text"
                required
                className="input"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
              <label className="label">
                <Lock className="w-4 h-4 inline mr-1" />
                Mật khẩu
              </label>
              <input
                name="password"
                type="password"
                required
                className="input"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            loading={loading}
          >
            Đăng nhập
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          {/* Tài khoản demo */}
          {/* <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Tài khoản demo:</p>
            <p>Trợ lý: <code className="bg-white px-2 py-1 rounded">troly_hc1</code></p>
            <p>Phó phòng: <code className="bg-white px-2 py-1 rounded">phophong_hc</code></p>
            <p>Trưởng phòng: <code className="bg-white px-2 py-1 rounded">truongphong_hc</code></p>
            <p className="mt-2">Mật khẩu: <code className="bg-white px-2 py-1 rounded">Admin123</code></p>
          </div> */}

          {/* Lưu ý */}
          <div className="flex items-start space-x-2 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-300">Lưu ý:</p>
              <ul className="mt-1 space-y-1 text-blue-700 dark:text-blue-400">
                <li>• Tên đăng nhập và mật khẩu phân biệt chữ hoa/thường</li>
                <li>• Mật khẩu phải có ít nhất 6 ký tự</li>
                <li>• Tài khoản sẽ bị khóa sau 5 lần đăng nhập sai liên tiếp</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;