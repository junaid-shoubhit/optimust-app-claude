import { lazy } from "react";

const UsersForm = lazy(() => import("../Forms/UsersForm"));
const UserGroupsForm = lazy(
  () => import("../Forms/UserGroupsForm"),
);
const ModulesForm = lazy(
  () => import("../Forms/ModuleForm"),
);
const DynamicTabsForm = lazy(
  () => import("../Forms/DynamicTabsForm"),
);
const MasterEntityForm = lazy(
  () => import("../Forms/MasterentityForm"),
);
const EmailTemplateForm = lazy(() => import("../Forms/EmailTemplatesForm"));
const EsignForm = lazy(() => import("../Forms/EsignControlPanelForm"));
const DynamicFieldsConfiguratorForm = lazy(
  () => import("../Forms/DynamicFieldsConfiguratorForm"),
);
const BillingRateForm = lazy(()=> import("../Forms/BillingRateForm"));
const InvoiceGeneratorForm = lazy(() => import("../Forms/InvoiceGenerateForm"));
export const COMPONENT_REGISTRY = {
  usersForm: UsersForm,
  userGroupsForm: UserGroupsForm,
  modules: ModulesForm,
  dynamictabs: DynamicTabsForm,
  masterentity: MasterEntityForm,
  dynamicfields: DynamicFieldsConfiguratorForm,
  emailTemplateForm: EmailTemplateForm,
  esignForm: EsignForm,
  billingRateForm : BillingRateForm,
  invoiceGeneratorForm : InvoiceGeneratorForm,
};
