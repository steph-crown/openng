export type HeroPreviewEndpoint = {
  id: string;
  label: string;
  path: string;
};

export const heroPreviewEndpoints: HeroPreviewEndpoint[] = [
  {
    id: "holidays-list",
    label: "Holidays (list)",
    path: "/v1/holidays?year=2026",
  },
  {
    id: "holidays-single",
    label: "Holidays (single)",
    path: "/v1/holidays/1",
  },
];
