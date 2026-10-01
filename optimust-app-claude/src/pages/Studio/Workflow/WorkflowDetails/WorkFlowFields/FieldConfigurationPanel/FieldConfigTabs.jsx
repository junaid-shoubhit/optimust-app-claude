const FieldConfigTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex border-b-[0.5px] border-(--border-inverse)  bg-white">
      <button
        className={`px-4 py-2 text-sm font-medium ${
          activeTab === "validation"
            ? "border-b border-blue-500 text-blue-600"
            : "text-gray-600"
        }`}
        onClick={() => setActiveTab("validation")}
      >
        Rules
      </button>

      <button
        className={`px-4 py-2 text-sm font-medium ${
          activeTab === "relations"
            ? "border-b border-blue-500 text-blue-600"
            : "text-gray-600"
        }`}
        onClick={() => setActiveTab("relations")}
      >
        Relations
      </button>
      <button
        className={`px-4 py-2 text-sm font-medium ${
          activeTab === "tabValidation"
            ? "border-b border-blue-500 text-blue-600"
            : "text-gray-600"
        }`}
        onClick={() => setActiveTab("tabValidation")}
      >
        Tab Rules
      </button>
    </div>
  );
};

export default FieldConfigTabs;
