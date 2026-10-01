import { useMemo, useRef, createRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";

const ExtraTabMenu = ({ fullPath, dataMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuRefs = useRef([]);

  const queryParams = new URLSearchParams(location.search);
  const entityId = queryParams.get("id");

  /* ---------------- ACTIVE CHECK ---------------- */
  const isItemActive = (item) => {
    // self active
    if (
      item.path &&
      item.path !== "#" &&
      location.pathname.includes(item.path)
    ) {
      return true;
    }

    // child active
    if (item.items?.length) {
      return item.items.some(isItemActive);
    }

    return false;
  };

  /* ---------------- NAVIGATE ---------------- */
  const handleNavigate = (item) => {
    if (!item.path || item.path === "#") return;

    navigate(
      `${fullPath}${item.path}${entityId ? `?id=${entityId}` : ""}`,
    );
  };

  /* ---------------- TEMPLATE ---------------- */
  const itemTemplate = (item, options) => {
    return (
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

        {item.items?.length > 0 && (
          <span className="pi pi-angle-right text-xs" />
        )}
      </div>
    );
  };

  /* ---------------- BUILD MENU ---------------- */
  const buildMenuModel = (items = []) => {
    return items
      .filter((item) => item.read)
      .sort((a, b) => a.orderByExpression - b.orderByExpression)
      .map((item) => ({
        label: item.label,

        icon:
          item.icon ||
          (item.items?.length
            ? "pi pi-folder-open"
            : "pi pi-folder"),

        active: isItemActive(item),

        command:
          !item.items?.length && item.path !== "#"
            ? () => handleNavigate(item)
            : undefined,

        items: item.items?.length
          ? buildMenuModel(item.items)
          : undefined,

        template: itemTemplate,
      }));
  };

  /* ---------------- TOP LEVEL ---------------- */
  const actions = useMemo(() => {
    if (!dataMenu?.length) return [];

    return dataMenu
      .filter((item) => item.read)
      .sort((a, b) => a.orderByExpression - b.orderByExpression);
  }, [dataMenu]);

  /* ---------------- MENU MODELS ---------------- */
  const menuModels = useMemo(() => {
    const map = new Map();

    actions.forEach((item) => {
      if (item.items?.length) {
        map.set(item.id, buildMenuModel(item.items));
      }
    });

    return map;
  }, [actions, location.pathname]);

  return (
    <div className="flex gap-2 items-center flex-wrap">
      {actions.map((item, index) => {
        if (!menuRefs.current[index]) {
          menuRefs.current[index] = createRef();
        }

        const hasChildren = item.items?.length > 0;

        const isActive = isItemActive(item);

        return (
          <div key={item.id}>
            {/* ---------------- TOP BUTTON ---------------- */}
            <Button
              label={item.label}
              icon={hasChildren ? "pi pi-angle-down" : item.icon}
              iconPos="right"
              text
              onClick={(e) => {
                if (hasChildren) {
                  menuRefs.current[index]?.current?.toggle(e);
                } else {
                  handleNavigate(item);
                }
              }}
              pt={{
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
              }}
            />

            {/* ---------------- TIERED MENU ---------------- */}
            {hasChildren && (
              <TieredMenu
                popup
                ref={menuRefs.current[index]}
                model={menuModels.get(item.id)}
                breakpoint="767px"
                pt={{
                  root: {
                    className:
                      "border border-(--color-borderOne)! rounded-lg! shadow-lg! overflow-hidden!",
                  },

                  menu: {
                    className: "p-1!",
                  },
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ExtraTabMenu;