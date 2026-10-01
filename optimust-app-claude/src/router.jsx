import { createBrowserRouter, Navigate } from "react-router-dom";
import { PATH } from "./utils/pagePath";
import { lazy } from "react";
import ProtectedRoute from "./auth/ProtectedRoute";
import PublicRoute from "./auth/PublicRoute.jsx";
import FormManager from "./components/FormManager/FormManager.jsx";

// Lazy load layouts and pages
const LazyMainLayout = lazy(() => import("./layouts/main/MainLayout"));
const LazyAuthLayout = lazy(() => import("./layouts/auth/AuthLayout"));
const LazyDashboard = lazy(() => import("./pages/Home/Dashboard/Dashboard"));
const LazyDynamicPage = lazy(
  () => import("./pages/DynamicContent/DynamicPage/DynamicPage.jsx"),
);

const LazyDocumentManager = lazy(
  () => import("./pages/DocumentManager/Documents/Document.jsx"),
);
const LazyTemplatesEditor = lazy(
  () => import("./pages/DocumentManager/Templates/TemplateEditor.jsx"),
);
const LazyTemplates = lazy(
  () => import("./pages/DocumentManager/Templates/Templates.jsx"),
);
const LazyLogin = lazy(() => import("./pages/Login/Login.jsx"));
const LazyResetPassword = lazy(() => import("./pages/Login/ResetPassword.jsx"));

const LazyWorkflow = lazy(() => import("./pages/Studio/Workflow/Workflow.jsx"));

const LazyPdfEsign = lazy(() => import("./pages/Tools/PdfEsign/PdfEsign.jsx"));

const LazyBulkMessaging = lazy(
  () => import("./pages/Tools/BulkMessaging/BulkMessaging.jsx"),
);

const LazyReports = lazy(() => import("./pages/Reports/Reports.jsx"));

const LazyCalendar = lazy(
  () => import("./pages/Managements/Calendar/Calendar.jsx"),
);

const LazyWFTasks = lazy(
  () => import("./pages/Managements/WFTasks/WFTasks.jsx"),
);

const LazyUsersGroupModulePermission = lazy(
  () =>
    import("./pages/Admin/Permissions/UsersGroupModulePermission/UsersGroupModulePermission.jsx"),
);

const LazyDynamicFieldsMapping = lazy(
  () => import("./pages/Admin/DynamicFieldsMapping/DynamicFieldsMapping.jsx"),
);
const LazyCalendarEventsMassAssignment = lazy(
  () =>
    import("./pages/Tools/CalendarEventsMassAssignment/CalendarEventsMassAssignment.jsx"),
);

const LazyUserProfile = lazy(
  () => import("./pages/UserProfile/UserProfile.jsx"),
);

const LazyWorkflowView = lazy(
  () => import("./pages/Studio/Workflow/WorkflowDetails/WorkFlowView.jsx"),
);

const LazyDocumentSiging = lazy(
  () => import("./pages/DocumentSiging/DocumentSiging.jsx"),
);
export const router = createBrowserRouter(
  [
    {
      path: PATH.DEFAULT,
      element: <Navigate to={PATH.DASHBOARD} replace />,
    },
    {
      path: PATH.PAGE_NOT_FOUND,
      element: <p> Page Not Found </p>,
    },
    {
      path: PATH.DOCUMENTSIGNING,
      element: <LazyDocumentSiging />,
    },

    {
      element: (
        <PublicRoute>
          <LazyAuthLayout />
        </PublicRoute>
      ),
      children: [
        {
          path: PATH.LOGIN,
          element: <LazyLogin />,
        },
        {
          path: PATH.RESETPASSWORD,
          element: <LazyResetPassword />,
        },
      ],
    },
    {
      element: (
        <ProtectedRoute>
          <LazyMainLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: PATH.DASHBOARD,
          element: <LazyDashboard />,
        },
        {
          path: PATH.DYNAMICPAGE,
          element: <LazyDynamicPage />,
          children: [
            {
              path: PATH.DYNAMICPAGEFORM,
              element: <FormManager type={"dynamicPage"} />,
            },
          ],
        },
        {
          path: PATH.CALENDAR,
          element: <LazyCalendar />,
        },
        {
          path: PATH.WFTASK,
          element: <LazyWFTasks />,
        },
        {
          path: PATH.REPORTS,
          element: <LazyReports />,
        },
        {
          path: PATH.USERESGROUPMODULEPERMISSION,
          element: <LazyUsersGroupModulePermission />,
        },

        {
          path: PATH.DYNAMICFIELDSMAPPING,
          element: <LazyDynamicFieldsMapping />,
        },

        {
          path: PATH.CALENDAREVENTSMASSASSIGNMENT,
          element: <LazyCalendarEventsMassAssignment />,
        },
        {
          path: PATH.PDFESIGN,
          element: <LazyPdfEsign />,
        },
        {
          path: PATH.BULKMESSAGING,
          element: <LazyBulkMessaging />,
        },
        {
          path: PATH.DOCUMENTS,
          element: <LazyDocumentManager />,
        },
        {
          path: "documents/editor",
          element: <LazyTemplatesEditor />,
        },
        {
          path: PATH.DOCUMENTSTEMPLATES,
          element: <LazyTemplates />,
          children: [
            {
              path: PATH.DOCUMENTSTEMPLATESFORM,
              element: (
                <FormManager type={"drafts_templates"} page={"templates"} />
              ),
            },
          ],
        },
        // {
        //   path: PATH.DOCUMENTS_DRAFT_TEMPLATES,
        //   element: <LazyTemplates type="draft" />,
        //   children: [
        //     {
        //       path: PATH.DOCUMENTS_DRAFT_TEMPLATES_FORM,
        //       element: <FormManager type={"drafts_templates"} page={"draft"} />,
        //     },
        //   ],
        // },
        {
          path: PATH.AUTOMATION,
          element: <LazyTemplates />,
          children: [
            {
              path: PATH.AUTOMATIONFORM,
              element: (
                <FormManager type={"drafts_templates"} page={"templates"} />
              ),
            },
          ],
        },
        {
          path: "/profile",
          element: <LazyUserProfile />,
        },
        {
          path: "/report",
          element: <p> Reports</p>,
        },
        {
          path: PATH.WORKFLOW,
          element: <LazyWorkflow />,
          children: [
            {
              path: PATH.WORKFLOWFIELDS,
              // element: <FormManager type={"workflowfields"} />,
              element: <LazyWorkflowView />,
            },
          ],
        },
      ],
    },
  ],
  {
    basename: "/app/",
  },
);
