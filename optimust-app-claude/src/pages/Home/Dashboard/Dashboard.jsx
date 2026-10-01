import { useQuery } from "@tanstack/react-query";

import DashboardHeader from "./DashboardHeader";
import CaseStatusCount from "./CaseStatusCount";
import IntakeStatusCount from "./IntakeStatusCount";
import EventStatusChart from "./EventStatusChart";
import GetTodayTasksReport from "./GetTodayTasksReport";

import { apiRequest } from "../../../services/apiBinding";

/* -------------------------------------------------------------------------- */
/*                                  DASHBOARD                                 */
/* -------------------------------------------------------------------------- */

const Dashboard = () => {
  const { data: reports = [], isLoading: isReportsLoading } = useQuery({
    queryKey: ["report-status-count"],

    queryFn: async ({ signal }) => {
      const response = await apiRequest({
        apiPath: "Utility/GetDashboardData?procedureName=GetReportStatusCount",
        method: "post",
        signal,
      });

      return response?.data ?? [];
    },
  });

  /* ------------------------------------------------------------------------ */
  /*                              FILTER DATA                                 */
  /* ------------------------------------------------------------------------ */

  const caseReports = reports.filter((item) => item.type === "Case");

  const intakeReports = reports.filter((item) => item.type === "Intake");

  return (
    <div className="min-h-screen p-5">
      {/* HEADER */}
      <DashboardHeader />

      {/* HERO SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-6">
        {/* CASE REPORTS */}
        <CaseStatusCount reports={caseReports} isLoading={isReportsLoading} />

        {/* INTAKE REPORTS */}
        <IntakeStatusCount
          reports={intakeReports}
          isLoading={isReportsLoading}
        />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-12 gap-5">
        {/* LEFT */}
        <div className="col-span-6 flex flex-col gap-5">
          <EventStatusChart />
        </div>

        {/* RIGHT */}
        <div className="col-span-6 flex flex-col gap-5">
          <GetTodayTasksReport />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
