import { memo, useMemo, useState } from "react";
import { Phone, Smartphone, MessageCircle, Printer } from "lucide-react";

import { ACCENTS } from "./constants";
import { getAddress } from "./utils";

import ContactHeader from "./ContactHeader";
import ContactLocation from "./ContactLocation";
import ContactMeta from "./ContactMeta";
import ReachTile from "./ReachTile";
import { formatDateUI } from "../../../utils/constant";

const ContactRecord = memo(
  ({ contact, handleEdit, moduleId, canEdit, canDelete }) => {
    const [expanded, setExpanded] = useState(false);

    const accent = useMemo(
      () => ACCENTS[contact.contactTypeName?.toLowerCase()] || ACCENTS.default,
      [contact.contactTypeName],
    );

    const address = useMemo(() => getAddress(contact), [contact]);

    const createdLabel = useMemo(
      () => formatDateUI(contact.created, "datetime"),
      [contact.created],
    );

    const modifiedLabel = useMemo(
      () => formatDateUI(contact.modified, "datetime"),
      [contact.modified],
    );

    return (
      <div className="relative rounded-[14px] border border-slate-200 bg-white p-3 shadow-sm">
        <span
          className="absolute -top-[10px] right-5 whitespace-nowrap rounded-t px-[10px] pt-[4px] pb-[8px] font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-white shadow"
          style={{
            background: accent.solid,
            clipPath: "polygon(0 0,100% 0,100% 78%,50% 100%,0 78%)",
          }}
        >
          {" "}
          {contact?.contactTypeName || "Contact"}{" "}
        </span>
        <ContactHeader
          handleEdit={handleEdit}
          canEdit={canEdit}
          canDelete={canDelete}
          contact={contact}
          accent={accent}
          moduleId={moduleId}
        />

        <div className="mt-3 grid grid-cols-2 gap-2">
          <ReachTile
            icon={<Phone size={12} />}
            label="Phone"
            value={contact.phone}
            href={`tel:${contact.phone}`}
          />

          <ReachTile
            icon={<Smartphone size={12} />}
            label="Mobile"
            value={contact.mobile}
            href={`tel:${contact.mobile}`}
          />

          <ReachTile
            icon={<MessageCircle size={12} />}
            label="WhatsApp"
            value={contact.whatsappId}
          />

          <ReachTile
            icon={<Printer size={12} />}
            label="Fax"
            value={contact.fax}
          />
        </div>

        <ContactLocation address={address} />

        <ContactMeta
          expanded={expanded}
          setExpanded={setExpanded}
          createdLabel={createdLabel}
          modifiedLabel={modifiedLabel}
          contact={contact}
        />
      </div>
    );
  },
);

export default ContactRecord;
