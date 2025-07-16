import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="bg-gradient-to-br from-green-950 via-green-700 to-green-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link to="/">Moneytor</Link>
        </h1>
        <nav className="space-x-4">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/classroom-list" className="hover:underline">
            Classrooms
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
