import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";

import { SiGoogleclassroom } from "react-icons/si";
import { FaPlus } from "react-icons/fa";
import Button from "../components/Button";

const Classrooms = () => {
  const { loading, user } = useAuth();

  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    const fetchClassrooms = async () => {
      const { data, error } = await supabase
        .from("classrooms")
        .select("*")
        .eq("owner", user.id);

      if (data) {
        console.log("Fetched classrooms:", data);
        setClassrooms(data);
      }
    };
    fetchClassrooms();
  }, []);

  return (
    <div className="container mx-auto p-3 h-auto flex flex-col gap-2 w-full max-w-md">
      {/* ADD NEW CLASSROOM */}
      <Button className="w-full">
        <span className="flex items-center justify-center text-lg gap-2">
          Add Classroom <SiGoogleclassroom className="text-xl" />
        </span>
      </Button>
      <div className="mt-4">
        <ClassroomList classrooms={classrooms} />
      </div>
    </div>
  );
};

const ClassroomList = ({ classrooms }) => {
  return (
    <>
      {classrooms.length > 0 ? (
        <ul className="space-y-4">
          {classrooms.map((classroom) => (
            <li key={classroom.id}>
              <Classroom path={`/classrooms/${classroom.id}`}>
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
