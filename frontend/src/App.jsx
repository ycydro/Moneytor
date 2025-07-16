import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Classrooms from "./pages/Classrooms";
import ClassroomDetail from "./pages/ClassroomDetail";
import "./App.css";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      {/* LINKS */}
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/classroom-list" element={<Classrooms />} />
          <Route path="/classroom/:id" element={<ClassroomDetail />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
