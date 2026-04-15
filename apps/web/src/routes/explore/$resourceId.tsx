import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ExploreResourcePage } from "../../features/dashboard/pages/explore-resource-page";

type ExplorerSearch = {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
  q?: string;
  year?: string;
  category?: string;
  schedule_kind?: string;
  is_confirmed?: string;
  date_from?: string;
  date_to?: string;
};

function toOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toOptionalNumber(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

export const Route = createFileRoute("/explore/$resourceId")({
  validateSearch: (search): ExplorerSearch => ({
    page: Math.max(1, Math.floor(toOptionalNumber(search.page, 1))),
    limit: Math.max(
      1,
      Math.min(50, Math.floor(toOptionalNumber(search.limit, 25))),
    ),
    sort: toOptionalString(search.sort),
    order:
      search.order === "desc"
        ? "desc"
        : search.order === "asc"
          ? "asc"
          : undefined,
    q: toOptionalString(search.q),
    year: toOptionalString(search.year),
    category: toOptionalString(search.category),
    schedule_kind: toOptionalString(search.schedule_kind),
    is_confirmed: toOptionalString(search.is_confirmed),
    date_from: toOptionalString(search.date_from),
    date_to: toOptionalString(search.date_to),
  }),
  component: ExploreResourceRoute,
});

function ExploreResourceRoute() {
  const navigate = useNavigate({ from: "/explore/$resourceId" });
  const params = Route.useParams();
  const search = Route.useSearch();

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
