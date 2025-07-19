import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import useStudentFunds from "../hooks/useStudentFunds";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";

import Card from "../components/Card";
import Button from "../components/Button";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { HiUserGroup } from "react-icons/hi";
import { RxAvatar } from "react-icons/rx";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { BiMoneyWithdraw } from "react-icons/bi";

const ClassroomDetail = () => {
  const { id } = useParams();
  const { loading, user } = useAuth();
  const navigate = useNavigate();

  const [totalFunds, setTotalFunds] = useState(0);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  const fetchAllClassroomData = async () => {
    setIsLoading(true);

    try {
      // Check ownership
      const { data: classroomData } = await supabase
        .from("classrooms")
        .select("*")
        .eq("id", id)
        .eq("owner", user?.id)
        .single();

      setIsOwner(!!classroomData);

      // Get all transactions for this classroom
      const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .eq("classroom_id", id);

      if (transactionsError) throw transactionsError;

      // Calculate total classroom funds
      const classroomTotal = transactions.reduce((total, transaction) => {
        return transaction.type === "deposit"
          ? total + transaction.amount
          : total - transaction.amount;
      }, 0);
      setTotalFunds(classroomTotal);

      // Get all students and calculate their individual funds
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .eq("classroom_id", id);

      if (studentsError) throw studentsError;

      const studentsWithFunds = studentsData.map((student) => {
        const studentTransactions = transactions.filter(
          (t) => t.student_id === student.id
        );
        const funds = studentTransactions.reduce((total, transaction) => {
          return transaction.type === "deposit"
            ? total + transaction.amount
            : total - transaction.amount;
        }, 0);
        return { ...student, funds };
      });

      setStudents(studentsWithFunds);
    } catch (error) {
      console.error("Error fetching classroom data:", error);
      alert("Failed to load classroom data");
    } finally {
      setIsLoading(false);
    }
  };

  const [searchText, setSearchText] = useState("");

  const searchStudents = async (searchQuery = searchText) => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("classroom_id", id)
        .ilike("name", `%${searchQuery.trim()}%`);

      if (error) throw error;

      console.log(data, "students");

      // We need to calculate funds for the filtered students
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("classroom_id", id);

      const filteredStudentsWithFunds = data.map((student) => {
        const studentTransactions = transactions.filter(
          (t) => t.student_id === student.id
        );
        const funds = studentTransactions.reduce((total, transaction) => {
          return transaction.type === "deposit"
            ? total + transaction.amount
            : total - transaction.amount;
        }, 0);
        return { ...student, funds };
      });

      setStudents(filteredStudentsWithFunds);
    } catch (error) {
      console.error("Error searching students:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) return;

    const trimmedSearch = searchText.trim();
    searchStudents(trimmedSearch);
  };

  useEffect(() => {
    if (!loading && user) {
      fetchAllClassroomData();
    }
  }, [id, loading, user]);

  useEffect(() => {
    if (searchText.trim()) return;

    searchStudents();
  }, [searchText, id]);

  return (
    <div className="p-4 flex flex-col items-center justify-start min-h-screen gap-5">
      <h1 className="text-1xl font-bold text-gray-800">CLASSROOM {id}</h1>
      <Card className="w-full max-w-md flex flex-col items-center justify-center gap-5">
        <div className="flex items-center justify-center text-center gap-2">
          <h3 className="text-2xl font-semibold text-gray-700">Total Funds</h3>
          <RiMoneyDollarCircleFill className="text-3xl text-green-600" />
        </div>
        <span className="text-gray-800 text-5xl text-center font-medium">
          {isLoading ? "Loading..." : `₱${totalFunds.toFixed(2)}`}
        </span>
        {isOwner && (
          <Button
            color=""
            className="w-full px-4 py-2 text-gray900 bg-amber-400 rounded-4xl"
          >
            <span className="flex items-center justify-center gap-2">
              <BiMoneyWithdraw className="text-xl" />
              Withdraw Funds
            </span>
          </Button>
        )}
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
        <Button className="w-full px-6 py-3">
          <span className="flex items-center gap-2">
            <HiUserGroup className="text-xl" />
            Manage Students
          </span>
        </Button>
      </div>

      <form className="w-full max-w-md flex items-center gap-2">
        <input
          type="text"
          placeholder="Search students..."
          required
          autoComplete="off"
          className="w-full py-2 border border-emerald-700 rounded-lg ps-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700"
          onClick={handleSearch}
        >
          <HiMagnifyingGlass className="text-xl" />
        </Button>
      </form>
      <div className="mt-3 w-full max-w-md">
        <StudentList students={students} onRefresh={fetchAllClassroomData} />
      </div>
    </div>
  );
};

const StudentList = ({ students, onRefresh }) => {
  return (
    <div className="w-full max-w-md">
      {students.length > 0 ? (
        <ul className="space-y-3">
          {students.map((student) => (
            <li key={student.id}>
              <StudentCard student={student} onRefresh={onRefresh} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-500">No students available.</div>
      )}
    </div>
  );
};

const StudentCard = ({ student, onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("transactions").insert([
        {
          student_id: student.id,
          classroom_id: student.classroom_id,
          amount: parseFloat(amount),
          type: "deposit",
          note: notes,
          treasurer_id: user.id,
        },
      ]);

      if (error) throw error;

      // Refresh all data after successful transaction
      await onRefresh();
      setAmount("");
      setNotes("");
    } catch (error) {
      console.error("Error updating funds:", error);
      alert("Failed to update student funds");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full border-2 border-emerald-700 rounded-lg shadow-md overflow-hidden">
      <div
        className="py-4 px-6 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <RxAvatar className="text-2xl" />
          <span className="text-md font-semibold">{student.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-500 text-md">
            ₱{student.funds?.toFixed(2) || "0.00"}
          </span>
          {isOpen ? (
            <FaChevronUp className="text-emerald-700 transition-transform duration-300" />
          ) : (
            <FaChevronDown className="text-emerald-700 transition-transform duration-300" />
          )}
        </div>
      </div>

      {/* Accordion Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 pt-2 bg-gray-50 rounded-b-lg border-t border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount to Deposit
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₱</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full pl-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Add any notes about this transaction..."
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              <span className="flex items-center justify-center gap-2">
                <RiMoneyDollarCircleFill className="text-xl" />
                {isSubmitting ? "Processing..." : "Update Funds"}
              </span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClassroomDetail;
