// ESignTagSelector.jsx
import React from 'react';

const ESignTagSelector = ({ selectedType, onSelectType, tagTypes }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {tagTypes.map((type) => (
   <button
  key={type.value}
  onClick={() => onSelectType(type.value)}
  style={
    selectedType === type.value
      ? {
          backgroundColor: "var(--background-secondary)",
          borderColor: "var(--background-secondary)",
          color: "var(--foreground)",
        }
      : {}
  }
  className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium border transition-all
    ${
      selectedType === type.value
        ? "shadow-md"
        : "bg-white border-gray-200 hover:border-gray-300 text-gray-700 hover:shadow"
    }
  `}
>
          <span className="text-white-700">{type.icon}</span>
          <span className="text-white-900">{type.name}</span>
        </button>
      ))}
    </div>
  );
};

export default ESignTagSelector;