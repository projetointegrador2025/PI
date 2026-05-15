#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { DatabaseStack } from "../lib/database-stack";
import { AuthStack } from "../lib/auth-stack";
import { ApiStack } from "../lib/api-stack";
import { FrontendStack } from "../lib/frontend-stack";

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || "us-east-1",
};

const database = new DatabaseStack(app, "SchoolSystemDatabase", { env });
const auth = new AuthStack(app, "SchoolSystemAuth", { env });
const api = new ApiStack(app, "SchoolSystemApi", {
  env,
  tables: database.tables,
  userPool: auth.userPool,
});
const frontend = new FrontendStack(app, "SchoolSystemFrontend", { env });
