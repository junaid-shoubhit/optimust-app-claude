// src/components/Buttons/EditButton.jsx
import CustomButton from "./CustomButton";

const EditButton = ({ rowData, onEdit }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    onEdit?.(rowData);
    
  };

  return (
    <CustomButton
      onClick={handleClick}
      text
      icon="pi pi-pencil text-xs! p-1 rounded bg-(--background-hover)"
      className="!text-blue-600 hover:text-blue-700 !p-0 !w-fit !rounded-none"
      aria-label="Edit"
    />
  );
};

export default EditButton;