import type { ResourceCatalogItem } from "../types";

export const resourceCatalog: ResourceCatalogItem[] = [
  {
    id: "holidays",
    name: "Public Holidays",
    description:
      "Federal public holidays in Nigeria including fixed, moveable, and declared special days.",
    updateFrequency: "Yearly",
    docsUrl: "https://docs.openng.dev/docs/resources/holidays",
    sourceUrl: "https://openng.dev",
    status: "live",
  },
  {
    id: "fuel",
    name: "Fuel Prices",
    description: "Monthly PMS, diesel, and kerosene prices by state.",
    updateFrequency: "Monthly",
    docsUrl: "https://docs.openng.dev",
    sourceUrl: "https://openng.dev",
    status: "soon",
  },
  {
    id: "postal-codes",
    name: "Postal Codes",
    description: "Nigerian postal code datasets by state and locality.",
    updateFrequency: "Static",
    docsUrl: "https://docs.openng.dev",
    sourceUrl: "https://openng.dev",
    status: "soon",
  },
  {
    id: "schools",
    name: "Public Schools",
    description: "Schools by state and LGA with canonical identifiers.",
    updateFrequency: "Quarterly",
    docsUrl: "https://docs.openng.dev",
    sourceUrl: "https://openng.dev",
    status: "soon",
  },
  {
    id: "health-facilities",
    name: "Health Facilities",
    description: "Healthcare facility directory by state and LGA.",
    updateFrequency: "Quarterly",
    docsUrl: "https://docs.openng.dev",
    sourceUrl: "https://openng.dev",
    status: "soon",
  },
  {
    id: "electricity-tariffs",
    name: "Electricity Tariffs",
    description: "DisCo tariff schedules and historical tariff changes.",
    updateFrequency: "Monthly",
    docsUrl: "https://docs.openng.dev",
    sourceUrl: "https://openng.dev",
    status: "soon",
  },
];

export function getResourceById(resourceId: string) {
  return resourceCatalog.find((resource) => resource.id === resourceId);
}

export function getLiveResources() {
  return resourceCatalog.filter((resource) => resource.status === "live");
}
