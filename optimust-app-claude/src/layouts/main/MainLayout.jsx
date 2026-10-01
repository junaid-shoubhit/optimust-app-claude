import { Outlet } from "react-router-dom";
import Sidebar from "./Navbar/Sidebar";
import "./layout.css";
import TabMenus from "./Navbar/TabMenus";
import { Suspense } from "react";
import NavigationProvider from "./Navbar/NavigationProvider";
import { useCustomNavigation } from "./Navbar/NavigationContext";
import { ConfirmPopup } from "primereact/confirmpopup";
import { ConfirmDialog } from "primereact/confirmdialog";

const WorkspaceLoader = () => (
  <div className="flex items-center justify-center h-full">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-(--border-inverse) border-t-(--background) rounded-full animate-spin" />
      <p className="text-xs text-(--text-secondary)">Loading workspace...</p>
    </div>
  </div>
);

const LayoutBody = () => {
  const { navReady } = useCustomNavigation();

  return (
    <div className="flex flex-col h-[calc(100vh)] overflow-hidden">
      <ConfirmPopup />
      <ConfirmDialog />

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="nav-sidebar">
          <Sidebar />
        </aside>

        {/* RIGHT CONTENT */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* TOP TAB MENU */}
          <TabMenus />

          {/* PAGE CONTENT */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {!navReady ? (
              <WorkspaceLoader />
            ) : (
              <Suspense fallback={<WorkspaceLoader />}>
                <Outlet />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MainLayout = () => {
  return (
    <div className="grid h-screen">
      <NavigationProvider>
        <LayoutBody />
      </NavigationProvider>
    </div>
  );
};

export default MainLayout;
