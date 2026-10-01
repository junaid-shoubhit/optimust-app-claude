import {
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
  createRef,
} from "react";
import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";
import { Skeleton } from "primereact/skeleton";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import { useCustomNavigation } from "./NavigationContext";
import ExtraTabMenu from "./ExtraTabMenu";
import { Building2 } from "lucide-react";
import TopBar from "./TopBar";

/* ---------------- PARAM CONFIG ---------------- */
const moduleParamConfig = {
  "/cases": ["id"],
  "/intakes": ["id"],
  "/workflow": ["id"],
  "/party": ["id"],
  "/documents": ["id", "versionId"],
};

/* ---------------- MEMO TAB ITEM ---------------- */
const TabItem = memo(function TabItem({
  item,
  isActive,
  menuRef,
  onClick,
  model,
}) {
  const handleClick = useCallback(
    (e) => {
      if (item.children?.length) {
        menuRef.current?.toggle(e);
      } else {
        onClick(item);
      }
    },
    [item, onClick, menuRef],
  );

  return (
    <div>
      <Button
        label={item.label?.toUpperCase()}
        icon={item.children?.length ? "pi pi-angle-down" : undefined}
        iconPos="right"
        className={`p-button-text border-0! px-0! py-0.5! ${
          isActive
            ? "text-(--text-secondary)! font-semibold! border-b! rounded-none! border-(--text-secondary)!"
            : "text-(--color-fontFour) border-transparent"
        }`}
        onClick={handleClick}
      />
      {item.children?.length > 0 && (
        <TieredMenu model={model} popup ref={menuRef} />
      )}
    </div>
  );
});

/* ---------------- MAIN ---------------- */
export default function TabMenus() {
  const { formManager } = useParams();
  const {
    activeModule,
    tabs,
    activeMenu,
    breadcrumb,
    isLoading,
    lastModuleUrlsRef,
  } = useCustomNavigation();

  const navigate = useNavigate();
  const location = useLocation();

  const fullUrl = location.pathname + location.search;

  const menuRefs = useRef([]);
  const modelCache = useRef(new Map());
  const navigationTimeoutRef = useRef(null);
  const hasNavigatedRef = useRef(false);
  const previousPathRef = useRef("");
  const skipNextNavigationRef = useRef(false);

  /* ---------------- RESET CACHE ---------------- */
  useEffect(() => {
    modelCache.current.clear();
  }, [tabs]);

  /* ---------------- TRACK LAST URL (SAFE) ---------------- */
  useEffect(() => {
    if (!activeModule?.id || !activeModule?.path) return;

    const modulePath = activeModule.path.replace(/\/$/, "");

    if (!location.pathname.startsWith(modulePath)) return;

    // Only track if we have a valid active menu
    if (activeMenu) {
      lastModuleUrlsRef.current[activeModule.id] = {
        path: location.pathname,
        search: location.search,
      };
    }
  }, [
    location.pathname,
    location.search,
    activeModule,
    activeMenu,
    lastModuleUrlsRef,
  ]);

  /* ---------------- FIND FIRST LEAF ---------------- */
  const findFirstLeaf = useCallback((items) => {
    const stack = [...items];
    while (stack.length) {
      const item = stack.shift();
      if (!item.children?.length && item.fullPath) return item;
      if (item.children) stack.push(...item.children);
    }
    return null;
  }, []);

  /* ---------------- SMART NAV (STABLE) ---------------- */
  useEffect(() => {
    if (!activeModule?.hasChildren) return;
    if (!tabs.length || !activeModule) return;

    const modulePath = activeModule.path.replace(/\/$/, "");
    const currentPath = location.pathname.replace(/\/$/, "");
    const isInsideModule = currentPath.startsWith(modulePath);
    const lastEntry = lastModuleUrlsRef.current[activeModule.id];

    // If we're inside the module and have an active menu, everything is fine
    if (isInsideModule && activeMenu) {
      hasNavigatedRef.current = false;
      previousPathRef.current = fullUrl;
      skipNextNavigationRef.current = false;
      return;
    }

    // If skip flag is set, allow current navigation
    if (skipNextNavigationRef.current) {
      skipNextNavigationRef.current = false;
      hasNavigatedRef.current = false;
      previousPathRef.current = fullUrl;
      return;
    }

    // Clear any pending navigation
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    // Use setTimeout to break potential loops
    navigationTimeoutRef.current = setTimeout(() => {
      // Don't navigate if already navigated for this path
      if (hasNavigatedRef.current && previousPathRef.current === fullUrl) {
        return;
      }

      let targetUrl = null;

      // PRIORITY 1: Always use last visited URL for this module
      if (lastEntry?.path?.startsWith(modulePath)) {
        const url = new URL(
          lastEntry.path + (lastEntry.search || ""),
          window.location.origin,
        );

        const allowedParams = moduleParamConfig[activeModule.path] || ["id"];
        const filtered = new URLSearchParams();

        allowedParams.forEach((key) => {
          const val = url.searchParams.get(key);
          if (val) filtered.set(key, val);
        });

        targetUrl =
          url.pathname + (filtered.toString() ? `?${filtered.toString()}` : "");
      }
      // PRIORITY 2: Navigate to first leaf if no last URL
      else {
        const firstLeaf = findFirstLeaf(tabs);
        if (firstLeaf?.fullPath) {
          targetUrl = firstLeaf.fullPath;
        }
      }

      // Only navigate if we have a target and it's different from current
      if (targetUrl && targetUrl !== fullUrl) {
        hasNavigatedRef.current = true;
        previousPathRef.current = fullUrl;
        navigate(targetUrl, { replace: true });

        // Reset after navigation completes
        setTimeout(() => {
          hasNavigatedRef.current = false;
        }, 300);
      }
    }, 50);

    // Cleanup
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [
    tabs,
    activeModule,
    location.pathname,
    location.search,
    activeMenu,
    navigate,
    findFirstLeaf,
    fullUrl,
    lastModuleUrlsRef,
  ]);

  /* ---------------- CLICK ---------------- */
  const handleTabClick = useCallback(
    (item) => {
      if (!item.fullPath || item.children?.length) return;
      // Reset navigation flag for user clicks
      hasNavigatedRef.current = false;
      navigate(item.fullPath);
    },
    [navigate],
  );

  /* ---------------- ACTIVE MAP ---------------- */
  const activeMap = useMemo(
    () => new Set(breadcrumb.map((item) => item.id)),
    [breadcrumb],
  );

  /* ---------------- MENU MODEL ---------------- */
  const buildMenuModel = useCallback(
    (items = []) =>
      items.map((item) => ({
        label: item?.label?.toUpperCase(),
        command: !item.children?.length
          ? () => handleTabClick(item)
          : undefined,
        className: activeMap.has(item.id) ? "tiered-active-item" : "",
        items: item.children ? buildMenuModel(item.children) : undefined,
      })),
    [handleTabClick, activeMap],
  );

  const menuModels = useMemo(() => {
    const map = new Map();
    tabs.forEach((item) => {
      if (item.children?.length) {
        map.set(item.id, buildMenuModel(item.children));
      }
    });
    return map;
  }, [tabs, buildMenuModel]);

  if (!activeModule?.hasChildren) {
    return (
      <div className="sub-menu flex justify-end items-center px-2 shadow min-h-12.5">
        <TopBar />
      </div>
    );
  }

  /* ---------------- UI ---------------- */
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
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} width="90px" height="18px" />
              ))
            : tabs.map((item, index) => {
                if (!menuRefs.current[index]) {
                  menuRefs.current[index] = createRef();
                }

                return (
                  <TabItem
                    key={item.id}
                    item={item}
                    isActive={activeMap.has(item.id)}
                    menuRef={menuRefs.current[index]}
                    onClick={handleTabClick}
                    model={menuModels.get(item.id)}
                  />
                );
              })}
        </div>
      </div>

      {formManager && activeMenu?.dataMenu?.length > 0 ? (
        <ExtraTabMenu
          fullPath={activeMenu?.fullPath}
          dataMenu={activeMenu.dataMenu}
        />
      ) : (
        <TopBar />
      )}
    </div>
  );
}
