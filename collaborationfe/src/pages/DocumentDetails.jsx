import {
    ArrowLeft,
    Calendar,
    Download,
    Edit,
    FileText,
    FolderOpen,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { documentsAPI } from '../api/documents';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import StatusBadge from '../components/common/StatusBadge';
import CollaboraEditor from '../components/documents/CollaboraEditor';
import DocumentVersions from '../components/documents/DocumentVersions';
import WorkflowActions from '../components/workflow/WorkflowActions';
import WorkflowHistory from '../components/workflow/WorkflowHistory';
import { useAuthStore } from '../store/authStore';
import { downloadFile, formatDate } from '../utils/helpers';

const DocumentDetails = () => {
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
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy văn bản</p>
        <Button onClick={() => navigate('/documents')} className="mt-4">
          Quay lại
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'info', name: 'Thông tin', icon: FileText },
    { id: 'history', name: 'Lịch sử', icon: Calendar },
    { id: 'versions', name: 'Phiên bản', icon: FolderOpen },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Button
              variant="secondary"
              icon={ArrowLeft}
              onClick={() => navigate('/documents')}
            >
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{document.Title}</h1>
              <p className="mt-2 text-gray-600">{document.DocumentNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <StatusBadge status={document.status?.StatusCode} />
            <StatusBadge priority={document.Priority} />
          </div>
        </div>

        {/* Actions */}
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
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center py-4 px-1 border-b-2 font-medium text-sm
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
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Mô tả</h3>
                  <p className="text-gray-900">
                    {document.Description || 'Không có mô tả'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Loại văn bản</h3>
                  <p className="text-gray-900">{document.category?.CategoryName}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Người tạo</h3>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{document.created_by?.FullName}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Ngày tạo</h3>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{formatDate(document.CreatedAt)}</span>
                  </div>
                </div>

                {document.DueDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Hạn chót</h3>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{formatDate(document.DueDate)}</span>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">File đính kèm</h3>
                  <p className="text-gray-900 truncate" title={document.FileName}>
                    {document.FileName}
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

      {/* Collabora Editor Modal */}
      {showEditor && (
        <CollaboraEditor
          documentId={document.DocumentId}
          onClose={() => {
            setShowEditor(false);
            fetchDocument(); // Refresh document after editing
          }}
        />
      )}
    </>
  );
};

export default DocumentDetails;