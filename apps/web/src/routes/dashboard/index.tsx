import { createFileRoute } from "@tanstack/react-router";
import { DashboardOverviewPage } from "../../features/dashboard/pages/dashboard-overview-page";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverviewRoute,
});

function DashboardOverviewRoute() {
  return <DashboardOverviewPage />;
}
