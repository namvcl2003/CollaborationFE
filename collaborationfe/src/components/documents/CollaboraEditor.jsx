
// import { AlertCircle, ExternalLink, X } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import toast from 'react-hot-toast';
// import axios from '../../api/axios';
// import Button from '../common/Button';

// const CollaboraEditor = ({ documentId, onClose }) => {
//   const [editorUrl, setEditorUrl] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchEditorUrl();
//     return () => {
//       endSession();
//     };
//   }, [documentId]);

//   const fetchEditorUrl = async () => {
//     try {
//       const response = await axios.get(`/collabora/${documentId}/editor-url`);
//       console.log('Collabora response:', response.data); // DEBUG
      
//       const url = response.data.editor_url;
//       console.log('Editor URL:', url); // DEBUG
      
//       setEditorUrl(url);
//     } catch (error) {
//       console.error('Error fetching editor URL:', error);
//       setError(error.response?.data?.detail || 'Không thể mở trình soạn thảo');
//       toast.error('Không thể mở trình soạn thảo');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const endSession = async () => {
//     try {
//       await axios.post(`/collabora/${documentId}/end-session`);
//     } catch (error) {
//       console.error('Error ending session:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Đang mở trình soạn thảo...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !editorUrl) {
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-lg p-8 max-w-md">
//           <div className="text-center">
//             <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">
//               Không thể mở trình soạn thảo
//             </h3>
//             <p className="text-gray-600 mb-4">
//               {error || 'Vui lòng kiểm tra Collabora Online đang chạy'}
//             </p>
//             <p className="text-sm text-gray-500 mb-4">
//               Đảm bảo Collabora đang chạy tại: http://localhost:9980
//             </p>
//             <Button onClick={onClose} variant="primary">
//               Đóng
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 bg-white z-50">
//       <div className="h-full flex flex-col">
//         {/* Header */}
//         <div className="bg-gray-100 border-b border-gray-300 p-4 flex items-center justify-between flex-shrink-0">
//           <h3 className="text-lg font-semibold text-gray-900">
//             Trình soạn thảo Collabora Online
//           </h3>
//           <div className="flex items-center space-x-2">
//             <Button
//               size="sm"
//               variant="secondary"
//               icon={ExternalLink}
//               onClick={() => window.open(editorUrl, '_blank')}
//             >
//               Mở tab mới
//             </Button>
//             <Button
//               size="sm"
//               variant="secondary"
//               icon={X}
//               onClick={onClose}
//             >
//               Đóng
//             </Button>
//           </div>
//         </div>

//         {/* Iframe */}
//         <div className="flex-1 relative">
//           <iframe
//             src={editorUrl}
//             className="absolute inset-0 w-full h-full border-0"
//             title="Collabora Editor"
//             allow="clipboard-read; clipboard-write"
//             sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CollaboraEditor;


import { AlertCircle, ExternalLink, Maximize2, Minimize2, RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axios from '../../api/axios';
import Button from '../common/Button';

const CollaboraEditor = ({ documentId, onClose }) => {
  const [editorUrl, setEditorUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchEditorUrl();
    return () => {
      endSession();
    };
  }, [documentId]);

  const fetchEditorUrl = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/collabora/${documentId}/editor-url`);
      console.log('Collabora response:', response.data);
      
      const url = response.data.editor_url;
      console.log('Editor URL:', url);
      
      setEditorUrl(url);
    } catch (error) {
      console.error('Error fetching editor URL:', error);
      setError(error.response?.data?.detail || 'Không thể mở trình soạn thảo');
      toast.error('Không thể mở trình soạn thảo');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    try {
      await axios.post(`/collabora/${documentId}/end-session`);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEditorUrl();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-primary-50 to-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-primary-600 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Đang mở trình soạn thảo...</p>
          <p className="mt-2 text-sm text-gray-500">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error || !editorUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Không thể mở trình soạn thảo
            </h3>
            <p className="text-gray-600 mb-2">
              {error || 'Vui lòng kiểm tra Collabora Online đang chạy'}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mt-4 mb-6">
              <p className="text-sm text-gray-700 font-medium mb-2">
                Hướng dẫn khắc phục:
              </p>
              <ul className="text-xs text-gray-600 text-left space-y-1">
                <li>• Đảm bảo Collabora đang chạy tại: <code className="bg-white px-2 py-0.5 rounded">http://localhost:9980</code></li>
                <li>• Kiểm tra kết nối mạng</li>
                <li>• Thử làm mới trang</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleRefresh} variant="outline" className="flex-1">
                Thử lại
              </Button>
              <Button onClick={onClose} variant="primary" className="flex-1">
                Đóng
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-white ${isFullscreen ? '' : 'p-4'}`}>
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left section */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Trình soạn thảo
                  </h3>
                  <p className="text-xs text-primary-100">
                    Collabora Online
                  </p>
                </div>
              </div>
            </div>

            {/* Right section - Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2.5 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 disabled:opacity-50"
                title="Làm mới"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2.5 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
                title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </button>

              <button
                onClick={() => window.open(editorUrl, '_blank')}
                className="p-2.5 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
                title="Mở tab mới"
              >
                <ExternalLink className="h-5 w-5" />
              </button>

              <div className="w-px h-6 bg-white bg-opacity-30 mx-1"></div>

              <button
                onClick={onClose}
                className="p-2.5 text-white hover:bg-red-500 hover:bg-opacity-90 rounded-lg transition-all duration-200"
                title="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar khi loading */}
        {isRefreshing && (
          <div className="h-1 bg-primary-800 overflow-hidden">
            <div className="h-full bg-white animate-pulse" style={{ width: '60%' }}></div>
          </div>
        )}
      </div>

      {/* Editor Container */}
      <div className="flex-1 relative bg-gray-50">
        {/* Iframe wrapper with shadow */}
        <div className={`absolute inset-0 ${isFullscreen ? '' : 'm-0'}`}>
          <div className="h-full w-full bg-white shadow-inner rounded-lg overflow-hidden">
            <iframe
              src={editorUrl}
              className="w-full h-full border-0"
              title="Collabora Editor"
              allow="clipboard-read; clipboard-write"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          </div>
        </div>

        {/* Loading overlay when refreshing */}
        {isRefreshing && (
          <div className="absolute inset-0 bg-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
                <span className="text-sm font-medium text-gray-700">Đang tải lại...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Footer - Optional */}
      {!isFullscreen && (
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Đang kết nối
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Tự động lưu</span>
              <span>•</span>
              <span>Collabora Online</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaboraEditor;