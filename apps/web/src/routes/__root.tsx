import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLayoutEffect, useState, type ReactNode } from "react";
import {
  HeadContent,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";

import { applyTheme, resolveInitialTheme } from "../lib/theme";
import appCss from "../styles/globals.css?url";

const webFontLinksEmpty: Array<{
  rel: string;
  href: string;
  crossOrigin?: "anonymous" | "use-credentials";
}> = [];

const webFontLinksGeistGoogle = [
  { rel: "preconnect" as const, href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect" as const,
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous" as const,
  },
  {
    rel: "stylesheet" as const,
    href: "https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Google+Sans+Flex:wght@100..900&display=swap",
  },
];

const fontLinkMode = 0 as 0 | 1;
const activeWebFontLinks =
  fontLinkMode === 0 ? webFontLinksEmpty : webFontLinksGeistGoogle;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "OpenNG",
      },
      {
        name: "description",
        content: "OpenNG public data platform",
      },
    ],
    links: [
      ...activeWebFontLinks,
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  useLayoutEffect(() => {
    applyTheme(resolveInitialTheme());
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
