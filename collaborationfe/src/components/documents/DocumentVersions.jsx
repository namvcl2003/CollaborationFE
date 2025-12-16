import { Clock, Download, User, GitCompare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { documentsAPI } from '../../api/documents';
import { formatDate } from '../../utils/helpers';
import toastUtil from '../../utils/toast.jsx';
import Button from '../common/Button';
import VersionComparison from './VersionComparison';

const DocumentVersions = ({ documentId }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersions, setSelectedVersions] = useState([]); // Max 2 versions for comparison
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, [documentId]);

  const fetchVersions = async () => {
    try {
      const data = await documentsAPI.getVersions(documentId);
      setVersions(data);
    } catch (error) {
      console.error('Error fetching versions:', error);
      toastUtil.handleApiError(error, 'Không thể tải lịch sử phiên bản');
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = (versionId) => {
    if (selectedVersions.includes(versionId)) {
      // Deselect
      setSelectedVersions(selectedVersions.filter((id) => id !== versionId));
    } else if (selectedVersions.length < 2) {
      // Select (max 2)
      setSelectedVersions([...selectedVersions, versionId]);
    } else {
      // Replace oldest selection
      setSelectedVersions([selectedVersions[1], versionId]);
    }
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      setShowComparison(true);
    }
  };

  const handleDownloadVersion = async (versionId, fileName) => {
    try {
      const blob = await documentsAPI.downloadVersion(documentId, versionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toastUtil.success('Tải xuống thành công');
    } catch (error) {
      console.error('Error downloading version:', error);
      toastUtil.handleApiError(error, 'Không thể tải xuống file');
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  // Show comparison view
  if (showComparison) {
    return (
      <VersionComparison
        documentId={documentId}
        version1Id={selectedVersions[0]}
        version2Id={selectedVersions[1]}
        onClose={() => {
          setShowComparison(false);
          setSelectedVersions([]);
        }}
      />
    );
  }

  // Show version list
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Lịch sử phiên bản
        </h3>

        {selectedVersions.length === 2 && (
          <Button
            size="sm"
            icon={GitCompare}
            onClick={handleCompare}
          >
            So sánh phiên bản
          </Button>
        )}
      </div>

      {selectedVersions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-blue-900">
              Đã chọn {selectedVersions.length}/2 phiên bản để so sánh
            </span>
            <button
              onClick={() => setSelectedVersions([])}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Xóa chọn
            </button>
          </div>
        </div>
      )}

      {versions.length === 0 ? (
        <p className="text-gray-500 text-sm">Chưa có phiên bản nào</p>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => {
            const isSelected = selectedVersions.includes(version.VersionId);

            return (
              <div
                key={version.VersionId}
                className={`
                  bg-gray-50 rounded-lg p-4 border cursor-pointer transition-all
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => handleVersionSelect(version.VersionId)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
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
                      <p className="text-sm text-gray-600 mt-1 ml-6">
                        {version.ChangeDescription}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 mt-2 ml-6 text-xs text-gray-500">
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadVersion(version.VersionId, version.FileName);
                    }}
                  >
                    Tải về
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocumentVersions;