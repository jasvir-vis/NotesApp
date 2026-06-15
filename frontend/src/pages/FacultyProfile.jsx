import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const FacultyProfile = () => {
  const navigate = useNavigate();

  const [facultyInfo, setFacultyInfo] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

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
      setProfileForm(prev => ({
        ...prev,
        name: faculty.name || ""
      }));
    } catch (err) {
      console.error("Failed to load faculty info:", err);
    }
  };

  // Update Profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!profileForm.currentPassword) {
      alert("Please enter your current password");
      setLoading(false);
      return;
    }

    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      alert("New passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        name: profileForm.name
      };

      // Only add password if new password is provided
      if (profileForm.newPassword) {
        updateData.currentPassword = profileForm.currentPassword;
        updateData.newPassword = profileForm.newPassword;
      }

      await API.put("/faculty/profile", updateData);
      alert("Profile updated successfully!");
      
      // Reload faculty info to update form
      await loadFacultyInfo();
      
      // Clear password fields after successful update
      setProfileForm(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("facultyToken");
    navigate("/faculty-login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Edit Profile</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => navigate("/faculty-dashboard")}
                className="text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium"
              >
                Back to Dashboard
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
        <div className="max-w-2xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 sm:px-6 py-6 sm:py-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Information</h2>
                <p className="text-gray-600">Update your personal information and password</p>
              </div>

              {/* Faculty Info Display */}
              {facultyInfo && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Faculty ID</p>
                      <p className="text-base font-semibold text-gray-900">{facultyInfo.facultyId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Department</p>
                      <p className="text-base font-semibold text-gray-900">{facultyInfo.department}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Update Form */}
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={profileForm.currentPassword}
                      onChange={(e) => setProfileForm({...profileForm, currentPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter current password to confirm changes"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password (Optional)
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm({...profileForm, newPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Leave blank to keep current password"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {loading ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-lg font-semibold mb-2">DAV UNIVERSITY, JALANDHAR</h3>
          <p className="text-gray-400">Digital Learning Management System © 2024</p>
        </div>
      </footer>
    </div>
  );
};

export default FacultyProfile;
