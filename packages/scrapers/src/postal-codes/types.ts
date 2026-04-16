export type SourceKind = "nipost" | "community";
export type Confidence = "authoritative" | "high" | "fallback";

export const scraperStepTypes = {
  purpose: "Define canonical row contracts for postal-code scraper interoperability",
  pipelineStep: "shared",
  runOrder: 0,
};

export type PostalCodeRecord = {
  state: string;
  state_slug: string;
  lga: string;
  lga_slug: string | null;
  area_name: string;
  post_office_name: string | null;
  postal_code: string;
  region_digit: number;
  is_verified: boolean;
  confidence: Confidence;
  source_kind: SourceKind;
  source_url: string;
  source_date: string;
  notes: string | null;
};

export type SourceRow = {
  state_slug: string;
  lga_slug: string | null;
  area_name: string;
  post_office_name: string | null;
  postal_code: string;
  source_url: string;
  source_date: string;
  source_kind: SourceKind;
};
