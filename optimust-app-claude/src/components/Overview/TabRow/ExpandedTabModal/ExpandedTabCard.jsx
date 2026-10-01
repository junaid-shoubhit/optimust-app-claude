import { memo } from "react";

import TabCardHeader from "../TabCardHeader";
import TabContent from "../TabContent";
import ExpandedCardPortal from "./ExpandedTabModal";

const ExpandedTabCard = ({
  tab,
  show,
  transform,
  width,
  height,
  closing,
  canEdit,
  columns,
  fields,
  onClose,
  onEdit,
}) => {
  if (!show) {
    return null;
  }

  return (
    <ExpandedCardPortal
      transform={transform}
      width={width}
      height={height}
      fadeOut={closing}
      onClose={onClose}
    >
      <div
        className="
          h-full
          flex
          flex-col
          border-[0.5px]
          border-(--border-inverse)
          rounded-lg
          bg-(--foreground)
          shadow-2xl
          overflow-hidden
        "
      >
        <TabCardHeader
          title={tab?.tabName}
          expanded
          canEdit={canEdit}
          onExpand={onClose}
          onEdit={onEdit}
        />

        <div className="flex-1 overflow-auto min-h-0">
          <TabContent
            tabTypeId={tab?.tabTypeId}
            columns={columns}
            fields={fields}
          />
        </div>
      </div>
    </ExpandedCardPortal>
  );
};

export default memo(ExpandedTabCard);
