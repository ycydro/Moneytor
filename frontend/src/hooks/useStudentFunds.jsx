import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabaseClient";

const useStudentFunds = (studentId, classroomId) => {
  const [funds, setFunds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateFunds = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("transactions")
        .select("amount, type")
        .eq("student_id", studentId)
        .eq("classroom_id", classroomId);

      if (error) throw error;

      const calculatedFunds = data.reduce((total, transaction) => {
        return transaction.type === "deposit"
          ? total + transaction.amount
          : total - transaction.amount;
      }, 0);

      setFunds(calculatedFunds);
      setError(null);
    } catch (err) {
      console.error("Error calculating student funds:", err);
      setError("Failed to calculate funds");
      setFunds(0);
    } finally {
      setIsLoading(false);
    }
  }, [studentId, classroomId]);

  useEffect(() => {
    calculateFunds();
  }, [calculateFunds]);

  return { funds, isLoading, error, refresh: calculateFunds };
};

export default useStudentFunds;
