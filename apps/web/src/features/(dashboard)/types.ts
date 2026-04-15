export type ResourceStatus = "live" | "soon";

export type ResourceCatalogItem = {
  id: string;
  name: string;
  description: string;
  updateFrequency: string;
  docsUrl: string;
  sourceUrl: string;
  status: ResourceStatus;
};

export type UsageSummary = {
  requestsToday: number;
  requestsThisMonth: number;
  remainingToday: number;
  dailyLimit: number;
  resetIn: string;
};

export type UsagePoint = {
  day: string;
  requests: number;
};

export type UsageByResource = {
  resource: string;
  requests: number;
};

export type RequestLogRow = {
  id: string;
  timestamp: string;
  resource: string;
  status: number;
  responseTimeMs: number;
  cached: boolean;
};
