import { FileText, Upload, X } from 'lucide-react';
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tạo văn bản mới</h2>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="label">Tiêu đề *</label>
            <input
              type="text"
              name="title"
              required
              className="input"
              placeholder="Nhập tiêu đề văn bản"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Mô tả</label>
            <textarea
              name="description"
              rows={4}
              className="input"
              placeholder="Nhập mô tả chi tiết"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Category */}
          <div>
            <label className="label">Loại văn bản *</label>
            <select
              name="category_id"
              required
              className="input"
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
            <label className="label">Độ ưu tiên *</label>
            <select
              name="priority"
              required
              className="input"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="1">Cao</option>
              <option value="2">Trung bình</option>
              <option value="3">Thấp</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="label">Hạn chót</label>
            <input
              type="datetime-local"
              name="due_date"
              className="input"
              value={formData.due_date}
              onChange={handleChange}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="label">File đính kèm *</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
              <div className="space-y-2 text-center">
                {file ? (
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="h-8 w-8 text-primary-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                        <span>Tải file lên</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept=".docx,.xlsx,.pptx,.doc,.xls,.ppt"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">hoặc kéo thả vào đây</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      DOCX, XLSX, PPTX tối đa 50MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/documents')}
        >
          Hủy
        </Button>
        <Button type="submit" loading={loading}>
          Tạo văn bản
        </Button>
      </div>
    </form>
  );
};

export default DocumentForm;