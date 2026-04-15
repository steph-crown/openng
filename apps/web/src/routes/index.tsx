import { createFileRoute } from "@tanstack/react-router";
import { HomeLanding } from "../features/home/pages/home-landing";

export const Route = createFileRoute("/")({
  component: HomeLanding,
});
