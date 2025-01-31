import React from "react";

const ToggleSwitch = ({ isEnabled, onToggle }) => {
  return (
    <div className="flex items-center space-x-3">
      <span className="text-white font-medium">
        {isEnabled ? "IA Activada" : "IA Desactivada"}
      </span>
      <button
        className={`relative w-12 h-6 flex items-center bg-gray-600 rounded-full p-1 transition duration-300 ${
          isEnabled ? "bg-green-500" : "bg-gray-400"
        }`}
        onClick={onToggle}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
            isEnabled ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;
