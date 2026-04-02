import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { logout } from "./store/slices/authSlice";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TaskBoard from "./components/TaskBoard";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && (
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Welcome back</p>
              <p className="text-xl font-semibold text-gray-800">
                {user?.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? <Login /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? <Signup /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <TaskBoard />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;