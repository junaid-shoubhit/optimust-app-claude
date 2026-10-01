import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import SidebarProfile from "./SidebarProfile";
import { useActiveModule } from "./useActiveModule";
import { apiRequest } from "../../../services/apiBinding";
import {
  getDefaultIcon,
  getDynamicIcon,
} from "../../../utils/constants/iconResolver";

const Sidebar = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    sidebarMenus,
    profileMenu,
    isLoading,
    activeModule,
    setActiveModule,
  } = useActiveModule();

  const [loadingModuleId, setLoadingModuleId] = useState(null);
  const lastPrefetchRef = useRef(0);

  /* -----------------------------
   * Prefetch Tabs
   * ----------------------------- */
  const prefetchTabs = (module) =>
    queryClient.prefetchQuery({
      queryKey: ["tabs", module.id],
      queryFn: () =>
        apiRequest({
          apiPath: `/Module/userChild/${module.id}`,
          method: "get",
        }),
      staleTime: Infinity,
      gcTime: 30 * 60 * 1000,
    });

  /* -----------------------------
   * Hover Prefetch
   * ----------------------------- */
  const handleHover = useCallback(
    (module, index) => {
      const now = Date.now();

      if (now - lastPrefetchRef.current < 120) return;

      lastPrefetchRef.current = now;

      const preload = (item) => {
        if (!item) return;

        if (!queryClient.getQueryData(["tabs", item.id])) {
          prefetchTabs(item);
        }
      };

      preload(module);
      preload(sidebarMenus[index - 1]);
      preload(sidebarMenus[index + 1]);
    },
    [queryClient, sidebarMenus],
  );

  /* -----------------------------
   * Navigation
   * ----------------------------- */
  const handleClick = useCallback(
    async (module) => {
      if (!module.hasChildren && module.path) {
        setActiveModule(module);
        navigate(module.path);
        return;
      }

      if (!queryClient.getQueryData(["tabs", module.id])) {
        setLoadingModuleId(module.id);

        try {
          await prefetchTabs(module);
        } finally {
          setLoadingModuleId(null);
        }
      }

      setActiveModule(module);
    },
    [navigate, queryClient, setActiveModule],
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
          ? Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-(--skeleton-bg) animate-pulse" />
                <div className="mt-1 h-2.5 w-14 rounded bg-(--skeleton-bg) animate-pulse" />
              </div>
            ))
          : sidebarMenus.map((module, index) => {
              const isActive = activeModule?.id === module.id;
              const isLoadingThis = loadingModuleId === module.id;

              return (
                <div
                  key={module.id}
                  onMouseEnter={() => handleHover(module, index)}
                  onClick={() => handleClick(module)}
                  className={`flex cursor-pointer flex-col items-center rounded-xl px-1 py-1 transition 
                  ${isActive ? "bg-(--background-box) text-white  " : "text-[#E05070] "}`}
                >
                  <div className="relative flex h-8 w-8 items-center justify-center">
                    {isLoadingThis && (
                      <span className="absolute inset-0 animate-spin rounded-full border-2 border-(--color-fontFive) border-t-transparent" />
                    )}

                    <div className="z-10">
                      {getDynamicIcon(module.icon) ||
                        getDefaultIcon(module.label)}
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
            })}
      </div>

      {/* Profile Section */}
      <SidebarProfile
        navigate={navigate}
        profileMenus={profileMenu}
        onProfileClick={handleClick}
      />
    </div>
  );
};

export default Sidebar;
