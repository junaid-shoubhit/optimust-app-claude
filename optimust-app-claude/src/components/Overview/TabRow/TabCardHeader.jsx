import { memo } from "react";
import { BiEditAlt } from "react-icons/bi";
import { MdOutlineExpandCircleDown } from "react-icons/md";

const TabCardHeader = ({
  title,
  expanded = false,
  canEdit = false,
  onExpand,
  onEdit,
}) => {
  return (
    <div
      className="
        bg-[#F4F5FA]
        flex
        justify-between
        items-center
        px-2
        py-2
        shrink-0
      "
    >
      <div className="flex gap-1 items-center min-w-0">
        <span
          className="
            h-3
            border-2
            border-[#D4183D]
            rounded-xs
            shrink-0
          "
        />

        <p
          className="
            tracking-wider
            text-xs
            uppercase
            font-bold
            text-(--foreground-dark)
            truncate
          "
        >
          {title}
        </p>
      </div>

      <div className="flex gap-2 shrink-0">
        <MdOutlineExpandCircleDown
          onClick={onExpand}
          className={`
            text-[16px]
            cursor-pointer
            transition-transform
            duration-300
            ${expanded ? "rotate-180" : ""}
          `}
        />

        {canEdit && (
          <BiEditAlt onClick={onEdit} className="text-[16px] cursor-pointer" />
        )}
      </div>
    </div>
  );
};

export default memo(TabCardHeader);
