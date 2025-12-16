import { AlertCircle, Calendar, FileText, FolderOpen, Upload, X, Info, FilePlus, FileDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentsAPI } from '../../api/documents';
import { templatesAPI } from '../../api/templates';
import toastUtil from '../../utils/toast.jsx';
import Button from '../common/Button';

const DocumentForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    priority: '2',
    due_date: '',
  });
  const [file, setFile] = useState(null);
  const [createMode, setCreateMode] = useState('upload'); // 'upload', 'create_new', or 'from_template'

  useEffect(() => {
    fetchCategories();
    fetchTemplates();
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

  const fetchTemplates = async () => {
    try {
      const data = await templatesAPI.getTemplates({ limit: 100 });
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSelectTemplate = async (template) => {
    setSelectedTemplate(template);

    try {
      const loadingId = toastUtil.loading('Đang tải mẫu văn bản...');

      // Fetch the template file as blob using axios
      const blob = await templatesAPI.getTemplateBlob(template.TemplateId);

      // Debug: Check blob size
      console.log('Template blob size:', blob.size, 'bytes');

      // Convert blob to File object
      const file = new File([blob], template.FileName, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      console.log('Template file created:', file.name, file.size, 'bytes');
      setFile(file);
      toastUtil.dismiss(loadingId);
      toastUtil.success(`Đã chọn mẫu: ${template.TemplateName}`);
    } catch (error) {
      console.error('Error loading template:', error);
      toastUtil.handleApiError(error, 'Không thể tải mẫu văn bản');
      setSelectedTemplate(null);
    }
  };

  const handleDownloadTemplate = async (template) => {
    try {
      const loadingId = toastUtil.loading('Đang tải xuống mẫu văn bản...');
      await templatesAPI.downloadTemplate(template.TemplateId, template.FileName);
      toastUtil.dismiss(loadingId);
      toastUtil.success(`Đã tải xuống mẫu: ${template.TemplateName}`);
    } catch (error) {
      console.error('Error downloading template:', error);
      toastUtil.handleApiError(error, 'Không thể tải xuống mẫu văn bản');
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
        toastUtil.validationError('Chỉ chấp nhận file .docx, .xlsx, .pptx');
        return;
      }

      // Validate file size (50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        toastUtil.validationError('Kích thước file không được vượt quá 50MB');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate file for upload and from_template modes
    if ((createMode === 'upload' || createMode === 'from_template') && !file) {
      toastUtil.validationError('Vui lòng chọn file');
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

      // Add create_new flag
      formDataToSend.append('create_new', createMode === 'create_new' ? 'true' : 'false');

      // Add file for upload mode or from_template mode
      if ((createMode === 'upload' || createMode === 'from_template') && file) {
        formDataToSend.append('file', file);
      }

      const response = await documentsAPI.createDocument(formDataToSend);
      toastUtil.success(
        createMode === 'create_new'
          ? 'Tạo văn bản Word mới thành công!'
          : createMode === 'from_template'
          ? 'Tạo văn bản từ mẫu thành công!'
          : 'Tạo văn bản thành công!'
      );
      navigate(`/documents/${response.DocumentId}`);
    } catch (error) {
      console.error('Error creating document:', error);
      toastUtil.handleApiError(error, 'Không thể tạo văn bản');
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
            <FileText className="h-7 w-7 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tạo văn bản mới</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Điền thông tin để tạo văn bản mới trong hệ thống</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center">
            <div className="h-1.5 w-1.5 rounded-full bg-primary-600 dark:bg-primary-400 mr-2"></div>
            Thông tin cơ bản
          </h2>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tiêu đề văn bản <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  placeholder="Nhập tiêu đề văn bản..."
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Info className="h-3.5 w-3.5 mr-1" />
                Tiêu đề ngắn gọn, súc tích mô tả nội dung văn bản
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mô tả chi tiết
              </label>
              <textarea
                name="description"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                placeholder="Nhập mô tả chi tiết về văn bản (tùy chọn)..."
                value={formData.description}
                onChange={handleChange}
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Info className="h-3.5 w-3.5 mr-1" />
                Mô tả giúp người xem hiểu rõ hơn về nội dung và mục đích văn bản
              </p>
            </div>
          </div>
        </div>

        {/* Category and Priority */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center">
            <div className="h-1.5 w-1.5 rounded-full bg-primary-600 dark:bg-primary-400 mr-2"></div>
            Phân loại
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <FolderOpen className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" />
                Loại văn bản <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="category_id"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" />
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" />
                Hạn chót
              </label>
              <input
                type="datetime-local"
                name="due_date"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={formData.due_date}
                onChange={handleChange}
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Info className="h-3.5 w-3.5 mr-1" />
                Thời hạn hoàn thành văn bản (không bắt buộc)
              </p>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center">
            <div className="h-1.5 w-1.5 rounded-full bg-primary-600 dark:bg-primary-400 mr-2"></div>
            File đính kèm {(createMode === 'upload' || (createMode === 'from_template' && !file)) && <span className="text-red-500 ml-2">*</span>}
          </h2>

          {/* Mode Selector */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setCreateMode('upload');
                  setFile(null);
                  setSelectedTemplate(null);
                }}
                className={`p-4 border-2 rounded-xl transition-all ${
                  createMode === 'upload'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span className="font-medium">Tải lên file có sẵn</span>
                </div>
                <p className="text-xs mt-2 text-center">
                  Upload file .docx, .xlsx, .pptx
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCreateMode('create_new');
                  setFile(null);
                  setSelectedTemplate(null);
                }}
                className={`p-4 border-2 rounded-xl transition-all ${
                  createMode === 'create_new'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <FilePlus className="h-5 w-5" />
                  <span className="font-medium">Tạo file Word mới</span>
                </div>
                <p className="text-xs mt-2 text-center">
                  Tạo văn bản Word trống mới
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCreateMode('from_template');
                  setFile(null);
                  setSelectedTemplate(null);
                }}
                className={`p-4 border-2 rounded-xl transition-all ${
                  createMode === 'from_template'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">Từ mẫu văn bản</span>
                </div>
                <p className="text-xs mt-2 text-center">
                  Chọn từ mẫu có sẵn
                </p>
              </button>
            </div>
          </div>

          <div className="relative">
            {createMode === 'create_new' ? (
              <div className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 rounded-xl p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center mb-4">
                  <FilePlus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-base font-medium text-gray-900 dark:text-white mb-2">
                  Sẽ tạo file Word mới (.docx)
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hệ thống sẽ tự động tạo file Word mới với tiêu đề văn bản bạn đã nhập
                </p>
                <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg text-sm text-blue-800 dark:text-blue-400">
                  <Info className="h-4 w-4 mr-2" />
                  File sẽ được tạo khi bạn nhấn "Tạo văn bản"
                </div>
              </div>
            ) : createMode === 'from_template' ? (
              <div className="space-y-4">
                {templates.length === 0 ? (
                  <div className="border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-xl p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-base font-medium text-gray-900 dark:text-white mb-2">
                      Chưa có mẫu văn bản nào
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Liên hệ quản lý để thêm mẫu văn bản vào hệ thống
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Chọn mẫu văn bản
                    </label>
                    <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-2">
                      {templates.map((template) => (
                        <div
                          key={template.TemplateId}
                          className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                            selectedTemplate?.TemplateId === template.TemplateId
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => handleSelectTemplate(template)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className={`p-2 rounded-lg ${
                                selectedTemplate?.TemplateId === template.TemplateId
                                  ? 'bg-primary-100 dark:bg-primary-800/50'
                                  : 'bg-gray-100 dark:bg-gray-600'
                              }`}>
                                <FileText className={`h-5 w-5 ${
                                  selectedTemplate?.TemplateId === template.TemplateId
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {template.TemplateName}
                                </p>
                                {template.Description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                    {template.Description}
                                  </p>
                                )}
                                <div className="flex items-center mt-2 space-x-3 text-xs text-gray-500 dark:text-gray-400">
                                  {template.Category && (
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded">
                                      {template.Category}
                                    </span>
                                  )}
                                  <span>{template.FileName}</span>
                                </div>
                              </div>
                            </div>
                            {selectedTemplate?.TemplateId === template.TemplateId && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadTemplate(template);
                                }}
                                className="ml-3 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                title="Tải xuống mẫu"
                              >
                                <FileDown className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedTemplate && file && (
                      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800 rounded-xl">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <Info className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-green-900 dark:text-green-400">
                                ✓ Đã tải mẫu: {selectedTemplate.TemplateName}
                              </p>
                              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                File mẫu đã được tự động gắn vào văn bản. Điền thông tin và nhấn "Tạo văn bản" để hoàn tất.
                              </p>
                              <div className="flex items-center mt-2 text-xs text-green-600 dark:text-green-400">
                                <FileText className="h-3.5 w-3.5 mr-1" />
                                <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTemplate(null);
                              setFile(null);
                            }}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors group ml-2"
                            title="Bỏ chọn mẫu"
                          >
                            <X className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : file ? (
              <div className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 dark:bg-green-800/50 rounded-lg">
                      <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <div className="flex items-center mt-2">
                        <div className="h-1.5 w-48 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                          <div className="h-full w-full bg-green-500 dark:bg-green-600"></div>
                        </div>
                        <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-medium">Đã tải lên</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors group"
                  >
                    <X className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50/30 dark:hover:bg-primary-900/20 transition-all">
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
                  <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-base font-medium text-gray-900 dark:text-white mb-1">
                    Nhấn để chọn file hoặc kéo thả vào đây
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Hỗ trợ: DOCX, XLSX, PPTX
                  </p>
                  <div className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <Upload className="h-4 w-4 mr-2" />
                    Chọn file
                  </div>
                </label>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                  Kích thước tối đa: 50MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="text-red-500 font-medium">*</span> Các trường bắt buộc phải điền
            </p>
            <div className="flex space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/documents')}
                className="flex-1 sm:flex-none px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
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
