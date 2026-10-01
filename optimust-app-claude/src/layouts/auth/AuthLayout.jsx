import { Outlet } from "react-router-dom";
import LoginLeftPanel from "./LoginLeftPanel";
const AuthLayout = () => {
  return (
    <div className="flex justify-center lg:justify-end ">
      <LoginLeftPanel />
      <div
        className={`border-t-4 border-[#D4183D] p-10 w-full md:w-[60%] lg:w-[30%] h-screen flex items-center justify-center`}
      >
        <div className="w-full rounded-3xl flex flex-col">
          {/* ' */}
          <h1 className="text-lg text-center py-5 text-(--background-secondary)">
            OPTIMUST LOGIN
            <div className="mx-auto mt-2 w-8 h-0.75 rounded-xs bg-[linear-gradient(90deg,#D4183D_0%,#5B5FC7_100%)]" />
          </h1>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
