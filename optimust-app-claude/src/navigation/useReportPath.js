import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { useAppNavigation } from "./NavigationContext";
import { tabsQueryOptions } from "./api";
import { buildMenuTree } from "./menuTree";
import { isPathWithin, splitPath } from "./paths";

const REPORTS_MODULE_PATH = "/reports";

const samePath = (a, b) => splitPath(a).join("/") === splitPath(b).join("/");

/** Route of the Report-module menu for `reportId`, or null. */
const findReportPath = (tree, reportId) => {
  const menus = [...tree.menuById.values()].filter((m) => m.fullPath);

  const byReportId = menus.find((m) => Number(m.reportId) === Number(reportId));

  if (byReportId) return byReportId.fullPath;

  // Older menus use the report id as their path.
  const legacyPath = `${REPORTS_MODULE_PATH}/no-tabs/${reportId}`;

  return menus.find((m) => samePath(m.fullPath, legacyPath))?.fullPath ?? null;
};

/**
 * Opens a report by id from anywhere (e.g. dashboard cards).
 *
 * Report pages are menu-driven: a URL shows whichever Report tab it matches,
 * so the report is resolved to its menu's route rather than building
 * `/reports/no-tabs/<id>`. The Report module's tabs are fetched on demand
 * (on hover via `prefetchReports`, or on click), never on page load.
 */
export const useReportNavigation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { modules, prefetchModuleTabs } = useAppNavigation();

  const reportsModule = useMemo(
    () => modules.find((m) => isPathWithin(REPORTS_MODULE_PATH, m.path)),
    [modules],
  );

  const prefetchReports = useCallback(
    () => prefetchModuleTabs(reportsModule),
    [prefetchModuleTabs, reportsModule],
  );

  const openReport = useCallback(
    async (reportId) => {
      if (!reportId || !reportsModule) return;

      let path = null;

      try {
        const res = await queryClient.ensureQueryData(
          tabsQueryOptions(reportsModule.id),
        );

        path = findReportPath(
          buildMenuTree(res?.data, reportsModule),
          reportId,
        );
      } catch (error) {
        console.error("[navigation] failed to load report menus", error);
      }

      if (path) {
        navigate(path);
      } else {
        toast.info("This report isn't available in your Report menu.");
      }
    },
    [navigate, queryClient, reportsModule],
  );

  return { openReport, prefetchReports };
};
