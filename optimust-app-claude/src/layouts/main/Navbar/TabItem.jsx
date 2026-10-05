import { memo, useCallback } from "react";
import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";

/** A top-level tab: a link for leaves, a dropdown for tabs with children. */
const TabItem = ({ item, isActive, menuRef, onClick, model }) => {
  const hasChildren = item.children?.length > 0;

  const handleClick = useCallback(
    (e) => {
      if (hasChildren) {
        menuRef.current?.toggle(e);
      } else {
        onClick(item);
      }
    },
    [hasChildren, item, onClick, menuRef],
  );

  return (
    <div>
      <Button
        label={item.label?.toUpperCase()}
        icon={hasChildren ? "pi pi-angle-down" : undefined}
        iconPos="right"
        className={`p-button-text border-0! px-0! py-0.5! ${
          isActive
            ? "text-(--text-secondary)! font-semibold! border-b! rounded-none! border-(--text-secondary)!"
            : "text-(--color-fontFour) border-transparent"
        }`}
        onClick={handleClick}
      />

      {hasChildren && <TieredMenu model={model} popup ref={menuRef} />}
    </div>
  );
};

export default memo(TabItem);
