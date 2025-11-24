// import { ExternalLink, X } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import toast from 'react-hot-toast';
// import axios from '../../api/axios'; // FIX: Thêm ../../
// import Button from '../common/Button';

// const CollaboraEditor = ({ documentId, onClose }) => {
//   const [editorUrl, setEditorUrl] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchEditorUrl();
//     return () => {
//       endSession();
//     };
//   }, [documentId]);

//   const fetchEditorUrl = async () => {
//     try {
//       const response = await axios.get(`/collabora/${documentId}/editor-url`);
//       setEditorUrl(response.data.editor_url);
//     } catch (error) {
//       console.error('Error fetching editor URL:', error);
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

//   if (!editorUrl) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-red-600">Không thể tải trình soạn thảo</p>
//         <Button onClick={onClose} variant="secondary" className="mt-4">
//           Đóng
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 bg-white z-50">
//       <div className="h-full flex flex-col">
//         {/* Header */}
//         <div className="bg-gray-100 border-b border-gray-300 p-4 flex items-center justify-between">
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
//         <iframe
//           src={editorUrl}
//           className="flex-1 w-full border-0"
//           title="Collabora Editor"
//           allow="clipboard-read; clipboard-write"
//         />
//       </div>
//     </div>
//   );
// };

// export default CollaboraEditor;


import { AlertCircle, ExternalLink, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axios from '../../api/axios';
import Button from '../common/Button';

const CollaboraEditor = ({ documentId, onClose }) => {
  const [editorUrl, setEditorUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEditorUrl();
    return () => {
      endSession();
    };
  }, [documentId]);

  const fetchEditorUrl = async () => {
    try {
      const response = await axios.get(`/collabora/${documentId}/editor-url`);
      console.log('Collabora response:', response.data); // DEBUG
      
      const url = response.data.editor_url;
      console.log('Editor URL:', url); // DEBUG
      
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang mở trình soạn thảo...</p>
        </div>
      </div>
    );
  }

  if (error || !editorUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không thể mở trình soạn thảo
            </h3>
            <p className="text-gray-600 mb-4">
              {error || 'Vui lòng kiểm tra Collabora Online đang chạy'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Đảm bảo Collabora đang chạy tại: http://localhost:9980
            </p>
            <Button onClick={onClose} variant="primary">
              Đóng
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gray-100 border-b border-gray-300 p-4 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">
            Trình soạn thảo Collabora Online
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="secondary"
              icon={ExternalLink}
              onClick={() => window.open(editorUrl, '_blank')}
            >
              Mở tab mới
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={X}
              onClick={onClose}
            >
              Đóng
            </Button>
          </div>
        </div>

        {/* Iframe */}
        <div className="flex-1 relative">
          <iframe
            src={editorUrl}
            className="absolute inset-0 w-full h-full border-0"
            title="Collabora Editor"
            allow="clipboard-read; clipboard-write"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        </div>
      </div>
    </div>
  );
};

export default CollaboraEditor;