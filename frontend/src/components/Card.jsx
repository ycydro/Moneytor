import React from "react";
import { LiaMoneyBillWaveAltSolid } from "react-icons/lia";

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`w-full max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow-md ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
