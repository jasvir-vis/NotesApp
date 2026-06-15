import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import FileViewer from "../components/FileViewer";

const CoursePage = () => {
  const { id } = useParams();

  const [topics, setTopics] = useState(null);
  const [selected, setSelected] = useState(null);
  const [course, setCourse] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = localStorage.getItem("adminToken");

  // Load topics
  const loadTopics = () => {
    API.get(`/topics/public/${id}`).then(res => setTopics(res.data || []));
  };

  // Load course
  const loadCourse = () => {
    API.get("/courses").then(res => {
      const found = res.data.find(c => c._id === id);
      setCourse(found);
    });
  };

  useEffect(() => {
    loadTopics();
    loadCourse();
  }, [id]);

  // DELETE topic
  const handleDelete = async (topicId) => {
    if (!isAdmin) return alert("Only admin can delete topics");
    if (!window.confirm("Are you sure?")) return;

    try {
      await API.delete(`/topics/${topicId}`);
      alert("Topic deleted successfully");
      loadTopics();
    } catch (err) {
      console.error("Failed to delete topic:", err);
      alert("Failed to delete topic");
    }
  };

  // Toggle select
  const toggleSelect = (topicId) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  // Select All
  const selectAll = () => {
    if (!topics || topics.length === 0) return;
    
    if (selectedTopics.length === topics.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(topics.map(t => t._id));
    }
  };

  // Download selected
  const downloadSelected = async () => {
    try {
      const res = await API.post(
        "/topics/download-zip",
        { topicIds: selectedTopics },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "topics.zip");

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Download failed");
    }
  };

  const printSelected = async () => {
    try {
      if (selectedTopics.length === 0) {
        alert("Select files to print");
        return;
      }

      // Single file → direct open
      if (selectedTopics.length === 1) {
        const file = topics.find(t => t._id === selectedTopics[0]);
        if (!file || !file.fileUrl) {
          alert("File not available for printing");
          return;
        }
        const fileUrl = `http://localhost:5000${file.fileUrl}`;
        window.open(fileUrl, "_blank");
        return;
      }

      // Multiple → merge
      const res = await API.post(
        "/topics/merge-pdf",
        { topicIds: selectedTopics },
        { responseType: "blob" }
      );

      // IMPORTANT FIX
      const file = new Blob([res.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);

      // Open in PDF viewer
      const newWindow = window.open(fileURL);

      if (newWindow) {
        newWindow.onload = () => {
          newWindow.focus();
          newWindow.print();
        };
      }

    } catch (err) {
      console.error(err);
      alert("Print failed");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {/* Mobile Toggle */}
              <button
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="ml-4 md:ml-0">
                {course ? (
                  <div>
                    <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                      {course.courseName}
                    </h1>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {course.courseCode}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                        {course.teacherName}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                        {course.department}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                        {course.className}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="animate-pulse">
                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-32 sm:w-48 mb-2"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden relative w-full">
        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <div
          className={`
            fixed md:relative z-50 top-0 left-0 h-full
            w-64 sm:w-72 bg-white shadow-lg border-r border-gray-200
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
          `}
        >
          {/* Close button */}
          <div className="md:hidden p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Topics</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <Sidebar
            topics={topics}
            onSelect={(t) => {
              setSelected(t);
              setSidebarOpen(false);
            }}
            onDelete={handleDelete}
            isAdmin={isAdmin}
            selectedTopics={selectedTopics}
            toggleSelect={toggleSelect}
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col w-full">

          {/* ACTION BAR */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={
                    topics && topics.length > 0 &&
                    selectedTopics.length === topics.length
                  }
                  onChange={selectAll}
                  disabled={!topics || topics.length === 0}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Select All
              </label>

              {selectedTopics.length > 0 && (
                <>
                  <button
                    onClick={downloadSelected}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download ({selectedTopics.length})
                  </button>

                  <button
                    onClick={printSelected}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Print ({selectedTopics.length})
                  </button>
                </>
              )}
            </div>
          </div>

          {/* FILE VIEWER */}
          <div className="flex-1 overflow-auto bg-gray-50 p-4">
            <div className="h-full">
              {!selected ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Topic</h3>
                    <p className="text-gray-500">Choose a topic from the sidebar to view its content</p>
                  </div>
                </div>
              ) : (
                <FileViewer file={selected} />
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CoursePage;