import { AlertCircle } from 'lucide-react';
import { Component } from 'react';
import Button from './Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md">
            <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Đã có lỗi xảy ra
            </h1>
            <p className="text-gray-600 mb-6">
              Xin lỗi, có lỗi không mong muốn xảy ra. Vui lòng thử lại.
            </p>
            <Button onClick={() => window.location.reload()}>
              Tải lại trang
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;