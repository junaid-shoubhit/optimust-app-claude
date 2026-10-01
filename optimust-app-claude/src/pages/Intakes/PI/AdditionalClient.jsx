import React, { memo, useEffect, useMemo, useState } from "react";
import { BiEditAlt } from "react-icons/bi";
import Input from "../../../components/Forms/Input/Input";
import CustomButton from "../../../components/Forms/Buttons/CustomButton";
import DeleteButton from "../../../components/Forms/Buttons/DeleteButton";
import StepModal from "../../../components/Modal/StepModal/StepModal";
import DMUpload from "../../DocumentManager/Documents/DMUploads/DMUpload";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../services/apiBinding";
import { confirmDialog } from "primereact/confirmdialog";
import { formatDateUI } from "../../../utils/constant";

/* =========================================================
   PARTY TYPE LABEL
   ========================================================= */

const getPartyTypeLabel = (partyType) => {
  const partyTypes = {
    19132: "Client",
    19109: "Defendant",
  };

  return partyTypes[partyType] || "";
};

/* =========================================================
   PARTY TYPE UI CONFIG
   Styling is based on PARTY TYPE ID, not label.
   ========================================================= */

const PARTY_TYPE_SECTION_CONFIG = {
  // Client
  19132: {
    headerClassName: "text-[#7a4b78]",
    lineClassName: "bg-[#eadfea]",
    countClassName: "bg-[#f5edf5] text-[#7a4b78]",
    dotClassName: "bg-[#9a6697]",

    cardClassName: "bg-[#faf7fb] border-[#eadfea]",

    // Active Client
    activeCardClassName:
      "bg-[#f4e9f4] border-[#9a6697] ring-1 ring-[#9a6697]/25",
    activeIndicatorClassName: "bg-[#9a6697]",
  },

  // Defendant
  19109: {
    headerClassName: "text-[#36756f]",
    lineClassName: "bg-[#dcece9]",
    countClassName: "bg-[#edf6f5] text-[#36756f]",
    dotClassName: "bg-[#4d938b]",

    cardClassName: "bg-[#f6fbfa] border-[#dcece9]",

    // Active Defendant
    activeCardClassName:
      "bg-[#eaf5f3] border-[#4d938b] ring-1 ring-[#4d938b]/25",
    activeIndicatorClassName: "bg-[#4d938b]",
  },

  // Fallback
  unknown: {
    headerClassName: "text-gray-500",
    lineClassName: "bg-gray-200",
    countClassName: "bg-gray-100 text-gray-500",
    dotClassName: "bg-gray-400",

    cardClassName: "bg-(--foreground) border-(--border-inverse)",

    activeCardClassName: "bg-gray-100 border-gray-500 ring-1 ring-gray-400/25",
    activeIndicatorClassName: "bg-gray-500",
  },
};

