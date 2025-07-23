import React, { useEffect } from "react";

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  closeButton = true,
  backdropClose = true,
  width = "md",
  height = "auto",
  padding = "p-6",
  borderRadius = "rounded-lg",
  backgroundColor = "bg-white",
  overlayColor = "bg-black/50",
  animation = "fade",
  customClasses = "",
}) => {
  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Width classes
  const widthClasses = {
    sm: "w-full max-w-sm",
    md: "w-full max-w-md",
    lg: "w-full max-w-lg",
    xl: "w-full max-w-xl",
    "2xl": "w-full max-w-2xl",
    full: "w-full mx-4",
  };

  // Height classes
  const heightClasses = {
    auto: "h-auto",
    sm: "h-64",
    md: "h-96",
    lg: "h-[32rem]",
    full: "h-[90vh]",
  };

  // Animation classes
  const animationClasses = {
    fade: "opacity-0 animate-fadeIn",
    slideUp: "translate-y-10 animate-slideUp",
    slideDown: "-translate-y-10 animate-slideDown",
    none: "",
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${overlayColor} ${animationClasses[animation]}`}
      onClick={() => backdropClose && onClose()}
    >
      <div
        className={`relative ${widthClasses[width]} ${heightClasses[height]} ${padding} ${borderRadius} ${backgroundColor} shadow-xl ${customClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        {(title || closeButton) && (
          <div className="flex items-center justify-between mb-4">
            {title && (
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            )}
            {closeButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Modal content */}
        <div className="overflow-y-auto h-[calc(100%-3rem)]">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
