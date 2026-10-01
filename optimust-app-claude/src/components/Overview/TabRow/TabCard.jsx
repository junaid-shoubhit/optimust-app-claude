import { memo, useCallback } from "react";

import TabCardHeader from "./TabCardHeader";
import TabContent from "./TabContent";
import { MIN_BASIS } from "./tabRow.constants";

const TabCard = ({
  tab,
  cardBasis,
  bgColor,
  canEdit,
  isExpanded,
  columns,
  fields,
  cardRef,
  tabRef,
  onExpand,
  onEdit,
}) => {
  const setRefs = useCallback(
    (element) => {
      cardRef.current = element;

      if (typeof tabRef === "function") {
        tabRef(element);
      }
    },
    [cardRef, tabRef],
  );

  return (
    <div
      ref={setRefs}
      style={{
        flexBasis: `${cardBasis}px`,
        minWidth: `${MIN_BASIS}px`,
        maxWidth: "100%",
      }}
     onDoubleClick={canEdit ? onEdit : onExpand}
      className={`
        flex-1
        border-[0.5px]
        border-(--border-inverse)
        rounded-lg
        shadow-md
        bg-(--foreground)
        relative
        flex
        flex-col
        min-w-0
        overflow-hidden
        contain-content
        ${isExpanded ? "opacity-0 pointer-events-none" : ""}
      `}
    >
      <TabCardHeader
        title={tab?.tabName}
        canEdit={canEdit}
        onExpand={onExpand}
        onEdit={onEdit}
      />

      <div
        className="
          rounded-b-lg
          bg-(--foreground)
          max-h-40
          overflow-auto
          min-h-40
          w-full
          h-full
          min-w-0
        "
        style={{
          backgroundColor: bgColor,
        }}
      >
        <TabContent
          tabTypeId={tab?.tabTypeId}
          columns={columns}
          fields={fields}
        />
      </div>
    </div>
  );
};

export default memo(TabCard);
