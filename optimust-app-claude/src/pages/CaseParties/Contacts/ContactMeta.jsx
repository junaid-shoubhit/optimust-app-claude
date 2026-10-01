import { memo } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import ContactFieldRow from "./ContactFieldRow";

const ContactMeta = memo(
  ({ expanded, setExpanded, createdLabel, modifiedLabel, contact }) => {
    return (
      <div className="mt-3 border-t border-slate-200 pt-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center"
        >
          <Calendar size={10} />

          <span className="ml-1 text-[10px]">Record</span>

          <ChevronDown
            size={14}
            className={`ml-auto transition ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {expanded && (
          <div className="mt-2">
            <ContactFieldRow label="Created" value={createdLabel} />

            <ContactFieldRow label="By" value={contact.createdByName} />

            <ContactFieldRow
              label="Modified"
              value={modifiedLabel || "Not yet modified"}
            />
          </div>
        )}
      </div>
    );
  },
);

export default ContactMeta;
