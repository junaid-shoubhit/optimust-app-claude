import { memo, useCallback, useMemo } from "react";

import TabCard from "./TabCard";
import ExpandedTabCard from "./ExpandedTabModal/ExpandedTabCard";
import { useTabExpansion } from "./ExpandedTabModal/useTabExpansion";

import {
  getCardBasis,
  orderFieldsByMetadata,
  sortFieldsNameList,
} from "./tabRow.utils";

const EMPTY_ARRAY = [];

const TabRow = ({
  tab,
  isExpanded,
  toggleTab,
  openModal,
  tabRef,
  bgColor,
  canEdit,
}) => {
  const fields = tab?.fields ?? EMPTY_ARRAY;
  const fieldsNameList = tab?.fieldsNameList ?? EMPTY_ARRAY;

  /**
   * Metadata sorted once per metadata change.
   */
  const sortedFieldsNameList = useMemo(
    () => sortFieldsNameList(fieldsNameList),
    [fieldsNameList],
  );

  /**
   * Important columns for collapsed view.
   */
  const displayColumns = useMemo(
    () => sortedFieldsNameList.filter((column) => column?.isImportant),
    [sortedFieldsNameList],
  );

  /**
   * Important fields ordered according to metadata.
   */
  const displayFields = useMemo(
    () => orderFieldsByMetadata(fields, displayColumns),
    [fields, displayColumns],
  );

  /**
   * All fields ordered for expanded view.
   */
  const sortedAllFields = useMemo(
    () => orderFieldsByMetadata(fields, sortedFieldsNameList),
    [fields, sortedFieldsNameList],
  );

  const cardBasis = useMemo(() => getCardBasis(tab), [tab]);

  const {
    cardRef,
    closing,
    showPortal,
    transform,
    width,
    height,
    handleExpand,
    handleClose,
  } = useTabExpansion({
    tab,
    isExpanded,
    toggleTab,
    fieldCount: sortedAllFields.length,
  });

  const handleEdit = useCallback(() => {
    openModal(tab);
  }, [openModal, tab]);

  return (
    <>
      <TabCard
        tab={tab}
        cardBasis={cardBasis}
        bgColor={bgColor}
        canEdit={canEdit}
        isExpanded={isExpanded}
        columns={displayColumns}
        fields={displayFields}
        cardRef={cardRef}
        tabRef={tabRef}
        onExpand={handleExpand}
        onEdit={handleEdit}
      />

      <ExpandedTabCard
        tab={tab}
        show={showPortal}
        transform={transform}
        width={width}
        height={height}
        closing={closing}
        canEdit={canEdit}
        columns={sortedFieldsNameList}
        fields={sortedAllFields}
        onClose={handleClose}
        onEdit={handleEdit}
      />
    </>
  );
};

export default memo(TabRow);
