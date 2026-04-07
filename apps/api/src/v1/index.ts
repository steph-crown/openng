import { Hono } from "hono";
import { refRouter } from "../core/ref-routes";
import type { AppVariables } from "../core/request-logger.middleware";
import { v1DiscoveryRouter } from "../core/meta";
import { v1PingRouter } from "./ping";

export const v1Router = new Hono<{ Variables: AppVariables }>();

v1Router.route("/", v1DiscoveryRouter);
v1Router.route("/ping", v1PingRouter);
v1Router.route("/ref", refRouter);
