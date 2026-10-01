import React from "react";
import { useNavigationData } from "../../layouts/main/Navbar/useNavigationData";

const BreadCrumb = () => {
  const { breadcrumb } = useNavigationData();
  return (
    <div className="flex gap-2 text-xs text-(--color-fontFour) font-medium">
      {breadcrumb.map((item, index) => (
        <span key={item.id} className="flex items-center gap-2">
          {index !== 0 && <span>/</span>}
          <span className="cursor-pointer hover:underline">{item.label}</span>
        </span>
      ))}
    </div>
  );
};

export default BreadCrumb;
