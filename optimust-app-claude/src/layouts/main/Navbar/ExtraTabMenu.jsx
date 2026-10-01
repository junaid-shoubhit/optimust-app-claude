import { createRef, useCallback, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

const isNavigable = (item) => Boolean(item.path) && item.path !== "#";

/** Readable items in display order. */
const visibleItems = (items = []) =>
  items
    .filter((item) => item.read)
    .sort((a, b) => a.orderByExpression - b.orderByExpression);

/** An item is active when its path is in the URL, or any child's is. */
const isItemActive = (item, pathname) => {
  if (isNavigable(item) && pathname.includes(item.path)) return true;

  return item.items?.length
    ? item.items.some((child) => isItemActive(child, pathname))
    : false;
};

const MenuItemTemplate = (item, options) => (
  <div
    onClick={options.onClick}
    className={`
      flex items-center justify-between
      px-3 py-2 rounded-md cursor-pointer
      transition-all duration-150

      ${
        item.active
          ? `
            bg-sky-100
            text-sky-700
            font-semibold
          `
          : `
            text-(--color-fontFour)
            hover:bg-(--color-bgTwo)
          `
      }
    `}
  >
    <div className="flex items-center gap-2">
      {item.icon && <span className={item.icon} />}
      <span>{item.label}</span>
    </div>

    {item.items?.length > 0 && <span className="pi pi-angle-right text-xs" />}
  </div>
);

const BUTTON_PT = (isActive) => ({
  root: {
    className: `
      uppercase!
      px-2!
      py-1!
      border-none!
      shadow-none!
      rounded-md!
      transition-all
      duration-200

      ${
        isActive
          ? `
            bg-(--color-fontFive)!
            text-(--color-bgThree)!
            font-semibold!
          `
          : `
            text-(--color-fontFour)!
            hover:bg-(--color-bgTwo)!
          `
      }
    `,
  },

  label: {
    className: "text-inherit!",
  },

  icon: {
    className: "text-inherit!",
  },
});

const TIERED_MENU_PT = {
  root: {
    className:
      "border border-(--color-borderOne)! rounded-lg! shadow-lg! overflow-hidden!",
  },

  menu: {
    className: "p-1!",
  },
};

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

/** Record-level actions ("Right Tab Menu") shown on detail pages. */
const ExtraTabMenu = ({ fullPath, dataMenu }) => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const menuRefs = useRef([]);

  const entityId = useMemo(
    () => new URLSearchParams(search).get("id"),
    [search],
  );

  const handleNavigate = useCallback(
    (item) => {
      if (!isNavigable(item)) return;

      navigate(`${fullPath}${item.path}${entityId ? `?id=${entityId}` : ""}`);
    },
    [navigate, fullPath, entityId],
  );

  const actions = useMemo(() => visibleItems(dataMenu), [dataMenu]);

  const menuModels = useMemo(() => {
    const toModel = (items) =>
      visibleItems(items).map((item) => ({
        label: item.label,

        icon:
          item.icon ||
          (item.items?.length ? "pi pi-folder-open" : "pi pi-folder"),

        active: isItemActive(item, pathname),

        command:
          !item.items?.length && item.path !== "#"
            ? () => handleNavigate(item)
            : undefined,

        items: item.items?.length ? toModel(item.items) : undefined,

        template: MenuItemTemplate,
      }));

    return new Map(
      actions
        .filter((item) => item.items?.length)
        .map((item) => [item.id, toModel(item.items)]),
    );
  }, [actions, pathname, handleNavigate]);

  const getMenuRef = (index) => {
    menuRefs.current[index] ??= createRef();

    return menuRefs.current[index];
  };

  return (
    <div className="flex gap-2 items-center flex-wrap">
      {actions.map((item, index) => {
        const hasChildren = item.items?.length > 0;
        const menuRef = getMenuRef(index);

        return (
          <div key={item.id}>
            <Button
              label={item.label}
              icon={hasChildren ? "pi pi-angle-down" : item.icon}
              iconPos="right"
              text
              onClick={(e) => {
                if (hasChildren) {
                  menuRef.current?.toggle(e);
                } else {
                  handleNavigate(item);
                }
              }}
              pt={BUTTON_PT(isItemActive(item, pathname))}
            />

            {hasChildren && (
              <TieredMenu
                popup
                ref={menuRef}
                model={menuModels.get(item.id)}
                breakpoint="767px"
                pt={TIERED_MENU_PT}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ExtraTabMenu;
