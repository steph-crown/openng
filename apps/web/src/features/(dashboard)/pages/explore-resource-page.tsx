import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type CellContext,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  ArrowsUpDownIcon,
  ChevronDownIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  CodeBracketIcon,
  FunnelIcon,
  LinkIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { DashboardShell } from "../components/dashboard-shell";
import { ShellCard } from "../components/shell-card";
import { fetchResourceList, fetchResourceMeta } from "../api/explorer-api";
import { getResourceById } from "../data/resource-catalog";
import type { ExplorerRouteSearch } from "../../../lib/explorer-route-search";
import { humanizeColumnLabel } from "../../../utils/humanize-column-label";
import { cx } from "../../../lib/cx";

type ExploreResourcePageProps = {
  resourceId: string;
  search: ExplorerRouteSearch;
  onApplySearch: (next: ExplorerRouteSearch) => void;
};

function formatCellValue(value: unknown, fieldType?: string) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (fieldType === "date" && typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  }
  return String(value);
}

type ExplorerFieldMeta = { type: string; display?: "badge" };

function ExplorerTableCell({
  value,
  meta,
}: {
  value: unknown;
  meta: ExplorerFieldMeta | undefined;
}) {
  const fieldType = meta?.type;
  const alignNumber = fieldType === "number";

  if (fieldType === "boolean") {
    if (value === null || value === undefined || value === "") {
      return <span className="text-(--color-muted)">—</span>;
    }
    return (
      <span className={cx(alignNumber && "flex justify-end")}>
        <Switch checked={Boolean(value)} disabled className="disabled:opacity-100" />
      </span>
    );
  }

  if (meta?.display === "badge" && value !== null && value !== undefined && value !== "") {
    return (
      <span className={cx(alignNumber && "text-right")}>
        <Badge variant="outline" title={String(value)} className="max-w-full truncate font-normal">
          {String(value)}
        </Badge>
      </span>
    );
  }

  return (
    <span className={cx(alignNumber && "text-right")}>{formatCellValue(value, fieldType)}</span>
  );
}

function ExplorerDetailValue({
  value,
  meta,
}: {
  value: unknown;
  meta: ExplorerFieldMeta | undefined;
}) {
  const fieldType = meta?.type;

  if (fieldType === "boolean") {
    if (value === null || value === undefined || value === "") {
      return <span className="text-(--color-muted)">—</span>;
    }
    return <Switch checked={Boolean(value)} disabled className="disabled:opacity-100" />;
  }

  if (meta?.display === "badge" && value !== null && value !== undefined && value !== "") {
    return (
      <Badge variant="outline" title={String(value)} className="max-w-full truncate font-normal">
        {String(value)}
      </Badge>
    );
  }

  return <span className="break-words">{formatCellValue(value, fieldType)}</span>;
}

function stringifyRecord(record: Record<string, unknown>) {
  return JSON.stringify(record, null, 2);
}

function pageNumbers(current: number, total: number) {
  if (total <= 1) {
    return [1];
  }
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  return [...pages].filter((value) => value >= 1 && value <= total).sort((a, b) => a - b);
}

