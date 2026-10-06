import { useNavigate } from "react-router-dom";
import CustomButton from "../Forms/Buttons/CustomButton";
import DeleteButton from "../Forms/Buttons/DeleteButton";
import EditButton from "../Forms/Buttons/EditButton";
import { memo } from "react";
import MailBtn from "../../pages/DynamicContent/DynamicView/components/Buttons/MailBtn";
const ActionsColumn = ({ actions, rowData, setSelectedRows, isTaskMail }) => {
  const navigate = useNavigate();
  return (
    <div className="flex gap-1 w-full justify-end">
      {isTaskMail && (
        <MailBtn
          rowDetails={{
            subject: rowData?.[4379],
            body: rowData?.[4384],
            mailDetails: rowData?.[4382],
          }}
          noLabel={true}
        />
      )}
      {actions?.canEdit && (
        <EditButton rowData={rowData} onEdit={actions?.onEdit} />
      )}

      {actions?.canView && (
        <CustomButton
          autoFocus={false}
          onClick={(e) => {
            e.currentTarget.blur();
            if (setSelectedRows) {
              setSelectedRows([rowData]);
            }
            navigate(`overview?id=${rowData?.id}`);
          }}
          text
          icon="pi pi-eye text-xs! p-1 rounded bg-(--background-hover)"
          className="text-(--color-fontFive)! p-0! w-fit! rounded-none!"
        />
      )}

      {actions?.canDelete && (
        <DeleteButton
          id={rowData?.id}
          apiPath={actions.deleteApiPath}
          apiClient={actions.apiClient}
          invalidateKeys={actions?.invalidateKeys}
          onDelete={actions?.onDelete}
          dataKey={actions?.dataKey}
        />
      )}

      {actions?.renderActions && actions.renderActions(rowData)}
    </div>
  );
};

export default memo(ActionsColumn);
