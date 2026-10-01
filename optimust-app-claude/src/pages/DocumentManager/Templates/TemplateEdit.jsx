import { useSearchParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../services/apiBinding";
import TemplateForm from "./TemplateForm";
import { useMemo } from "react";
import TemplateSkeleton from "./TemplateSkeleton";
import { useCustomNavigation } from "../../../layouts/main/Navbar/NavigationContext";

export default function TemplateEdit() {
  const [searchParams] = useSearchParams();
  const { activeMenu } = useCustomNavigation();
  const location = useLocation();
  const id = searchParams.get("id");
  const versionId = searchParams.get("versionId");
  const type = searchParams.get("type");
  const page = type;
  // navigate(`edit?${params.toString()}`);
  // detect mode based on url
  const mode = useMemo(() => {
    if (location.pathname.includes("clone")) return "clone";
    if (location.pathname.includes("edit")) return "edit";
    return "view"; // default
  }, [location.pathname]);

  const { data, error, isLoading } = useQuery({
    queryKey: ["template-detail", page, id, versionId],
    queryFn: () =>
      apiRequest({
        apiPath: `Template?id=${id}&versionId=${versionId}&isDraft=${
          page === "draft" ? true : false
        }`,
        payload: {
          id,
          versionId: versionId || 0,
          isDraft: page === "draft" ? true : false,
        },
      }),
    refetchOnMount: "always",
  });

  if (!id) return <div>Invalid URL – id is required.</div>;
  if (error) return <div>Error fetching template</div>;

  // 🌀 Loading Skeleton UI
  if (isLoading) {
    return <TemplateSkeleton />;
  }

  return (
    <TemplateForm
      activeMenu={activeMenu}
      mode={mode}
      selectedData={data}
      page={page}
    />
  );
}
