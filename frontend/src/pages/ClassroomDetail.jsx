import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";

import Card from "../components/Card";
import Button from "../components/Button";
import { IoIosEye } from "react-icons/io";
import { BsClockHistory } from "react-icons/bs";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { TiUserAdd } from "react-icons/ti";
import { RxAvatar } from "react-icons/rx";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { PiHandDeposit } from "react-icons/pi";
import { BiMoneyWithdraw } from "react-icons/bi";
import { IoClose } from "react-icons/io5";

const ClassroomDetail = () => {
  const { id } = useParams();
  const { loading, user } = useAuth();
  const navigate = useNavigate();

  const [totalFunds, setTotalFunds] = useState(0);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [classroom, setClassroom] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [transactionType, setTransactionType] = useState("");

  const [openAddStudentModal, setOpenAddStudentModal] = useState(false);
  const [openTransactionModal, setOpenTransactionModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(5);
  const [totalStudents, setTotalStudents] = useState(0);

  // Calculate total funds from transactions
  const calculateTotalFunds = (transactions) => {
    console.log("done calculating");

    return transactions.reduce((total, transaction) => {
      return transaction.type === "deposit"
        ? total + transaction.amount
        : total - transaction.amount;
    }, 0);
  };

  // Fetch transactions only when needed
  const fetchTransactions = async () => {
    setIsCalculating(true);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("classroom_id", id);

      if (error) throw error;
      setTransactions(data);
      setTotalFunds(calculateTotalFunds(data));
    } catch (error) {
      console.error(error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Fetch classroom ownership and transactions once
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const { data: classroomData } = await supabase
          .from("classrooms")
          .select("*")
          .eq("id", id)
          .single();

        // Check if current user is the owner
        setIsOwner(classroomData?.owner === user?.id || false);
        setClassroom(classroomData);

        // Load transactions once
        await fetchTransactions();
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [id]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      // Calculate safe range values
      const from = (currentPage - 1) * studentsPerPage;
      const to = from + studentsPerPage - 1;

      let query = supabase
        .from("students")
        .select("*", { count: "exact" })
        .eq("classroom_id", id)
        .order("name", { ascending: "false" });

      // Add search filter if needed
      if (searchText.trim()) {
        query = query.ilike("name", `%${searchText.trim()}%`);
      }

      // First get the count
      const { count } = await query;
      setTotalStudents(count);

      // Handle case when there are no students
      if (count === 0) {
        setStudents([]);
        return;
      }

      // Calculate safe range
      const safeFrom = Math.min(from, count - 1);
      const safeTo = Math.min(to, count - 1);

      // Ensure safeFrom <= safeTo
      if (safeFrom > safeTo) {
        setStudents([]);
        return;
      }

      // Get the actual student data
      const { data: studentsData, error: studentsError } = await query.range(
        safeFrom,
        safeTo
      );

      if (studentsError) throw studentsError;

      // Calculate funds for the paginated students using transactions
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
      console.error("Error fetching students:", error);
      alert("Failed to load student data");
    } finally {
      setIsLoading(false);
    }
  };

  const searchStudents = async (searchQuery = searchText) => {
    try {
      setCurrentPage(1); // Reset to first page when searching
      await fetchStudents();
    } catch (error) {
      console.error("Error searching students:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) return;
    await searchStudents(searchText.trim());
  };

  // Fetch students when page changes
  useEffect(() => {
    if (!loading && user) {
      fetchStudents();
    }
  }, [currentPage, transactions, loading, user]);

  // Refresh when search text is cleared
  useEffect(() => {
    if (searchText.trim()) return;
    searchStudents();
  }, [searchText]);

  // Calculate total pages
  const totalPages = Math.ceil(totalStudents / studentsPerPage);

  // Function to refresh after transaction
  const handleTransactionComplete = async () => {
    await fetchTransactions(); // This will update totalFunds
    await fetchStudents(); // This will update student funds
  };

  const handleFundsModal = (type) => {
    setTransactionType(type);
    setOpenTransactionModal(true);
  };

  return (
    <div className="p-4 flex flex-col items-center justify-start min-h-screen gap-5">
      <h1 className="text-1xl font-bold text-gray-800">
        CLASSROOM {classroom?.name?.toUpperCase()}
      </h1>
      <Card className="w-full max-w-md flex flex-col items-center justify-center gap-5">
        <div className="flex items-center justify-center text-center gap-2">
          <h3 className="text-2xl font-semibold text-gray-700">Total Funds</h3>
          <RiMoneyDollarCircleFill className="text-3xl text-green-600" />
        </div>
        <span
          className={`text-gray-800 text-center font-medium ${
            isCalculating ? "text-4xl" : "text-5xl"
          }`}
        >
          {isCalculating ? "Calculating.." : `₱${totalFunds.toFixed(2)}`}
        </span>
        {isOwner && (
          <div className="space-y-2.5">
            <Button
              onClick={() => handleFundsModal("Deposit")}
              color=""
              className="w-full px-4 py-2 text-gray-900 bg-amber-400 rounded-4xl"
            >
              <span className="flex items-center justify-center gap-2">
                <PiHandDeposit className="text-xl" />
                Deposit Funds
              </span>
            </Button>
            <Button
              onClick={() => handleFundsModal("Withdraw")}
              color=""
              className="w-full px-4 py-2 text-gray-900 bg-amber-400 rounded-4xl"
            >
              <span className="flex items-center justify-center gap-2">
                <BiMoneyWithdraw className="text-xl" />
                Withdraw Funds
              </span>
            </Button>
          </div>
        )}
        <Button
          color=""
          className="w-full hover:underline"
          onClick={() =>
            navigate(`/classrooms/${id}/treasurer-history/${classroom.owner}`, {
              state: { isOwner },
            })
          }
        >
          <span className="flex items-center justify-center gap-2 text-md">
            <BsClockHistory /> View Funds History
          </span>
        </Button>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
        {isOwner && (
          <Button
            className="w-full px-6 py-3"
            onClick={() => setOpenAddStudentModal(true)}
          >
            <span className="flex items-center gap-2">
              <TiUserAdd className="text-xl" />
              Add Students
            </span>
          </Button>
        )}
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
        <StudentList
          students={students}
          onRefresh={handleTransactionComplete}
          isLoading={isLoading}
          isOwner={isOwner}
        />
      </div>

      {/* Pagination Controls */}
      {totalStudents > studentsPerPage && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isLoading}
            className="px-4 py-2"
          >
            Previous
          </Button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || isLoading}
            className="px-4 py-2"
          >
            Next
          </Button>
        </div>
      )}
      <TransactionModal
        open={openTransactionModal}
        transactionType={transactionType}
        user={user}
        onClose={() => setOpenTransactionModal(false)}
        classroomId={id}
        onTransaction={fetchTransactions}
      />
      <AddStudentModal
        open={openAddStudentModal}
        onClose={() => setOpenAddStudentModal(false)}
        classroomId={id}
        onStudentAdded={fetchStudents}
      />
    </div>
  );
};

