import { FiPlus } from "react-icons/fi";
import { Skeleton } from "primereact/skeleton";

const RemainingFieldsList = ({ fields, onSelect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="min-h-1/2! p-4 flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-[0.5px] border-(--border-inverse) rounded-lg px-3 py-3"
          >
            <div className="flex flex-col gap-2 w-full">
              <Skeleton width="40%" height="14px" />
              <Skeleton width="20%" height="10px" />
            </div>

            <Skeleton width="50px" height="20px" />
          </div>
        ))}
      </div>
    );
  }

  if (!fields.length) {
    return (
      <div className="min-h-10! p-2 text-sm text-gray-400 text-center">
        All Remaining fields have been added
      </div>
    );
  }

  return (
    <div className="min-h-1/2! p-4 flex flex-col gap-2">
      {fields.map((field) => (
        <div
          key={field.id}
          className="flex items-center justify-between border-[0.5px] border-(--border-inverse) rounded-lg px-3 py-2 hover:bg-gray-50 transition"
        >
          <div className="flex flex-col w-full min-w-0">
            <p className="font-semibold text-sm wrap-break-word">
              {field.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{field.type}</p>
          </div>

          <button
            onClick={() => onSelect(field)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <FiPlus size={16} />
            Add
          </button>
        </div>
      ))}
    </div>
  );
};

export default RemainingFieldsList;
