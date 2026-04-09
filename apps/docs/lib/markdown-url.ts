export function markdownUrlForPage(url: string): string {
  if (url === "/" || url === "") return "/index.mdx";
  return `${url}.mdx`;
}
