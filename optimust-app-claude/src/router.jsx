import { createBrowserRouter, Navigate } from "react-router-dom";
import { PATH } from "./utils/pagePath";
import { lazy } from "react";
import ProtectedRoute from "./auth/ProtectedRoute";
import PublicRoute from "./auth/PublicRoute.jsx";
import FormManager from "./components/FormManager/FormManager.jsx";

/*
 * Route-level code splitting with preloading. Each lazy page's chunk is only
 * fetched the first time it renders, which made the first visit to a page sit
 * on the "Loading workspace..." fallback while it downloaded. preloadRoutes()
 * fetches them in the background after login so navigation doesn't wait.
 */
const routeLoaders = [];

const lazyRoute = (factory) => {
  routeLoaders.push(factory);

  return lazy(factory);
};

const whenIdle = (callback) =>
  typeof window.requestIdleCallback === "function"
    ? window.requestIdleCallback(callback, { timeout: 3000 })
    : window.setTimeout(callback, 300);

let routesPreloaded = false;

/** Downloads every route chunk, one at a time, in idle periods. Idempotent. */
export const preloadRoutes = () => {
  if (routesPreloaded) return;

  routesPreloaded = true;

  const queue = [...routeLoaders];

  const next = () => {
    const load = queue.shift();

    if (!load) return;

    // A failed preload is harmless: the route loads normally when visited.
    load()
      .catch(() => {})
      .finally(() => whenIdle(next));
  };

  whenIdle(next);
};

// Lazy load layouts and pages
const LazyMainLayout = lazyRoute(() => import("./layouts/main/MainLayout"));
const LazyAuthLayout = lazyRoute(() => import("./layouts/auth/AuthLayout"));
const LazyDashboard = lazyRoute(
  () => import("./pages/Home/Dashboard/Dashboard"),
);
const LazyDynamicPage = lazyRoute(
  () => import("./pages/DynamicContent/DynamicPage/DynamicPage.jsx"),
);

const LazyDocumentManager = lazyRoute(
  () => import("./pages/DocumentManager/Documents/Document.jsx"),
);
const LazyTemplatesEditor = lazyRoute(
  () => import("./pages/DocumentManager/Templates/TemplateEditor.jsx"),
);
const LazyTemplates = lazyRoute(
  () => import("./pages/DocumentManager/Templates/Templates.jsx"),
);
const LazyLogin = lazyRoute(() => import("./pages/Login/Login.jsx"));
const LazyResetPassword = lazyRoute(
  () => import("./pages/Login/ResetPassword.jsx"),
);

const LazyWorkflow = lazyRoute(
  () => import("./pages/Studio/Workflow/Workflow.jsx"),
);

const LazyPdfEsign = lazyRoute(
  () => import("./pages/Tools/PdfEsign/PdfEsign.jsx"),
);

const LazyBulkMessaging = lazyRoute(
  () => import("./pages/Tools/BulkMessaging/BulkMessaging.jsx"),
);

const LazyReports = lazyRoute(() => import("./pages/Reports/Reports.jsx"));

const LazyCalendar = lazyRoute(
  () => import("./pages/Managements/Calendar/Calendar.jsx"),
);

const LazyWFTasks = lazyRoute(
  () => import("./pages/Managements/WFTasks/WFTasks.jsx"),
);

const LazyUsersGroupModulePermission = lazyRoute(
  () =>
    import("./pages/Admin/Permissions/UsersGroupModulePermission/UsersGroupModulePermission.jsx"),
);

const LazyDynamicFieldsMapping = lazyRoute(
  () => import("./pages/Admin/DynamicFieldsMapping/DynamicFieldsMapping.jsx"),
);
const LazyCalendarEventsMassAssignment = lazyRoute(
  () =>
    import("./pages/Tools/CalendarEventsMassAssignment/CalendarEventsMassAssignment.jsx"),
);

const LazyUserProfile = lazyRoute(
  () => import("./pages/UserProfile/UserProfile.jsx"),
);

const LazyWorkflowView = lazyRoute(
  () => import("./pages/Studio/Workflow/WorkflowDetails/WorkFlowView.jsx"),
);

const LazyDocumentSiging = lazyRoute(
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
