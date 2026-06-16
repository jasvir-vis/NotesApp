import axios from "axios";

// const API = axios.create({
//   baseURL: "https://notesapp-3nkf.onrender.com/api",
// });

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((req) => {
  // Check current URL to determine which token to use
  const currentPath = window.location.pathname;
  
  let token;
  if (currentPath.startsWith('/admin')) {
    token = localStorage.getItem("adminToken");
  } else if (currentPath.startsWith('/faculty')) {
    token = localStorage.getItem("facultyToken");
  } else {
    // Fallback logic
    token = localStorage.getItem("facultyToken") || localStorage.getItem("adminToken");
  }

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
