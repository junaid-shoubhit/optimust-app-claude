import { useState, useRef, useEffect } from "react";
import { PATH } from "../../../utils/pagePath";
import { useFirmSwitch } from "../../../pages/Login/useFirmSwitch";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

const SidebarProfile = ({ navigate, profileMenus, onProfileClick }) => {
  const queryClient = useQueryClient();
  const firms = JSON.parse(localStorage.getItem("auth-firms") || "[]");
  const activeFirm = JSON.parse(localStorage.getItem("selected-firm") || "{}");
  const userName = localStorage.getItem("userName") || "";

  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(activeFirm?.value || null);

  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firmMutation = useFirmSwitch({
    onSuccess: async () => {
      toast.success("Firm selected successfully!");
      navigate("/", { replace: true });
      await queryClient.invalidateQueries();
    },

    onError: () => {
      setSelectedTeam(activeFirm?.value);
    },
  });

  const handleEnter = (menu) => {
    clearTimeout(timeoutRef.current);
    setActiveMenu(menu);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 120);
  };

  const handleTeamSwitch = (firm) => {
    if (firmMutation.isPending || firm.value === activeFirm?.value) {
      return;
    }

    setSelectedTeam(firm.value);

    setActiveMenu(null);
    setTimeout(() => setOpen(false), 120);

    firmMutation.mutate({
      firm,
      userName,
    });
  };

  return (
    <div className="relative flex flex-col items-center" ref={containerRef}>
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer group"
      >
        {/* className="" */}
        <div
          className="w-11 h-11 flex items-center justify-center rounded-full
          logoGradient shadow-[0_4px_12px_rgba(0,0,0,0.08)]
          group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)]
          group-hover:scale-105 transition-all duration-200"
        >
          <span className="text-sm text-white font-semibold">
            {activeFirm?.label?.slice(0, 2)}
          </span>
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-full ml-1 w-72
        bg-white/95 backdrop-blur-xl
        rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.18)]
        border border-gray-100/60
        transform transition-all duration-200 origin-left
        ${
          open
            ? "opacity-100 scale-100 translate-x-0"
            : "opacity-0 scale-95 -translate-x-1 pointer-events-none"
        }
        `}
      >
        <div className="p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <i className="pi pi-user text-gray-600"></i>
          </div>

          <div className="flex-1">
            <p className="font-semibold text-sm">{userName}</p>
          </div>
        </div>

        <div className="h-px bg-gray-100 mx-3" />

        <div
          className="relative px-2 py-2"
          onMouseEnter={() => handleEnter("teams")}
          onMouseLeave={handleLeave}
        >
          <div
            className="flex items-center justify-between px-3 py-2.5 rounded-xl
            hover:bg-gray-50 cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                <i className="pi pi-briefcase text-xs text-gray-600"></i>
              </div>

              <div>
                <p className="text-sm font-medium">Firms</p>
                <p className="text-[10px] text-gray-400">{activeFirm?.label}</p>
              </div>
            </div>

            <i className="pi pi-angle-right text-xs text-gray-400"></i>
          </div>

          <div
            onMouseEnter={() => handleEnter("teams")}
            onMouseLeave={handleLeave}
            className={`absolute bottom-0 left-full ml-0.5 w-60 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)]
            border border-gray-100
            transform transition-all duration-200 origin-left
            ${
              activeMenu === "teams"
                ? "opacity-100 translate-x-0 scale-100"
                : "opacity-0 translate-x-2 scale-95 pointer-events-none"
            }`}
          >
            <div className="px-3 pt-2 pb-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                Switch Firm
              </p>
            </div>

            <div className="h-px bg-gray-100 mx-2" />

            <div className="max-h-72 overflow-y-auto p-2">
              {firms.map((firm) => {
                const isActive = selectedTeam === firm.value;

                return (
                  <div
                    key={firm.value}
                    onClick={() => handleTeamSwitch(firm)}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition
                    ${isActive ? "bg-(--background-table-active)" : "hover:bg-gray-50"}
                    ${firmMutation.isPending ? "pointer-events-none" : ""}`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1 bottom-1 w-1 rounded-r bg-(--background-secondary)" />
                    )}

                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-semibold">
                      {firm.label.slice(0, 2)}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-medium">{firm.label}</p>

                      {firmMutation.isPending &&
                        selectedTeam === firm.value && (
                          <p className="text-[10px] text-(--background-secondary)">
                            Switching...
                          </p>
                        )}
                    </div>

                    {isActive && !firmMutation.isPending && (
                      <i className="pi pi-check text-xs text-(--background-secondary)"></i>
                    )}

                    {firmMutation.isPending && selectedTeam === firm.value && (
                      <i className="pi pi-spin pi-spinner text-xs text-(--background-secondary)"></i>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 mx-3 my-2" />

        <div className="p-2">
          {profileMenus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => {
                onProfileClick(menu);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm"
            >
              <i className="pi pi-user"></i>
              {menu.label}
            </button>
          ))}
          {/* <button
            onClick={() => navigate("/profile")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm"
          >
            <i className="pi pi-user"></i>
            Profile
          </button>

          <button
            onClick={() => navigate("/settings")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm"
          >
            <i className="pi pi-cog"></i>
            Settings
          </button> */}

          <div className="h-px bg-gray-100 my-2" />

          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("SSID");
              localStorage.removeItem("email");

              setTimeout(() => {
                navigate(PATH.LOGIN);
              }, 500);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            hover:bg-red-50 text-red-500 text-sm"
          >
            <i className="pi pi-sign-out"></i>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidebarProfile;
