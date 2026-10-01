import { useEffect, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";

export const useSortableFields = (fields) => {
  const [sortableFields, setSortableFields] = useState([]);
  const [activeItem, setActiveItem] = useState(null);

  const sortFields = (data) =>
    [...data].sort(
      (a, b) => (a.orderByExpression ?? 0) - (b.orderByExpression ?? 0)
    );

  useEffect(() => {
    setSortableFields(sortFields(fields));
  }, [fields]);

  const handleDragStart = (event) => {
    const item = sortableFields.find((f) => f.id === event.active.id);
    setActiveItem(item || null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveItem(null);
      return;
    }

    const oldIndex = sortableFields.findIndex((f) => f.id === active.id);
    const newIndex = sortableFields.findIndex((f) => f.id === over.id);

    setSortableFields((prev) => arrayMove(prev, oldIndex, newIndex));
    setActiveItem(null);
  };

  const resetOrder = () => {
    setSortableFields(sortFields(fields));
  };

  return {
    sortableFields,
    activeItem,
    handleDragStart,
    handleDragEnd,
    resetOrder,
  };
};