export const PATH = {
  // Autentication
  PAGE_NOT_FOUND: "*",
  DEFAULT: "/",
  LOGIN: "/login",
  RESETPASSWORD: "/reset-password",
  // Dashboard
  DASHBOARD: "/home/dashboard",

  // Documents
  DOCUMENTS: "/documents/case",
  DOCUMENTSTEMPLATES: "/documents/templates",
  DOCUMENTSTEMPLATESFORM: "/documents/templates/:formManager",
  DOCUMENTS_DRAFT_TEMPLATES: "/documents/draft-templates",
  DOCUMENTS_DRAFT_TEMPLATES_FORM: "/documents/draft-templates/:formManager",

  // Admin
  WORKFLOW: "/workflow/:workflowSlug",
  WORKFLOWFIELDS: "/workflow/:workflowSlug/:formManager",

  // Reports
  REPORTS: "/reports/:reportType",

  // Calendar
  CALENDAR: "/management/calendar",
  WFTASK: "/management/wftasks",
  WFTASKFORM: "/management/wftasks/:formManager",

  DYNAMICPAGE: "/:module/:designType/:entityCode/",
  DYNAMICPAGEFORM: "/:module/:designType/:entityCode/:formManager",

  //Dynamic Fields Configurator
  USERESGROUPMODULEPERMISSION: "/admin/user-group-module-permissions",
  DYNAMICFIELDSMAPPING: "/admin/dynamic-fields-mapping",

  // tools
  CALENDAREVENTSMASSASSIGNMENT: "/tools/calendar-events-mass-assignment",

  //tools
  EMAILTEMPLATES: "/tools/email-templates",
  ESIGNPANEL: "/tools/esign-panel",
  PDFESIGN: "/tools/pdf-esign",
  BULKMESSAGING: "/tools/bulk-messaging",

  //Document Siging
  DOCUMENTSIGNING: "/sign-document",

  // Automation
  AUTOMATION: "/admin/automations",
  AUTOMATIONFORM: "/admin/automations/:formManager",
  // DOCUMENTSTEMPLATES: "/documents/templates",
};
