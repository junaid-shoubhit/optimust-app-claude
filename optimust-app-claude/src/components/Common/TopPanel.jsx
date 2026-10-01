import { memo, useState } from "react";
import { BiEditAlt } from "react-icons/bi";
import { MdOutlineExpandCircleDown } from "react-icons/md";

const TopPanel = ({
  // title,
  onEdit,
  isLoading,
  shouldShowToggle,
  className = "",
  width,
  heightOffset = 104,
  children,
  variant, // optional
  // onBack, // optional
  canEdit,
  renderModal,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      className={`
        relative
        flex
        flex-col
        shrink-0
        bg-(--foreground)
        shadow-md
        px-6
        py-2
        ${className}
      `}
      style={{
        width: width ? `${width}px` : "",
        ...(variant === "list"
          ? {
              height: `calc(100vh - ${heightOffset}px)`,
            }
          : {
              maxHeight: isExpanded ? "30vh" : "10vh",
              overflow: "auto",
            }),
      }}
    >
      {/* =====================================================
          HEADER ACTIONS
      ===================================================== */}

      {!isLoading && (
        <div className="absolute top-2 right-3 flex gap-1 items-center z-10">
          {/* Expand / Collapse */}

          {shouldShowToggle && (
            <MdOutlineExpandCircleDown
              onClick={() => setIsExpanded((prev) => !prev)}
              className={`
                text-md
                cursor-pointer
                transition-transform
                ${isExpanded ? "rotate-180" : ""}
              `}
            />
          )}

          {/* Edit */}

          {onEdit && canEdit && (
            <BiEditAlt
              onClick={onEdit}
              className="text-md text-(--foreground-dark) cursor-pointer"
            />
          )}
        </div>
      )}

      {/* =====================================================
          MODAL
      ===================================================== */}

      {renderModal?.()}

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="grid gap-2">
        {children?.({
          isExpanded,
        })}
      </div>
    </aside>
  );
};

export default memo(TopPanel);
