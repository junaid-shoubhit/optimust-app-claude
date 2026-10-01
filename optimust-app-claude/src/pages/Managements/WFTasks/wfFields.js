import {
  createStatusTemplate,
  createToleranceTemplate,
  createGrandTotalTemplate,
  createColumnHeader,
} from "./wfTemplates";

const STATUS_FIELDS = [
  ["wIP", "WIP"],
  ["assigned", "Assigned"],
  ["completed", "Completed"],
  ["canceled", "Canceled"],
  ["notAssigned", "Not Assigned"],
  ["pending", "Pending"],
];

const TOLERANCE_FIELDS = [
  ["toleranceGreatherthanDays", "> Tolerance"],
  ["todayTotal", "Today Total"],
  ["30LessthanDays", "< 30 Days"],
  ["30PlusDays", "30+ Days"],
  ["45PlusDays", "45+ Days"],
  ["60PlusDays", "60+ Days"],
];

export const getWFTasksFields = (onStatClick) => [
  {
    parameterName: "taskTypeName",
    columnName: "Task Type",
    isFilter: true,
    frozen: true,
    width: "180px",
    alignFrozen: "left",
  },
  {
    parameterName: "taskSubTypeName",
    columnName: "Task Subtype",
    isFilter: true,
    frozen: true,
    alignFrozen: "left",
  },

  ...STATUS_FIELDS.map(([parameterName, label]) => {
    return {
      parameterName,
      columnName: createColumnHeader(label, parameterName),
      width: "130px",
      isFilter: false,
      customTemplate: createStatusTemplate(parameterName, onStatClick),
    };
  }),

  {
    parameterName: "grandTotal",
    columnName: "Grand Total",
    width: "100px",
    isFilter: false,
    customTemplate: createGrandTotalTemplate(onStatClick),
  },

  {
    parameterName: "taskToleranceInDays",
    columnName: "Tolerance Days",
    width: "100px",
    isFilter: true,
  },

  ...TOLERANCE_FIELDS.map(([parameterName, columnName]) => ({
    parameterName,
    columnName,
    width: "100px",
    isFilter: false,
    customTemplate: createToleranceTemplate(parameterName, onStatClick),
  })),
];
