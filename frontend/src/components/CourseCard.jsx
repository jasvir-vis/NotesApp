import { useNavigate } from "react-router-dom";

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/course/${course._id}`)}
      className="bg-white p-5 rounded-xl shadow hover:shadow-xl transition cursor-pointer border"
    >
      <h2 className="text-xl font-bold mb-2">
        {course.courseName}
      </h2>

      <p className="text-sm text-gray-600">📘 {course.courseCode}</p>
      <p className="text-sm text-gray-600">👨‍🏫 {course.teacherName}</p>
      <p className="text-sm text-gray-600">🏫 {course.department}</p>
      <p className="text-sm text-gray-600">🎓 {course.className}</p>
    </div>
  );
};

export default CourseCard;