import DocumentPreviewList from "../DocumentPreviewList/DocumentPreviewList";
export const STATIC_PAGE_CONFIG = {
  "/users": {
    headerName: "Users",
    apiPath: "/Utility/GetDynamicPage",
    queryKey: "users",

    fieldsConfig: [
      {
        parameterName: "username",
        columnName: "Username",
        width: "150px",
      },
      {
        parameterName: "firstName",
        columnName: "First Name",
      },
      {
        parameterName: "middleName",
        columnName: "Middle Name",
      },
      {
        parameterName: "lastName",
        columnName: "Last Name",
      },
      {
        parameterName: "email",
        columnName: "Email",
        width: "220px",
      },
      {
        parameterName: "firms",
        columnName: "Firms",
        customTemplate: (value) => value?.replace(/&#x0D;|\n/g, ", ") || "",
        width: "200px",
      },
      {
        parameterName: "userGroupIds",
        columnName: "User Groups",
        customTemplate: (value) =>
          value?.endsWith(",") ? value.slice(0, -1) : value,
        width: "350px",
      },
      {
        parameterName: "created",
        columnName: "Created On",
        width: "160px",
        customTemplate: (value) =>
          value ? new Date(value).toLocaleString() : "",
      },
      {
        parameterName: "modified",
        columnName: "Modified On",
        width: "160px",
        customTemplate: (value) =>
          value ? new Date(value).toLocaleString() : "",
      },

      {
        parameterName: "lastLogin",
        columnName: "Last Login",
        width: "170px",
      },
      {
        parameterName: "baseModule",
        columnName: "Base Module",
        width: "150px",
      },

      {
        parameterName: "isActive",
        columnName: "Status",
        width: "60px",
        // customTemplate: (value, row) => (
        //   <CustomToggle
        //     value={value}
        //     onChange={(newVal) => updateUserStatus(row, newVal?.value)}
        //   />
        // ),
        type: "boolean",
        frozen: true,
      },
      // Always keep actions at the end
      // {
      //   key: "actions",
      //   header: "Actions",
      //   width: "120px",
      //   type: "actions",
      // },
    ],

    transformResponse: (data) => data?.data || [],

    stepModal: {
      componentKey: "usersForm", // ✅ key only
      widthConfig: {
        1: { width: "35vw" },
        2: { width: "90vw", minHeight: "60vh" },
      },
      colSize: 3,
    },
  },

  "/email-templates": {
    headerName: "Email Templates",
    apiPath: "/Utility/GetDynamicPage",
    queryKey: "emailTemplates",

    fieldsConfig: [
      {
        parameterName: "name",
        columnName: "Name",
        width: "250px",
        filter: { type: "input" },
      },

      {
        parameterName: "subject",
        columnName: "Subject",
        width: "300px",
        filter: { type: "input" },
      },

      {
        parameterName: "entityCode",
        columnName: "Entity Code",
        width: "200px",
        filter: { type: "input" },
      },

      {
        parameterName: "created",
        columnName: "Created",
        width: "180px",
        customTemplate: (value) =>
          value ? new Date(value).toLocaleString() : "",
      },

      {
        parameterName: "createdName",
        columnName: "Created By",
        width: "200px",
        filter: { type: "input" },
      },

      {
        parameterName: "modified",
        columnName: "Modified",
        width: "180px",
        customTemplate: (value) =>
          value ? new Date(value).toLocaleString() : "",
      },

      {
        parameterName: "modifiedName",
        columnName: "Modified By",
        width: "200px",
        filter: { type: "input" },
      },
    ],

    transformResponse: (data) => data?.data || [],

    stepModal: {
      componentKey: "emailTemplateForm", // ✅ key only
      widthConfig: {
        1: { width: "45vw" },
      },
      colSize: 3,
    },
  },

  "/esign-panel": {
    headerName: "Esign Control Panel",
    apiPath: "/eSign/page",
    queryKey: "esign",

    fieldsConfig: [
      {
        parameterName: "id",
        columnName: "Request Id",
        width: "160px",
        filter: { type: "input" },
      },

      {
        parameterName: "dateSent",
        columnName: "Date Sent",
        width: "180px",
        customTemplate: (value) =>
          value ? new Date(value).toLocaleString() : "",
      },

      {
        parameterName: "expirationDate",
        columnName: "Expiration Date",
        width: "180px",
        customTemplate: (value) =>
          value ? new Date(value).toLocaleString() : "",
      },

      {
        parameterName: "dateSigned",
        columnName: "Date Signed",
        width: "180px",
        customTemplate: (value) =>
          value ? new Date(value).toLocaleString() : "",
      },

      {
        parameterName: "sentByName",
        columnName: "Sent By",
        width: "180px",
        filter: { type: "input" },
      },

      {
        parameterName: "caseNo",
        columnName: "Case No",
        width: "140px",
        filter: { type: "input" },
      },

      {
        parameterName: "sentToName",
        columnName: "Recipient Name",
        width: "200px",
        filter: { type: "input" },
      },

      {
        parameterName: "sentToEmail",
        columnName: "Recipient Email",
        width: "220px",
        filter: { type: "input" },
      },

      {
        parameterName: "status",
        columnName: "Status",
        width: "140px",
        filter: { type: "dropdown" }, // adjust if needed
      },

      {
        parameterName: "eSignType",
        columnName: "Type",
        width: "140px",
        filter: { type: "dropdown" },
      },

      {
        parameterName: "numOfDocs",
        columnName: "Number of Documents",
        width: "180px",
      },

      {
        parameterName: "eSignDocuments",
        columnName: "Documents",
        width: "220px",
        customTemplate: (value) => {
          if (!value?.length) return "-";

          return <DocumentPreviewList documents={value} />;
        },
      },
    ],

    transformResponse: (data) => data?.eSignRequests || [],

    stepModal: {
      componentKey: "esignForm", // ✅ key only
      widthConfig: {
        1: { width: "35vw" },
        2: { width: "90vw", minHeight: "60vh" },
      },
      colSize: 3,
    },
  },

  "/BillingRate": {
    headerName: "Billing Rate",
    apiPath: "/Utility/GetDynamicPage",
    queryKey: "billingRate",

    fieldsConfig: [
      {
        parameterName: "billingUserName",
        columnName: "Billing User",
        width: "200px",
        filter: { type: "input" },
      },

      {
        parameterName: "ratePerHour",
        columnName: "Rate Per Hour",
        width: "160px",
        filter: { type: "input" },
      },

      {
        parameterName: "effectiveFrom",
        columnName: "Effective From",
        width: "180px",
        customTemplate: (value) =>
          value ? new Date(value).toLocaleString() : "",
      },

      {
        parameterName: "effectiveTo",
        columnName: "Effective To",
        width: "180px",
        customTemplate: (value) =>
          value ? new Date(value).toLocaleString() : "",
      },

      {
        parameterName: "created",
        columnName: "Created",
        width: "180px",
        customTemplate: (value) =>
          value ? new Date(value).toLocaleString() : "",
      },
    ],

    transformResponse: (data) => data?.data || [],

    stepModal: {
      componentKey: "billingRateForm", // ✅ key only
      widthConfig: {
        1: { width: "35vw" },
        2: { width: "90vw", minHeight: "60vh" },
      },
      colSize: 3,
    },
  },

  "/InvoiceGenerator": {
    headerName: "Invoice Generator",
    apiPath: "/Utility/GetDynamicPage",
    queryKey: "invoiceGenerator",

    fieldsConfig: [
      {
        parameterName: "client",
        columnName: "Client",
        width: "220px",
        filter: { type: "input" },
      },

      {
        parameterName: "issuedDate",
        columnName: "From Date",
        width: "180px",
        customTemplate: (value) =>
          value ? new Date(value).toLocaleString() : "",
      },

      {
        parameterName: "dueDate",
        columnName: "To Date",
        width: "180px",
        customTemplate: (value) =>
          value ? new Date(value).toLocaleString() : "",
      },

      {
        parameterName: "taxAmount",
        columnName: "Tax Amount",
        width: "140px",
        filter: { type: "input" },
      },

      {
        parameterName: "notes",
        columnName: "Notes",
        width: "300px",
        filter: { type: "input" },
      },

      {
        parameterName: "created",
        columnName: "Created",
        width: "180px",
        customTemplate: (value) =>
          value ? new Date(value).toLocaleString() : "",
      },
    ],

    transformResponse: (data) => data?.data || [],

    stepModal: {
      componentKey: "invoiceGeneratorForm", // ✅ key only
      widthConfig: {
        1: { width: "35vw" },
        2: { width: "90vw", minHeight: "60vh" },
      },
      colSize: 3,
    },
  },

  "/dynamic-tabs": {
    headerName: "Dynamic Tabs",
    apiPath: "/Utility/GetDynamicPage",
    // queryKey: "dynamictabs",
    payload: {
      tableName: "DynamicTabs",
    },
    fieldsConfig: [
      // { parameterName: "id", columnName: "Id", width: "80px" },
      { parameterName: "name", columnName: "Name", width: "250px" },
      {
        parameterName: "entityCode",
        columnName: "Entity Code",
        width: "200px",
      },
      {
        parameterName: "tabType",
        columnName: "Tab Type",
        width: "200px",
      },
      {
        parameterName: "workflowType",
        columnName: "Workflow Type",
        width: "200px",
      },

      {
        parameterName: "isActive",
        columnName: "Status",
      },
      {
        parameterName: "created",
        columnName: "Created On",
        width: "250px",
        type: "datetime",
      },
      {
        parameterName: "modified",
        columnName: "Modified On",
        width: "250px",
        type: "datetime",
      },
    ],

    transformResponse: (data) => data?.data || [],

    stepModal: {
      componentKey: "dynamictabs",
      widthConfig: {
        1: { width: "33vw" },
        2: { width: "90vw", minHeight: "60vh" },
      },
      colSize: 3,
    },
  },
  "/modules": {
    headerName: "Modules",
    apiPath: "/Utility/GetDynamicPage",
    // queryKey: "modules",

    fieldsConfig: [
      { parameterName: "name", columnName: "Name" },
      { parameterName: "relativePath", columnName: "Relative Path" },
      { parameterName: "instructions", columnName: "Instructions" },
      { parameterName: "parentName", columnName: "Parent" },
      { parameterName: "isDataMenu", columnName: "Is Case Menu" },
      { parameterName: "orderByExpression", columnName: "Order By Expression" },
      { parameterName: "created", columnName: "Created" },
      { parameterName: "modified", columnName: "Modified" },
    ],

    transformResponse: (data) => data?.data || [],

    stepModal: {
      componentKey: "modules", // ✅ key only
      widthConfig: {
        1: { width: "55vw" },
        2: { width: "90vw", minHeight: "60vh" },
      },
      colSize: 3,
    },
  },

  "/masterentity": {
    headerName: "Master Entity",
    apiPath: "/Utility/GetDynamicPage",
    queryKey: "masterentity",
    payload: {
      tableName: "MasterEntity",
      //  tableName: "DynamicTabs",
    },
    fieldsConfig: [
      { parameterName: "id", columnName: "Id", width: "80px" },
      { parameterName: "label", columnName: "Label", width: "250px" },
      { parameterName: "name", columnName: "Name", width: "250px" },

      {
        parameterName: "permission",
        columnName: "Permission",
      },
    ],

    transformResponse: (data) => data?.data || [],

    stepModal: {
      componentKey: "masterentity",

      widthConfig: {
        1: { width: "33vw" },
        2: { width: "90vw", minHeight: "60vh" },
      },
      colSize: 3,
    },
  },

  "/usergroups": {
    headerName: "User Groups",
    apiPath: "/Utility/GetDynamicPage",
    queryKey: "userGroups",

    fieldsConfig: [{ parameterName: "name", columnName: "Group Name" }],

    transformResponse: (data) => data?.data || [],

    stepModal: {
      componentKey: "userGroupsForm",
      widthConfig: {
        1: { width: "33vw" },
        2: { width: "90vw", minHeight: "60vh" },
      },
      colSize: 3,
    },
  },

  "/dynamic-fields-configurator": {
    headerName: "Dynamic Fields Configurator",
    apiPath: "/Utility/GetDynamicPage",
    // queryKey: "dynamicfields-page",

    fieldsConfig: [
      { parameterName: "name", columnName: "Name" },
      { parameterName: "datatype", columnName: "Data Type" },
      { parameterName: "defaultValue", columnName: "Default Value" },
      { parameterName: "isDropdown", columnName: "Dropdown" },
      { parameterName: "dropdownTable", columnName: "Dropdown Table" },
      {
        parameterName: "dropdownTableColumn",
        columnName: "Dropdown Table Column",
      },
      { parameterName: "entityCode", columnName: "Entity Code" },
      { parameterName: "tabName", columnName: "Tab Name" },
      { parameterName: "isMultiSelect", columnName: "Multi Select" },
      { parameterName: "isBlank", columnName: "Is Blank" },
      { parameterName: "isCalculatedField", columnName: "Is Calculated Field" },
    ],

    transformResponse: (data) => data?.data || [],

    stepModal: {
      componentKey: "dynamicfields",
      widthConfig: {
        1: { width: "53vw" },
      },
      colSize: 3,
    },
  },
};
