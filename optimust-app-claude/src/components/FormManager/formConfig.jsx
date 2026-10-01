// src/config/formConfig.js
import { lazy } from "react";
import { DynamicViewImport } from "./dynamicImports";
/* ===================== LAZY WITH PRELOAD ===================== */

const lazyWithPreload = (importFn) => {
  const Component = lazy(importFn);
  Component.preload = importFn;
  return Component;
};

/* ===================== GENERIC FORM SET BUILDER ===================== */

const createFormSet = (config) => {
  const forms = Object.fromEntries(
    Object.entries(config).map(([key, importFn]) => [
      key,
      lazyWithPreload(importFn),
    ]),
  );

  const resolver = ({ formManager }) => {
    const comp = forms[formManager];
    comp?.preload?.();
    return comp || null;
  };

  return { forms: { default: forms }, resolver };
};

/* ===================== FORM CONFIG ===================== */

export const formConfig = {
  drafts_templates: createFormSet({
    add: () => import("../../pages/DocumentManager/Templates/TemplateForm.jsx"),
    clone: () =>
      import("../../pages/DocumentManager/Templates/TemplateEdit.jsx"),
    edit: () =>
      import("../../pages/DocumentManager/Templates/TemplateEdit.jsx"),
    overview: () =>
      import("../../pages/DocumentManager/Templates/TemplateView.jsx"),
  }),
  /* ===================== DYNAMIC PAGE (CLEAN VERSION) ===================== */

  dynamicPage: createFormSet(
    Object.fromEntries(
      [
        "overview",
        "caselogs",
        "pdfesign",
        "feedetails",
        "expenses",
        "depositdetails",
        "settlementworksheet",
        "timeentries",
        "tasks-3",
        "event-4",
        "chats",
        "contacts",
        "documents",
        "workflows",
        "manage",
        "wftasks",
      ].map((key) => [key, DynamicViewImport]),
    ),
  ),
};
