import { Bell, Search, Sparkles } from "lucide-react";
import React, { useMemo, useState } from "react";

const DashboardHeader = () => {
  const [search, setSearch] = useState("");

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";

    return "Good Evening";
  }, []);

  const userName = localStorage.getItem("userName") || "";

  return (
    <div className="flex justify-between gap-5 mb-3">
      <div>
        <div
          className="flex items-center gap-2 font-semibold"
          style={{ color: "var(--color-bgSeven)" }}
        >
          <Sparkles size={18} />
          Smart Dashboard
        </div>

        <h1
          className="text-4xl font-black mt-2"
          style={{ color: "var(--color-fontFour)" }}
        >
          {greeting}, {userName} 👋
        </h1>

        <p
          className="mt-2 text-[15px]"
          style={{ color: "var(--color-fontSix)" }}
        >
          Manage cases, intake, tasks & team productivity.
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;

// <div className="flex flex-wrap gap-3 items-center">
//   {/* SEARCH */}

//   <div className="relative">
//     <Search
//       size={18}
//       className="absolute left-4 top-1/2 -translate-y-1/2"
//       style={{ color: "var(--color-fontSix)" }}
//     />

//     <input
//       value={search}
//       onChange={(e) => setSearch(e.target.value)}
//       placeholder="Search anything..."
//       className="h-14 w-[280px] rounded-2xl pl-11 pr-4 outline-none border"
//       style={{
//         background: "rgba(255,255,255,0.7)",
//         borderColor: "var(--color-bgTwo)",
//       }}
//     />
//   </div>

//   {/* BELL */}

//   <button
//     className="h-14 w-14 rounded-2xl border flex items-center justify-center relative"
//     style={{
//       background: "rgba(255,255,255,0.7)",
//       borderColor: "var(--color-bgTwo)",
//     }}
//   >
//     <Bell size={20} style={{ color: "var(--color-fontFour)" }} />

//     <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-red-500" />
//   </button>

//   {/* BUTTON */}

//   {/* <button
//       className="h-14 px-6 rounded-2xl text-white font-semibold flex items-center gap-2 transition hover:scale-[1.02]"
//       style={{
//         background:
//           "linear-gradient(135deg, var(--color-bgFive), var(--color-bgSeven))",
//       }}
//     >
//       <Plus size={18} />
//       Create New
//     </button> */}
// </div>