const AdditionalClient = ({
  activeMenu,
  intakeId,
  clientEnitityId,
  queryKeys,
  entityParentId,
  setSelectedClient,
  selectedClient,
  selectedDetails,
  setUploadedFiles,
  visible,
  setVisible,
  clients = [],
  isSelectable,
  setIsAddMode,
  isAddMode,
  isConverted,
  tabQueryKey,
}) => {
  const [search, setSearch] = useState("");

  // Stores collapsed/expanded state for each party type
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const queryClient = useQueryClient();

  /* =========================================================
     SEARCH EXISTING CLIENT
     ========================================================= */

  const {
    mutate: searchClient,
    data: responseData,
    isPending,
    reset: resetSearchResults,
  } = useMutation({
    mutationFn: (searchValue) =>
      apiRequest({
        apiPath: "/Party/PlaintiffPersonDetails",
        method: "get",
        payload: {
          searchTerm: searchValue,
          entityId: intakeId,
        },
      }),

    onSuccess: (response) => {
      if ((response?.data?.length ?? 0) === 0) {
        toast.info("No record found.");
      }
    },
  });

  const existingClients = responseData?.data || [];

  /* =========================================================
     ADD EXISTING CLIENT
     ========================================================= */

  const { mutate: addExistingUser } = useMutation({
    mutationFn: (payload) =>
      apiRequest({
        apiPath: "/Intakes/IntakeDDupDataSave",
        method: "post",
        payload,
      }),

    onSuccess: (response) => {
      if (response?.success === true) {
        toast.success("Client added successfully");
      }

      if (response?.success === false) {
        toast.info(response?.message || "Operation could not be completed");
        return;
      }

      Object.values(queryKeys || {})
        .filter(Boolean)
        .forEach((queryKey) => {
          queryClient.invalidateQueries({
            queryKey,
          });
        });
    },
  });

  /* =========================================================
     AUTO SELECT FIRST CLIENT
     ========================================================= */

  useEffect(() => {
    if (!selectedClient && clients.length > 0) {
      setSelectedClient(clients[0]);
    }
  }, [clients, selectedClient, setSelectedClient]);

  /* =========================================================
     SEARCH
     ========================================================= */

  const handleSearch = (searchValue) => {
    if (!searchValue || searchValue.length < 3) {
      toast.info("Please enter at least 3 characters to search for a client.");
      return;
    }

    searchClient(searchValue);
  };

  /* =========================================================
     ADD EXISTING CLIENT
     ========================================================= */

  const handleAddExistingClient = (client) => {
    resetSearchResults();
    setSearch("");

    const payload = {
      partyId: client?.id,
      moduleId: activeMenu?.id,
      intakeId,
      workFlowId: clientEnitityId?.workflowId,
      partyTypeId: client?.partyType,
    };

    addExistingUser(payload);
  };

  /* =========================================================
     HELPERS
     ========================================================= */

  const truncate = (text, max = 10) =>
    text && text.length > max ? `${text.slice(0, max)}...` : text;

  /* =========================================================
     GROUP CLIENTS BY PARTY TYPE
     ========================================================= */

  const CLIENT_PARTY_TYPE_ID = "19132";

  const groupedClients = useMemo(() => {
    const groups = {};

    clients.forEach((client) => {
      const partyTypeId = client?.partyTypeId
        ? String(client.partyTypeId)
        : "unknown";

      if (!groups[partyTypeId]) {
        groups[partyTypeId] = {
          id: partyTypeId,
          label:
            client?.partyType ||
            getPartyTypeLabel(client?.partyTypeId) ||
            "Party Type Not Set",
          clients: [],
        };
      }

      groups[partyTypeId].clients.push(client);
    });

    return Object.values(groups).sort((a, b) => {
      if (a.id === CLIENT_PARTY_TYPE_ID) return -1;
      if (b.id === CLIENT_PARTY_TYPE_ID) return 1;

      return 0;
    });
  }, [clients]);

  /* =========================================================
     COLLAPSE / EXPAND PARTY TYPE
     ========================================================= */

  const toggleGroup = (groupId) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  /* =========================================================
     DELETE → SELECT NEXT/PREVIOUS CLIENT
     ========================================================= */

  const handleClientDelete = (client) => {
    const currentIndex = clients.findIndex(
      (item) => item.rowIndex === client.rowIndex,
    );

    let nextSelected = null;

    // Select previous client first
    if (currentIndex > 0) {
      nextSelected = clients[currentIndex - 1];
    }
    // Otherwise select next client
    else if (clients.length > 1) {
      nextSelected = clients[currentIndex + 1];
    }

    setSelectedClient(nextSelected);
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl">
      {/* =====================================================
          HEADER
          ===================================================== */}

      {activeMenu?.create && isSelectable && !isConverted && (
        <div className="shrink-0">
          <div className="flex px-3 items-center gap-1 pt-3">
            <span className="h-3 border-2 border-(--border-secondary) rounded-xs" />

            <p className="text-xs uppercase font-bold text-(--text-secondary)">
              Search Existing / Add New
            </p>
          </div>

          <div className="flex items-center gap-1 p-2 border-b-[0.5px] border-(--border-inverse)">
            <div className="flex justify-between items-center gap-2 flex-1">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Existing Clients..."
                className="outline-none! w-full!"
                noErrorMessage
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(search);
                  }
                }}
              />

              <CustomButton
                text
                icon={isPending ? "pi pi-spin pi-spinner" : "pi pi-search"}
                className="w-fit! p-2! text-(--text-secondary)!"
                onClick={() => handleSearch(search)}
              />
            </div>

            <CustomButton
              text
              icon="pi pi-plus"
              className="w-fit! p-2! text-(--text-secondary)!"
              onClick={() => {
                setIsAddMode(true);
                setVisible(true);
              }}
            />
          </div>
        </div>
      )}

      {/* =====================================================
          EXISTING CLIENT SEARCH RESULTS
          ===================================================== */}

      {existingClients?.length > 0 && (
        <div className="max-h-[270px] border-b border-gray-200">
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              Existing Clients
            </h3>

            <CustomButton
              text
              icon="pi pi-times"
              className="w-fit! p-1! text-(--text-secondary)! text-gray-500! hover:text-red-500! hover:bg-red-50!"
              onClick={() => {
                resetSearchResults();
                setSearch("");
              }}
            />
          </div>

          <div className="h-[calc(100%-44px)] overflow-y-auto px-2 pb-3 space-y-2">
            {existingClients.map((client) => {
              const partyTypeLabel = getPartyTypeLabel(client?.partyType);
              const partyTypeId = String(client?.partyType || "");

              const partyTypeConfig =
                PARTY_TYPE_SECTION_CONFIG[partyTypeId] ||
                PARTY_TYPE_SECTION_CONFIG.unknown;

              return (
                <div
                  key={client.id}
                  className="p-3 rounded-xl border-[0.5px] bg-(--foreground) border-(--border-inverse) relative"
                >
                  {/* Party Type Tag */}
                  {partyTypeLabel && (
                    <div className="absolute top-2 left-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${partyTypeConfig.countClassName}`}
                      >
                        {partyTypeLabel}
                      </span>
                    </div>
                  )}

                  {/* Action */}
                  <div className="absolute top-2 right-2">
                    <CustomButton
                      text
                      icon="pi pi-plus"
                      className="w-fit! p-2! text-(--text-secondary)!"
                      onClick={() => {
                        confirmDialog({
                          message: "Are you sure you want to add this client?",
                          header: "Confirmation",
                          className: "custom-confirm",
                          icon: "pi pi-question-circle",
                          acceptClassName:
                            "secondaryBtn bg-(--background-secondary)!",
                          rejectClassName:
                            "text-(--text-secondary)! border-none! bg-transparent!",
                          accept: () => {
                            handleAddExistingClient(client);
                          },
                        });
                      }}
                    />
                  </div>

                  {/* Client */}
                  <div className="flex items-center gap-3 mb-2 mt-5">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gray-400 text-white text-sm font-bold flex items-center justify-center">
                      {client?.firstName?.[0]}
                      {client?.lastName?.[0]}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {truncate(client?.firstName)}{" "}
                        {truncate(client?.middleName)}{" "}
                        {truncate(client?.lastName)}
                      </p>

                      <div className="flex items-center gap-3">
                        <p className="text-xs text-gray-500">
                          <span className="text-gray-400">DOB:</span>{" "}
                          {formatDateUI(client?.dateOfBirth, "date", false) ||
                            "--"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-y-1 text-xs text-gray-600">
                    <p>
                      <span className="text-gray-400">SSN:</span>{" "}
                      {client?.ssn || "--"}
                    </p>

                    {client?.mobileNumber && (
                      <p>
                        <span className="text-gray-400">Mobile:</span>{" "}
                        {client.mobileNumber}
                      </p>
                    )}

                    {client?.emailId && (
                      <p className="truncate">
                        <span className="text-gray-400">Email:</span>{" "}
                        {client.emailId}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================
          PARTY DETAILS TITLE
          ===================================================== */}

      <div className="flex px-3 items-center gap-1 pt-3">
        <span className="h-4 border-2 border-(--border-secondary) rounded-xs" />

        <p className="text-sm uppercase font-bold text-(--text-secondary)">
          Party Details
        </p>
      </div>

      {/* =====================================================
          PARTY LIST
          ===================================================== */}

      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
        {groupedClients.map((group) => {
          const sectionConfig =
            PARTY_TYPE_SECTION_CONFIG[group.id] ||
            PARTY_TYPE_SECTION_CONFIG.unknown;

          const isCollapsed = !!collapsedGroups[group.id];

          return (
            <div key={group.id} className="space-y-2">
              {/* =================================================
                  PARTY TYPE SECTION HEADER
                  ================================================= */}

              <div
                className="flex items-center gap-2 px-1 pt-1 pb-1 cursor-pointer select-none group"
                onClick={() => toggleGroup(group.id)}
              >
                {/* Collapse Button */}
                <span
                  className={`
                    w-2.5 h-2.5 rounded-md
                    flex items-center justify-center
                    ${sectionConfig.countClassName}
                    transition-all duration-200
                    group-hover:scale-105
                  `}
                >
                  <i
                    className={`
                      pi
                      ${isCollapsed ? "pi-chevron-right" : "pi-chevron-down"}
                      text-[10px]!
                    `}
                  />
                </span>

                {/* Party Type Dot */}
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${sectionConfig.dotClassName}`}
                />

                {/* Party Type Name */}
                <span
                  className={`text-[11px] font-bold uppercase tracking-wide ${sectionConfig.headerClassName}`}
                >
                  {group.label}
                </span>

                {/* Count */}
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[9px] font-semibold ${sectionConfig.countClassName}`}
                >
                  {group.clients.length}
                </span>

                {/* Divider */}
                <div className={`flex-1 h-px ${sectionConfig.lineClassName}`} />
              </div>

              {/* =================================================
                  PARTY CARDS
                  ================================================= */}

              {!isCollapsed &&
                group.clients.map((client) => {
                  const isSelected =
                    selectedClient?.rowIndex === client.rowIndex;

                  return (
                    <div
                      key={client.rowIndex}
                      onClick={() => {
                        if (isSelectable) {
                          setSelectedClient(client);
                        }
                      }}
                      className={`
                        p-3
                        rounded-xl
                        border-[0.5px]
                        relative
                        overflow-hidden
                        ${
                          isSelectable
                            ? "cursor-pointer transition-all duration-200"
                            : ""
                        }
                        ${
                          isSelected
                            ? sectionConfig.activeCardClassName
                            : sectionConfig.cardClassName
                        }
                        ${
                          isSelectable && !isSelected
                            ? "hover:brightness-[0.98] hover:border-gray-300"
                            : ""
                        }
                      `}
                    >
                      {/* =================================================
                          ACTIONS
                          ================================================= */}

                      <div className="absolute top-2 right-2 flex items-center gap-2">
                        {isSelectable ? (
                          <>
                            {/* Edit */}
                            {activeMenu?.update && !isConverted && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  setIsAddMode(false);
                                  setSelectedClient(client);
                                  setVisible(true);
                                }}
                                className="p-1 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition"
                              >
                                <BiEditAlt size={16} />
                              </button>
                            )}

                            {/* Delete */}
                            {activeMenu?.delete && !isConverted && (
                              <DeleteButton
                                id={client.entityId}
                                apiPath={`/Utility/DynamicPageDelete?Id=:id&ModuleId=${activeMenu?.id}&EntityCodeId=${clientEnitityId?.entityCodeId}`}
                                invalidateKeys={[
                                  ["additional-clients", intakeId],
                                  queryKeys?.clientQueryKey,
                                ]}
                                message="Delete this client?"
                                className="text-red-400! hover:text-red-600! p-0! w-fit!"
                                onDelete={() => handleClientDelete(client)}
                                apiCallNeeded={true}
                              />
                            )}
                          </>
                        ) : (
                          /* Upload */
                          <DMUpload
                            selectedCase={
                              selectedDetails
                                ? {
                                    ...selectedDetails,
                                    caseDetails: {
                                      ...selectedDetails?.caseDetails,
                                      caseId: client?.entityId,
                                    },
                                  }
                                : null
                            }
                            clientName={`${client?.clientFirstName || ""} ${
                              client?.clientLastName || ""
                            }`}
                            entityCodeId={clientEnitityId?.entityCodeId}
                            setUploadedFiles={setUploadedFiles}
                            isConverted={isConverted}
                          />
                        )}
                      </div>

                      {/* Selected Indicator */}
                      {isSelected && isSelectable && (
                        <div
                          className={`
                            absolute
                            left-0
                            top-3
                            bottom-3
                            w-1
                            rounded-r-full
                            ${sectionConfig.activeIndicatorClassName}
                          `}
                        />
                      )}

                      {/* =================================================
                          PARTY INFO
                          ================================================= */}

                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="h-10 w-10 shrink-0 rounded-full bg-linear-to-br logoGradient text-white text-sm font-bold flex items-center justify-center">
                          {client?.clientFirstName?.[0]}
                          {client?.clientLastName?.[0]}
                        </div>

                        {/* Name + Metadata */}
                        <div className="min-w-0 flex-1 pr-10">
                          {/* Name */}
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {truncate(client?.clientTitle)}{" "}
                              {truncate(client?.clientFirstName)}{" "}
                              {truncate(client?.clientLastName)}
                            </p>

                            {/* Selected Check */}
                            {isSelected && isSelectable && (
                              <span
                                className={`
                                  shrink-0
                                  w-4
                                  h-4
                                  rounded-full
                                  flex
                                  items-center
                                  justify-center
                                  ${sectionConfig.activeIndicatorClassName}
                                `}
                              >
                                <i className="pi pi-check text-white text-[8px]!" />
                              </span>
                            )}
                          </div>

                          {/* Metadata + Party Type Tag */}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {/* Party Type Tag */}
                            {group?.id !== "unknown" && (
                              <span
                                className={`
                                  shrink-0
                                  px-2
                                  py-0.5
                                  rounded-full
                                  text-[9px]
                                  font-semibold
                                  ${sectionConfig.countClassName}
                                `}
                              >
                                {group?.label}
                              </span>
                            )}

                            {/* Gender */}
                            <p className="text-xs text-gray-500">
                              <span className="text-gray-400">Gender:</span>{" "}
                              {client?.gender || "--"}
                            </p>

                            {/* DOB */}
                            <p className="text-xs text-gray-500">
                              <span className="text-gray-400">DOB:</span>{" "}
                              {formatDateUI(
                                client?.dateOfBirth,
                                "date",
                                false,
                              ) || "--"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* =================================================
                          SSN
                          ================================================= */}

                      <div className="mt-3 pt-2 border-t border-black/5">
                        <p className="text-xs text-gray-600">
                          <span className="text-gray-400">SSN:</span>{" "}
                          {client?.ssn || "-"}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          );
        })}

        {/* =====================================================
            EMPTY STATE
            ===================================================== */}

        {clients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-(--background-hover) flex items-center justify-center mb-2">
              <i className="pi pi-users text-(--text-secondary)" />
            </div>

            <p className="text-sm font-medium text-gray-600">
              No clients found
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Add a client to get started.
            </p>
          </div>
        )}
      </div>

      {/* =====================================================
          CLIENT MODAL
          ===================================================== */}

      {visible && (
        <StepModal
          visible={visible}
          setVisible={setVisible}
          id={isAddMode ? 0 : selectedClient?.entityId || 0}
          rowIndex={isAddMode ? null : selectedClient?.rowIndex}
          title="Client Details"
          entityCode="intake-client"
          entityCodeId={clientEnitityId?.entityCodeId}
          moduleId={activeMenu?.id}
          designType={clientEnitityId?.designType}
          entityParentId={isAddMode ? entityParentId : null}
          queryKeys={queryKeys}
          tabQueryKey={tabQueryKey}
        />
      )}
    </div>
  );
};

export default memo(AdditionalClient);
