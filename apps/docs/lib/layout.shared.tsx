import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { OpenNavLogo } from "@/components/open-nav-logo";

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: "https://github.com/stephcrown/openng",
    nav: {
      title: <OpenNavLogo />,
      url: "/",
    },
  };
}
