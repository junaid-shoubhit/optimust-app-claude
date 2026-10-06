import { createRef, useCallback, useMemo, useRef } from "react";
import { Skeleton } from "primereact/skeleton";
import { useNavigate, useParams } from "react-router-dom";
import { Building2 } from "lucide-react";

import { useAppNavigation } from "../../../navigation/NavigationContext";
import ExtraTabMenu from "./ExtraTabMenu";
import TabItem from "./TabItem";
import TopBar from "./TopBar";

const TAB_SKELETON_COUNT = 5;

/** Builds PrimeReact TieredMenu items for a tab's children. */
const toMenuModel = (items, activeIds, onSelect) =>
  items.map((item) => ({
    label: item?.label?.toUpperCase(),
    command: !item.children?.length ? () => onSelect(item) : undefined,
    className: activeIds.has(item.id) ? "tiered-active-item" : "",
    items: item.children?.length
      ? toMenuModel(item.children, activeIds, onSelect)
      : undefined,
  }));

export default function TabMenus() {
  const { formManager } = useParams();
  const navigate = useNavigate();

  const { activeModule, tabs, isTabsLoading, activeMenu, breadcrumb } =
    useAppNavigation();

  const menuRefs = useRef(new Map());

  const handleTabClick = useCallback(
    (item) => {
      if (item.fullPath && !item.children?.length) navigate(item.fullPath);
    },
    [navigate],
  );

  const activeIds = useMemo(
    () => new Set(breadcrumb.map((item) => item.id)),
    [breadcrumb],
  );

  const menuModels = useMemo(
    () =>
      new Map(
        tabs
          .filter((tab) => tab.children?.length)
          .map((tab) => [
            tab.id,
            toMenuModel(tab.children, activeIds, handleTabClick),
          ]),
      ),
    [tabs, activeIds, handleTabClick],
  );

  const getMenuRef = (id) => {
    if (!menuRefs.current.has(id)) menuRefs.current.set(id, createRef());

    return menuRefs.current.get(id);
  };

  /* ------------------------- Module without tabs ------------------------ */

  if (!activeModule?.hasChildren) {
    return (
      <div className="sub-menu flex justify-end items-center px-2 shadow min-h-12.5">
        <TopBar />
      </div>
    );
  }

  /* -------------------------------- Tabs -------------------------------- */

  const showDataMenu = formManager && activeMenu?.dataMenu?.length > 0;

  return (
    <div className="sub-menu border-t-[2.86px] border-[#E05070] flex justify-between items-center px-2 shadow min-h-12.5">
      <div className="flex gap-2">
        <div className="flex items-center gap-1">
          <Building2 size={13} className="text-gray-600" />
          <p className="text-[12px] font-bold leading-0.5 tracking-wide!">
            OPTIMUST
          </p>
          <p className="text-[#00000014]"> / </p>
        </div>

        <div className="flex gap-4 items-center">
          {isTabsLoading
            ? Array.from({ length: TAB_SKELETON_COUNT }, (_, i) => (
                <Skeleton key={i} width="90px" height="18px" />
              ))
            : tabs.map((item) => (
                <TabItem
                  key={item.id}
                  item={item}
                  isActive={activeIds.has(item.id)}
                  menuRef={getMenuRef(item.id)}
                  onClick={handleTabClick}
                  model={menuModels.get(item.id)}
                />
              ))}
        </div>
      </div>

      {showDataMenu ? (
        <ExtraTabMenu
          fullPath={activeMenu.fullPath}
          dataMenu={activeMenu.dataMenu}
        />
      ) : (
        <TopBar />
      )}
    </div>
  );
}
