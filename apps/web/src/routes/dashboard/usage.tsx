import { createFileRoute } from "@tanstack/react-router";
import { DashboardUsagePage } from "../../features/dashboard/pages/dashboard-usage-page";

export const Route = createFileRoute("/dashboard/usage")({
  component: DashboardUsageRoute,
});

function DashboardUsageRoute() {
  return <DashboardUsagePage />;
}
