import { createFileRoute } from "@tanstack/react-router";
import { DashboardKeysPage } from "../../features/(dashboard)/pages/dashboard-keys-page";

export const Route = createFileRoute("/(dashboard)/keys")({
  component: DashboardKeysPage,
});
