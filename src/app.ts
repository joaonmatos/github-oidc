#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { GithubOidcStack } from "./github-oidc-stack";

const app = new App();
new GithubOidcStack(app, "GithubOidcStack", {
  env: {
    region: "us-east-1",
  },
});
