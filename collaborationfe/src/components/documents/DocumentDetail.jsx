import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    Clock,
    Download,
    Edit,
    FileText,
    FolderOpen,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { documentsAPI } from '../../api/documents';
import { useAuthStore } from '../../store/authStore';
import { downloadFile, formatDate, formatRelativeTime } from '../../utils/helpers';
import Button from '../common/Button';
import Loading from '../common/Loading';
import StatusBadge from '../common/StatusBadge';
import WorkflowActions from '../workflow/WorkflowActions';
import WorkflowHistory from '../workflow/WorkflowHistory';
import CollaboraEditor from './CollaboraEditor';
import DocumentVersions from './DocumentVersions';

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const data = await documentsAPI.getDocument(id);
      setDocument(data);
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('Không thể tải thông tin văn bản');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await documentsAPI.downloadDocument(id);
      downloadFile(blob, document.FileName);
      toast.success('Tải xuống thành công');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Không thể tải xuống file');
    }
  };

  const handleActionComplete = () => {
    fetchDocument();
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Không tìm thấy văn bản
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Văn bản không tồn tại hoặc đã bị xóa
          </p>
          <Button onClick={() => navigate('/documents')} className="mt-4">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'info', name: 'Thông tin', icon: FileText },
    { id: 'history', name: 'Lịch sử', icon: Clock },
    { id: 'versions', name: 'Phiên bản', icon: FolderOpen },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start space-x-4">
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              onClick={() => navigate('/documents')}
            >
              Quay lại
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {document.Title}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {document.DocumentNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <StatusBadge status={document.status?.StatusCode} />
            <StatusBadge priority={document.Priority} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              icon={Edit}
              onClick={() => setShowEditor(true)}
            >
              Mở trình soạn thảo
            </Button>
            <Button
              variant="outline"
              icon={Download}
              onClick={handleDownload}
            >
              Tải xuống
            </Button>
          </div>
        </div>

        {/* Workflow Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thao tác văn bản
          </h2>
          <WorkflowActions 
            document={document} 
            onActionComplete={handleActionComplete}
          />
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${activeTab === tab.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Mô tả
                    </h3>
                    <p className="text-gray-900">
                      {document.Description || 'Không có mô tả'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Loại văn bản
                    </h3>
                    <p className="text-gray-900">
                      {document.category?.CategoryName || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Người tạo
                    </h3>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">
                        {document.created_by?.FullName || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Ngày tạo
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">
                        {formatDate(document.CreatedAt)}
                      </span>
                    </div>
                  </div>

                  {document.DueDate && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Hạn chót
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-red-400" />
                        <span className="text-gray-900">
                          {formatDate(document.DueDate)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      File đính kèm
                    </h3>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{document.FileName}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Cập nhật lần cuối
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">
                        {formatRelativeTime(document.UpdatedAt)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Trạng thái
                    </h3>
                    <p className="text-gray-900">
                      {document.status?.StatusName || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <WorkflowHistory documentId={document.DocumentId} />
            )}

            {activeTab === 'versions' && (
              <DocumentVersions documentId={document.DocumentId} />
            )}
          </div>
        </div>
      </div>

      {/* Collabora Editor Modal */}
      {showEditor && (
        <CollaboraEditor
          documentId={document.DocumentId}
          onClose={() => {
            setShowEditor(false);
            fetchDocument();
          }}
        />
      )}
    </>
  );
};

export default DocumentDetail;