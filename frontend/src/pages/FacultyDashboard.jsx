import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const FacultyDashboard = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [topicMasters, setTopicMasters] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTopicMaster, setSelectedTopicMaster] = useState("");
  const [file, setFile] = useState(null);
  const [editTopic, setEditTopic] = useState({ topicName: "" });
  const [newFile, setNewFile] = useState(null);
  const [search, setSearch] = useState("");
  const [facultyInfo, setFacultyInfo] = useState(null);

  const [form, setForm] = useState({
    courseName: "",
    courseCode: "",
    teacherName: "",
    department: "",
    className: ""
  });

  // Auth Check and Load Faculty Info
  useEffect(() => {
    const token = localStorage.getItem("facultyToken");
    if (!token) navigate("/faculty-login");
    
    // Load faculty info
    loadFacultyInfo();
  }, []);

  // Load faculty information
  const loadFacultyInfo = async () => {
    try {
      const res = await API.get("/faculty/profile");
      const faculty = res.data;
      setFacultyInfo(faculty);
      
      // Pre-fill form with faculty info
      setForm(prev => ({
        ...prev,
        teacherName: faculty.name || "",
        department: faculty.department || ""
      }));
    } catch (err) {
      alert("Failed to load faculty info");
    }
  };

  // Faculty's dashboard courses
  const loadCourses = async () => {
    try {
      const res = await API.get("/courses/fcourse");
      setCourses(res.data || []);
    } catch (err) {
      setCourses([]);
    }
  };

  // Load Topics
  const loadTopics = async (courseId) => {
    try {
      const res = await API.get(`/topics/${courseId}`);
      setTopics(res.data);
    } catch (err) {
      // Error silently handled
    }
  };

  // Load Topic Names (ARRAY)
  const loadTopicMasters = async (courseId) => {
    try {
      const res = await API.get(`/topic-master/${courseId}`);
      setTopicMasters(res.data); // array of strings
    } catch (err) {
      // Error silently handled
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Add Course
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/courses", form);

      setForm(prev => ({
        ...prev,
        courseName: "",
        courseCode: "",
        className: ""
        // Keep teacherName and department as they're pre-filled
      }));

      loadCourses();
      alert("Course created successfully!");
    } catch (err) {
      alert("Failed to create course. Please try again.");
    }
  };

  // ADD TOPIC (FIXED)
  const addTopic = async (e) => {
    e.preventDefault();

    if (!selectedTopicMaster || !file) {
      alert("Please select a topic and upload a file");
      return;
    }

    const formData = new FormData();
    formData.append("courseId", selectedCourse._id);
    formData.append("topicName", selectedTopicMaster);
    formData.append("file", file);

    try {
      const response = await API.post("/topics/upload", formData);
      alert("Topic uploaded successfully!");

      setSelectedTopicMaster("");
      setFile(null);

      loadTopics(selectedCourse._id);
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = "Unknown error occurred";
      
      if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`Upload failed: ${errorMessage}`);
    }
  };

  // UPDATE TOPIC (FIXED)
  const updateTopic = async () => {
    const formData = new FormData();

    if (editTopic.topicName) {
      formData.append("topicName", editTopic.topicName);
    }

    if (newFile) {
      formData.append("file", newFile);
    }

    try {
      await API.put(`/topics/${editTopic._id}`, formData);

      alert("Topic updated successfully!");

      setEditTopic(null);
      setNewFile(null);

      loadTopics(selectedCourse._id);
    } catch (err) {
      alert("Failed to update topic. Please try again.");
    }
  };

  // DELETE COURSE
  const deleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await API.delete(`/courses/${id}`);
      loadCourses();
      alert("Course deleted successfully!");
    } catch (err) {
      alert("Failed to delete course. Please try again.");
    }
  };

  // DELETE TOPIC
  const deleteTopic = async (id) => {
    if (!window.confirm("Are you sure you want to delete this topic?")) return;

    try {
      await API.delete(`/topics/${id}`);
      loadTopics(selectedCourse._id);
      alert("Topic deleted successfully!");
    } catch (err) {
      alert("Failed to delete topic. Please try again.");
    }
  };

  const logout = () => {
    localStorage.removeItem("facultyToken");
    navigate("/faculty-login");
  };

  const filteredCourses = courses.filter(c =>
    c.courseName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Faculty Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => {
                  const manualPath = '/src/assets/Faculty User Manual.pdf';
                  window.open(manualPath, '_blank');
                }}
                className="text-green-600 hover:text-green-800 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium"
              >
                View Manual
              </button>
              <a
                href="/src/assets/Faculty User Manual.pdf"
                download="Faculty User Manual.pdf"
                className="text-green-600 hover:text-green-800 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium"
              >
                Download Manual
              </a>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/faculty/profile")}
                className="text-blue-600 hover:text-blue-800 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium"
              >
                Edit Profile
              </button>
              <button
                onClick={logout}
                className="text-red-600 hover:text-red-800 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Add Course Section */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Course</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                <input
                  type="text"
                  placeholder="e.g., Introduction to Computer Science"
                  value={form.courseName}
                  onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                <input
                  type="text"
                  placeholder="e.g., CS101"
                  value={form.courseCode}
                  onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Name</label>
                <input
                  type="text"
                  placeholder="e.g., Dr. John Smith"
                  value={form.teacherName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Auto-filled from your profile</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g., Computer Science"
                  value={form.department}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Auto-filled from your profile</p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <input
                  type="text"
                  placeholder="e.g., Year 1, Semester 1"
                  value={form.className}
                  onChange={(e) => setForm({ ...form, className: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm"
            >
              Create Course
            </button>
          </form>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-4">
              {search ? "No courses match your search. Try a different search term." : "Get started by creating your first course."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {filteredCourses.map(c => (
              <div
                key={c._id}
                className="bg-white shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
              >
                <div
                  className="p-4 sm:p-6 cursor-pointer"
                  onClick={() => {
                    setSelectedCourse(c);
                    loadTopics(c._id);
                    loadTopicMasters(c._id);
                  }}
                >
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{c.courseName}</h3>
                  <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                    <p><span className="font-medium">Code:</span> {c.courseCode}</p>
                    <p><span className="font-medium">Instructor:</span> {c.teacherName}</p>
                  </div>
                </div>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex justify-between items-center">
                  <button
                    onClick={() => navigate(`/admin/topic-master/${c._id}`)}
                    className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                  >
                    Manage Topics
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCourse(c._id);
                    }}
                    className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Topics Section */}
        {selectedCourse && (
          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {selectedCourse.courseName} - Topics
              </h2>
              <p className="text-gray-600 text-sm">Manage and upload course materials</p>
            </div>

            {/* Add Topic Form */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Upload New Topic</h3>
              <form onSubmit={addTopic} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic Name</label>
                  <select
                    value={selectedTopicMaster}
                    onChange={(e) => setSelectedTopicMaster(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  >
                    <option value="">Select a topic</option>
                    {topicMasters.map((t, i) => (
                      <option key={i} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
                >
                  Upload Topic
                </button>
              </form>
            </div>

            {/* Topics List */}
            {topics.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">No topics uploaded yet</p>
                <p className="text-sm text-gray-400">Upload your first topic using the form above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topics.map(t => (
                  <div key={t._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                      <div className="flex-1 mb-3 sm:mb-0">
                        <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">{t.topicName}</h4>
                        <div className="flex flex-col sm:flex-wrap sm:gap-4 text-sm text-gray-500">
                          <span>File: {t.fileUrl.split('/').pop()}</span>
                          <span>Uploaded: {new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                        <a
                          href={`http://localhost:5000${t.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          View
                        </a>
                        <button
                          onClick={() => setEditTopic(t)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTopic(t._id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        t.fileType?.includes('pdf') ? 'bg-red-100 text-red-800' :
                        t.fileType?.includes('word') || t.fileType?.includes('document') ? 'bg-blue-100 text-blue-800' :
                        t.fileType?.includes('powerpoint') || t.fileType?.includes('presentation') ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t.fileType?.includes('pdf') ? 'PDF' :
                         t.fileType?.includes('word') || t.fileType?.includes('document') ? 'DOC' :
                         t.fileType?.includes('powerpoint') || t.fileType?.includes('presentation') ? 'PPT' :
                         'File'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Edit Topic Modal */}
            {editTopic && editTopic._id && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
                <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Topic</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Topic Name</label>
                        <input
                          type="text"
                          value={editTopic.topicName}
                          onChange={(e) => setEditTopic({...editTopic, topicName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Replace File (Optional)</label>
                        <input
                          type="file"
                          onChange={(e) => setNewFile(e.target.files[0])}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        onClick={updateTopic}
                        className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditTopic({ topicName: "" });
                          setNewFile(null);
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default FacultyDashboard;