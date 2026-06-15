import API from "../services/api";

const FileViewer = ({ file }) => {
  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium">No file selected</p>
          <p className="text-sm text-gray-500 mt-1">Select a topic from the sidebar to view its content</p>
        </div>
      </div>
    );
  }

  const fileUrl = `http://localhost:5000${file.fileUrl}`;
  const fileExtension = file.fileUrl.split('.').pop().toLowerCase();
  
  const getFileTypeIcon = () => {
    if (file.fileType?.includes('pdf')) return 'PDF';
    if (file.fileType?.includes('word') || file.fileType?.includes('document')) return 'DOC';
    if (file.fileType?.includes('presentation')) return 'PPT';
    return 'FILE';
  };

  const getFileTypeColor = () => {
    if (file.fileType?.includes('pdf')) return 'bg-red-100 text-red-800';
    if (file.fileType?.includes('word') || file.fileType?.includes('document')) return 'bg-blue-100 text-blue-800';
    if (file.fileType?.includes('presentation')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleView = () => {
    API.post(`/topics/view/${file._id}`).catch(err => {
      console.log('View tracking failed:', err);
    });
  };

  const handlePrint = () => {
    try {
      const printWindow = window.open(fileUrl, '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 1000);
        };
      } else {
        // Fallback for popup blockers
        window.open(fileUrl, '_blank');
      }
    } catch (err) {
      console.error('Print failed:', err);
      // Fallback
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* File Header */}
      <div className="border-b border-gray-200 px-4 sm:px-6 py-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getFileTypeColor()}`}>
              {getFileTypeIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-xl font-semibold text-gray-900 truncate">{file.topicName}</h2>
              <p className="text-sm text-gray-500">
                {file.fileUrl.split('/').pop()} • {new Date(file.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:inline">Print</span>
              <span className="sm:hidden">Print</span>
            </button>
            <a
              href={fileUrl}
              download
              onClick={handleView}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Download</span>
              <span className="sm:hidden">Get</span>
            </a>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleView}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="hidden sm:inline">Open in New Tab</span>
              <span className="sm:hidden">Open</span>
            </a>
          </div>
        </div>
      </div>

      {/* File Content - Full Page View */}
      <div className="flex-1 overflow-auto p-0 print:p-0">
        <div className="h-full w-full">
          {file.fileType?.includes('pdf') || file.fileType?.includes('image') ? (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0 print:w-full print:h-full"
              style={{ 
                minHeight: '100vh',
                width: '100%',
                height: '100vh'
              }}
              title={file.topicName}
              onLoad={handleView}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md mx-auto">
                <div className="mb-6">
                  <svg className="w-16 sm:w-24 h-16 sm:h-24 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">File Preview Not Available</h3>
                <p className="text-sm text-gray-500 mb-4">
                  This file type cannot be previewed in the browser. Please download the file to view its contents.
                </p>
                <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
                  <a
                    href={fileUrl}
                    download
                    onClick={handleView}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download File
                  </a>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleView}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open File
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;