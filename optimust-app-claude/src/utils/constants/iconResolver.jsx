import * as MdIcons from "react-icons/md";
import * as GoIcons from "react-icons/go";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as io5Icons from "react-icons/io5";

// 🔥 Merge all libraries
const iconLibraries = {
  ...MdIcons,
  ...GoIcons,
  ...FaIcons,
  ...AiIcons,
  ...io5Icons,
};

export const getDynamicIcon = (iconName) => {
  if (!iconName) return null;

  const IconComponent = iconLibraries[iconName];

  if (!IconComponent) return null;

  return <IconComponent className="text-[20px]" />;
};

export const getDefaultIcon = (label = "") => {
  const initials = label
    ?.split(" ")
    ?.map((w) => w[0])
    ?.join("")
    ?.slice(0, 2)
    ?.toUpperCase();

  return (
    <div className="w-6 h-6 p-3 rounded-full border border-gray-400 flex items-center justify-center text-gray-600 text-xs font-semibold">
      {initials || "?"}
    </div>
  );
};
