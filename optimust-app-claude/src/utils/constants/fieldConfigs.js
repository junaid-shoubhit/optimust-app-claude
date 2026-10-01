import moment from "moment";

export const FIELD_CONFIGS = {
  party: {
    fields: (data) => {
      const isCompany = data?.isCompany;

      return isCompany
        ? [
            { label: "Company Name", key: "companyName" },
            { label: "Tax ID", key: "taxId" },
            { label: "Party Type", key: "partyTypes", type: "array-label" },
            { label: "Active", key: "isActive", type: "boolean" },
          ]
        : [
            { label: "Full Name", key: "fullName" },
            { label: "Date of Birth", key: "dateOfBirth" },
            { label: "SSN Number", key: "ssn" },
            { label: "Party Type", key: "partyTypes", type: "array-label" },
            { label: "Active", key: "isActive", type: "boolean" },
          ];
    },

    transformData: (data) => ({
      ...data?.data,
      ...data?.options,
    }),
  },

  case: {
    fields: [
      { label: "Case No", key: "caseNo" },
      { label: "Case Name", key: "caseName" },
      { label: "Matter Type", key: "matterType" },
      { label: "Status", key: "status" },
      { label: "Status Group", key: "statusGroup" },
      { label: "Final Status", key: "finalStatus" },
    ],
  },

  intake: {
    fields: [
      { label: "Date", key: "date" },
      {
        label: "Matter Type",
        key: "matterTypeId",
        type: "object-label",
      },
      {
        label: "Attorney Assigned",
        key: "attorneyAssignedId",
        type: "object-label",
      },
      {
        label: "Paralegal",
        key: "paralegalId",
        type: "object-label",
      },
      {
        label: "Prior Attorney",
        key: "priorAttorney",
      },
      {
        label: "Consent",
        key: "consent",
      },
      {
        label: "Accident Type",
        key: "accidentTypeId",
        type: "object-label",
      },
      {
        label: "Accident Date",
        key: "accidentDateTime",
      },
      {
        label: "State",
        key: "locationOfAccidentStateId",
        type: "object-label",
      },
      {
        label: "County",
        key: "locationOfAccidentCountyId",
        type: "object-label",
      },
      {
        label: "Description of Accident",
        key: "descriptionOfAccident",
      },
    ],
    extraSections: [
      {
        key: "referralSourceMapping",
        title: "Source Categories / Referrals",
        type: "referral-list",
      },
    ],
  },

  client: {
    fields: [
      { label: "Client Title", key: "clientTitle" },
      { label: "Client First Name", key: "clientFirstName" },
      { label: "Client Last Name", key: "clientLastName" },
      { label: "Client Middle Name", key: "clientMiddleName" },
      { label: "SSN", key: "ssn" },
      { label: "Date Of Birth", key: "dateOfBirth" },
      { label: "Gender", key: "gender" },
    ],
  },

  workflow: {
    fields: [
      { label: "Workflow Name", key: "name" },
      { label: "Tab Name", key: "tabName" },
      { label: "Relation Workflow", key: "parentWorkflow" },
      { label: "Type", key: "mappingType" },
      { label: "Workflow", key: "workflowTypeMapping", type: "multiArray" },
      { label: "Entity Code", key: "entityCode" },
      { label: "Created", key: "createdBy" },
      { label: "Modified", key: "modifiedBy" },
    ],
  },

  user: {
    fields: [
      { label: "Username", key: "username" },
      { label: "Email", key: "email" },
      { label: "First Name", key: "firstName" },
      { label: "Middle Name", key: "middleName" },
      { label: "Last Name", key: "lastName" },
      { label: "Active", key: "isActive", type: "bit" },
      { label: "Two Factor Type", key: "tfaType" },
      { label: "User Groups", key: "userGroups" },
    ],
    transformData: (data) => data?.data || {},
  },
};

export const mapSelectedFields = (data = {}, fields = []) => {
  if (!data || !fields?.length) return [];

  const formatValue = (value, type) => {
    if (type === "bit") {
      return ["true", true, 1, "1"].includes(value) ? "Yes" : "No";
    }

    if (type === "date") {
      return value ? moment.utc(value).format("MMM DD, YYYY") : "--";
    }

    if (type === "multiArray") {
      console.log("value", value);
      return null;
    }

    if (Array.isArray(value)) {
      return (
        value
          .map((item) => {
            if (item == null) return "";

            if (typeof item === "object") {
              return item.label ?? item.value ?? JSON.stringify(item);
            }

            return item;
          })
          .filter(Boolean)
          .join(", ") || "--"
      );
    }

    if (value && typeof value === "object") {
      return value.label ?? value.value ?? JSON.stringify(value);
    }

    return value ?? "--";
  };

  return fields.map(({ label, key, render, type }) => ({
    label,
    value: render ? render(data) : formatValue(data?.[key], type),
  }));
};

export const getDisplayValue = (value, type) => {
  if (value == null) return "-";

  // Keep dates as-is
  if (type === "date" || type === "datetime") {
    return value;
  }

  // Array
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item == null) return "";
        if (typeof item === "object") {
          return item.label ?? item.value ?? "";
        }
        return item;
      })
      .filter(Boolean)
      .join(", ");
  }

  // Object
  if (typeof value === "object") {
    return value.label ?? value.value ?? JSON.stringify(value);
  }

  // Boolean
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  // Primitive
  return value;
};
