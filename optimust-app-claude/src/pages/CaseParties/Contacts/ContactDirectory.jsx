import { memo, useMemo } from "react";
import ContactRecord from "./ContactRecord";

const ContactDirectory = memo(({ data = [] }) => {
  const contacts = useMemo(
    () => (Array.isArray(data) ? data : [data]).filter(Boolean),
    [data],
  );

  if (!contacts.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
        No contact to show yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {contacts.map((contact, index) => (
        <ContactRecord
          key={contact.id ?? contact.email ?? index}
          contact={contact}
        />
      ))}
    </div>
  );
});

export default ContactDirectory;
