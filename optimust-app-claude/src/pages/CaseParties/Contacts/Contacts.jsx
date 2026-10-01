// import { useState, useCallback, useMemo, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { useParams } from "react-router-dom";
// import classNames from "classnames";

// import Table from "../../../components/Table/Table";
// import { apiRequest } from "../../../services/apiBinding";
// import StepModal from "../../../components/Modal/StepModal/StepModal";
// import ContactsForm from "./ContactForm/ContactsForm";

// const defaultFilters = {
//   page: 1,
//   pageSize: 10,
// };

// const Contacts = ({ entityId, activeMenu }) => {
//   const params = useParams();
//   const [totalCount, setTotalCount] = useState(0);
//   const [visible, setVisible] = useState(false);
//   const [details, setDetails] = useState(null);

//   const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

//   const { data, isLoading, isError, error } = useQuery({
//     queryKey: ["contacts", appliedFilters, entityId],

//     queryFn: ({ signal }) =>
//       apiRequest({
//         apiPath: `/Contact/party/${entityId}`,
//         method: "get",
//         signal,
//       }),

//     enabled: !!entityId,
//   });

//   useEffect(() => {
//     if (data?.dataSize !== undefined) {
//       setTotalCount(data.dataSize);
//     }
//   }, [data?.dataSize]);

// const addData = useCallback(() => {
//   setDetails(null);
//   setVisible(true);
// }, []);

// const headerProps = useMemo(
//   () => ({
//     addData,

//     headerName: activeMenu?.label,

//     setFilters: setAppliedFilters,

//     defaultFilters,

//     filterName: "contact",

//     actionsConfig: {
//       export: true,
//       back: true,
//       add: activeMenu?.create,
//     },
//   }),
//   [addData],
// );

//   const fieldsConfig = useMemo(
//     () => [
//       {
//         parameterName: "id",
//         columnName: "Contact ID",
//         width: "120px",
//       },

//       {
//         parameterName: "name",
//         columnName: "Name",
//         width: "180px",
//       },

//       {
//         parameterName: "email",
//         columnName: "Email",
//         width: "220px",
//       },

//       {
//         parameterName: "phone",
//         columnName: "Phone",
//         width: "160px",
//       },

//       {
//         parameterName: "extension",
//         columnName: "Ext.",
//         width: "100px",
//       },

//       {
//         parameterName: "mobile",
//         columnName: "Mobile",
//         width: "160px",
//       },

//       {
//         parameterName: "whatsappId",
//         columnName: "WhatsApp ID",
//         width: "180px",
//       },

//       {
//         parameterName: "fax",
//         columnName: "Fax",
//         width: "160px",
//       },

//       {
//         parameterName: "address",
//         columnName: "Address",
//         width: "250px",
//       },

//       {
//         parameterName: "city",
//         columnName: "City",
//         width: "160px",
//       },

//       {
//         parameterName: "country",
//         columnName: "Country",
//         width: "160px",
//       },

//       {
//         parameterName: "stateName",
//         columnName: "State",
//         width: "160px",
//       },

//       {
//         parameterName: "zip",
//         columnName: "Zip",
//         width: "120px",
//       },

//       {
//         parameterName: "contactTypeName",
//         columnName: "Contact Type",
//         width: "180px",
//       },

//       {
//         parameterName: "disableEmailEdit",
//         columnName: "Disable Email Edit",
//         width: "180px",

//         customTemplate: (val) => (val ? "Yes" : "No"),
//       },

//       {
//         parameterName: "created",
//         columnName: "Created",
//         width: "160px",

//         customTemplate: (val) =>
//           val ? new Date(val).toLocaleDateString() : "",
//       },

//       {
//         parameterName: "modified",
//         columnName: "Modified",
//         width: "160px",

//         customTemplate: (val) =>
//           val ? new Date(val).toLocaleDateString() : "",
//       },
//     ],
//     [],
//   );

//   const handleEdit = useCallback((rowData) => {
//     console.log("Edit row data:", rowData);

//     setDetails(rowData);
//     setVisible(true);
//   }, []);

//   if (isError) {
//     return <p className="text-red-500">Error: {error.message}</p>;
//   }
//   console.log("data", data);
//   return (
//     <div className="flex gap-4">
//       <div
//         className={classNames(
//           params?.formManager ? "w-70" : "w-full",

//           "w-full rounded-3xl transition-all duration-300",
//         )}
//       >
//         <Table
//           data={data || []}
//           totalRecords={totalCount}
//           fieldsConfig={fieldsConfig}
//           loading={isLoading}
//           filters={appliedFilters}
//           setFilters={setAppliedFilters}
//           actions={{
//             canEdit: activeMenu?.update,
//             canDelete: activeMenu?.delete,

