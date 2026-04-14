import { OpenNavLogo as SharedOpenNavLogo } from "@openng/ui/components/open-nav-logo";

export function OpenNavLogo() {
  return (
    <SharedOpenNavLogo
      as="span"
      className="font-heading text-base font-bold tracking-tight"
      iconClassName="text-fd-primary"
      textClassName="text-fd-foreground"
    />
  );
}
