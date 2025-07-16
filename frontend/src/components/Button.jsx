import React from "react";

const Button = ({
  color = "primary",
  type = "button",
  className = "",
  children,
  onClick,
}) => {
  return (
    <button
      className={`cursor-pointer ${
        color === "primary"
          ? "px-4 py-2 bg-green-800 text-white rounded hover:bg-green-900 transition-colors duration-200"
          : ``
      } ${className}`}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
