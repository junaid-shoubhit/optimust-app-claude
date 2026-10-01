import { lazy } from "react";

/* ================= HELPER ================= */
export const lazyWithPreload = (factory) => {
  const Component = lazy(factory);
  Component.preload = factory;
  return Component;
};

/* ================= REGISTRY ================= */
export const LAZY_REGISTRY = {
  Overview: lazyWithPreload(
    () => import("../../../../components/Overview/Index"),
  ),

  PdfEsign: lazyWithPreload(
    () => import("../../../../pages/Tools/PdfEsign/PdfEsign"),
  ),

  CallLogs: lazyWithPreload(
    () => import("../../../Cases/PI/PIDetails/CallLogs"),
  ),

  Chats: lazyWithPreload(() => import("../../../Cases/PI/PIDetails/Chats")),

  SettlementWorksheet: lazyWithPreload(
    () =>
      import("../../../Cases/PI/PIDetails/Financials/SettlementWorksheet/SettlementWorksheet"),
  ),

  CaseEvents: lazyWithPreload(
    () => import("../../../Cases/PI/CaseEvents/CaseEvents"),
  ),

  FeeDetails: lazyWithPreload(
    () =>
      import("../../../Cases/PI/PIDetails/Financials/FeeDetails/FeeDetails"),
  ),

  DepositDetails: lazyWithPreload(
    () => import("../../../Cases/PI/PIDetails/Financials/DepositeDetails"),
  ),

  Expenses: lazyWithPreload(
    () => import("../../../Cases/PI/PIDetails/Financials/Expenses/Expenses"),
  ),

  TimeEntries: lazyWithPreload(
    () =>
      import("../../../Cases/PI/PIDetails/Financials/TimeEntries/TimeEntries"),
  ),

  Contacts: lazyWithPreload(
    () => import("../../../CaseParties/Contacts/Contacts"),
  ),

  Documents: lazyWithPreload(
    () => import("../../../DocumentManager/Documents/Document"),
  ),

  WORKFLOW: lazyWithPreload(() => import("../../DynamicPage/DynamicPage")),
  WFTASKS: lazyWithPreload(
    () => import("../../../Managements/WFTasks/WFTasks"),
  ),

  MANAGE: lazyWithPreload(() => import("../../DynamicManage/DynamicManage")),
};
