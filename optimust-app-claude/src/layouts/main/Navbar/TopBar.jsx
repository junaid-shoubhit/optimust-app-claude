import { memo } from "react";

import { useNavigate } from "react-router-dom";

import SearchDropdown from "../../../components/SearchDropdown/SearchDropdown";
import { useCustomNavigation } from "./NavigationContext";
import { useActiveModule } from "./useActiveModule";
import { flushSync } from "react-dom";
// import { Bell } from "lucide-react";

const TopBar = () => {
  const navigate = useNavigate();

  const { setActiveModule } = useCustomNavigation();
  const { modules } = useActiveModule();
  return (
    <nav className="">
      <div className="flex gap-2 items-center">
        <SearchDropdown
          className="w-80"
          queryKey="global-case-search"
          apiPath="/Utility/GetDynamicPage"
          labelKey="4393"
          placeholder="Search Case Number"
          iconName="pi pi-search"
          responseKey="data"
          payloadBuilder={(search) => ({
            page: 1,

            pageSize: 50,

            filters: [
              {
                parameterName: "4393",

                value: search,

                value2: null,

                label: "",
              },
            ],
            sortCriteria: [],
            moduleId: 5259,

            entityCodeId: 1,
          })}
          onSelect={(item) => {
            const casesModule = modules.find((m) => m.path === "/cases");

            flushSync(() => {
              setActiveModule(casesModule);
            });

            navigate(`/cases/tabs-dynamic/pi/overview?id=${item?.id}`);
          }}
        />

        {/* <button
          className="h-7.25 w-7.25 rounded border flex items-center justify-center relative"
          style={{
            background: "rgba(255,255,255,0.7)",
            borderWidth: "1.57px",
            borderColor: "var(--border-primary)",
          }}
        >
          <Bell size={16} style={{ color: "var(--color-fontFour)" }} />

          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button> */}
      </div>
    </nav>
  );
};

export default memo(TopBar);
