import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const FacultyLogin = () => {
  const navigate = useNavigate();

  const [facultyId, setFacultyId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await API.post("/faculty/login", {
        facultyId,
        password
      });

      // Save token
      localStorage.setItem("facultyToken", res.data.token);
      localStorage.setItem("facultyId", facultyId);


      alert("Login successful!");
      navigate("/faculty");

    } catch (err) {
      console.error("Login failed:", err);
      alert(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        
        {/* Login Card */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Faculty Login</h2>
            <p className="text-sm text-gray-600 mt-1">Enter your credentials to access your account</p>
          </div>

          <form className="space-y-6" onSubmit={login}>
            {/* Faculty ID */}
            <div>
              <label htmlFor="facultyId" className="block text-sm font-medium text-gray-700 mb-2">
                Faculty ID
              </label>
              <input
                id="facultyId"
                name="facultyId"
                type="text"
                required
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your faculty ID"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition duration-300 ${
                isLoading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Help Text */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Need help? Contact your system administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyLogin;