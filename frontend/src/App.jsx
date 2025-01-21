import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignUpPage from "./pages/auth/SignUpPage";
import LoginPage from "./pages/auth/LoginPage";
import HomePage from "./pages/home/HomePage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import Notification from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQuery } from "@tanstack/react-query";
import { baseUrl } from "./constant/url";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch(`${baseUrl}/api/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.error) {
          return null;
        }
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw error;
      }
    },
    retry: false,
  });
  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="flex max-w-6xl mx-auto">
          {authUser && <Sidebar />}
          <Routes>
            <Route
              path="/"
              element={authUser ? <HomePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={!authUser ? <LoginPage /> : <Navigate to="/" />}
            />
            <Route
              path="/signup"
              element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
            />
            <Route
              path="/notifications"
              element={authUser ? <Notification /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile/:username"
              element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
            />
          </Routes>
          {authUser && <RightPanel />}
          <ToastContainer />
        </div>
      )}
    </>
  );
}

export default App;
