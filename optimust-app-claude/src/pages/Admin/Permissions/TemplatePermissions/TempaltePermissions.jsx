import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Checkbox } from "primereact/checkbox";
import { toast } from "react-toastify";

import { apiRequest } from "../../../../services/apiBinding";
import SelectField from "../../../../components/Forms/Select/Select";
import CustomButton from "../../../../components/Forms/Buttons/CustomButton";

import PermissionsTable from "../../../../components/PermissionsTable/PermissionsTable";

// ✅ Dummy Data
import { templatePermissionDummy } from "../../../../data/templatePermissionDummy";

const TemplatePermissions = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [permissions, setPermissions] = useState({});

  // ---------------------------
  // USER GROUPS API (same)
  // ---------------------------
  const { data: groupsData = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["userGroupAll"],
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: "/UserGroup/all",
        method: "get",
        signal,
      }),
  });

  // ---------------------------
  // TEMPLATE DATA
  // ---------------------------

  // 🔹 OPTION 1: Dummy Data
  const templateData = templatePermissionDummy;

  // 🔹 OPTION 2: API (uncomment when ready)
  /*
  const { data: templateResponse = [] } = useQuery({
    queryKey: ["templatePermissions", selectedGroup?.id],
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: `/template/userGroup/${selectedGroup.id}`,
        method: "get",
        signal,
      }),
    enabled: !!selectedGroup?.id,
  });

  const templateData = templateResponse?.data || [];
  */

  // ---------------------------
  // TABLE CONFIG
  // ---------------------------
  const tableConfig = [
    { key: "read", header: "Read" },
    { key: "create", header: "Create" },
    { key: "update", header: "Update" },
    { key: "delete", header: "Delete" },
  ];

  // ---------------------------
  // INIT PERMISSIONS
  // ---------------------------
  useEffect(() => {
    if (!templateData.length) return;

    const init = {};
    templateData.forEach((item) => {
      init[item.id] = {
        read: false,
        create: false,
        update: false,
        delete: false,
      };
    });

    setPermissions(init);
  }, [templateData]);

  // ---------------------------
  // TOGGLE ALL
  // ---------------------------
  const isAllSelected = useMemo(() => {
    const all = Object.values(permissions);
    return (
      all.length && all.every((p) => tableConfig.every((col) => p[col.key]))
    );
  }, [permissions, tableConfig]);

  const handleToggleAll = () => {
    const val = !isAllSelected;

    setPermissions((prev) => {
      const updated = {};

      for (const id in prev) {
        updated[id] = {};
        tableConfig.forEach((col) => {
          updated[id][col.key] = val;
        });
      }

      return updated;
    });
  };

  // ---------------------------
  // SAVE
  // ---------------------------
  const saveMutation = useMutation({
    mutationFn: (payload) =>
      apiRequest({
        apiPath: "/template/permissions",
        method: "patch",
        payload,
      }),
    onSuccess: () => toast.success("Saved successfully"),
    onError: () => toast.error("Save failed"),
  });

  const handleSave = () => {
    if (!selectedGroup) return toast.warn("Select user group first");

    const payload = Object.entries(permissions).map(([id, perms]) => ({
      templateId: Number(id),
      userGroupId: selectedGroup.id,
      ...perms,
    }));

    saveMutation.mutate({ data: payload });
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="flex flex-col gap-6 pt-4 px-4">
      {/* Header */}
      <div className="flex justify-between border-b pb-4">
        <h1 className="text-2xl font-semibold">Template Permissions</h1>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Checkbox checked={isAllSelected} onChange={handleToggleAll} />
            <label className="uppercase text-sm">Toggle All</label>
          </div>

          <CustomButton
            label={saveMutation.isPending ? "Saving..." : "Save Changes"}
            onClick={handleSave}
          />
        </div>
      </div>

      {/* Group Dropdown */}
      <SelectField
        name="group"
        label="User Group"
        placeholder="Select User Group"
        defaultOptions={groupsData.map((g) => ({
          label: g.name,
          value: g,
        }))}
        onChange={(o) => setSelectedGroup(o?.value || null)}
        isClearable
        isLoading={groupsLoading}
      />

      {/* Table */}
      {selectedGroup ? (
        <PermissionsTable
          data={templateData}
          permissions={permissions}
          setPermissions={setPermissions}
          tableConfig={tableConfig}
        />
      ) : (
        <div className="h-60 flex justify-center items-center border text-gray-500 rounded-xl">
          Select a user group to manage template permissions
        </div>
      )}
    </div>
  );
};

export default TemplatePermissions;
