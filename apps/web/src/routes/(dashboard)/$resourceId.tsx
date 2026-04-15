import { createFileRoute } from "@tanstack/react-router";
import { parseExplorerRouteSearch } from "../../lib/explorer-route-search";
import { ExploreResourceRoute } from "../../features/(dashboard)/pages/explore-resource-route";

export const Route = createFileRoute("/(dashboard)/$resourceId")({
  validateSearch: (search) => parseExplorerRouteSearch(search),
  component: ExploreResourceRoute,
});
