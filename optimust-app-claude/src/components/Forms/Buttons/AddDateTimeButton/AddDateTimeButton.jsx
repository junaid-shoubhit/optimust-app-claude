import { Calendar } from "lucide-react";
// or any icon library you're using

const AddDateTimeButton = ({ fieldName, formMethods }) => {
  const { getValues, setValue } = formMethods;
  const userName = localStorage.getItem("userName") || "";

  const initials = userName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("");

  const handleAddDateTime = () => {
    const currentValue = getValues(fieldName) || "";

    const now = new Date();

    const formatted = now.toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const textToInsert =
      `${formatted}${initials ? ` (${initials})` : ""}: `.toUpperCase();

    const newValue = currentValue
      ? `${textToInsert}\n${currentValue}`
      : textToInsert;

    setValue(fieldName, newValue, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <button
      type="button"
      onClick={handleAddDateTime}
      className="absolute -top-1.5 right-0  mr-0.5 rounded p-1 text-gray-600 transition-colors hover:text-gray-800"
      title="Insert Date & Time"
    >
      <Calendar size={16} />
    </button>
  );
};

export default AddDateTimeButton;