export function ExploreResourcePage({ resourceId, search, onApplySearch }: ExploreResourcePageProps) {
  const resource = getResourceById(resourceId);
  const isLive = resource?.status === "live";
  const [draft, setDraft] = useState<ExplorerRouteSearch>(search);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [copiedState, setCopiedState] = useState<"" | "api" | "url" | "list" | "row">("");

  useEffect(() => {
    setDraft(search);
  }, [search]);

  const metaQuery = useQuery({
    queryKey: ["resource-meta", resourceId],
    queryFn: () => fetchResourceMeta(resourceId),
    enabled: isLive,
    staleTime: 1000 * 60 * 5,
  });

  const appliedParams = useMemo(() => {
    const params: Record<string, string | number | undefined> = {
      page: search.page ?? 1,
      limit: search.limit ?? 25,
      sort: search.sort,
      order: search.order,
      year: search.year,
      category: search.category,
      schedule_kind: search.schedule_kind,
      is_confirmed: search.is_confirmed,
      date_from: search.date_from,
      date_to: search.date_to,
    };

    const mappedSearch = search.q?.trim();
    if (mappedSearch) {
      params.name = mappedSearch;
    }

    return params;
  }, [search]);

  const listQuery = useQuery({
    queryKey: ["resource-list", resourceId, appliedParams],
    queryFn: () => fetchResourceList({ resourceId, params: appliedParams }),
    enabled: isLive,
    staleTime: 1000 * 20,
  });

  const rows = useMemo(() => {
    if (!listQuery.data?.data) {
      return [];
    }
    return listQuery.data.data;
  }, [listQuery.data]);

  const defaultColumns = useMemo(() => {
    if (!metaQuery.data) {
      return ["date", "name", "year", "category", "isConfirmed"];
    }
    return metaQuery.data.fields.slice(0, 5).map((field) => field.name);
  }, [metaQuery.data]);

  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultColumns);

  useEffect(() => {
    if (visibleColumns.length === 0 && defaultColumns.length > 0) {
      setVisibleColumns(defaultColumns);
    }
  }, [defaultColumns, visibleColumns.length]);

  const fieldMetaMap = useMemo(() => {
    const map = new Map<string, ExplorerFieldMeta>();
    if (!metaQuery.data) {
      return map;
    }
    for (const field of metaQuery.data.fields) {
      map.set(field.name, {
        type: field.type,
        display: field.display,
      });
    }
    return map;
  }, [metaQuery.data]);

  const allColumnNames = useMemo(() => {
    if (!metaQuery.data) {
      return defaultColumns;
    }
    return metaQuery.data.fields.map((field) => field.name);
  }, [defaultColumns, metaQuery.data]);

  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
    const dataColumns = visibleColumns.map(
      (columnName): ColumnDef<Record<string, unknown>> => ({
      id: columnName,
      accessorFn: (row: Record<string, unknown>) => row[columnName],
      header: () => (
        <button
          type="button"
          className="inline-flex items-center gap-1 text-left text-(--color-fg) hover:text-(--color-brand)"
          onClick={() => {
            const currentSort = draft.sort ?? metaQuery.data?.default_sort ?? "date";
            const currentOrder = draft.order ?? metaQuery.data?.default_sort_order ?? "asc";
            const nextOrder =
              currentSort === columnName && currentOrder === "asc" ? "desc" : "asc";

            onApplySearch({
              ...search,
              sort: columnName,
              order: nextOrder,
              page: 1,
            });
          }}
        >
          <span>{humanizeColumnLabel(columnName)}</span>
          <ArrowsUpDownIcon className="h-3.5 w-3.5 shrink-0 text-(--color-muted)" />
        </button>
      ),
      cell: (ctx: CellContext<Record<string, unknown>, unknown>) => {
        const value = ctx.getValue();
        return <ExplorerTableCell value={value} meta={fieldMetaMap.get(columnName)} />;
      },
    }),
    );

    const actionsColumn: ColumnDef<Record<string, unknown>> = {
      id: "actions",
      header: () => <span className="text-(--color-muted)">Actions</span>,
      cell: ({ row }) => (
        <button
          type="button"
          className="rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs font-medium text-(--color-fg) transition-colors hover:bg-(--color-surface-strong)"
          onClick={(event) => {
            event.stopPropagation();
            setSelectedRowIndex(row.index);
          }}
        >
          View
        </button>
      ),
    };

    return [...dataColumns, actionsColumn];
  }, [
    visibleColumns,
    draft.sort,
    draft.order,
    onApplySearch,
    search,
    metaQuery.data,
    fieldMetaMap,
  ]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const selectedRow = selectedRowIndex === null ? null : rows[selectedRowIndex] ?? null;

  const total = listQuery.data?.meta.total ?? 0;
  const limit = search.limit ?? 25;
  const page = search.page ?? 1;
  const pages = listQuery.data?.meta.pages ?? Math.max(1, Math.ceil(total / limit));

  async function copyText(value: string, type: "api" | "url" | "list" | "row") {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedState(type);
      window.setTimeout(() => setCopiedState(""), 2000);
    } catch {
      setCopiedState("");
    }
  }

  function applyDraftFilters() {
    onApplySearch({
      ...draft,
      page: 1,
    });
  }

  function resetFilters() {
    const reset: ExplorerRouteSearch = {
      page: 1,
      limit: 25,
      sort: metaQuery.data?.default_sort,
      order: metaQuery.data?.default_sort_order,
    };
    setDraft(reset);
    onApplySearch(reset);
  }

  if (!resource) {
    return (
      <DashboardShell currentPath={`/${resourceId}`}>
        <ShellCard title="Resource not found">
          <p className="text-sm text-(--color-muted)">
            This resource does not exist in the current catalog.
          </p>
          <a href="/explore" className="mt-2 inline-flex text-sm text-(--color-brand)">
            Back to explorer
          </a>
        </ShellCard>
      </DashboardShell>
    );
  }

  if (!isLive) {
    return (
      <DashboardShell currentPath={`/${resourceId}`}>
        <ShellCard title={`${resource.name} · Coming soon`}>
          <p className="text-sm text-(--color-muted)">{resource.description}</p>
          <div className="mt-3 inline-flex gap-2">
            <a
              href="https://github.com/stephcrown/openng/issues"
              className="rounded-full border border-(--color-border) bg-(--color-bg) px-4 py-2 text-sm"
            >
              Request access
            </a>
            <a
              href="/contribute"
              className="rounded-full border border-(--color-border) bg-(--color-bg) px-4 py-2 text-sm"
            >
              Contribute data
            </a>
          </div>
        </ShellCard>
      </DashboardShell>
    );
  }

  const pageList = pageNumbers(page, pages);
  const queryPath = `/v1/${resourceId}`;
  const queryString = new URLSearchParams(
    Object.entries(appliedParams)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([key, value]) => [key, String(value)]),
  ).toString();
  const curlCommand = `curl "${queryPath}${queryString ? `?${queryString}` : ""}"`;

  const filterFields = (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <label className="text-xs text-(--color-muted)">Search</label>
        <input
          value={draft.q ?? ""}
          onChange={(event) => setDraft((prev) => ({ ...prev, q: event.target.value }))}
          placeholder="Search name"
          className="h-10 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 text-sm"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs text-(--color-muted)">Year</label>
        <input
          value={draft.year ?? ""}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, year: event.target.value || undefined }))
          }
          placeholder="2026"
          className="h-10 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 text-sm"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs text-(--color-muted)">Category</label>
        <input
          value={draft.category ?? ""}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, category: event.target.value || undefined }))
          }
          placeholder="fixed"
          className="h-10 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 text-sm"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs text-(--color-muted)">Is confirmed</label>
        <select
          value={draft.is_confirmed ?? ""}
          onChange={(event) =>
            setDraft((prev) => ({
              ...prev,
              is_confirmed: event.target.value || undefined,
            }))
          }
          className="h-10 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 text-sm"
        >
          <option value="">Any</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
      <div className="grid gap-1">
        <label className="text-xs text-(--color-muted)">Date from</label>
        <input
          type="date"
          value={draft.date_from ?? ""}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, date_from: event.target.value || undefined }))
          }
          className="h-10 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 text-sm"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs text-(--color-muted)">Date to</label>
        <input
          type="date"
          value={draft.date_to ?? ""}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, date_to: event.target.value || undefined }))
          }
          className="h-10 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 text-sm"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs text-(--color-muted)">Sort by</label>
        <select
          value={draft.sort ?? metaQuery.data?.default_sort ?? "date"}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, sort: event.target.value || undefined }))
          }
          className="h-10 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 text-sm"
        >
          {(metaQuery.data?.sortable_columns ?? ["date", "name", "year"]).map((value) => (
            <option key={value} value={value}>
              {humanizeColumnLabel(value)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1">
        <label className="text-xs text-(--color-muted)">Direction</label>
        <div className="inline-flex gap-2">
          <button
            type="button"
            className={cx(
              "rounded-full px-3 py-1.5 text-sm",
              (draft.order ?? metaQuery.data?.default_sort_order ?? "asc") === "asc"
                ? "bg-(--color-brand) text-(--color-brand-foreground)"
                : "border border-(--color-border)",
            )}
            onClick={() => setDraft((prev) => ({ ...prev, order: "asc" }))}
          >
            Asc
          </button>
          <button
            type="button"
            className={cx(
              "rounded-full px-3 py-1.5 text-sm",
              (draft.order ?? metaQuery.data?.default_sort_order ?? "asc") === "desc"
                ? "bg-(--color-brand) text-(--color-brand-foreground)"
                : "border border-(--color-border)",
            )}
            onClick={() => setDraft((prev) => ({ ...prev, order: "desc" }))}
          >
            Desc
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardShell currentPath={`/${resourceId}`}>
      <div className="grid gap-5">
        <header className="grid gap-3 pb-2">
          <div className="grid gap-2">
            <h1 className="text-[clamp(24px,2.6vw,34px)] font-medium tracking-[-0.02em]">
              {resource.name}
            </h1>
            <p className="max-w-[760px] text-sm text-(--color-muted)">
              {metaQuery.data?.description ?? resource.description}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-(--color-muted)">
              <a
                href={resource.docsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full border border-(--color-border) px-2 py-1 transition-colors hover:bg-(--color-surface-strong)"
              >
                View docs
              </a>
              <span className="rounded-full border border-(--color-border) px-2 py-1">
                Updates: {metaQuery.data?.update_frequency ?? resource.updateFrequency}
              </span>
            </div>
          </div>
        </header>

        <div className="grid gap-4">
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm text-(--color-muted)">
                  Showing {rows.length} of {total} results
                </div>
                <div className="inline-flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(true)}
                    className="inline-flex items-center gap-1 rounded-full border border-(--color-border) bg-(--color-bg) px-3 py-2 text-xs"
                  >
                    <FunnelIcon className="h-3.5 w-3.5" />
                    Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => void listQuery.refetch()}
                    className="inline-flex items-center gap-1 rounded-full border border-(--color-border) bg-(--color-bg) px-3 py-2 text-xs"
                  >
                    <ArrowPathIcon className="h-3.5 w-3.5" />
                    Refresh
                  </button>
                  <Popover open={actionsMenuOpen} onOpenChange={setActionsMenuOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full border border-(--color-border) bg-(--color-bg) px-3 py-2 text-xs"
                      >
                        Actions
                        <ChevronDownIcon className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 p-1">
                      <div className="grid gap-0.5">
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-(--color-surface-strong)"
                          onClick={() => {
                            setShowColumnPicker((value) => !value);
                            setActionsMenuOpen(false);
                          }}
                        >
                          <AdjustmentsHorizontalIcon className="h-4 w-4 shrink-0 text-(--color-muted)" />
                          Columns
                        </button>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-(--color-surface-strong)"
                          onClick={() => {
                            void copyText(window.location.href, "url");
                            setActionsMenuOpen(false);
                          }}
                        >
                          {copiedState === "url" ? (
                            <ClipboardDocumentCheckIcon className="h-4 w-4 shrink-0 text-(--color-muted)" />
                          ) : (
                            <LinkIcon className="h-4 w-4 shrink-0 text-(--color-muted)" />
                          )}
                          Share view
                        </button>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-(--color-surface-strong)"
                          onClick={() => {
                            void copyText(curlCommand, "api");
                            setActionsMenuOpen(false);
                          }}
                        >
                          {copiedState === "api" ? (
                            <ClipboardDocumentCheckIcon className="h-4 w-4 shrink-0 text-(--color-muted)" />
                          ) : (
                            <CodeBracketIcon className="h-4 w-4 shrink-0 text-(--color-muted)" />
                          )}
                          Copy API call
                        </button>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-(--color-surface-strong)"
                          onClick={() => {
                            void copyText(JSON.stringify(rows, null, 2), "list");
                            setActionsMenuOpen(false);
                          }}
                        >
                          {copiedState === "list" ? (
                            <ClipboardDocumentCheckIcon className="h-4 w-4 shrink-0 text-(--color-muted)" />
                          ) : (
                            <ClipboardDocumentIcon className="h-4 w-4 shrink-0 text-(--color-muted)" />
                          )}
                          Copy list JSON
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {showColumnPicker ? (
                <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3">
                  <div className="grid grid-cols-2 gap-2 max-[700px]:grid-cols-1">
                    {allColumnNames.map((columnName) => {
                      const checked = visibleColumns.includes(columnName);
                      return (
                        <label key={columnName} className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              if (event.target.checked) {
                                setVisibleColumns((prev) => [...prev, columnName]);
                                return;
                              }
                              setVisibleColumns((prev) =>
                                prev.filter((existing) => existing !== columnName),
                              );
                            }}
                          />
                          {humanizeColumnLabel(columnName)}
                        </label>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    className="mt-3 rounded-full border border-(--color-border) px-3 py-1.5 text-xs"
                    onClick={() => setVisibleColumns(defaultColumns)}
                  >
                    Reset to default
                  </button>
                </div>
              ) : null}
            </div>

            <div className="overflow-x-auto">
              <Table className="min-w-[820px]">
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className={cx(
                              "text-xs",
                              header.column.id === "actions" && "w-[1%] whitespace-nowrap text-right",
                            )}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {listQuery.isLoading
                      ? Array.from({ length: limit }, (_, index) => (
                          <TableRow key={`skeleton-${index}`}>
                            {visibleColumns.map((columnName) => (
                              <TableCell key={`${columnName}-${index}`}>
                                <div className="h-4 w-[80%] animate-pulse rounded bg-(--color-surface-strong)" />
                              </TableCell>
                            ))}
                            <TableCell className="text-right">
                              <div className="ml-auto h-8 w-16 animate-pulse rounded-full bg-(--color-surface-strong)" />
                            </TableCell>
                          </TableRow>
                        ))
                      : rows.length === 0
                        ? (
                            <TableRow>
                              <TableCell
                                colSpan={visibleColumns.length + 1}
                                className="h-24 text-center"
                              >
                                <div className="grid place-items-center gap-2 py-4">
                                  <p className="text-base font-medium text-(--color-fg)">
                                    No results
                                  </p>
                                  <p className="text-sm text-(--color-muted)">
                                    No records match your current filters.
                                  </p>
                                  <button
                                    type="button"
                                    className="rounded-full border border-(--color-border) bg-(--color-surface) px-4 py-2 text-sm text-(--color-fg) transition-colors hover:bg-(--color-surface-strong)"
                                    onClick={resetFilters}
                                  >
                                    Reset filters
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        : table.getRowModel().rows.map((row, index) => (
                          <TableRow
                            key={row.id}
                            className="cursor-pointer hover:bg-(--color-surface-strong)"
                            onClick={() => setSelectedRowIndex(index)}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell
                                key={cell.id}
                                className={cx(
                                  cell.column.id === "actions" && "w-[1%] whitespace-nowrap text-right",
                                )}
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="inline-flex items-center gap-2 text-sm">
                  <span>per page</span>
                  <select
                    value={limit}
                    onChange={(event) => {
                      onApplySearch({
                        ...search,
                        page: 1,
                        limit: Number(event.target.value),
                      });
                    }}
                    className="h-9 rounded-lg border border-(--color-border) bg-(--color-bg) px-2 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onApplySearch({ ...search, page: Math.max(1, page - 1) })}
                    disabled={page <= 1}
                    className="rounded-full border border-(--color-border) px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {pageList.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => onApplySearch({ ...search, page: pageNumber })}
                      className={cx(
                        "h-8 min-w-8 rounded-full px-2 text-sm",
                        pageNumber === page
                          ? "bg-(--color-brand) text-(--color-brand-foreground)"
                          : "border border-(--color-border)",
                      )}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onApplySearch({ ...search, page: Math.min(pages, page + 1) })}
                    disabled={page >= pages}
                    className="rounded-full border border-(--color-border) px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <p className="text-sm text-(--color-muted)">
                  Page {page} of {pages}
                </p>
            </div>
        </div>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent
          side="right"
          className="flex h-full max-h-[100dvh] w-full flex-col gap-0 border-(--color-border) bg-(--color-bg) p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-(--color-border) px-4 py-4 text-left">
            <SheetTitle className="text-base font-medium">Filters</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{filterFields}</div>
          <SheetFooter className="border-t border-(--color-border) sm:flex-col">
            <button
              type="button"
              className="w-full rounded-full bg-(--color-brand) py-3 text-sm font-medium text-(--color-brand-foreground)"
              onClick={() => {
                applyDraftFilters();
                setFiltersOpen(false);
              }}
            >
              Apply
            </button>
            <button
              type="button"
              className="w-full rounded-full border border-(--color-border) bg-(--color-bg) py-3 text-sm font-medium"
              onClick={() => {
                resetFilters();
                setFiltersOpen(false);
              }}
            >
              Clear
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {selectedRow ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/45 p-3">
          <div className="max-h-[90svh] w-full max-w-[780px] overflow-y-auto rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-medium">{resource.name} record</h2>
                <p className="text-sm text-(--color-muted)">
                  {selectedRowIndex === null ? 0 : selectedRowIndex + 1} of {rows.length}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border)"
                onClick={() => setSelectedRowIndex(null)}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-2">
              {Object.entries(selectedRow).map(([key, value]) => (
                <div key={key} className="grid grid-cols-[180px_minmax(0,1fr)] gap-3 text-sm">
                  <p className="font-medium text-(--color-muted)">{humanizeColumnLabel(key)}</p>
                  <div>
                    <ExplorerDetailValue value={value} meta={fieldMetaMap.get(key)} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 inline-flex gap-2">
              <button
                type="button"
                className="rounded-full border border-(--color-border) px-4 py-2 text-sm"
                onClick={() => copyText(stringifyRecord(selectedRow), "row")}
              >
                {copiedState === "row" ? "Copied" : "Copy as JSON"}
              </button>
              <a
                href={resource.docsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full border border-(--color-border) px-4 py-2 text-sm"
              >
                View docs
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