const StudentList = ({ students, isOwner, onRefresh }) => {
  return (
    <div className="w-full max-w-md">
      {students.length > 0 ? (
        <ul className="space-y-3">
          {students.map((student) => (
            <li key={student.id}>
              <StudentCard
                student={student}
                onRefresh={onRefresh}
                isOwner={isOwner}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-500">No students available.</div>
      )}
    </div>
  );
};

const StudentCard = ({ student, isOwner, onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
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
        onClick={
          isOwner
            ? () => setIsOpen(!isOpen)
            : () =>
                navigate(
                  `/classrooms/${student.classroom_id}/student/${student.id}`,
                  {
                    state: { isOwner },
                  }
                )
        }
      >
        <div className="flex items-center gap-2">
          <RxAvatar className="text-2xl" />
          <span className="text-md font-semibold">{student.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-green-500 text-md">
            ₱{student.funds?.toFixed(2) || "0.00"}
          </span>

          {isOwner ? (
            isOpen ? (
              <FaChevronUp className="text-emerald-700 transition-transform duration-300" />
            ) : (
              <FaChevronDown className="text-emerald-700 transition-transform duration-300" />
            )
          ) : (
            <IoIosEye className="text-emerald-950 text-2xl" />
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
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
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
                    step="1"
                    min={1}
                    max={5000}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <Button
                  onClick={() =>
                    setAmount((prev) => String(Number(prev || 0) + 5))
                  }
                  className="whitespace-nowrap"
                >
                  +5
                </Button>
                <Button
                  onClick={() =>
                    setAmount((prev) => String(Number(prev || 0) + 10))
                  }
                  className="whitespace-nowrap"
                >
                  +10
                </Button>
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
            <div className="space-y-2">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                <span className="flex items-center justify-center gap-2">
                  <RiMoneyDollarCircleFill className="text-xl" />
                  {isSubmitting ? "Processing..." : "Update Funds"}
                </span>
              </Button>
              <Button
                color=""
                className="w-full hover:underline"
                onClick={() =>
                  navigate(
                    `/classrooms/${student.classroom_id}/student/${student.id}`,
                    {
                      state: { isOwner },
                    }
                  )
                }
              >
                <span className="flex items-center justify-center gap-2 text-md">
                  <BsClockHistory /> View Transaction History
                </span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const TransactionModal = ({
  open,
  transactionType,
  user,
  onClose,
  classroomId,
  onTransaction,
}) => {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleClose = () => {
    setAmount("");
    setNotes("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from("transactions")
        .insert([
          {
            // lowercase the type
            type:
              transactionType.split(" ")[0].charAt(0).toLowerCase() +
              transactionType.split(" ")[0].slice(1).toLowerCase(),
            amount,
            student_id: null,
            treasurer_id: user.id,
            classroom_id: classroomId,
            note: notes,
          },
        ])
        .select();

      if (insertError) throw insertError;

      // Clear form and close modal on success
      setAmount("");

      handleClose();
      onTransaction(); // Refresh the transaction
    } catch (err) {
      console.error("Error withdrawing:", err);
      setError(err.message || "Failed to withdraw");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        open ? "visible" : "invisible"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal container */}
      <div
        className={`relative w-full max-w-md bg-white rounded-lg shadow-xl transition-all duration-300 ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {transactionType} Funds
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none cursor-pointer"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        {/* Modal body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Amount to {transactionType}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
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
                  step="1"
                  min={1}
                  max={5000}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <Button
                onClick={() =>
                  setAmount((prev) => String(Number(prev || 0) + 5))
                }
                className="whitespace-nowrap !text-gray-900 !bg-amber-400 hover:!bg-amber-600"
              >
                {transactionType === "Deposit" ? "+" : "-"}5
              </Button>
              <Button
                onClick={() =>
                  setAmount((prev) => String(Number(prev || 0) + 10))
                }
                className="whitespace-nowrap !text-gray-900 !bg-amber-400 hover:!bg-amber-600"
              >
                {transactionType === "Deposit" ? "+" : "-"}10
              </Button>
            </div>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes
            </label>
            <textarea
              id="notes"
              rows={2}
              value={notes}
              required
              onChange={(e) => setNotes(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Add the purpose of this transaction..."
              disabled={isSubmitting}
            />
          </div>

          {/* Modal footer */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <Button
              type="submit"
              className="whitespace-nowrap !text-gray-900 !bg-amber-400 hover:!bg-amber-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="w-4 h-4 mr-2 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {transactionType}ing...
                </span>
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddStudentModal = ({ open, onClose, classroomId, onStudentAdded }) => {
  const [name, setName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleClose = () => {
    setName("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from("students")
        .insert([
          {
            name,
            classroom_id: classroomId,
          },
        ])
        .select();

      if (insertError) throw insertError;

      // Clear form and close modal on success
      setName("");

      handleClose();
      onStudentAdded(); // Refresh the student list
    } catch (err) {
      console.error("Error adding student:", err);
      setError(err.message || "Failed to add student");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        open ? "visible" : "invisible"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal container */}
      <div
        className={`relative w-full max-w-md bg-white rounded-lg shadow-xl transition-all duration-300 ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Add New Student
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none cursor-pointer"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        {/* Modal body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Johnny Bravo"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Modal footer */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="w-4 h-4 mr-2 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding...
                </span>
              ) : (
                "Add Student"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassroomDetail;