//             onEdit: handleEdit,

//             deleteApiPath: "/Contact/:id/16",

//             invalidateKeys: [["contacts"]],
//           }}
//           headerProps={headerProps}
//           pageLinkSize={params?.formManager ? 3 : 5}
//           isOpen={!!params?.formManager}
//         />
//       </div>

//       {visible && (
//         <StepModal
//           visible={visible}
//           setVisible={setVisible}
//           id={0}
//           title="Contacts"
//           widthConfig={{
//             1: { width: "60vw" },
//             2: {
//               width: "90vw",
//               minHeight: "60vh",
//             },
//           }}
//           entityCode="contact"
//           entityCodeId={activeMenu?.entityCodeId}
//           colSize={3}
//           details={details}
//           designType={activeMenu?.designType}
//           StepOneComponent={(props) => (
//             <ContactsForm
//               {...props}
//               caseId={entityId}
//               entityCodeId={activeMenu?.entityCodeId}
//             />
//           )}
//         />
//       )}
//     </div>
//   );
// };

// export default Contacts;

import { lazy, memo, Suspense, useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ContactRecord from "./ContactRecord";
import { apiRequest } from "../../../services/apiBinding";
import TableHeader from "../../../components/Table/TableHeader";
import StepModal from "../../../components/Modal/StepModal/StepModal";
import { ContactSkeleton } from "./ContactsSkeleton";
import { ContactRound, UserPlus } from "lucide-react";

const ContactsForm = lazy(() => import("./ContactForm/ContactsForm"));

const ContactDirectory = memo(({ activeMenu, entityId, isTabs, partyData }) => {
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(null);

  const {
    data: contacts = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["contacts", entityId],
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: `/Contact/party/${entityId}`,
        method: "get",
        signal,
      }),
    enabled: Boolean(entityId),
    staleTime: 5 * 60 * 1000,
    select: (response) => {
      const responseData = response?.data || [];

      return (
        Array.isArray(responseData) ? responseData : [responseData]
      ).filter(Boolean);
    },
  });

  const addData = useCallback(() => {
    setDetails(partyData || null);
    setVisible(true);
  }, [partyData]);

  const headerProps = useMemo(
    () => ({
      addData,
      headerName: `${activeMenu?.label} Contacts`,
      actionsConfig: {
        add: activeMenu?.create,
      },
    }),
    [addData, activeMenu?.label, activeMenu?.create],
  );

  const handleEdit = useCallback((rowData) => {
    console.log("Edit row data:", rowData);

    setDetails(rowData);
    setVisible(true);
  }, []);

  const gridClass = useMemo(
    () => `grid ${isTabs ? "grid-cols-2" : "grid-cols-3"} gap-x-3 gap-y-5 pt-5`,
    [isTabs],
  );

  if (isLoading) {
    return <ContactSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
        {error?.message || "Failed to load contacts"}
      </div>
    );
  }

  return (
    <>
      <TableHeader {...headerProps} />
      <div className={gridClass}>
        {!contacts.length ? (
          <div className="col-span-full flex min-h-[400px] items-center justify-center">
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200  p-10 text-center">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500" />

              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-violet-50">
                <ContactRound className="h-12 w-12 text-blue-600" />
              </div>

              <h2 className="mb-3 text-2xl font-bold text-slate-800">
                No Contacts Available
              </h2>

              <p className="mx-auto mb-8 max-w-sm text-sm text-slate-500">
                Get started by creating your first contact. All phone numbers,
                emails, addresses, and communication details will appear here.
              </p>

              <button
                onClick={addData}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 font-medium text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <UserPlus size={18} />
                Create Contact
              </button>
            </div>
          </div>
        ) : (
          contacts.map((contact) => (
            <ContactRecord
              handleEdit={handleEdit}
              key={contact.id}
              contact={contact}
              canEdit={activeMenu?.update}
              canDelete={activeMenu?.delete}
              moduleId={activeMenu?.id}
            />
          ))
        )}
      </div>
      {visible && (
        <StepModal
          visible={visible}
          setVisible={setVisible}
          id={entityId}
          title="Contacts"
          widthConfig={{
            1: { width: "60vw" },
            2: {
              width: "90vw",
              minHeight: "60vh",
            },
          }}
          entityCode="contact"
          entityCodeId={activeMenu?.entityCodeId}
          moduleId={activeMenu?.id}
          colSize={3}
          details={details}
          designType={activeMenu?.designType}
          StepOneComponent={(props) => (
            <Suspense>
              <ContactsForm {...props} />
            </Suspense>
          )}
        />
      )}
    </>
  );
});

export default ContactDirectory;
