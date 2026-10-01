const CALL_LOGS = [
  {
    userName: "Amit Kumar",
    userId: "amit.k",
    dateTime: "01/02/2026 3:15 PM",
    actionType: "STATUS CHANGE",
    previousValue: "Pending Review",
    newValue: "Approved",
  },
  {
    userName: "Nitin V",
    userId: "nitin.v",
    dateTime: "01/02/2026 4:55 PM",
    actionType: "DOCUMENT UPDATE",
    previousValue: "Default folder: ROOT-FOLDER",
    newValue: "Default folder: ROOT-FOLDER",
  }
];

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

const CallLogs = () => {
  return (
    <div className="flex flex-col gap-4">
      {CALL_LOGS.map((log, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 bg-white rounded-2xl px-4 py-2"
        >
          {/* Top Row */}
          <div className="grid justify-between items-center grid-cols-1 md:grid-cols-2 gap-1">
            <div className="flex gap-1">
              <div className="flex items-center gap-2">
                <div className="rounded-full p-2 bg-(--color-bgTwo)">
                  <p className="text-(--color-fontFour) font-semibold text-base">
                    {getInitials(log.userName)}
                  </p>
                </div>
                <div className="grid">
                  <p className="text-(--color-fontFour) text-sm font-semibold">
                    {log.userName} ({log.userId})
                  </p>
                  <p className="text-(--color-fontFour) text-sm">{log.dateTime}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-1 md:justify-end">
              <p className="text-sm text-(--color-fontFour)">
                Action Type:
              </p>
              <p className="text-sm font-semibold text-(--color-fontFour)">
                {log.actionType}
              </p>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid justify-between grid-cols-1 md:grid-cols-2 gap-1">
            <div className="flex gap-1">
              <p className="text-sm text-(--color-fontFour)">
                Previous Value:
              </p>
              <p className="text-sm font-semibold text-(--color-fontFour)">
                {log.previousValue}
              </p>
            </div>

            <div className="flex gap-1 md:justify-end">
              <p className="text-sm text-(--color-fontFour)">
                New Value:
              </p>
              <p className="text-sm font-semibold text-(--color-fontFour)">
                {log.newValue}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CallLogs;
