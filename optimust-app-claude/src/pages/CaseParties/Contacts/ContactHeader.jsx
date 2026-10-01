import { memo } from "react";
import { Mail } from "lucide-react";
import CopyButton from "./CopyButton";
import { getInitials } from "./utils";
import ActionsColumn from "../../../components/Table/ActionsColumn";

const ContactHeader = memo(
  ({ contact, accent, handleEdit, moduleId, canEdit, canDelete }) => {
    return (
      <>
        <div className="flex items-center gap-2 pt-3">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold"
            style={{
              background: accent.tint,
              color: accent.ink,
            }}
          >
            {getInitials(contact.name)}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-[13px] font-bold">{contact.name}</h2>
          </div>
          <div>
            <ActionsColumn
              actions={{
                canEdit,
                canDelete,
                onEdit: () => {
                  handleEdit(contact);
                },
                deleteApiPath: `Contact?Id=:id&ModuleId=${moduleId}`,

                invalidateKeys: [["contacts"]],
              }}
              rowData={contact}
            />
          </div>
        </div>
        {contact.email && (
          <div className="flex pl-8 items-center gap-1">
            <Mail size={12} />

            <a
              href={`mailto:${contact.email}`}
              className="truncate text-xs text-slate-500"
            >
              {contact.email}
            </a>

            <CopyButton value={contact.email} label="email" />
          </div>
        )}
      </>
    );
  },
);

export default ContactHeader;
