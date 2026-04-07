import { Hono } from "hono";
import type { AppVariables } from "../types/context";
import { combinedAuth } from "../middleware/auth-context";
import { standardRateLimitMiddleware } from "../middleware/rate-limit";
import { createRegistryListRouter } from "../registry/list-router";
import { holidaysRouter } from "../resources/holidays";
import { refRouter } from "../resources/ref/router";
import { v1PingRouter } from "./ping";

export const v1Router = new Hono<{ Variables: AppVariables }>();

v1Router.use("*", combinedAuth);
v1Router.use("*", standardRateLimitMiddleware);
v1Router.route("/", createRegistryListRouter());
v1Router.route("/ping", v1PingRouter);
v1Router.route("/ref", refRouter);
v1Router.route("/holidays", holidaysRouter);
