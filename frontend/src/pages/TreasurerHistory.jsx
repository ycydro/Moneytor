import React, { useEffect, useState } from "react";
import Button from "../components/Button";
import dayjs from "dayjs";
import { supabase } from "../services/supabaseClient";
import { FaArrowLeft } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const TreasurerHistory = () => {
  const location = useLocation();
  const { isOwner } = location.state || {};
  const navigate = useNavigate();
  const { cid, id } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [student, setStudent] = useState({});

  const fetchTransactionsByTreasuer = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setStudent(data);
    } catch (error) {
      console.error("Error to fetch student:", error);
      alert("Failed to load student data");
    }

    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("treasurer_id", id)
        .eq("classroom_id", cid)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      alert("Failed to load transactions data");
    }
  };

  const handleRemove = async (tid) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .delete()
        .eq("treasurer_id", id)
        .eq("classroom_id", cid)
        .eq("id", tid);

      if (error) throw error;
      fetchTransactionsByTreasuer();
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("Failed to load student data");
    }
  };

  useEffect(() => {
    fetchTransactionsByTreasuer();
  }, []);

  return (
    <div className="w-full flex justify-center px-4 py-6">
      <div className="w-full max-w-md">
        <div
          onClick={() => navigate(`/classrooms/${cid}`)}
          className="mb-4 flex gap-2 items-center cursor-pointer"
        >
          <FaArrowLeft />
          <span>Back to Classroom</span>
        </div>

        <div className="w-full my-1">
          <h2 className="text-center text-lg font-semibold">
            Transaction History of {student?.name}
          </h2>
        </div>

        <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm sm:text-base min-w-[300px]">
              <thead>
                <tr className="bg-gray-50 text-gray-600">
                  <th className="py-3 px-2 sm:px-4 font-medium text-left">
                    Type
                  </th>
                  <th className="py-3 px-2 sm:px-4 font-medium text-center">
                    Amount
                  </th>
                  <th className="py-3 px-2 sm:px-4 font-medium text-center whitespace-nowrap">
                    Date
                  </th>
                  <th className="py-3 px-2 sm:px-4 font-medium text-center">
                    Notes
                  </th>
                  {isOwner && (
                    <th className="py-3 px-2 sm:px-4 font-medium text-center">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="py-3 px-2 sm:px-4 text-gray-700 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              transaction.type === "deposit"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          {transaction.type
                            .split(" ")[0]
                            .charAt(0)
                            .toUpperCase() +
                            transaction.type
                              .split(" ")[0]
                              .slice(1)
                              .toLowerCase()}
                        </div>
                      </td>
                      <td
                        className={`py-3 px-2 sm:px-4 font-medium text-center whitespace-nowrap ${
                          transaction.type === "deposit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "deposit" ? "+" : "-"}
                        {transaction.amount}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs text-gray-500 text-center whitespace-nowrap">
                        {dayjs(transaction.created_at).format("MMM DD, YYYY")}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs text-gray-500 text-center whitespace-nowrap">
                        {transaction.note}
                      </td>
                      {isOwner && (
                        <td className="py-3 px-2 sm:px-4 text-gray-500 text-center whitespace-nowrap">
                          <Button
                            onClick={() => handleRemove(transaction.id)}
                            className="bg-white p-2 rounded hover:!bg-gray-100"
                          >
                            <FaTrashAlt className="text-red-500" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreasurerHistory;
