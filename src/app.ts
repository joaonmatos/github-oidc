#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { GithubOidcStack } from "./github-oidc-stack";

const account =
  process.env.DEV_ACCOUNT_ID ??
  process.env.AWS_ACCOUNT_ID ??
  process.env.CDK_ACCOUNT_ID;
const region =
  process.env.DEV_REGION ?? process.env.AWS_REGION ?? process.env.CDK_REGION;

const app = new App();
new GithubOidcStack(app, "GithubOidcStack", {
  env: {
    account,
    region: region ?? "us-east-1",
  },
});
