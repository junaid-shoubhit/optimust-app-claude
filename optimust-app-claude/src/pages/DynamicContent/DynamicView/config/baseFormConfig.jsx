import StepModal from "../../../../components/Modal/StepModal/StepModal";
import { COMPONENT_REGISTRY } from "../../componentRegistry";
import { LAZY_REGISTRY } from "./lazyRegistry";

export const BASE_FORM_CONFIG = {
  overview: {
    key: "overview",
    title: "Overview",
    Component: LAZY_REGISTRY.Overview,

    getProps: ({ entityId, activeMenu, apiData, partyData }) => {
      const stepKey = activeMenu?.stepModal?.componentKey;
      const StepOneComponent = stepKey ? COMPONENT_REGISTRY[stepKey] : null;

      return {
        entityId,
        details: apiData,
        activeMenu,
        partyData,
        tabsApiPath: (id) =>
          `FieldDefinition/tabs/${activeMenu?.entityCodeId}/${id}/true/false`,

        extraFieldsApiPath: ({ tabName, tabTypeId, entityId }) =>
          `Case/CaseOverviewGetTabDetails?tabName=${tabName}&TabTypeId=${tabTypeId}&entityId=${entityId}&entityCodeId=${activeMenu?.entityCodeId}&includeIsImportant=false
            &isParent=${false}
        `,

        ModalComponent: StepModal,
        StepOneComponent,
      };
    },
  },

  caselogs: {
    noHeader: true,
    key: "caselogs",
    title: "Call Logs",
    Component: LAZY_REGISTRY.CallLogs,
    getProps: ({ entityId }) => ({ caseId: entityId }),
  },

  pdfesign: {
    noHeader: true,
    key: "pdfesign",
    title: "PDF Esign",
    Component: LAZY_REGISTRY.PdfEsign,
    getProps: ({ entityId, caseData, activeMenu }) => ({
      entityId,
      caseData,
      activeMenu,
    }),
  },

  depositdetails: {
    noHeader: true,
    key: "depositdetails",
    title: "Deposit Details",
    Component: LAZY_REGISTRY.DepositDetails,
    getProps: ({ entityId, activeMenu }) => ({ caseId: entityId, activeMenu }),
  },

  settlementworksheet: {
    noHeader: true,
    key: "settlementworksheet",
    title: "Settlement Worksheet",
    Component: LAZY_REGISTRY.SettlementWorksheet,
    getProps: ({ entityId, activeMenu }) => ({ caseId: entityId, activeMenu }),
  },

  chats: {
    key: "chats",
    title: "Chats",
    Component: LAZY_REGISTRY.Chats,
    getProps: ({ entityId, activeMenu }) => ({ entityId, activeMenu }),
  },

  feedetails: {
    noHeader: true,
    key: "feedetails",
    title: "Fee Details",
    Component: LAZY_REGISTRY.FeeDetails,
    getProps: ({ entityId, activeMenu }) => ({ caseId: entityId, activeMenu }),
  },

  expenses: {
    noHeader: true,
    key: "expenses",
    title: "Expenses",
    Component: LAZY_REGISTRY.Expenses,
    getProps: ({ entityId, activeMenu }) => ({ caseId: entityId, activeMenu }),
  },

  timeentries: {
    noHeader: true,
    key: "timeentries",
    title: "Time Entries",
    Component: LAZY_REGISTRY.TimeEntries,
    getProps: ({ entityId, activeMenu }) => ({ caseId: entityId, activeMenu }),
  },

  //     contacts: {
  contacts: {
    noHeader: true,
    key: "contacts",
    title: "Contacts",
    Component: LAZY_REGISTRY.Contacts,
    getProps: ({ entityId, activeMenu }) => ({ caseId: entityId, activeMenu }),
  },

  "event-4": {
    key: "event-4",
    title: "",
    noHeader: true,
    Component: LAZY_REGISTRY.CaseEvents,
    getProps: ({ entityId }) => ({ caseId: entityId }),
  },

  "tasks-3": {
    key: "tasks-3",
    title: "",
    noHeader: true,
    Component: LAZY_REGISTRY.CaseEvents,
    getProps: ({ entityId }) => ({ caseId: entityId }),
  },

  documents: {
    Component: LAZY_REGISTRY.Documents,
    noHeader: true,
    heigth: "h-[calc(100vh-45px)]",
    getProps: ({ entityId, activeMenu }) => ({
      entityId,
      SearchParm: `(cc.id ='${entityId}')`,
      entityCodeId: activeMenu?.entityCodeId,
    }),
  },

  workflows: {
    Component: LAZY_REGISTRY.WORKFLOW,
    noHeader: true,
    getProps: ({ entityId, activeMenu, caseData }) => ({
      entityId,
      activeMenu,
      caseData,
    }),
  },

  wftasks: {
    Component: LAZY_REGISTRY.WFTASKS,
    noHeader: true,
    getProps: ({ entityId, activeMenu, caseData }) => ({
      entityId,
      activeMenu,
      caseData,
    }),
  },

  "event-211": {
    Component: LAZY_REGISTRY.WORKFLOW,
    noHeader: true,
    getProps: ({ entityId, activeMenu }) => ({ entityId, activeMenu }),
  },

  manage: {
    Component: LAZY_REGISTRY.MANAGE,
    noHeader: true,
    getProps: ({ entityId, activeMenu }) => ({ entityId, activeMenu }),
  },
};
