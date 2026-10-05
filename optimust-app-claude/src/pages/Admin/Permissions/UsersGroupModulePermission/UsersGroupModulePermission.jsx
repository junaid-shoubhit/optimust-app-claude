import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Accordion, AccordionTab } from "primereact/accordion";
import { toast } from "react-toastify";
import CustomCheckBox from "../../../../components/Forms/Checkbox/CustomCheckBox";

import { apiRequest } from "../../../../services/apiBinding";
import SelectField from "../../../../components/Forms/Select/Select";
import CustomButton from "../../../../components/Forms/Buttons/CustomButton";

import Input from "../../../../components/Forms/Input/Input";
import { useAppNavigation } from "../../../../navigation/NavigationContext";
const UsersGroupModulePermission = () => {
  const queryClient = useQueryClient();

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [expanded, setExpanded] = useState({});
  const [activeRootIndex, setActiveRootIndex] = useState([]);
  const [searchExpanded, setSearchExpanded] = useState({});
  const { activeMenu } = useAppNavigation();

  const [search, setSearch] = useState("");
  // 1. Fetch User Groups for dropdown
  const { data: groupsData = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["userGroupAll"],
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: "/UserGroup/all",
        method: "get",
        signal,
      }),
  });

  // 2. Fetch ALL modules (full hierarchy - independent of group)
  const { data: allModulesResponse = [], isLoading: allModulesLoading } =
    useQuery({
      queryKey: ["allModules"],
      queryFn: ({ signal }) =>
        apiRequest({
          apiPath: `/module/all/${activeMenu?.id}`,
          method: "get",
          signal,
        }),
    });

  const fullModulesData = useMemo(
    () => allModulesResponse?.data || [],
    [allModulesResponse],
  );

  // 3. Fetch permissions for the selected group (only modules with at least one true permission)
  const { data: permissionsResponse = {}, isLoading: permissionsLoading } =
    useQuery({
      queryKey: ["modulePermissions", selectedGroup?.id],
      queryFn: ({ signal }) =>
        apiRequest({
          apiPath: `/module/userGroup/${selectedGroup.id}`,
          method: "get",
          signal,
        }),
      enabled: !!selectedGroup?.id,
    });
  const permissionModulesData = useMemo(
    () => permissionsResponse?.data ?? [],
    [permissionsResponse?.data], // ← depend on .data directly, not the whole response
  );

  // FILTER FUNCTION
  const filterTree = (nodes, searchText, expandedKeys = new Set()) => {
    return nodes
      .map((node) => {
        const match = node.name
          .toLowerCase()
          .includes(searchText.toLowerCase());

        const filteredChildren = filterTree(
          node.children || [],
          searchText,
          expandedKeys,
        );

        if (match || filteredChildren.length > 0) {
          if (filteredChildren.length > 0) {
            expandedKeys.add(node.id); // auto expand parent
          }

          return {
            ...node,
            children: filteredChildren,
          };
        }

        return null;
      })
      .filter(Boolean);
  };

  // Build nested tree from FULL modules list
  const treeNodes = useMemo(() => {
    if (!fullModulesData?.length) return [];

    const nodeMap = {};

    fullModulesData.forEach((mod) => {
      nodeMap[mod.id] = { ...mod, children: [] };
    });

    const roots = [];

    fullModulesData.forEach((mod) => {
      const parentId = mod.parentId ?? 0;

      if (parentId === 0) {
        roots.push(nodeMap[mod.id]);
      } else if (nodeMap[parentId]) {
        nodeMap[parentId].children.push(nodeMap[mod.id]);
      }
    });

    return roots;
  }, [fullModulesData]);

  const { filteredTree, autoExpanded } = useMemo(() => {
    if (!search) return { filteredTree: treeNodes, autoExpanded: {} };

    const expandedKeys = new Set();

    const filtered = filterTree(treeNodes, search, expandedKeys);

    const expandedObj = {};
    expandedKeys.forEach((id) => {
      expandedObj[id] = [0, 1, 2, 3, 4];
    });

    return {
      filteredTree: filtered,
      autoExpanded: expandedObj,
    };
  }, [search, treeNodes]);

  useEffect(() => {
    if (!search) setSearchExpanded({});
  }, [search]);

  // Initialize permissions: merge full list + actual permission values
  useEffect(() => {
    if (!selectedGroup?.id) {
      setPermissions((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }

    if (!fullModulesData?.length) return;

    // ✅ Don't run if permissions query is still loading/hasn't settled
    if (selectedGroup?.id && permissionsLoading) return;

    const init = {};
    fullModulesData.forEach((mod) => {
      const permMod = permissionModulesData.find((p) => p.id === mod.id);
      init[mod.id] = {
        read: !!permMod,
        create: !!permMod?.create,
        update: !!permMod?.update,
        delete: !!permMod?.delete,
        massUpdate: !!permMod?.massUpdate,

        createAction: !!permMod?.createAction,
        updateAction: !!permMod?.updateAction,
        deleteAction: !!permMod?.deleteAction,
        massUpdateAction: !!permMod?.massUpdateAction,
      };
    });

    setPermissions(init);
  }, [
    selectedGroup?.id,
    fullModulesData,
    permissionModulesData,
    permissionsLoading,
  ]);

  // Toggle All
  const isAllSelected = useMemo(() => {
    const all = Object.values(permissions);
    return (
      all.length && all.every((p) => p.read && p.create && p.update && p.delete && p.massUpdate )
    );
  }, [permissions]);

const handleToggleAll = () => {
  const val = !isAllSelected;

  setPermissions((prev) => {
    const updated = {};

    for (const id in prev) {
      updated[id] = {
        read: val,
        create: val,
        update: val,
        delete: val,
        massUpdate: val,

        createAction: prev[id].createAction,
        updateAction: prev[id].updateAction,
        deleteAction: prev[id].deleteAction,
        massUpdateAction: prev[id].massUpdateAction,
      };
    }

    return updated;
  });
};

  const uncheckAllChildren = (nodeId, updated) => {
    const node = fullModulesData.find((m) => m.id === nodeId);
    if (!node) return;
    const children = fullModulesData.filter((m) => m.parentId === nodeId);
    children.forEach((child) => {
      updated[child.id] = {
        read: false,
        create: false,
        update: false,
        delete: false,
        massUpdate: false,

        createAction: false,
        updateAction: false,
        deleteAction: false,
          massUpdateAction: false,
      };
      uncheckAllChildren(child.id, updated);
    });
  };

  const handlePermissionChange = (moduleId, key, value) => {
    setPermissions((prev) => {
      const current = prev[moduleId];
      let updated = { ...prev, [moduleId]: { ...current, [key]: value } };

      if (["create", "update", "delete", "massUpdate"].includes(key) && value) {
        updated[moduleId].read = true;
      }

      if (key === "read" && !value) {
        updated[moduleId] = {
          read: false,
          create: false,
          update: false,
          delete: false,
          massUpdate: false,

          createAction: false,
          updateAction: false,
          deleteAction: false,
          massUpdateAction: false,
        };
        uncheckAllChildren(moduleId, updated); // ← recursively uncheck all children
      }

      return updated;
    });
  };

  // Recursive Tree Renderer
  const renderTree = (nodes, level = 0, parentRead = true) => {
    return nodes.map((node) => {
      const isLeaf = node.children.length === 0;
      const isRoot = level === 0; // add this
      const perms = permissions[node.id] || {
        read: false,
        create: false,
        update: false,
        delete: false,
        massUpdate: false,

        createAction: false,
        updateAction: false,
        deleteAction: false,
        massUpdateAction: false,
      };

      const customHeader = (
        <div
          className="flex items-center justify-between w-full pr-4"
          onClick={(e) => {
            if (isLeaf) e.stopPropagation();
          }}
        >
          <div
            className={`font-medium ${level > 0 ? "text-gray-700" : "text-gray-900"}`}
          >
            {node.name}
          </div>

          <div className="flex items-center gap-8">
            {[
              { key: "read", visible: true },
              { key: "create", visible: perms.createAction },
              { key: "update", visible: perms.updateAction },
              { key: "delete", visible: perms.deleteAction },
              { key: "massUpdate", visible: perms.massUpdateAction },
            ]
              .filter(({ visible }) => visible)
              .map(({ key: perm }) => (
                <div
                  key={perm}
                  className="flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <CustomCheckBox
                    inputId={`${perm}-${node.id}`}
                    checked={!!perms[perm]}
                    disabled={!parentRead}
                    onChange={(e) => {
                      e.originalEvent?.stopPropagation();
                      e.stopPropagation?.();
                      handlePermissionChange(node.id, perm, e.checked);
                    }}
                  />

                  <label
                    htmlFor={`${perm}-${node.id}`}
                    className="text-xs font-semibold uppercase cursor-pointer text-gray-600"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {perm}
                  </label>
                </div>
              ))}
          </div>
        </div>
      );
      return (
        <AccordionTab
          key={node.id}
          header={customHeader}
          className={isLeaf ? "no-toggle-icon" : ""}
        >
          {!isLeaf && (
            <div className="pl-8 border-l-2 border-gray-200 py-2">
              <Accordion
                multiple
                activeIndex={
                  search
                    ? (searchExpanded[node.id] ?? autoExpanded[node.id] ?? [])
                    : expanded[node.id] || []
                }
                onTabChange={(e) => {
                  if (search) {
                    setSearchExpanded((prev) => ({
                      ...prev,
                      [node.id]: e.index,
                    }));
                  } else {
                    setExpanded((prev) => ({ ...prev, [node.id]: e.index }));
                  }
                }}
              >
                {renderTree(node.children, level + 1, perms.read)}
              </Accordion>
            </div>
          )}
        </AccordionTab>
      );
    });
  };

  // Save Handler
  const saveMutation = useMutation({
    mutationFn: (payload) =>
      apiRequest({
        apiPath: "/module/permissions",
        method: "patch",
        payload,
      }),
    onSuccess: () => {
      toast.success("Permissions saved successfully");

      // 🔥 Refetch permissions for selected group
      queryClient.invalidateQueries({
        queryKey: ["modulePermissions", selectedGroup?.id],
      });
    },
    onError: () => toast.error("Failed to save permissions"),
  });

  const handleSave = () => {
    if (!selectedGroup) return toast.warn("Please select a user group first");

    const moduleInfos = Object.entries(permissions)
      .filter(
        ([_, perms]) =>
          perms.read || perms.create || perms.update || perms.delete || perms.massUpdate,
      )
      .map(([id, perms]) => ({
        moduleId: Number(id), // ✅ correct id
        userGroupId: selectedGroup.id,
        create: perms.create,
        update: perms.update,
        delete: perms.delete,
        massUpdate: perms.massUpdate,
      }));

    saveMutation.mutate({
      userGroupId: selectedGroup.id,
      moduleInfos,
      moduleId: activeMenu?.id, // ✅ top-level moduleId (as per your requirement)
      userId: 0,
      firmId: 0,
    });
  };

  return (
    <div className="flex flex-col gap-6 pt-4 px-4">
      {/* Header */}
      <div className="flex justify-between border-b border-gray-400 pb-4">
        <p className="text-sm font-bold uppercase text-(--color-fontFour)">
          User Group Module Permissions
        </p>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <CustomCheckBox
              checked={isAllSelected}
              onChange={handleToggleAll}
            />
            <label
              title="Toggle All"
              className="truncate-1-lines text-xs uppercase font-medium"
            >
              Toggle All
            </label>
          </div>

          <CustomButton
            iconPos="left"
            label={saveMutation.isPending ? "Saving..." : "Save Changes"}
            icon="pi pi-save"
            className={"saveBtn"}
            aria-label="Add"
            onClick={handleSave}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <SelectField
          name="group"
          label="select User Group"
          placeholder="Select User Group"
          defaultOptions={groupsData?.data?.map((g) => ({
            label: g.name,
            value: g,
          }))}
          value={
            selectedGroup
              ? {
                  label: selectedGroup.name,
                  value: selectedGroup,
                }
              : null
          }
          onChange={(o) => setSelectedGroup(o?.value || null)}
          isClearable
          isLoading={groupsLoading}
        />

        <div>
          {/* <label className="block mb-2 font-medium">Search Modules</label> */}
          <label
            title="Search Modules"
            className="truncate-1-lines text-xs uppercase font-medium"
          >
            Search Modules
          </label>
          <Input
            name="search"
            featureName="search"
            type="icon"
            iconName="pi pi-search"
            iconPosition="left"
            placeholder="Search modules..."
            noErrorMessage={true}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={!selectedGroup}
            className="
    w-full
    h-9
    text-xs
    border
    border-gray-400
    rounded-md
    shadow-sm
  "
          />
        </div>
      </div>{" "}
      {/* Modules Tree */}
      {selectedGroup ? (
        <div className="rounded-3xl border bg-white shadow p-2 h-[70vh] overflow-y-auto">
          {allModulesLoading || permissionsLoading ? (
            <div className="flex justify-center py-10">
              Loading modules and permissions...
            </div>
          ) : !treeNodes.length ? (
            <div className="flex justify-center items-center h-40 text-gray-500">
              No modules found
            </div>
          ) : (
            <Accordion
              multiple
              activeIndex={
                search
                  ? (searchExpanded["root"] ??
                    filteredTree.map((_, index) => index))
                  : activeRootIndex
              }
              onTabChange={(e) => {
                if (search) {
                  setSearchExpanded((prev) => ({ ...prev, root: e.index }));
                } else {
                  setActiveRootIndex(e.index);
                }
              }}
            >
              {renderTree(filteredTree)}
            </Accordion>
          )}
        </div>
      ) : (
        <div className="h-80 flex justify-center items-center border text-gray-500 rounded-xl">
          Select a user group to view and manage permissions
        </div>
      )}
    </div>
  );
};

export default UsersGroupModulePermission;
