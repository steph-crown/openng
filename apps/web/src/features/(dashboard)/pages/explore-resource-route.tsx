import { getRouteApi } from "@tanstack/react-router";

import { ExploreResourcePage } from "./explore-resource-page";

const routeApi = getRouteApi("/(dashboard)/$resourceId");

export function ExploreResourceRoute() {
  const navigate = routeApi.useNavigate();
  const params = routeApi.useParams();
  const search = routeApi.useSearch();

  return (
    <ExploreResourcePage
      resourceId={params.resourceId}
      search={search}
      onApplySearch={(next) => {
        navigate({
          search: (prev) => ({
            ...prev,
            ...next,
          }),
          replace: false,
        });
      }}
    />
  );
}
