import { createFileRoute } from "@tanstack/react-router";
import { ExploreHomePage } from "../../features/dashboard/pages/explore-home-page";

export const Route = createFileRoute("/explore/")({
  component: ExploreHomeRoute,
});

function ExploreHomeRoute() {
  return <ExploreHomePage />;
}
