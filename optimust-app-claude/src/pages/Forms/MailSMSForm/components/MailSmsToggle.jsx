import React from "react";
import { FiMail, FiMessageSquare } from "react-icons/fi";
import classNames from "classnames";

const MailSmsToggle = React.memo(({ activeType, onChange }) => {
  const isMail = activeType === "mail";
  const isSms = activeType === "sms";

  return (
    <div className="p-2 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
      <div className="bg-gray-100 p-1 rounded-2xl flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange("mail")}
          className={classNames(
            "flex-1 px-3 sm:px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm",
            {
              "bg-white shadow text-primary": isMail,
              "text-gray-500 hover:text-gray-700": !isMail,
            },
          )}
        >
          <FiMail size={16} />
          Mail
        </button>

        <button
          type="button"
          onClick={() => onChange("sms")}
          className={classNames(
            "flex-1 px-3 sm:px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm",
            {
              "bg-white shadow text-primary": isSms,
              "text-gray-500 hover:text-gray-700": !isSms,
            },
          )}
        >
          <FiMessageSquare size={16} />
          SMS
        </button>
      </div>
    </div>
  );
});

MailSmsToggle.displayName = "MailSmsToggle";

export default MailSmsToggle;
