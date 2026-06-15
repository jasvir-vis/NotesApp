import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import CourseCard from "../components/CourseCard";
// import logo from "../assets/logohead.png";

const Home = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");

  useEffect(() => {
    API.get("/courses/")
      .then(res => {
        console.log("Courses loaded:", res.data);
        setCourses(res.data || []);
      })
      .catch(err => {
        console.error("Error loading courses:", err);
        setError("Failed to load courses");
      })
      .finally(() => setLoading(false));
  }, []);

  // Get unique departments and teachers for filters
  const departments = [...new Set(courses.map(c => c.department).filter(Boolean))];
  const teachers = [...new Set(courses.map(c => c.teacherName).filter(Boolean))];

  // Filter courses with multiple criteria
  const filteredCourses = courses.filter(course => {
    if (!course || !course.courseName) return false;

    const matchesSearch = !search || course.courseName.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || course.department === departmentFilter;
    const matchesTeacher = teacherFilter === "all" || course.teacherName === teacherFilter;

    return matchesSearch && matchesDepartment && matchesTeacher;
  });

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Courses</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-500 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          {/* <img
            src={logo}
            alt="DAV University Logo"
            className="w-12 h-12 object-contain"
          /> */}

          <h1 className="text-3xl text-white font-bold text-center">
            Notes App 
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Courses</h3>
            <p className="text-3xl font-bold text-blue-600">{courses.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Departments</h3>
            <p className="text-3xl font-bold text-green-600">
              {[...new Set(courses.map(c => c.department))].length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Faculty</h3>
            <p className="text-3xl font-bold text-purple-600">
              {[...new Set(courses.map(c => c.teacherName))].length}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search courses by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Department Filter */}
              <div>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Teacher Filter */}
              <div>
                <select
                  value={teacherFilter}
                  onChange={(e) => setTeacherFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All Faculty</option>
                  {teachers.map(teacher => (
                    <option key={teacher} value={teacher}>{teacher}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(search || departmentFilter !== "all" || teacherFilter !== "all") && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setSearch("");
                    setDepartmentFilter("all");
                    setTeacherFilter("all");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Available Courses ({filteredCourses.length})
          </h2>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {search ? "No Courses Found" : "No Courses Available"}
              </h3>
              <p className="text-gray-500">
                {search
                  ? "Try adjusting your search terms."
                  : "Courses will appear here once added by faculty."
                }
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;