import {
  Download,
  Edit2,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { templatesAPI } from '../api/templates';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';

const TemplateManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    template_name: '',
    description: '',
    category: '',
  });

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, [searchTerm, selectedCategory]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await templatesAPI.getTemplates({
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
      });
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Không thể tải danh sách mẫu văn bản');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await templatesAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const fileExt = file.name.split('.').pop().toLowerCase();
      if (!['doc', 'docx'].includes(fileExt)) {
        toast.error('Chỉ chấp nhận file Word (.doc, .docx)');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();

    if (!formData.template_name || !selectedFile) {
      toast.error('Vui lòng điền tên mẫu và chọn file!');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('template_name', formData.template_name);
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      if (formData.category) {
        formDataToSend.append('category', formData.category);
      }
      formDataToSend.append('file', selectedFile);

      await templatesAPI.createTemplate(formDataToSend);
      toast.success('✅ Tạo mẫu văn bản thành công!');
      setIsCreateModalOpen(false);
      resetForm();
      fetchTemplates();
      fetchCategories();
    } catch (error) {
      console.error('Error creating template:', error);
      const errorMsg = error.response?.data?.detail || 'Lỗi khi tạo mẫu văn bản';
      toast.error(`❌ ${errorMsg}`);
    }
  };

  const handleUpdateTemplate = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      if (formData.template_name) {
        formDataToSend.append('template_name', formData.template_name);
      }
      if (formData.description !== undefined) {
        formDataToSend.append('description', formData.description);
      }
      if (formData.category !== undefined) {
        formDataToSend.append('category', formData.category);
      }
      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      }

      await templatesAPI.updateTemplate(selectedTemplate.TemplateId, formDataToSend);
      toast.success('✅ Cập nhật mẫu văn bản thành công!');
      setIsEditModalOpen(false);
      resetForm();
      fetchTemplates();
      fetchCategories();
    } catch (error) {
      console.error('Error updating template:', error);
      const errorMsg = error.response?.data?.detail || 'Lỗi khi cập nhật mẫu văn bản';
      toast.error(`❌ ${errorMsg}`);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mẫu này?')) {
      return;
    }

    try {
      await templatesAPI.deleteTemplate(templateId);
      toast.success('✅ Xóa mẫu văn bản thành công!');
      fetchTemplates();
      fetchCategories();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('❌ Lỗi khi xóa mẫu văn bản');
    }
  };

  const handleDownloadTemplate = async (template) => {
    try {
      await templatesAPI.downloadTemplate(template.TemplateId, template.FileName);
      toast.success('✅ Đang tải xuống mẫu...');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('❌ Lỗi khi tải mẫu');
    }
  };

  const resetForm = () => {
    setFormData({
      template_name: '',
      description: '',
      category: '',
    });
    setSelectedFile(null);
    setSelectedTemplate(null);
  };

  const openEditModal = (template) => {
    setSelectedTemplate(template);
    setFormData({
      template_name: template.TemplateName,
      description: template.Description || '',
      category: template.Category || '',
    });
    setSelectedFile(null);
    setIsEditModalOpen(true);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(2)} MB`;
  };

  if (loading && templates.length === 0) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <FileText className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Quản lý mẫu văn bản</h1>
                <p className="text-indigo-100 mt-1">
                  Upload và quản lý các mẫu file Word cho hệ thống
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="group flex items-center space-x-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Tạo mẫu mới</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <div>
                  <p className="text-sm opacity-90">Tổng số mẫu</p>
                  <p className="text-2xl font-bold">{templates.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <div>
                  <p className="text-sm opacity-90">Danh mục</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-white opacity-5"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full bg-white opacity-5"></div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm mẫu văn bản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            Không tìm thấy mẫu văn bản nào
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.TemplateId}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {template.TemplateName}
                  </h3>
                  {template.Category && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400">
                      {template.Category}
                    </span>
                  )}
                </div>
              </div>

              {template.Description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {template.Description}
                </p>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 space-y-1">
                <p className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  {template.FileName}
                </p>
                <p>Kích thước: {formatFileSize(template.FileSize)}</p>
                <p>Tạo bởi: {template.creator_name || 'N/A'}</p>
                <p>
                  {new Date(template.CreatedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadTemplate(template)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Tải về
                </button>
                <button
                  onClick={() => openEditModal(template)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.TemplateId)}
                  className="flex items-center justify-center px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Tạo mẫu văn bản mới
              </h3>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}
                className="text-white hover:bg-white/20 p-1 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTemplate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên mẫu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.template_name}
                  onChange={(e) =>
                    setFormData({ ...formData, template_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="VD: Mẫu công văn hành chính"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Danh mục
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="VD: Công văn, Báo cáo, Quyết định"
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Mô tả ngắn gọn về mẫu văn bản này"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  File mẫu (.doc, .docx) <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label
                        htmlFor="file-upload-create"
                        className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus-within:outline-none"
                      >
                        <span>Chọn file</span>
                        <input
                          id="file-upload-create"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".doc,.docx"
                          onChange={handleFileSelect}
                          required
                        />
                      </label>
                    </div>
                    {selectedFile && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        ✓ {selectedFile.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      DOC, DOCX (Max 10MB)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit">Tạo mẫu</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Chỉnh sửa mẫu văn bản
              </h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetForm();
                }}
                className="text-white hover:bg-white/20 p-1 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateTemplate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên mẫu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.template_name}
                  onChange={(e) =>
                    setFormData({ ...formData, template_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Danh mục
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  list="categories"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  File hiện tại
                </label>
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {selectedTemplate.FileName}
                  </p>
                  <p className="text-xs mt-1">
                    {formatFileSize(selectedTemplate.FileSize)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Thay đổi file (tùy chọn)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label
                        htmlFor="file-upload-edit"
                        className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none"
                      >
                        <span>Chọn file mới</span>
                        <input
                          id="file-upload-edit"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".doc,.docx"
                          onChange={handleFileSelect}
                        />
                      </label>
                    </div>
                    {selectedFile && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        ✓ {selectedFile.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Để trống nếu không thay đổi
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit">Cập nhật</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManagement;
