import { AiFillStar } from "react-icons/ai";
import { FiTrash2 } from "react-icons/fi";

const PendingFields = ({ pendingFields, setPendingFields }) => {
    const handleRemovePending = (index) => {
    setPendingFields((prev) => prev.filter((_, i) => i !== index));
  };
  if (!pendingFields?.length) return null;

  return (
    <div className="p-2 border-b bg-gray-50">
      <p className="text-xs font-semibold text-gray-500 px-2 pb-1 uppercase">
        Fields to be Added ({pendingFields.length})
      </p>

      <div className="max-h-[140px] overflow-y-auto space-y-1">
        {pendingFields.map((field, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 
            ${field.isEdit ? "border-yellow-300 border" : "border border-green-300"}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-sm truncate">{field.name}</p>

              {field.isImportant && (
                <AiFillStar className="text-yellow-400 text-xs shrink-0" />
              )}
            </div>

            <button
              onClick={() => handleRemovePending(index)}
              className="text-gray-400 hover:text-red-500"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingFields;