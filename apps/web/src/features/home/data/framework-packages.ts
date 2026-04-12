export type FrameworkPackage = {
  name: string;
  description: string;
};

export const frameworkPackages: FrameworkPackage[] = [
  {
    name: "fumadocs-mdx",
    description: "Use MDX in your React framework elegantly.",
  },
  {
    name: "fumadocs-core",
    description: "Headless library for building docs + handling content.",
  },
  {
    name: "fumadocs-ui",
    description: "UI library for building docs.",
  },
  {
    name: "fumadocs-openapi",
    description: "Extend Fumadocs to render OpenAPI docs.",
  },
];
