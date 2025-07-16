import React from "react";
import { Link } from "react-router-dom";
import { SiGoogleclassroom } from "react-icons/si";
import { FaPlus } from "react-icons/fa";
import Button from "../components/Button";
const classrooms = [
  { id: 1, name: "Grade 10 - A" },
  { id: 2, name: "Grade 11 - B" },
];
const Classrooms = () => {
  return (
    <div className="container mx-auto p-3 h-auto flex flex-col gap-2 w-full max-w-md">
      {/* ADD NEW CLASSROOM */}
      <Button className="w-full">
        <span className="flex items-center justify-center text-lg gap-2">
          Add Classroom <SiGoogleclassroom className="text-xl" />
        </span>
      </Button>
      <div className="mt-4">
        <ClassroomList />
      </div>
    </div>
  );
};

const ClassroomList = () => {
  return (
    <>
      {classrooms.length > 0 ? (
        <ul className="space-y-4">
          {classrooms.map((classroom) => (
            <li key={classroom.id}>
              <Classroom path={`/classroom/${classroom.id}`}>
                <span className="flex items-center justify-center text-4xl gap-2">
                  {classroom.name} <SiGoogleclassroom />
                </span>
                <span className="text-gray-500 text-sm">100 students</span>
              </Classroom>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-500">
          No classrooms available.
        </div>
      )}
    </>
  );
};

const Classroom = ({ path, children }) => {
  return (
    <Link
      to={path}
      className="border-2 border-emerald-500 py-15 px-4 rounded-lg shadow-md text-center h-auto flex flex-col items-center justify-center gap-1"
    >
      {children}
    </Link>
  );
};

export default Classrooms;
