import { Clock, Download, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { documentsAPI } from '../../api/documents';
import { formatDate } from '../../utils/helpers';
import Button from '../common/Button';

const DocumentVersions = ({ documentId }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVersions();
  }, [documentId]);

  const fetchVersions = async () => {
    try {
      const data = await documentsAPI.getVersions(documentId);
      setVersions(data);
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast.error('Không thể tải lịch sử phiên bản');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Lịch sử phiên bản</h3>

      {versions.length === 0 ? (
        <p className="text-gray-500 text-sm">Chưa có phiên bản nào</p>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => (
            <div
              key={version.VersionId}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">
                      Phiên bản {version.VersionNumber}
                    </span>
                    {version.IsCurrentVersion && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                        Hiện tại
                      </span>
                    )}
                  </div>

                  {version.ChangeDescription && (
                    <p className="text-sm text-gray-600 mt-1">
                      {version.ChangeDescription}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(version.CreatedAt)}
                    </span>
                    <span className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {version.created_by?.FullName || `User ID: ${version.CreatedByUserId}`}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  icon={Download}
                  onClick={() => {
                    // TODO: Download specific version
                    toast.info('Chức năng tải phiên bản cụ thể đang phát triển');
                  }}
                >
                  Tải về
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentVersions;