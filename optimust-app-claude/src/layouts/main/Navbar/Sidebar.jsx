import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import SidebarProfile from "./SidebarProfile";
import { useActiveModule } from "./useActiveModule";
import { useTabsPrefetch } from "./navigation/useTabsPrefetch";
import {
  getDefaultIcon,
  getDynamicIcon,
} from "../../../utils/constants/iconResolver";

const MODULE_SKELETON_COUNT = 16;

const ModuleSkeleton = () => (
  <div className="flex flex-col items-center">
    <div className="h-8 w-8 rounded-full bg-(--skeleton-bg) animate-pulse" />
    <div className="mt-1 h-2.5 w-14 rounded bg-(--skeleton-bg) animate-pulse" />
  </div>
);

const SidebarItem = ({ module, isActive, isLoading, onHover, onClick }) => (
  <div
    onMouseEnter={onHover}
    onClick={onClick}
    className={`flex cursor-pointer flex-col items-center rounded-xl px-1 py-1 transition 
    ${isActive ? "bg-(--background-box) text-white  " : "text-[#E05070] "}`}
  >
    <div className="relative flex h-8 w-8 items-center justify-center">
      {isLoading && (
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-(--color-fontFive) border-t-transparent" />
      )}

      <div className="z-10">
        {getDynamicIcon(module.icon) || getDefaultIcon(module.label)}
      </div>
    </div>

    <p
      className={`text-center text-[#8B97B1] text-[10px] uppercase ${
        isActive ? "font-bold text-white" : ""
      }`}
    >
      {module.label}
    </p>
  </div>
);

const Sidebar = () => {
  const navigate = useNavigate();

  const {
    sidebarMenus,
    profileMenu,
    isLoading,
    activeModule,
    setActiveModule,
  } = useActiveModule();

  const { isTabsCached, prefetchTabs, prefetchOnHover } =
    useTabsPrefetch(sidebarMenus);

  const [loadingModuleId, setLoadingModuleId] = useState(null);

  /**
   * Leaf modules navigate straight to their page. Modules with tabs only
   * become active once their tabs are loaded; TabMenus then routes to the
   * module's last visited page or first tab.
   */
  const handleModuleClick = useCallback(
    async (module) => {
      if (!module.hasChildren && module.path) {
        setActiveModule(module);
        navigate(module.path);
        return;
      }

      if (!isTabsCached(module)) {
        setLoadingModuleId(module.id);

        try {
          await prefetchTabs(module);
        } finally {
          setLoadingModuleId(null);
        }
      }

      setActiveModule(module);
    },
    [navigate, setActiveModule, isTabsCached, prefetchTabs],
  );

  return (
    <div className="grid h-[calc(100vh-1rem)] gap-1 content-start custom-scroll">
      {/* Logo */}
      <div className="grid justify-items-center">
        <div className="grid h-10 w-10 place-items-center rounded-lg logoGradient">
          <p className="font-extrabold text-(--foreground)">OP</p>
        </div>
      </div>

      {/* Menus */}
      <div className="h-[calc(100vh-7rem)] custom-scroll overflow-auto flex flex-col items-center  gap-1">
        {isLoading
          ? Array.from({ length: MODULE_SKELETON_COUNT }, (_, i) => (
              <ModuleSkeleton key={i} />
            ))
          : sidebarMenus.map((module, index) => (
              <SidebarItem
                key={module.id}
                module={module}
                isActive={activeModule?.id === module.id}
                isLoading={loadingModuleId === module.id}
                onHover={() => prefetchOnHover(index)}
                onClick={() => handleModuleClick(module)}
              />
            ))}
      </div>

      {/* Profile Section */}
      <SidebarProfile
        navigate={navigate}
        profileMenus={profileMenu}
        onProfileClick={handleModuleClick}
      />
    </div>
  );
};

export default Sidebar;
