import React from "react";
import { Briefcase, Folder, FileText, BarChart3 } from "lucide-react";

const LoginLeftPanel = () => {
  const icons = [Briefcase, Folder, FileText, BarChart3];

  return (
    <div className="md:w-[40%] lg:w-[70%] relative w-full h-screen overflow-hidden flex items-center justify-center bg-linear-to-b from-[#161c2c] via-[#232c42] to-[#1a2236]">
      {/* Ambient glow blobs */}
      <div className="absolute top-[20%] left-[-5%] w-64 h-64 rounded-full bg-indigo-500/25 blur-[70px] pointer-events-none" />
      <div className="absolute top-[55%] left-[5%] w-56 h-56 rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-104 h-104 rounded-full bg-rose-800/30 blur-[90px] pointer-events-none" />

      {/* Center content */}
      <div className="relative flex flex-col items-center text-center px-6">
        {/* Logo */}
        <div className="flex items-center justify-center w-17.5 h-17.5 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-500 shadow-[0_0_45px_rgba(99,102,241,0.45)]">
          <span className="text-white font-bold text-xl tracking-wide">OP</span>
        </div>

        {/* Title */}
        <h1 className="text-white font-extrabold text-2xl tracking-wider mt-6">
          OPTIMUST
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-sm leading-relaxed mt-3 max-w-65">
          Legal case management platform for modern law firms
        </p>

        {/* Feature icons */}
        <div className="flex gap-3 mt-8">
          {icons.map((Icon, i) => (
            <div
              key={i}
              className="flex items-center justify-center w-12 h-12 rounded-[13px] bg-rose-900/40"
            >
              <Icon size={18} className="text-rose-400" strokeWidth={2} />
            </div>
          ))}
        </div>

        {/* Tagline */}
        <p className="text-slate-600 text-[11px] tracking-[0.25em] uppercase mt-10">
          Secure · Reliable · Efficient
        </p>
      </div>

      {/* Bottom gradient bar */}
      <div className="absolute bottom-0 left-0 w-full h-0.75 bg-linear-to-r from-red-500 via-pink-500 to-indigo-500" />
    </div>
  );
};

export default LoginLeftPanel;
