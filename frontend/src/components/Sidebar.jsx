const getFileIcon = (type) => {
  if (!type) return "📄";

  if (type.includes("pdf")) return "📕";
  if (type.includes("presentation")) return "📊";
  if (type.includes("word")) return "📝";

  return "📄";
};

const Sidebar = ({
  topics,
  onSelect,
  onDelete,
  isAdmin,
  selectedTopics = [],   // ✅ prevent undefined error
  toggleSelect
}) => {
  const isLoading = topics === null || topics === undefined;
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Course Topics</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-8 h-8 text-blue-600">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-sm text-gray-500 mt-2">Loading topics...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && topics.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No topics available</p>
          </div>
        )}

        {/* Topics list - simplified to show only title and time */}
        {!isLoading && topics.length > 0 && (
          <div className="space-y-2">
            {topics.map((t) => (
              <div
                key={t._id}
                className="group bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer"
                onClick={() => onSelect(t)}
              >
                <div className="flex items-center gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedTopics?.includes(t._id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelect(t._id);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  {/* Title and Time */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                      {t.topicName || "Untitled Topic"}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(t.createdAt).toLocaleDateString()} • {new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>

                  {/* Delete button for admin */}
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(t._id);
                      }}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete topic"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;