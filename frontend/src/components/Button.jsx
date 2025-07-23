import React from "react";

const Button = ({
  color = "primary",
  type = "button",
  disabled,
  className = "",
  children,
  onClick,
}) => {
  return (
    <button
      className={`px-4 py-2 cursor-pointer ${
        color === "primary"
          ? " bg-green-800 text-white rounded hover:bg-green-900 transition-colors duration-200"
          : ``
      } ${className}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
