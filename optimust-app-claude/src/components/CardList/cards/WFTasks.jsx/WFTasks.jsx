import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { WFTasksSkeleton } from "./WFTasksSkeleton";
import TaskDetailsPanel from "./TaskDetailsPanel";
import { apiRequest } from "../../../../services/apiBinding";

const WFTasks = () => {
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTitle, setPanelTitle] = useState("");

  const {
    mutate,
    data: details,
    isPending,
    isError,
    reset,
  } = useMutation({
    mutationFn: async (payload) => {
      const response = await apiRequest({
        method: "post",
        apiPath: "/Task/TaskSubTypeDetails",
        payload: { ...payload, page: 1, pageSize: 50 },
      });
      return response;
    },
  });

  const handleOpenDetails = (parsed, label, typeName, subtypeName) => {
    setPanelTitle(
      `${typeName}${subtypeName ? ` · ${subtypeName}` : ""} — ${label}`,
    );
    setPanelOpen(true);
    mutate({
      taskSubtypeId: parsed?.taskSubtypeIds || null,
      userIds: parsed?.taskSubtypeIds || null,
      taskSubtypeIds: parsed?.taskSubtypeIds || null,
      taskTypeIds: parsed?.taskTypeIds || null,
      taskStatusIds: parsed?.taskStatusIds || null,
      applySort: "",
      //   quickFilter: false,
      sortColumn: "",
      sortType: "",
    });
  };

  const handleClosePanel = () => {
    setPanelOpen(false);
    // delay reset slightly so content doesn't blank out mid-animation
    setTimeout(() => reset(), 300);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <WFTasksSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex w-full items-start gap-4">
      <TaskDetailsPanel
        open={panelOpen}
        onClose={handleClosePanel}
        title={panelTitle}
        isLoading={isPending}
        isError={isError}
        data={details}
      />
    </div>
  );
};

export default WFTasks;
