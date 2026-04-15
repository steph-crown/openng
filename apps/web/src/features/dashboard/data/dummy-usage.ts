import type {
  RequestLogRow,
  UsageByResource,
  UsagePoint,
  UsageSummary,
} from "../types";

export const dummyUsageSummary: UsageSummary = {
  requestsToday: 179,
  requestsThisMonth: 4821,
  remainingToday: 4821,
  dailyLimit: 5000,
  resetIn: "6h 22m",
};

export const dummyUsagePoints: UsagePoint[] = [
  { day: "Mon", requests: 410 },
  { day: "Tue", requests: 632 },
  { day: "Wed", requests: 589 },
  { day: "Thu", requests: 701 },
  { day: "Fri", requests: 778 },
  { day: "Sat", requests: 545 },
  { day: "Sun", requests: 611 },
];

export const dummyUsageByResource: UsageByResource[] = [
  { resource: "holidays", requests: 2910 },
  { resource: "fuel", requests: 842 },
  { resource: "postal-codes", requests: 527 },
  { resource: "schools", requests: 321 },
  { resource: "health-facilities", requests: 221 },
];

export const dummyRequestLogs: RequestLogRow[] = Array.from(
  { length: 24 },
  (_, index) => {
    const status = index % 11 === 0 ? 429 : index % 7 === 0 ? 500 : 200;
    return {
      id: `request-${index + 1}`,
      timestamp: new Date(Date.now() - index * 1000 * 60 * 18).toISOString(),
      resource: index % 3 === 0 ? "holidays" : index % 3 === 1 ? "fuel" : "postal-codes",
      status,
      responseTimeMs: 50 + ((index * 17) % 240),
      cached: index % 2 === 0,
    };
  },
);
