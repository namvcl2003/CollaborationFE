import { ArrowLeft, Columns, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { documentsAPI } from '../../api/documents';
import { formatDate } from '../../utils/helpers';
import toastUtil from '../../utils/toast.jsx';
import Button from '../common/Button';
import Loading from '../common/Loading';

/**
 * Version Comparison Component
 *
 * Displays word-level diff between two document versions
 * with 2 display modes: Inline and Side-by-side
 */
const VersionComparison = ({ documentId, version1Id, version2Id, onClose }) => {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayMode, setDisplayMode] = useState('inline'); // 'inline' | 'sidebyside'

  useEffect(() => {
    fetchComparison();
  }, [documentId, version1Id, version2Id]);

  const fetchComparison = async () => {
    try {
      const data = await documentsAPI.compareVersions(documentId, version1Id, version2Id);
      setComparison(data);
    } catch (error) {
      console.error('Error fetching comparison:', error);
      toastUtil.handleApiError(error, 'Không thể so sánh phiên bản');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render Inline Mode
   * Single column with strikethrough for deletions and highlights for insertions
   */
  const renderInlineMode = () => {
    return (
      <div className="prose max-w-none">
        <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-white p-6 rounded-lg border border-gray-200">
          {comparison.diff.map((op, idx) => {
            if (op.type === 'equal') {
              return <span key={idx}>{op.content}</span>;
            } else if (op.type === 'delete') {
              return (
                <span
                  key={idx}
                  className="bg-red-100 text-red-800 line-through px-0.5"
                  title="Đã xóa"
                >
                  {op.content}
                </span>
              );
            } else if (op.type === 'insert') {
              return (
                <span
                  key={idx}
                  className="bg-green-100 text-green-800 font-medium px-0.5"
                  title="Đã thêm"
                >
                  {op.content}
                </span>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  /**
   * Render Side-by-Side Mode
   * Two columns: version1 on left, version2 on right
   */
  const renderSideBySideMode = () => {
    // Group diff operations into left and right content
    const leftContent = [];
    const rightContent = [];

    comparison.diff.forEach((op) => {
      if (op.type === 'equal') {
        leftContent.push({ type: 'equal', content: op.content });
        rightContent.push({ type: 'equal', content: op.content });
      } else if (op.type === 'delete') {
        leftContent.push({ type: 'delete', content: op.content });
      } else if (op.type === 'insert') {
        rightContent.push({ type: 'insert', content: op.content });
      }
    });

    return (
      <div className="grid grid-cols-2 gap-4">
        {/* Version 1 - Left */}
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
            <h4 className="font-semibold text-sm text-gray-700">
              Phiên bản {comparison.version1.VersionNumber}
            </h4>
          </div>
          <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-white p-4 max-h-[600px] overflow-y-auto">
            {leftContent.map((op, idx) => (
              <span
                key={idx}
                className={
                  op.type === 'delete'
                    ? 'bg-red-100 text-red-800 line-through px-0.5'
                    : ''
                }
              >
                {op.content}
              </span>
            ))}
          </div>
        </div>

        {/* Version 2 - Right */}
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
            <h4 className="font-semibold text-sm text-gray-700">
              Phiên bản {comparison.version2.VersionNumber}
            </h4>
          </div>
          <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-white p-4 max-h-[600px] overflow-y-auto">
            {rightContent.map((op, idx) => (
              <span
                key={idx}
                className={
                  op.type === 'insert'
                    ? 'bg-green-100 text-green-800 font-medium px-0.5'
                    : ''
                }
              >
                {op.content}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading />
      </div>
    );
  }

  if (!comparison) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header with Back button + Display Mode Toggles */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={onClose}
          >
            Quay lại
          </Button>
          <h3 className="text-lg font-semibold text-gray-900">
            So sánh phiên bản
          </h3>
        </div>

        {/* Display mode toggle */}
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={displayMode === 'inline' ? 'primary' : 'outline'}
            icon={FileText}
            onClick={() => setDisplayMode('inline')}
          >
            Inline
          </Button>
          <Button
            size="sm"
            variant={displayMode === 'sidebyside' ? 'primary' : 'outline'}
            icon={Columns}
            onClick={() => setDisplayMode('sidebyside')}
          >
            Side-by-side
          </Button>
        </div>
      </div>

      {/* Version Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">Phiên bản cũ</div>
          <div className="font-semibold text-gray-900 text-lg">
            Phiên bản {comparison.version1.VersionNumber}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {formatDate(comparison.version1.CreatedAt)}
          </div>
          {comparison.version1.ChangeDescription && (
            <div className="text-sm text-gray-600 mt-2 italic">
              "{comparison.version1.ChangeDescription}"
            </div>
          )}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">Phiên bản mới</div>
          <div className="font-semibold text-gray-900 text-lg">
            Phiên bản {comparison.version2.VersionNumber}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {formatDate(comparison.version2.CreatedAt)}
          </div>
          {comparison.version2.ChangeDescription && (
            <div className="text-sm text-gray-600 mt-2 italic">
              "{comparison.version2.ChangeDescription}"
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Thống kê thay đổi</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              +{comparison.stats.words_added}
            </div>
            <div className="text-sm text-gray-600">Từ thêm</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              -{comparison.stats.words_removed}
            </div>
            <div className="text-sm text-gray-600">Từ xóa</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {comparison.stats.words_unchanged}
            </div>
            <div className="text-sm text-gray-600">Không đổi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {comparison.stats.total_changes}
            </div>
            <div className="text-sm text-gray-600">Tổng thay đổi</div>
          </div>
        </div>
      </div>

      {/* Comparison content with selected display mode */}
      <div>
        {displayMode === 'inline' && renderInlineMode()}
        {displayMode === 'sidebyside' && renderSideBySideMode()}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center flex-wrap gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-6 h-4 bg-green-100 border border-green-300 rounded"></span>
            <span className="text-gray-700">Đã thêm</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-6 h-4 bg-red-100 border border-red-300 rounded"></span>
            <span className="text-gray-700">Đã xóa</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-6 h-4 bg-gray-100 border border-gray-300 rounded"></span>
            <span className="text-gray-700">Không đổi</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionComparison;
