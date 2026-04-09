import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { OpenNavLogo } from "@/components/open-nav-logo";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <OpenNavLogo />,
      url: "/",
    },
  };
}
