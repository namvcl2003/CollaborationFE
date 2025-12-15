import { AlertCircle, Calendar, FileText, FolderOpen, Upload, X, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { documentsAPI } from '../../api/documents';
import Button from '../common/Button';

const DocumentForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    priority: '2',
    due_date: '',
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await documentsAPI.getCategories();
      setCategories(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, category_id: data[0].CategoryId }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.ms-excel',
        'application/vnd.ms-powerpoint',
      ];

      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Chỉ chấp nhận file .docx, .xlsx, .pptx');
        return;
      }

      // Validate file size (50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 50MB');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Vui lòng chọn file');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('priority', formData.priority);
      if (formData.due_date) {
        formDataToSend.append('due_date', formData.due_date);
      }
      formDataToSend.append('file', file);

      const response = await documentsAPI.createDocument(formDataToSend);
      toast.success('Tạo văn bản thành công!');
      navigate(`/documents/${response.DocumentId}`);
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error(error.response?.data?.detail || 'Không thể tạo văn bản');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case '1': return 'bg-red-50 border-red-200 text-red-700';
      case '2': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case '3': return 'bg-blue-50 border-blue-200 text-blue-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-50 rounded-xl">
            <FileText className="h-7 w-7 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tạo văn bản mới</h1>
            <p className="text-sm text-gray-500 mt-1">Điền thông tin để tạo văn bản mới trong hệ thống</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
            <div className="h-1.5 w-1.5 rounded-full bg-primary-600 mr-2"></div>
            Thông tin cơ bản
          </h2>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề văn bản <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Nhập tiêu đề văn bản..."
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500 flex items-center">
                <Info className="h-3.5 w-3.5 mr-1" />
                Tiêu đề ngắn gọn, súc tích mô tả nội dung văn bản
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả chi tiết
              </label>
              <textarea
                name="description"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                placeholder="Nhập mô tả chi tiết về văn bản (tùy chọn)..."
                value={formData.description}
                onChange={handleChange}
              />
              <p className="mt-1.5 text-xs text-gray-500 flex items-center">
                <Info className="h-3.5 w-3.5 mr-1" />
                Mô tả giúp người xem hiểu rõ hơn về nội dung và mục đích văn bản
              </p>
            </div>
          </div>
        </div>

        {/* Category and Priority */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
            <div className="h-1.5 w-1.5 rounded-full bg-primary-600 mr-2"></div>
            Phân loại
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FolderOpen className="h-4 w-4 mr-1.5 text-gray-500" />
                Loại văn bản <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="category_id"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white"
                value={formData.category_id}
                onChange={handleChange}
              >
                <option value="">Chọn loại văn bản</option>
                {categories.map((cat) => (
                  <option key={cat.CategoryId} value={cat.CategoryId}>
                    {cat.CategoryName}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1.5 text-gray-500" />
                Độ ưu tiên <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="priority"
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 transition-colors ${getPriorityColor(formData.priority)}`}
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="1">🔴 Cao - Cần xử lý ngay</option>
                <option value="2">🟡 Trung bình - Bình thường</option>
                <option value="3">🔵 Thấp - Không gấp</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
                Hạn chót
              </label>
              <input
                type="datetime-local"
                name="due_date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={formData.due_date}
                onChange={handleChange}
              />
              <p className="mt-1.5 text-xs text-gray-500 flex items-center">
                <Info className="h-3.5 w-3.5 mr-1" />
                Thời hạn hoàn thành văn bản (không bắt buộc)
              </p>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
            <div className="h-1.5 w-1.5 rounded-full bg-primary-600 mr-2"></div>
            File đính kèm <span className="text-red-500 ml-2">*</span>
          </h2>

          <div className="relative">
            {file ? (
              <div className="border-2 border-green-200 bg-green-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <div className="flex items-center mt-2">
                        <div className="h-1.5 w-48 bg-green-200 rounded-full overflow-hidden">
                          <div className="h-full w-full bg-green-500"></div>
                        </div>
                        <span className="ml-2 text-xs text-green-600 font-medium">Đã tải lên</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                  >
                    <X className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50/30 transition-all">
                <input
                  type="file"
                  id="file-upload"
                  className="sr-only"
                  accept=".docx,.xlsx,.pptx,.doc,.xls,.ppt"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer"
                >
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-base font-medium text-gray-900 mb-1">
                    Nhấn để chọn file hoặc kéo thả vào đây
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Hỗ trợ: DOCX, XLSX, PPTX
                  </p>
                  <div className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <Upload className="h-4 w-4 mr-2" />
                    Chọn file
                  </div>
                </label>
                <p className="text-xs text-gray-400 mt-4">
                  Kích thước tối đa: 50MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              <span className="text-red-500 font-medium">*</span> Các trường bắt buộc phải điền
            </p>
            <div className="flex space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/documents')}
                className="flex-1 sm:flex-none px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none relative px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-primary-800 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tạo văn bản...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Tạo văn bản
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DocumentForm;
