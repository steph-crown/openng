import { notFound } from "next/navigation";

import { getLLMText } from "@/lib/get-llm-text";
import { source } from "@/lib/source";

export const revalidate = false;

type RouteContext = {
  params: Promise<{ slug?: string[] }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const { slug } = await context.params;
  const page = source.getPage(slug ?? []);
  if (!page) notFound();

  return new Response(await getLLMText(page), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}

export function generateStaticParams() {
  return source.generateParams();
}
