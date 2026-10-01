import { GoHome } from "react-icons/go";
import { PiPhoneList } from "react-icons/pi";
import { LuNotepadText } from "react-icons/lu";
import { FiMessageSquare } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: GoHome },
  { key: "calllogs", label: "Call Logs", icon: PiPhoneList },
  { key: "auditlogs", label: "Audit Logs", icon: LuNotepadText },
  { key: "chats", label: "SMS", icon: FiMessageSquare },
];

const PITabs = ({ caseType, formManager }) => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const handleTabChange = (key) => {
    navigate(`/cases/${caseType}/${key}?${searchParams.toString()}`);
  };

  return (
    <div className="flex gap-3 justify-center">
      {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
        const isActive = formManager === key;

        return (
          <div
            key={key}
            onClick={() => handleTabChange(key)}
            className={` group flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors duration-200`}
          >
            <Icon
              className={` text-2xl transition-colors duration-200 ${
                isActive
                  ? "text-(--color-fontFive)"
                  : "text-(--color-fontSix) group-hover:text-(--color-fontFive)"
              }`}
            />
            <p
              className={`text-xs font-bold uppercase text-center transition-colors duration-200 ${
                isActive
                  ? "text-(--color-fontFive)"
                  : "text-(--color-fontSix) group-hover:text-(--color-fontFive)"
              }`}
            >
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default PITabs;
