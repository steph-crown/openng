import { createFileRoute } from "@tanstack/react-router";
import { HomeLanding } from "../features/home/home-landing";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <HomeLanding />;
}
