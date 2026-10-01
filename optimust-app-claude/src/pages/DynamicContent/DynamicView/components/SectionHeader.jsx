import { useNavigate } from "react-router-dom";

import CustomButton from "../../../../components/Forms/Buttons/CustomButton";
import ProgressStatus from "./ProgressStatus";

const SectionHeader = ({
  title,
  onBack,
  actions = [],
  buttonMenus = [],
  fullPath = "",
  entityId,
  entityCodeId,
  isCaseOverview,
}) => {
  const navigate = useNavigate();

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const handleNavigate = (item) => {
    if (!item.path || item.path === "#") {
      return;
    }

    navigate(`${fullPath}${item.path}${entityId ? `?id=${entityId}` : ""}`);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="shrink-0 flex gap-4 justify-between items-center px-4 pb-1 min-w-0 w-full">
      {/* =================================================
          LEFT SIDE
      ================================================= */}

      <div className="flex gap-2 items-center min-w-0 flex-1 overflow-hidden">
        {/* Back + Title */}

        <div className="flex gap-1 items-center shrink-0">
          {onBack && (
            <CustomButton
              text
              icon="pi pi-arrow-left text-sm! text-(--background-secondary)!"
              className="p-0! w-fit!"
              onClick={onBack}
            />
          )}

          <h2 className="text-[15px] font-semibold truncate max-w-[200px]">
            {title}
          </h2>
        </div>

        {/* Case Progress */}

        {isCaseOverview && (
          <div className="min-w-0 flex-1 overflow-hidden">
            <ProgressStatus
              payload={{
                entityId,
                entityCodeId,
              }}
            />
          </div>
        )}
      </div>

      {/* =================================================
          RIGHT SIDE
      ================================================= */}

      <div className="flex gap-2 items-center flex-wrap justify-end shrink-0">
        {/* ===============================================
            EXISTING ACTIONS
        =============================================== */}

        {actions.map((action, index) => {
          /* ================= COMPONENT ================= */

          if (action.type === "component" && action.Component) {
            const Component = action.Component;

            return (
              <Component
                key={action.key || index}
                {...action.props}
                entityId={entityId}
              />
            );
          }

          /* ================= BUTTON ================= */

          return (
            <CustomButton
              key={action.key || index}
              label={action.label}
              icon={action.icon}
              iconPos="left"
              className="p-button-sm primary"
              onClick={action.onClick}
              {...(action.props || {})}
            />
          );
        })}

        {/* ===============================================
            BUTTON MENUS
        =============================================== */}

        {buttonMenus
          ?.filter((item) => item.read)
          ?.sort(
            (a, b) =>
              (a.orderByExpression ?? 9999) - (b.orderByExpression ?? 9999),
          )
          ?.map((item) => (
            <CustomButton
              key={item.id}
              label={item.label}
              icon={item.icon}
              iconPos="left"
              className="p-button-sm primary transition-all duration-200"
              onClick={() => handleNavigate(item)}
            />
          ))}
      </div>
    </div>
  );
};

export default SectionHeader;
