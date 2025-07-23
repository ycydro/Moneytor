import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

import Classrooms from "./pages/Classrooms";
import ClassroomDetail from "./pages/ClassroomDetail";
import "./App.css";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentDetail from "./pages/StudentDetail";
import TreasurerHistory from "./pages/TreasurerHistory";

function App() {
  return (
    <Router>
      <Navbar />
      {/* LINKS */}
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/classroom-list"
            element={
              <ProtectedRoute>
                <Classrooms />
              </ProtectedRoute>
            }
          />

          <Route path="/classrooms/:id" element={<ClassroomDetail />} />
          <Route
            path="/classrooms/:cid/student/:id"
            element={<StudentDetail />}
          />
          <Route
            path="/classrooms/:cid/treasurer-history/:id"
            element={<TreasurerHistory />}
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
