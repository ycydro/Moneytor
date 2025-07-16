import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import Card from "../components/Card";
import Button from "../components/Button";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { HiUserGroup } from "react-icons/hi";
import { RxAvatar } from "react-icons/rx";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { BiMoneyWithdraw } from "react-icons/bi";

const students = [
  { id: 1, name: "John Doe", funds: 2500 },
  { id: 2, name: "Jane Smith", funds: 3000 },
];

const ClassroomDetail = () => {
  const { id } = useParams();

  return (
    <div className="p-4 flex flex-col items-center justify-start min-h-screen gap-5">
      <h1 className="text-1xl font-bold text-gray-800">CLASSROOM {id}</h1>
      <Card className="w-full max-w-md flex flex-col items-center justify-center gap-5">
        <div className="flex items-center justify-center text-center gap-2">
          <h3 className="text-2xl font-semibold text-gray-700">Total Funds</h3>
          <RiMoneyDollarCircleFill className="text-3xl text-green-600" />
        </div>
        <span className="text-gray-800 text-5xl text-center font-medium">
          ₱5000
        </span>
        <Button
          color=""
          className="w-full px-4 py-2 text-gray900 bg-amber-400 rounded-4xl"
        >
          <span className="flex items-center justify-center gap-2">
            <BiMoneyWithdraw className="text-xl" />
            Withdraw Funds
          </span>
        </Button>
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
        />
        <Button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700">
          <HiMagnifyingGlass className="text-xl" />
        </Button>
      </form>
      <div className="mt-3 w-full max-w-md">
        <StudentList />
      </div>
    </div>
  );
};

const StudentList = () => {
  return (
    <div className="w-full max-w-md">
      {students.length > 0 ? (
        <ul className="space-y-3">
          {students.map((student) => (
            <li key={student.id}>
              <StudentCard student={student} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-500">No students available.</div>
      )}
    </div>
  );
};

const StudentCard = ({ student }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("deposit");

  return (
    <div className="w-full border-2 border-emerald-700 rounded-lg shadow-md overflow-hidden">
      <div
        className="py-4 px-6 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <RxAvatar className="text-2xl" />
          <span className="text-xl font-semibold">{student.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-500 text-md">₱{student.funds}</span>
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
          <div className="space-y-4">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₱</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  className="block w-full pl-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0.00"
                  step="1"
                  min="0"
                />
              </div>
            </div>

            {/* Transaction Type */}
            <div>
              <label
                htmlFor="transaction-type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Transaction Type
              </label>
              <select
                id="transaction-type"
                className="appearance-none block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
              >
                <option value="deposit">Deposit</option>
                <option value="withdraw">Withdraw</option>
              </select>
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
                className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Add any notes about this transaction..."
              />
            </div>

            {/* Submit Button */}
            <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors">
              <span className="flex items-center justify-center gap-2">
                <RiMoneyDollarCircleFill className="text-xl" />
                Update Funds
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomDetail;
